import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Heart, MessageCircle, X, Clock, Verified, UserPlus } from "lucide-react";
import { useAuth, Profile } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationItem {
  id: string;
  type: "match" | "message" | "connection_request";
  userId: string;
  userName: string;
  userAvatar: string;
  isVerified?: boolean;
  message?: string;
  timestamp: string;
  read: boolean;
}

export const NotificationDropdown = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch initial notifications (connection requests + matches + unread messages)
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const items: NotificationItem[] = [];

      // Incoming connection requests (likes TO current user)
      const { data: incomingLikes } = await supabase
        .from("likes")
        .select("*")
        .eq("to_user", user.id)
        .order("created_at", { ascending: false })
        .limit(15);

      if (incomingLikes) {
        // Check which of these are already matched (mutual)
        const { data: matches } = await supabase
          .from("matches")
          .select("user1, user2")
          .or(`user1.eq.${user.id},user2.eq.${user.id}`);
        const matchedIds = new Set(
          (matches || []).map((m: any) =>
            m.user1 === user.id ? m.user2 : m.user1
          )
        );

        const likerIds = incomingLikes.map((l: any) => l.from_user);
        if (likerIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, name, avatar_url, is_verified")
            .in("id", likerIds);
          const pMap = new Map((profiles || []).map((p: any) => [p.id, p]));

          for (const like of incomingLikes) {
            const p = pMap.get(like.from_user);
            if (!p) continue;
            const isMutual = matchedIds.has(like.from_user);
            items.push({
              id: isMutual ? `match-like-${like.id}` : `like-${like.id}`,
              type: isMutual ? "match" : "connection_request",
              userId: like.from_user,
              userName: p.name || "Người dùng",
              userAvatar:
                p.avatar_url ||
                `https://api.dicebear.com/7.x/lorelei/svg?seed=${like.from_user}&backgroundColor=ffd5dc`,
              isVerified: p.is_verified,
              timestamp: like.created_at,
              read: false,
            });
          }
        }
      }

      // Recent unread messages
      const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .neq("sender_id", user.id)
        .eq("seen", false)
        .order("created_at", { ascending: false })
        .limit(10);

      if (messages && messages.length > 0) {
        const senderIds = [...new Set(messages.map((m: any) => m.sender_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, avatar_url, is_verified")
          .in("id", senderIds);
        const pMap = new Map((profiles || []).map((p: any) => [p.id, p]));

        for (const msg of messages) {
          const p = pMap.get(msg.sender_id);
          if (!p) continue;
          items.push({
            id: `msg-${msg.id}`,
            type: "message",
            userId: msg.sender_id,
            userName: p.name || "Người dùng",
            userAvatar:
              p.avatar_url ||
              `https://api.dicebear.com/7.x/lorelei/svg?seed=${msg.sender_id}&backgroundColor=ffd5dc`,
            isVerified: p.is_verified,
            message: msg.content,
            timestamp: msg.created_at,
            read: false,
          });
        }
      }

      // Sort by timestamp desc
      items.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

      setNotifications(items.slice(0, 20));
      setUnreadCount(items.filter((n) => !n.read).length);
    };

    fetchNotifications();

    // Realtime: new likes (connection requests)
    const likeChannel = supabase
      .channel("notif_likes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "likes",
          filter: `to_user=eq.${user.id}`,
        },
        async (payload) => {
          const like = payload.new as any;
          if (like.from_user === user.id) return;

          const { data: p } = await supabase
            .from("profiles")
            .select("id, name, avatar_url, is_verified")
            .eq("id", like.from_user)
            .single();

          if (p) {
            const item: NotificationItem = {
              id: `like-${like.id}`,
              type: "connection_request",
              userId: like.from_user,
              userName: p.name || "Người dùng",
              userAvatar:
                p.avatar_url ||
                `https://api.dicebear.com/7.x/lorelei/svg?seed=${like.from_user}&backgroundColor=ffd5dc`,
              isVerified: p.is_verified,
              timestamp: like.created_at,
              read: false,
            };
            setNotifications((prev) => [item, ...prev].slice(0, 20));
            setUnreadCount((prev) => prev + 1);
          }
        },
      )
      .subscribe();

    // Realtime: new matches
    const matchChannel = supabase
      .channel("notif_matches")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
        },
        async (payload) => {
          const m = payload.new as any;
          const otherId = m.user1 === user.id ? m.user2 : m.user1;
          if (
            otherId === user.id ||
            (m.user1 !== user.id && m.user2 !== user.id)
          )
            return;

          const { data: p } = await supabase
            .from("profiles")
            .select("id, name, avatar_url, is_verified")
            .eq("id", otherId)
            .single();

          if (p) {
            // Update existing connection_request to match type
            setNotifications((prev) => {
              const updated = prev.map((n) =>
                n.userId === otherId && n.type === "connection_request"
                  ? { ...n, type: "match" as const, id: `match-${m.id}` }
                  : n
              );
              // If no existing request found, add new match notification
              const hasExisting = prev.some((n) => n.userId === otherId);
              if (!hasExisting) {
                const item: NotificationItem = {
                  id: `match-${m.id}`,
                  type: "match",
                  userId: otherId,
                  userName: p.name || "Người dùng",
                  userAvatar:
                    p.avatar_url ||
                    `https://api.dicebear.com/7.x/lorelei/svg?seed=${otherId}&backgroundColor=ffd5dc`,
                  isVerified: p.is_verified,
                  timestamp: m.created_at,
                  read: false,
                };
                return [item, ...updated].slice(0, 20);
              }
              return updated;
            });
            setUnreadCount((prev) => prev + 1);
          }
        },
      )
      .subscribe();

    // Realtime: new messages
    const msgChannel = supabase
      .channel("notif_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const msg = payload.new as any;
          if (msg.sender_id === user.id) return;

          const { data: p } = await supabase
            .from("profiles")
            .select("id, name, avatar_url, is_verified")
            .eq("id", msg.sender_id)
            .single();

          if (p) {
            const item: NotificationItem = {
              id: `msg-${msg.id}`,
              type: "message",
              userId: msg.sender_id,
              userName: p.name || "Người dùng",
              userAvatar:
                p.avatar_url ||
                `https://api.dicebear.com/7.x/lorelei/svg?seed=${msg.sender_id}&backgroundColor=ffd5dc`,
              isVerified: p.is_verified,
              message: msg.content,
              timestamp: msg.created_at,
              read: false,
            };
            setNotifications((prev) => [item, ...prev].slice(0, 20));
            setUnreadCount((prev) => prev + 1);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(likeChannel);
      supabase.removeChannel(matchChannel);
      supabase.removeChannel(msgChannel);
    };
  }, [user]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const handleClick = (item: NotificationItem) => {
    setOpen(false);
    if (item.type === "connection_request") {
      // Navigate to profile so user can connect back
      navigate(`/user-profile?id=${item.userId}`);
    } else if (item.type === "match") {
      navigate(`/messages?chat=${item.userId}`);
    } else {
      navigate(`/messages?chat=${item.userId}`);
    }
  };

  const fmtTime = (ts: string) => {
    const h = Math.floor((Date.now() - new Date(ts).getTime()) / 3600000);
    if (h < 1) return "Vừa xong";
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) markAllRead();
        }}
        className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background shadow-sm" />
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed sm:absolute right-2 sm:right-0 top-14 sm:top-full sm:mt-2 w-[calc(100vw-1rem)] sm:w-[340px] max-h-[440px] bg-card/95 backdrop-blur-xl rounded-2xl shadow-elevated border border-border/40 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/10">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  Thông báo
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Notification list */}
              <div className="overflow-y-auto max-h-[380px] p-2 space-y-1">
                {notifications.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <Bell className="w-8 h-8 text-muted-foreground/20 mx-auto" />
                    <p className="text-xs text-muted-foreground">
                      Chưa có thông báo nào
                    </p>
                  </div>
                ) : (
                  notifications.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleClick(item)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all hover:bg-muted/50 ${
                        !item.read ? "bg-primary/[0.03]" : ""
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-border/10">
                          <img
                            src={item.userAvatar}
                            alt=""
                            className="w-full h-full object-cover bg-primary/5"
                          />
                        </div>
                        {!item.read && (
                          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-card" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold truncate">
                            {item.userName}
                          </span>
                          {item.isVerified && (
                            <Verified className="w-3.5 h-3.5 text-blue-500 fill-white shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {item.type === "match"
                            ? "🤝 Đã kết nối! Vị trí đã được chia sẻ"
                            : item.type === "connection_request"
                              ? "🤝 muốn kết nối với bạn"
                              : `💬 ${item.message || "Gửi tin nhắn"}`}
                        </p>
                        <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {fmtTime(item.timestamp)}
                        </span>
                      </div>
                      <div className="shrink-0 mt-1">
                        {item.type === "match" ? (
                          <Heart className="w-4 h-4 text-primary fill-primary" />
                        ) : item.type === "connection_request" ? (
                          <UserPlus className="w-4 h-4 text-green-500" />
                        ) : (
                          <MessageCircle className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
