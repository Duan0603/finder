import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, Compass, MessageCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";
import { PageTransition } from "@/components/layout/PageTransition";
import { motion } from "framer-motion";

const nav = [
  { to: "/", label: "Trang chủ" },
  { to: "/explore", label: "Khám phá" },
  { to: "/matches", label: "Ghép đôi" },
  { to: "/messages", label: "Tin nhắn" },
];

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const loc = useLocation();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [unreadMatches, setUnreadMatches] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const avatarUrl =
    profile?.avatar_url ||
    `https://api.dicebear.com/7.x/lorelei/svg?seed=${user?.id || "default"}&backgroundColor=ffd5dc`;

  // Track scroll for header shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Realtime listener for new matches and messages
  useEffect(() => {
    if (!user) return;

    // Fetch initial unread counts
    const fetchCounts = async () => {
      // Unread messages
      const { count: msgCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("seen", false)
        .neq("sender_id", user.id);

      if (msgCount !== null) setUnreadMessages(msgCount);
    };

    fetchCounts();

    const matchesChannel = supabase
      .channel("new_matches")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
          filter: `user2=eq.${user.id}`,
        },
        async (payload) => {
          const { data: partner } = await supabase
            .from("profiles")
            .select("name, avatar_url")
            .eq("id", payload.new.user1)
            .single();

          if (partner) {
            toast({
              title: "🎉 Tương hợp mới!",
              description: `Bạn và ${partner.name} đã tương hợp. Gửi tin nhắn ngay!`,
              className: "bg-primary text-primary-foreground border-none",
            });
            setUnreadMatches((prev) => prev + 1);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
          filter: `user1=eq.${user.id}`,
        },
        async (payload) => {
          const { data: partner } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", payload.new.user2)
            .single();

          if (partner) {
            toast({
              title: "🎉 Tương hợp mới!",
              description: `Bạn và ${partner.name} đã tương hợp.`,
              className: "bg-primary text-primary-foreground border-none",
            });
            setUnreadMatches((prev) => prev + 1);
          }
        },
      )
      .subscribe();

    const messagesChannel = supabase
      .channel("new_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          if (payload.new.sender_id !== user.id) {
            setUnreadMessages((prev) => prev + 1);
            if (window.location.pathname !== "/messages") {
              toast({
                title: "💬 Tin nhắn mới",
                description: "Bạn có tin nhắn mới.",
              });
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchesChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user]);

  // Reset unread count when visiting the page
  useEffect(() => {
    if (loc.pathname === "/matches") {
      setUnreadMatches(0);
    } else if (loc.pathname === "/messages") {
      setUnreadMessages(0);
      if (user) {
        supabase
          .from("messages")
          .update({ seen: true })
          .eq("seen", false)
          .neq("sender_id", user.id)
          .then();
      }
    }
  }, [loc.pathname, user]);

  return (
    <div className="min-h-screen bg-background">
      {/* ══════════ GLOBAL TOP NAVBAR ══════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-all duration-300 ${
          scrolled
            ? "bg-background/85 border-border/40 shadow-md"
            : "bg-background/70 border-border/30 shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <motion.span
              className="text-2xl font-bold tracking-tight"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="font-serif-display italic text-gradient-flame">
                Fin
              </span>
              <span>der</span>
            </motion.span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {nav.map((item) => {
              const active = loc.pathname === item.to;

              {
                /* Khám phá with dropdown */
              }
              if (item.to === "/explore") {
                const isExploreActive = [
                  "/explore",
                  "/swipe",
                ].includes(loc.pathname);
                return (
                  <div key={item.to} className="relative group">
                    <Link
                      to={item.to}
                      className={`text-sm font-medium transition-colors hover:text-primary py-4 relative ${
                        isExploreActive
                          ? "text-primary font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.label}
                      <svg
                        className="inline-block w-3.5 h-3.5 ml-1 opacity-50 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-180"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {/* Active underline indicator */}
                      {isExploreActive && (
                        <motion.div
                          layoutId="nav-underline"
                          className="absolute -bottom-[1px] left-0 right-0 h-[2px] gradient-hot rounded-full"
                          transition={{ type: "spring", stiffness: 350, damping: 30 }}
                        />
                      )}
                    </Link>

                    {/* Dropdown */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                      <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-elevated border border-border/40 p-2 min-w-[180px]">
                        {[
                          { to: "/explore", label: "Tìm bạn đồng hành" },
                          { to: "/swipe", label: "Quẹt ghép đôi" },
                        ].map((sub) => (
                          <Link
                            key={sub.to}
                            to={sub.to}
                            className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-primary/5 hover:text-primary hover:translate-x-0.5 ${
                              loc.pathname === sub.to
                                ? "text-primary bg-primary/5"
                                : "text-foreground"
                            }`}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-sm font-medium transition-colors hover:text-primary relative py-4 ${
                    active
                      ? "text-primary font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                  {/* Active underline indicator */}
                  {active && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-[1px] left-0 right-0 h-[2px] gradient-hot rounded-full"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  {item.to === "/matches" && unreadMatches > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-4 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    >
                      {unreadMatches}
                    </motion.span>
                  )}
                  {item.to === "/messages" && unreadMessages > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-2 w-2 h-2 rounded-full bg-primary"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Notification bell + Profile avatar */}
          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <Link
              to="/profile"
              className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                loc.pathname === "/profile"
                  ? "border-primary shadow-glow scale-105"
                  : "border-transparent hover:border-primary/20 hover:scale-105"
              }`}
            >
              <img
                src={avatarUrl}
                alt=""
                className="w-full h-full object-cover bg-primary/5"
              />
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════ MAIN CONTENT ══════════ */}
      <main className="max-w-5xl mx-auto pt-20 pb-24 md:pb-8 px-4 md:px-6">
        <PageTransition>{children}</PageTransition>
      </main>

      {/* ══════════ MOBILE BOTTOM NAV ══════════ */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-heavy border-t border-border/30 md:hidden">
        <div className="flex justify-around py-1.5 safe-area-bottom">
          {[
            { to: "/", icon: Heart, label: "Trang chủ" },
            { to: "/explore", icon: Compass, label: "Khám phá" },
            { to: "/matches", icon: Sparkles, label: "Ghép đôi" },
            { to: "/messages", icon: MessageCircle, label: "Tin nhắn" },
          ].map((item) => {
            const active = loc.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-300 ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div className="relative">
                  <motion.div
                    animate={active ? { scale: 1.15, y: -2 } : { scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <item.icon
                      className={`w-[22px] h-[22px] transition-all duration-300 ${
                        active ? "drop-shadow-[0_2px_4px_rgba(232,49,26,0.3)]" : ""
                      }`}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  </motion.div>
                  {active && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full gradient-hot"
                    />
                  )}
                  {item.to === "/matches" && unreadMatches > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background"
                    />
                  )}
                  {item.to === "/messages" && unreadMessages > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background"
                    />
                  )}
                </div>
                <span
                  className={`text-[10px] font-semibold transition-all duration-300 ${
                    active ? "text-primary" : ""
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
