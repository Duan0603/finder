import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail, Lock, Check, ArrowRight, Flame } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const nav = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"input" | "done">("input");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập email",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    } else {
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
            <h2 className="text-2xl font-bold">Đã gửi email! 📧</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Kiểm tra email{" "}
              <span className="font-semibold text-foreground">{email}</span> để
              đặt lại mật khẩu.
            </p>
          </div>
          <Button
            onClick={() => nav("/login")}
            className="w-full h-[52px] rounded-2xl gradient-hot border-0 text-white font-semibold shadow-elevated"
          >
            Quay lại đăng nhập <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 pt-12">
      <div className="max-w-sm mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => nav("/login")}
            className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <Flame className="w-5 h-5 text-primary" />
        </div>
        <div className="animate-fade-in">
          <h2 className="text-2xl font-bold">Quên mật khẩu</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Nhập email đã đăng ký để nhận link đặt lại mật khẩu
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="h-[52px] rounded-2xl bg-muted/40 border-0 pl-11 focus:ring-2 focus:ring-primary/20"
            />
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
                Gửi email reset <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
