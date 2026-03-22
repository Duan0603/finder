import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Lock,
  Check,
  Eye,
  EyeOff,
  Flame,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const nav = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "done">("form");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  // Listen for the PASSWORD_RECOVERY event from Supabase
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Also check if we already have a session (user clicked the link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || password.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Sign out so user isn't auto-logged in — they should log in with the new password
      await supabase.auth.signOut();
      setStep("done");
    }
  };

  if (step === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center space-y-6 animate-scale-in">
          <div className="w-20 h-20 rounded-3xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-green-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Đổi mật khẩu thành công! 🎉</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Mật khẩu của bạn đã được cập nhật. Hãy đăng nhập với mật khẩu mới.
            </p>
          </div>
          <Button
            onClick={() => nav("/login")}
            className="w-full h-[52px] rounded-2xl gradient-hot border-0 text-white font-semibold shadow-elevated"
          >
            Đăng nhập ngay <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center space-y-6 animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Đang xác thực...</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Vui lòng đợi trong giây lát. Nếu bạn chưa nhận được email, hãy thử
              lại.
            </p>
          </div>
          <Button
            onClick={() => nav("/forgot-password")}
            variant="outline"
            className="w-full h-[52px] rounded-2xl font-semibold"
          >
            Gửi lại email reset
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 pt-12">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Flame className="w-5 h-5 text-primary" />
        </div>
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold">Đặt lại mật khẩu</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Nhập mật khẩu mới cho tài khoản của bạn
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu mới (ít nhất 6 ký tự)"
              className="h-[52px] rounded-2xl bg-muted/40 border-0 pl-11 pr-11 focus:ring-2 focus:ring-primary/20"
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
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Xác nhận mật khẩu mới"
              className="h-[52px] rounded-2xl bg-muted/40 border-0 pl-11 pr-11 focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirm ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] rounded-2xl gradient-hot border-0 text-white font-semibold shadow-elevated"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Đặt lại mật khẩu <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
