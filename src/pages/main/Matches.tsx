import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Heart,
  Star,
  Clock,
  Verified,
  Sparkles,
  ArrowUpDown,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth, Profile } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface MatchWithProfile {
  matchId: string;
  timestamp: string;
  user: Profile;
}

const Matches = () => {
  const { user, profile: myProfile } = useAuth();
  const [matched, setMatched] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"newest" | "online">("newest");

  useEffect(() => {
    if (!user) return;
    const fetchMatches = async () => {
      setLoading(true);
      const { data: matchesData } = await supabase
        .from("matches")
        .select("*")
        .or(`user1.eq.${user.id},user2.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!matchesData || matchesData.length === 0) {
        setMatched([]);
        setLoading(false);
        return;
      }

      // Get the other user IDs
      const otherUserIds = matchesData.map((m) =>
        m.user1 === user.id ? m.user2 : m.user1,
      );

      // Fetch their profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", otherUserIds);

      const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

      const result: MatchWithProfile[] = matchesData
        .map((m) => {
          const otherId = m.user1 === user.id ? m.user2 : m.user1;
          const profile = profileMap.get(otherId);
          if (!profile) return null;
          return { matchId: m.id, timestamp: m.created_at, user: profile };
        })
        .filter(Boolean) as MatchWithProfile[];

      setMatched(result);
      setLoading(false);
    };
    fetchMatches();
  }, [user]);

  // Sorted matches
  const sortedMatches = useMemo(() => {
    const copy = [...matched];
    if (sortBy === "online") {
      copy.sort((a, b) => {
        if (a.user.is_online && !b.user.is_online) return -1;
        if (!a.user.is_online && b.user.is_online) return 1;
        return (
          new Date(b.user.last_active).getTime() -
          new Date(a.user.last_active).getTime()
        );
      });
    }
    // "newest" is the default order (by match timestamp, already desc)
    return copy;
  }, [matched, sortBy]);

  const fmt = (ts: string) => {
    const h = Math.floor((Date.now() - new Date(ts).getTime()) / 3600000);
    if (h < 1) return "Vừa xong";
    if (h < 24) return `${h}h trước`;
    return `${Math.floor(h / 24)} ngày trước`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary fill-primary" /> Matches
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {matched.length} matches
          </p>
        </div>
        {matched.length > 0 && (
          <div className="flex bg-muted/40 rounded-xl p-1 gap-0.5">
            <button
              onClick={() => setSortBy("newest")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${sortBy === "newest" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}
            >
              Mới nhất
            </button>
            <button
              onClick={() => setSortBy("online")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${sortBy === "online" ? "bg-card shadow-sm text-green-500" : "text-muted-foreground"}`}
            >
              Online
            </button>
          </div>
        )}
      </div>

      {matched.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="w-20 h-20 rounded-3xl gradient-glass flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10 text-primary/30" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Chưa có match nào</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Hãy swipe để tìm người phù hợp!
            </p>
          </div>
          <Link to="/swipe">
            <Button className="gradient-hot border-0 text-white rounded-2xl">
              Bắt đầu Swipe <Heart className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* New matches carousel */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent" /> Matches mới
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
              {sortedMatches.map(({ user: u }) => {
                const avatarUrl =
                  u.avatar_url ||
                  `https://api.dicebear.com/7.x/lorelei/svg?seed=${u.id}&backgroundColor=ffd5dc`;
                return (
                  <Link
                    key={u.id}
                    to={`/messages?chat=${u.id}`}
                    className="flex flex-col items-center gap-1.5 shrink-0 group"
                  >
                    <div className="relative">
                      <div className="w-[72px] h-[72px] rounded-full p-[2.5px] gradient-hot group-hover:shadow-glow transition-shadow">
                        <div className="w-full h-full rounded-full overflow-hidden bg-card">
                          <img
                            src={avatarUrl}
                            alt=""
                            className="w-full h-full object-cover bg-primary/5"
                          />
                        </div>
                      </div>
                      {u.is_online && (
                        <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-green-400 border-[2.5px] border-card" />
                      )}
                    </div>
                    <span className="text-xs font-medium max-w-[72px] truncate">
                      {u.name?.split(" ").pop()}
                    </span>
                  </Link>
                );
              })}
              <Link
                to="/swipe"
                className="flex flex-col items-center gap-1.5 shrink-0 group"
              >
                <div className="w-[72px] h-[72px] rounded-full border-2 border-dashed border-muted-foreground/15 flex items-center justify-center group-hover:border-primary/30 transition-colors">
                  <Heart className="w-6 h-6 text-muted-foreground/25 group-hover:text-primary/40" />
                </div>
                <span className="text-xs text-muted-foreground">Tìm thêm</span>
              </Link>
            </div>
          </div>

          {/* Match list */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Tất cả
            </h3>
            {sortedMatches.map(({ user: u, timestamp }, i) => {
              const cc = myProfile
                ? u.interests.filter((x) => myProfile.interests.includes(x))
                    .length
                : 0;
              const avatarUrl =
                u.avatar_url ||
                `https://api.dicebear.com/7.x/lorelei/svg?seed=${u.id}&backgroundColor=ffd5dc`;
              return (
                <Link
                  key={u.id}
                  to={`/messages?chat=${u.id}`}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all group animate-slide-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-card">
                      <img
                        src={avatarUrl}
                        alt=""
                        className="w-full h-full object-cover bg-primary/5"
                      />
                    </div>
                    {u.is_online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-400 border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-[15px]">
                        {u.name}
                        {u.age && `, ${u.age}`}
                      </h3>
                      {u.is_verified && (
                        <Verified className="w-4 h-4 text-[#00D4FF]" />
                      )}
                      {u.is_online && (
                        <span className="text-[9px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full uppercase">
                          Online
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {u.occupation || u.city || ""}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {cc > 0 && (
                        <span className="text-[10px] text-primary font-semibold flex items-center gap-0.5">
                          <Star className="w-3 h-3" />
                          {cc} chung
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {fmt(timestamp)}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="gradient-hot border-0 text-white rounded-xl shadow-card group-hover:shadow-elevated"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" /> Chat
                  </Button>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default Matches;
