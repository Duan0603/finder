import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heart,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ArrowLeft,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Login = () => {
  const navigate = useNavigate();
  const { signUp, signIn, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<"social" | "email">("social");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isInWebView, setIsInWebView] = useState(false);

  useEffect(() => {
    const checkWebView = () => {
      if (typeof window === "undefined") return false;
      const ua = window.navigator.userAgent.toLowerCase();
      return (
        ua.includes("zalo") ||
        ua.includes("fbav") ||
        ua.includes("messenger") ||
        ua.includes("instagram") ||
        (ua.includes("safari") && ua.includes("wv")) ||
        ua.includes("webview")
      );
    };
    setIsInWebView(checkWebView());
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập email và mật khẩu",
        variant: "destructive",
      });
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu không khớp",
        variant: "destructive",
      });
      return;
    }
    if (isSignUp && password.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu tối thiểu 6 ký tự",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          toast({
            title: "Đăng ký thất bại",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Đăng ký thành công! 🎉",
            description: "Hãy hoàn tất hồ sơ của bạn.",
          });
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Đăng nhập thất bại",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (isInWebView) {
      toast({
        title: "Trình duyệt không hỗ trợ",
        description: "Google không cho phép đăng nhập trong ứng dụng này (WebView). Vui lòng nhấn vào biểu tượng (...) ở góc màn hình và chọn 'Mở bằng trình duyệt' để tiếp tục.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Ambient background blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-primary/15 to-orange-300/10 blur-[100px] animate-blob" />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-pink-300/10 to-primary/8 blur-[120px] animate-blob"
          style={{ animationDelay: "4s" }}
        />
      </div>

      {/* Hero gradient section */}
      <div className="relative h-[320px] gradient-romantic flex flex-col items-center justify-end overflow-hidden">
        {/* Animated rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className="absolute w-48 h-48 rounded-full border border-white/15"
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-72 h-72 rounded-full border border-white/10"
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.05, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute w-96 h-96 rounded-full border border-white/5"
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.03, 0.15] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>

        {/* Floating orbs */}
        <motion.div
          className="absolute w-20 h-20 rounded-full bg-white/10"
          style={{ top: "15%", right: "10%" }}
          animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-14 h-14 rounded-full bg-white/8"
          style={{ top: "35%", left: "8%" }}
          animate={{ y: [10, -10, 10], x: [5, -5, 5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Floating hearts */}
        <motion.div
          className="absolute top-16 left-[18%]"
          animate={{ y: [-5, 8, -5], rotate: [-5, 5, -5] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Heart className="w-6 h-6 text-white/25 fill-white/10" />
        </motion.div>
        <motion.div
          className="absolute top-28 right-[22%]"
          animate={{ y: [5, -8, 5], rotate: [5, -5, 5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <Heart className="w-5 h-5 text-white/20 fill-white/8" />
        </motion.div>
        <motion.div
          className="absolute bottom-32 left-[35%]"
          animate={{ y: [-8, 6, -8], scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <Sparkles className="w-4 h-4 text-white/20" />
        </motion.div>

        {/* Logo & brand */}
        <motion.div
          className="relative z-10 text-center pb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div
            className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/10"
            whileHover={{ scale: 1.05, rotate: 3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Heart className="w-11 h-11 text-white fill-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
          </motion.div>
          <h1
            className="text-4xl font-black text-white tracking-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            <span className="font-serif-display italic">Fin</span>der
          </h1>
          <p className="text-white/40 text-[10px] mt-1.5 uppercase tracking-[0.25em] font-semibold">
            Dating 2026
          </p>
        </motion.div>
      </div>

      {/* Form area — glass card effect */}
      <motion.div
        className="flex-1 -mt-8 rounded-t-[2rem] bg-background/80 backdrop-blur-xl relative z-10 px-6 pt-8 pb-6 border-t border-white/10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="max-w-sm mx-auto">
          {/* Social login (default) */}
          <AnimatePresence mode="wait">
            {mode === "social" && (
              <motion.div
                key="social"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                <h2 className="text-xl font-bold text-center mb-1">
                  Đăng nhập ngay
                </h2>
                <p className="text-center text-sm text-muted-foreground mb-5">
                  Chọn cách đăng nhập nhanh nhất cho bạn
                </p>

                {isInWebView && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mb-4"
                  >
                    <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive text-[13px] leading-snug py-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="text-sm font-bold mb-1">Cảnh báo bảo mật (WebView)</AlertTitle>
                      <AlertDescription>
                        Bạn đang mở ứng dụng trong một trình duyệt rút gọn. Google sẽ <b>không cho phép đăng nhập</b> tại đây.
                        <br />
                        <b>Hãy bấm (...) và chọn "Mở bằng trình duyệt" (Safari/Chrome).</b>
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {/* Google */}
                <motion.button
                  onClick={handleGoogle}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 h-[52px] px-4 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all border border-border/50 disabled:opacity-50 group"
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="text-sm font-semibold flex-1">
                    Tiếp tục với Google
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </motion.button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground font-medium">
                    hoặc
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Email button */}
                <motion.button
                  onClick={() => setMode("email")}
                  className="w-full flex items-center justify-center gap-2 h-[48px] rounded-2xl border border-border hover:bg-muted/60 hover:border-primary/20 transition-all text-sm font-semibold group"
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Mail className="w-4 h-4 group-hover:text-primary transition-colors" /> Đăng nhập bằng Email
                </motion.button>
              </motion.div>
            )}

            {/* Email login */}
            {mode === "email" && (
              <motion.form
                key="email"
                onSubmit={handleEmailAuth}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <motion.button
                  type="button"
                  onClick={() => setMode("social")}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2 group"
                  whileHover={{ x: -3 }}
                >
                  <ArrowLeft className="w-4 h-4 group-hover:text-primary transition-colors" /> Quay lại
                </motion.button>
                <h2 className="text-xl font-bold">
                  {isSignUp ? "Tạo tài khoản" : "Đăng nhập bằng Email"}
                </h2>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="pl-11 h-13 rounded-2xl bg-muted/50 border-0 text-base focus:ring-2 focus:ring-primary/30 focus:bg-background transition-all"
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu"
                    className="pl-11 pr-11 h-13 rounded-2xl bg-muted/50 border-0 text-base focus:ring-2 focus:ring-primary/30 focus:bg-background transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {isSignUp && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="relative group overflow-hidden"
                    >
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Xác nhận mật khẩu"
                        className="pl-11 h-13 rounded-2xl bg-muted/50 border-0 text-base focus:ring-2 focus:ring-primary/30 focus:bg-background transition-all"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isSignUp && (
                  <div className="flex justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-xs text-primary hover:underline font-medium hover:text-primary/80 transition-colors"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                )}

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-13 rounded-2xl gradient-hot border-0 text-white font-semibold text-base shadow-elevated hover:shadow-glow transition-all"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {isSignUp ? "Đăng ký" : "Đăng nhập"}{" "}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </motion.div>

                <p className="text-sm text-center text-muted-foreground">
                  {isSignUp ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-primary font-semibold hover:underline"
                  >
                    {isSignUp ? "Đăng nhập" : "Đăng ký ngay"}
                  </button>
                </p>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Verification badge */}
          <motion.div
            className="flex items-center gap-2.5 mt-6 p-3.5 rounded-2xl bg-gradient-to-r from-primary/[0.04] to-primary/[0.02] border border-primary/8 backdrop-blur-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">
              Xác minh{" "}
              <span className="text-primary font-semibold">Photo Verified</span>{" "}
              để tăng 30% matches và giảm fake.
            </p>
          </motion.div>

          {/* Terms */}
          <p className="text-[10px] text-muted-foreground/60 text-center mt-4 leading-relaxed">
            Bằng cách đăng nhập, bạn đồng ý với{" "}
            <span className="underline cursor-pointer hover:text-muted-foreground/80 transition-colors">Điều khoản</span> và{" "}
            <span className="underline cursor-pointer hover:text-muted-foreground/80 transition-colors">Chính sách bảo mật</span> của Finder.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
