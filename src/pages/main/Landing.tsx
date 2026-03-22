import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  Heart,
  MessageCircle,
  Users,
  MapPin,
  Star,
  ArrowRight,
  Shield,
  Sparkles,
  ChevronDown,
  Play,
  CheckCircle,
  Clock,
  Globe,
  Zap,
  Menu,
  X,
} from "lucide-react";

/* ──────────────────────── helpers ──────────────────────── */
const Counter = ({ end, suffix = "" }: { end: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          let start = 0;
          const step = Math.max(1, Math.floor(end / 60));
          const timer = setInterval(() => {
            start += step;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else setCount(start);
          }, 18);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

const features = [
  {
    icon: Users,
    title: "Meetings",
    desc: "Gặp gỡ những người phù hợp nhất dựa trên sở thích và vị trí của bạn. AI matching thông minh.",
    color: "from-red-500 to-orange-400",
    bg: "bg-red-50",
    to: "/explore",
  },
  {
    icon: MessageCircle,
    title: "Chat",
    desc: "Nhắn tin, gửi ảnh và chia sẻ Date Ideas đặc biệt cùng nhau.",
    color: "from-orange-500 to-amber-400",
    bg: "bg-orange-50",
    to: "/messages",
  },
];



const howItWorks = [
  {
    step: 1,
    title: "Tạo hồ sơ",
    desc: "Đăng ký miễn phí và tạo hồ sơ hấp dẫn của bạn",
    icon: Users,
  },
  {
    step: 2,
    title: "Khám phá",
    desc: "Duyệt qua các hồ sơ và tìm người phù hợp",
    icon: Heart,
  },
  {
    step: 3,
    title: "Kết nối",
    desc: "Khi cả hai thích nhau – bắt đầu trò chuyện!",
    icon: MessageCircle,
  },
  {
    step: 4,
    title: "Hẹn hò",
    desc: "Gợi ý Date Ideas và tận hưởng khoảnh khắc đặc biệt",
    icon: MapPin,
  },
];

/* ──────────────────────── LANDING ──────────────────────── */
const Landing = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [totalUsers, setTotalUsers] = useState(0);
  const [weeklyUsers, setWeeklyUsers] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase.rpc("get_site_stats");
      if (!error && data) {
        setTotalUsers(data.total_users || 0);
        setWeeklyUsers(data.weekly_users || 0);
      }
    };

    fetchStats();
  }, []);

  const avatarUrl =
    profile?.avatar_url ||
    `https://api.dicebear.com/7.x/lorelei/svg?seed=${user?.id || "default"}&backgroundColor=ffd5dc`;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ══════════ GLOBAL NAVIGATION ══════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <span className="text-2xl font-bold tracking-tight">
              <span className="font-serif-display italic text-gradient-flame">
                Fin
              </span>
              <span>der</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: "Trang chủ", to: "/" },
              { label: "Khám phá", to: "/explore" },
              { label: "Ghép đôi", to: "/matches" },
              { label: "Tin nhắn", to: "/messages" },
            ].map((item, i) => {
              {
                /* Khám phá with dropdown */
              }
              if (item.to === "/explore") {
                return (
                  <div key={item.to} className="relative group">
                    <Link
                      to={item.to}
                      className="text-sm font-medium transition-colors hover:text-primary text-muted-foreground py-4"
                    >
                      {item.label}
                      <svg
                        className="inline-block w-3.5 h-3.5 ml-1 opacity-50 group-hover:opacity-100 transition-all group-hover:rotate-180"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-elevated border border-border/40 p-2 min-w-[180px]">
                        <Link
                          to="/explore"
                          className="block px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-primary/5 hover:text-primary text-foreground"
                        >
                          Tìm bạn đồng hành
                        </Link>
                        <Link
                          to="/swipe"
                          className="block px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-primary/5 hover:text-primary text-foreground"
                        >
                          Quẹt ghép đôi
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    i === 0
                      ? "text-primary font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Auth buttons / User avatar */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link
                to="/profile"
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all"
              >
                <img
                  src={avatarUrl}
                  alt=""
                  className="w-full h-full object-cover bg-primary/5"
                />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors px-4 py-2"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/login"
                  className="gradient-hot text-white text-sm font-semibold px-6 py-2.5 rounded-full shadow-card hover:shadow-glow transition-all active:scale-[0.97] flex items-center gap-1.5"
                >
                  Bắt đầu ngay
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="md:hidden w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
          >
            {mobileMenu ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden border-t border-border/30 p-6 space-y-4">
            {[
              { label: "Trang chủ", to: "/" },
              { label: "Khám phá", to: "/explore" },
              { label: "Ghép đôi", to: "/matches" },
              { label: "Tin nhắn", to: "/messages" },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenu(false)}
                className="block text-sm font-medium text-foreground hover:text-primary py-2"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 space-y-2">
              {user ? (
                <Link
                  to="/profile"
                  onClick={() => setMobileMenu(false)}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl bg-card border border-border/30"
                >
                  <img
                    src={avatarUrl}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover bg-primary/5 border-2 border-primary/20"
                  />
                  <div>
                    <p className="text-sm font-bold">
                      {profile?.name || "Hồ sơ"}
                    </p>
                    <p className="text-xs text-muted-foreground">Xem hồ sơ</p>
                  </div>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="block w-full gradient-hot text-white text-center text-sm font-semibold px-6 py-3 rounded-2xl shadow-card"
                >
                  Bắt đầu ngay
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ══════════ HERO SECTION ══════════ */}
      <section
        id="home"
        className="relative min-h-screen flex flex-col justify-center pt-20 pb-12 overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 gradient-hero opacity-70" />
        <div
          className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-br from-red-200/30 to-orange-200/30 rounded-full blur-[140px]"
          style={{
            transform: `translate(${mousePos.x * -0.5}px, ${mousePos.y * -0.5}px)`,
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-pink-200/20 to-yellow-200/20 rounded-full blur-[120px]"
          style={{
            transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
          }}
        />

        {/* Floating elements with Parallax */}
        <div
          className="absolute top-32 left-[10%] animate-float opacity-30"
          style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
        >
          <Heart className="w-10 h-10 text-primary fill-primary/10" />
        </div>
        <div
          className="absolute top-48 right-[15%] animate-float-slow opacity-25"
          style={{
            transform: `translate(${mousePos.x * -1.5}px, ${mousePos.y * -1.5}px)`,
          }}
        >
          <Heart className="w-8 h-8 text-pink-400 fill-pink-400/10" />
        </div>
        <div
          className="absolute bottom-32 left-[20%] animate-float-reverse opacity-20"
          style={{
            transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)`,
          }}
        >
          <Heart className="w-12 h-12 text-orange-400 fill-orange-400/10" />
        </div>

        {/* Decorative circles */}
        <div
          className="absolute top-40 right-[35%] w-4 h-4 rounded-full bg-primary/20 animate-pulse-slow blur-[1px]"
          style={{
            transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)`,
          }}
        />
        <div
          className="absolute top-60 left-[30%] w-3 h-3 rounded-full bg-orange-400/20 animate-pulse-slow blur-[1px]"
          style={{
            transform: `translate(${mousePos.x * -2}px, ${mousePos.y * -2}px)`,
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="space-y-8 animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 rounded-full px-5 py-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  Better connection for better life
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight">
                <span className="text-foreground">Dating in your </span>
                <br />
                <span className="font-serif-display italic text-gradient-romantic font-bold">
                  Favorite{" "}
                </span>
                <span className="text-gradient-flame font-extrabold">
                  Instant{" "}
                </span>
                <br />
                <span className="text-gradient-flame font-extrabold">
                  Messengers!
                </span>
              </h1>

              <p className="text-muted-foreground text-base md:text-lg max-w-lg leading-relaxed">
                Kết nối với những người đặc biệt xung quanh bạn. Tìm kiếm tình
                yêu thật sự với tính năng matching thông minh AI.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <button
                  onClick={() => navigate("/login")}
                  className="gradient-hot text-white font-bold px-8 py-4 rounded-full shadow-elevated hover:shadow-glow transition-all active:scale-[0.97] flex items-center gap-2 text-base"
                >
                  JOIN NOW
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-card rounded-full px-4 py-2.5 shadow-card border border-border/50">
                    <span className="text-sm font-bold">99%</span>
                    <span className="text-xs text-muted-foreground">
                      Match Rate
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-amber-400 fill-amber-400"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic Stats row */}
              <div className="flex items-center gap-8 pt-6 border-t border-border/50">
                <div className="text-left animate-fade-up" style={{ animationDelay: "0.2s" }}>
                  <p className="text-3xl font-bold text-foreground flex items-center gap-1">
                    <Counter end={totalUsers} />+
                  </p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
                    Tổng Người Dùng
                  </p>
                </div>
                
                <div className="w-px h-12 bg-border/50"></div>

                <div className="text-left animate-fade-up" style={{ animationDelay: "0.3s" }}>
                  <p className="text-3xl font-bold text-gradient-flame flex items-center gap-1">
                    <Counter end={weeklyUsers} />+
                  </p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
                    Truy Cập Tuần
                  </p>
                </div>
              </div>

            </div>

            {/* Right - Hero visual */}
            <div
              className="relative flex justify-center lg:justify-end animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              {/* Main couple image placeholder with decorative frame */}
              <div className="relative">
                {/* Yellow background accent */}
                <div className="absolute -top-8 -right-8 w-80 h-96 bg-gradient-to-br from-amber-300/40 to-orange-300/40 rounded-[3rem] rotate-6 animate-blob" />
                <div
                  className="absolute -bottom-6 -left-6 w-72 h-80 bg-gradient-to-br from-red-300/30 to-pink-300/30 rounded-[3rem] -rotate-3 animate-blob"
                  style={{ animationDelay: "4s" }}
                />

                {/* Profile cards stack */}
                <div className="relative z-10">
                  {/* Background card */}
                  <div className="absolute top-8 -left-10 w-56 h-72 rounded-3xl bg-card shadow-card overflow-hidden rotate-[-8deg] border border-border/30">
                    <img
                      src="/assets/images/profile-girl-1.png"
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Main card */}
                  <div className="relative w-72 h-[380px] rounded-3xl overflow-hidden shadow-elevated border-4 border-white z-20">
                    <img
                      src="/assets/images/hero-couple.png"
                      alt="Dating couple"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16">
                      <h3 className="text-white font-bold text-lg">
                        Hẹn hò an toàn
                      </h3>
                      <p className="text-white/60 text-sm">
                        Verified • 2km away
                      </p>
                    </div>

                    {/* Like badge */}
                    <div className="absolute top-4 right-4 w-12 h-12 rounded-full gradient-hot flex items-center justify-center shadow-glow animate-heartbeat">
                      <Heart className="w-6 h-6 text-white fill-white" />
                    </div>
                  </div>

                  {/* Floating badge: Great Meeting */}
                  <div className="absolute bottom-12 -right-6 z-30 bg-card shadow-elevated rounded-2xl px-4 py-3 flex items-center gap-3 animate-float border border-border/30">
                    <div className="w-10 h-10 rounded-full gradient-gold flex items-center justify-center">
                      <Star className="w-5 h-5 text-white fill-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Great Meeting</p>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 text-amber-400 fill-amber-400"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Floating verified badge */}
                  <div
                    className="absolute top-4 -left-4 z-30 bg-card shadow-card rounded-full px-3 py-1.5 flex items-center gap-1.5 animate-float-slow"
                    style={{ animationDelay: "0.5s" }}
                  >
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-semibold text-green-600">
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
          <span className="text-xs text-muted-foreground font-medium">
            Khám phá thêm
          </span>
          <ChevronDown className="w-5 h-5 text-primary" />
        </div>
      </section>

      {/* ══════════ FEATURES SECTION ══════════ */}
      <section id="features" className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-4 py-1.5 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary">
                Tính năng nổi bật
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              We{" "}
              <span className="font-serif-display italic">communicate</span>
              <br />
              <span className="text-gradient-romantic">dynamically</span>{" "}
              with each other.
            </h2>
            <p className="text-muted-foreground">
              Tất cả những gì bạn cần để tìm kiếm và kết nối với người ấy
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {features.map((f, i) => (
              <Link
                key={f.title}
                to={f.to}
                className="group block bg-card rounded-3xl p-8 shadow-card hover:shadow-elevated transition-all duration-500 border border-border/30 hover:border-primary/20 animate-fade-up hover:-translate-y-2"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-glow transition-all duration-300`}
                >
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 flex items-center justify-between">
                  <span>
                    {f.title.split("").map((c, ci) =>
                      ci < f.title.indexOf(" ") + 1 ||
                      f.title.indexOf(" ") === -1 ? (
                        <span key={ci}>{c}</span>
                      ) : (
                        <span key={ci} className="text-primary">
                          {c}
                        </span>
                      ),
                    )}
                  </span>
                  <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {f.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>



      {/* ══════════ HOW IT WORKS ══════════ */}
      <section id="how-it-works" className="py-20 md:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left visual */}
            <div className="relative animate-fade-up">
              <div className="relative mx-auto w-fit">
                {/* Phone mockup */}
                <div className="w-72 h-[520px] bg-card rounded-[3rem] shadow-elevated border-8 border-foreground/5 overflow-hidden relative">
                  {/* Status bar */}
                  <div className="h-12 bg-card flex items-center justify-center">
                    <div className="w-24 h-5 rounded-full bg-foreground/10" />
                  </div>
                  {/* App content simulation */}
                  <div className="p-4 space-y-3">
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 to-orange-100 relative">
                      <img
                        src="/assets/images/profile-girl-2.png"
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
                        <p className="text-white font-bold">Thảo Vy, 21</p>
                        <p className="text-white/60 text-xs">Marketing • 5km</p>
                      </div>
                    </div>
                    <div className="flex justify-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
                        <X className="w-6 h-6 text-red-400" />
                      </div>
                      <div className="w-14 h-14 rounded-full gradient-hot flex items-center justify-center shadow-glow">
                        <Heart className="w-6 h-6 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating notification */}
                <div className="absolute -top-4 -right-8 bg-card shadow-elevated rounded-2xl px-4 py-2.5 flex items-center gap-2 animate-float border border-border/30 z-20">
                  <div className="w-8 h-8 rounded-full gradient-hot flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white fill-white" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold">It's a Match!</p>
                    <p className="text-[9px] text-muted-foreground">
                      Bạn và Đức Huy
                    </p>
                  </div>
                </div>

                {/* Floating message */}
                <div
                  className="absolute bottom-24 -left-12 bg-card shadow-card rounded-2xl px-4 py-2 animate-float-slow border border-border/30 z-20"
                  style={{ animationDelay: "1s" }}
                >
                  <p className="text-[10px] text-muted-foreground">
                    💬 "Hey! Cà phê nhé?"
                  </p>
                </div>
              </div>
            </div>

            {/* Right content */}
            <div
              className="space-y-8 animate-fade-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/8 rounded-full px-4 py-1.5">
                <Globe className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-primary">
                  Cách hoạt động
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Meet The <br />
                <span className="font-serif-display italic text-gradient-flame">
                  Chosen One
                </span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Chỉ với 4 bước đơn giản, bạn sẽ tìm được người ấy. Hệ thống AI
                matching thông minh giúp kết nối bạn với những người phù hợp
                nhất.
              </p>

              <div className="space-y-6">
                {howItWorks.map((item, i) => (
                  <div
                    key={item.step}
                    className="flex items-start gap-4 group cursor-pointer animate-fade-up"
                    style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shrink-0 group-hover:gradient-hot group-hover:text-white transition-all duration-300 group-hover:shadow-card">
                      <item.icon className="w-5 h-5 text-primary group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base mb-1 group-hover:text-primary transition-colors">
                        <span className="text-primary font-extrabold mr-1.5">
                          0{item.step}.
                        </span>
                        {item.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════ CTA SECTION ══════════ */}
      <section className="py-20 md:py-32 relative">
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <div className="gradient-romantic rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden shadow-glow">
            {/* Decorative elements */}
            <div className="absolute top-6 left-6 w-20 h-20 rounded-full bg-white/10 animate-float" />
            <div className="absolute bottom-6 right-6 w-16 h-16 rounded-full bg-white/10 animate-float-reverse" />
            <div className="absolute top-1/2 left-10 w-3 h-3 rounded-full bg-white/20 animate-pulse-slow" />
            <div
              className="absolute top-10 right-20 w-2 h-2 rounded-full bg-white/25 animate-pulse-slow"
              style={{ animationDelay: "0.5s" }}
            />

            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                Sẵn sàng tìm <br className="hidden md:block" />
                <span className="font-serif-display italic">người ấy</span>{" "}
                chưa?
              </h2>
              <p className="text-white/70 max-w-md mx-auto">
                Hàng triệu người đang chờ kết nối với bạn. Bắt đầu hành trình
                tìm kiếm tình yêu ngay hôm nay!
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => navigate("/login")}
                  className="bg-white text-primary font-bold px-8 py-4 rounded-full shadow-elevated hover:shadow-glow transition-all active:scale-[0.97] flex items-center gap-2 text-base"
                >
                  Đăng ký miễn phí
                  <ArrowRight className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>100% An toàn & Bảo mật</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="border-t border-border/30 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl gradient-hot flex items-center justify-center shadow-card">
                  <Heart className="w-5 h-5 text-white fill-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">
                  <span className="text-gradient-flame font-serif-display italic">
                    Fin
                  </span>
                  der
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ứng dụng hẹn hò dành riêng cho sinh viên Việt Nam. An toàn,
                thông minh, hiện đại.
              </p>
            </div>

            {/* Links */}
            {[
              {
                title: "Tính năng",
                links: ["Swipe", "Explore", "Messages", "Video Call"],
              },
              {
                title: "Hỗ trợ",
                links: ["FAQ", "Liên hệ", "Chính sách", "Điều khoản"],
              },
              {
                title: "Kết nối",
                links: [
                  { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61587141010574" },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-sm mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => {
                    const label = typeof link === "string" ? link : link.label;
                    const href = typeof link === "string" ? "#" : link.href;
                    return (
                      <li key={label}>
                        <a
                          href={href}
                          target={href !== "#" ? "_blank" : undefined}
                          rel={href !== "#" ? "noopener noreferrer" : undefined}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          {label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-border/30 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Finder. Made with{" "}
              <Heart className="w-3 h-3 text-primary fill-primary inline" /> in
              Vietnam
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating chat button */}
      <button className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-hot text-white shadow-glow flex items-center justify-center hover:scale-110 transition-transform active:scale-95 md:hidden">
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Landing;
