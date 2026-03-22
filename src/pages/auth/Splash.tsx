import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"logo" | "tagline" | "exit">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("tagline"), 700);
    const t2 = setTimeout(() => setPhase("exit"), 2000);
    const t3 = setTimeout(() => navigate("/home"), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gradient-romantic overflow-hidden">
      {/* Animated rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="absolute w-40 h-40 rounded-full border border-white/10 animate-ring-expand" />
        <div
          className="absolute w-40 h-40 rounded-full border border-white/10 animate-ring-expand"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute w-40 h-40 rounded-full border border-white/10 animate-ring-expand"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Floating orbs */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/8"
          style={{
            width: `${40 + i * 30}px`,
            height: `${40 + i * 30}px`,
            left: `${15 + i * 16}%`,
            top: `${25 + (i % 3) * 22}%`,
            animation: `float ${3 + i * 0.6}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}

      {/* Floating hearts */}
      <div className="absolute top-[20%] left-[15%] animate-float opacity-20">
        <Heart className="w-10 h-10 text-white fill-white" />
      </div>
      <div
        className="absolute top-[40%] right-[20%] animate-float-slow opacity-15"
        style={{ animationDelay: "0.5s" }}
      >
        <Heart className="w-8 h-8 text-white fill-white" />
      </div>

      {/* Logo */}
      <div
        className={`relative z-10 transition-all duration-700 ${phase === "exit" ? "scale-[1.5] opacity-0 blur-xl" : "scale-100 opacity-100"}`}
      >
        <div
          className={`w-32 h-32 rounded-[2.5rem] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-glow ${phase === "logo" ? "animate-bounce-in" : ""}`}
        >
          <Heart className="w-16 h-16 text-white fill-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
        </div>
      </div>

      {/* Brand text */}
      <div
        className={`relative z-10 mt-10 text-center transition-all duration-700 ${
          phase === "exit"
            ? "translate-y-10 opacity-0 blur-lg"
            : phase === "tagline"
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
        }`}
      >
        <h1
          className="text-6xl font-black text-white tracking-tighter"
          style={{ letterSpacing: "-0.04em" }}
        >
          <span className="font-serif-display italic">Fin</span>der
        </h1>
        <p className="text-white/80 text-sm mt-3 font-bold tracking-[0.3em] uppercase">
          Dating 2026
        </p>
      </div>

      {/* Tagline */}
      <div
        className={`relative z-10 mt-4 transition-all duration-500 delay-200 ${
          phase === "tagline"
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        <p className="text-white/50 text-xs font-medium">
          Kết nối. Yêu thương. Hẹn hò.
        </p>
      </div>

      {/* Loading bar */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-white/15 overflow-hidden">
        <div
          className="h-full bg-white/50 rounded-full animate-shimmer"
          style={{
            width: "60%",
            backgroundSize: "200% 100%",
            backgroundImage:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
          }}
        />
      </div>
    </div>
  );
};

export default Splash;
