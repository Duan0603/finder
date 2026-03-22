import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle OAuth callback - wait for Supabase to process the response
    const handleCallback = async () => {
      try {
        // Get current session after OAuth redirect
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session?.user) {
          // Session established successfully, redirect to home
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 500);
        } else {
          // No session, might fail - redirect to login
          setTimeout(() => {
            navigate("/login", { replace: true });
          }, 1000);
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-500">Lỗi: {error}</p>
          <p className="mt-2 text-sm text-gray-500">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
