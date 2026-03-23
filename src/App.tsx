import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { useTranslation } from "react-i18next";

// Auth pages
import Splash from "./pages/auth/Splash";
import Login from "./pages/auth/Login";
import Onboarding from "./pages/auth/Onboarding";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AuthCallback from "./pages/auth/AuthCallback";

// Main pages
import Landing from "./pages/main/Landing";
import Swipe from "./pages/main/Swipe";
import Explore from "./pages/main/Explore";
import Matches from "./pages/main/Matches";
import Messages from "./pages/main/Messages";
import Profile from "./pages/main/Profile";
import NotFound from "./pages/main/NotFound";
import UserProfile from "./pages/main/UserProfile";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, profile } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  if (user) {
    // Profile is still loading asynchronously — wait for it
    if (!profile)
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      );
    // Profile loaded but no name — needs onboarding
    if (!profile.name || !profile.name.trim())
      return <Navigate to="/onboarding" replace />;
    // Profile complete — go to explore
    return <Navigate to="/explore" replace />;
  }
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    {/* Landing page — default entry point */}
    <Route
      path="/"
      element={
        <PublicRoute>
          <Landing />
        </PublicRoute>
      }
    />
    <Route
      path="/home"
      element={
        <PublicRoute>
          <Landing />
        </PublicRoute>
      }
    />

    {/* Auth flow */}
    <Route path="/splash" element={<Splash />} />
    <Route
      path="/login"
      element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      }
    />
    <Route
      path="/onboarding"
      element={
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      }
    />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/auth/callback" element={<AuthCallback />} />

    {/* Main app (with layout) */}
    <Route
      path="/swipe"
      element={
        <ProtectedRoute>
          <AppLayout>
            <Swipe />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/explore"
      element={
        <ProtectedRoute>
          <AppLayout>
            <Explore />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/matches"
      element={
        <ProtectedRoute>
          <AppLayout>
            <Matches />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/messages"
      element={
        <ProtectedRoute>
          <AppLayout>
            <Messages />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <ProtectedRoute>
          <AppLayout>
            <Profile />
          </AppLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/user-profile"
      element={
        <ProtectedRoute>
          <AppLayout>
            <UserProfile />
          </AppLayout>
        </ProtectedRoute>
      }
    />

    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
