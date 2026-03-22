import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase auth state will be handled by AuthContext
    // Just redirect to home after callback
    const timer = setTimeout(() => {
      navigate("/");
    }, 500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
