import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Wait for the auth context to finish loading
    if (!loading) {
      if (user) {
        // If logged in, go to the main app
        navigate("/explore", { replace: true });
      } else {
        // Check if we are in the middle of an OAuth redirect (hash contains tokens)
        // If so, don't redirect to landing yet, wait for AuthContext to pick it up
        const hasHash = window.location.hash.includes("access_token") || 
                        window.location.hash.includes("id_token") ||
                        window.location.hash.includes("error_description");
        
        if (!hasHash) {
          // Otherwise, send them back to landing or login
          navigate("/", { replace: true });
        }
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-lg font-medium text-foreground animate-pulse">
          Đang xử lý đăng nhập...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
