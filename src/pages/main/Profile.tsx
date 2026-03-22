import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Edit,
  MapPin,
  Heart,
  Briefcase,
  User,
  Verified,
  Camera,
  Settings,
  Moon,
  Sun,
  ChevronRight,
  LogOut,
  Bell,
  Lock,
  Eye,
  HelpCircle,
  ScanFace,
  Save,
  X,
  CreditCard,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const interestTags = [
  "Âm nhạc",
  "Du lịch",
  "Thể thao",
  "Đọc sách",
  "Nấu ăn",
  "Chụp ảnh",
  "Phim ảnh",
  "Game",
  "Khiêu vũ",
  "Yoga",
  "Cắm trại",
  "Cafe",
  "Mèo",
  "Chó",
  "Nghệ thuật",
  "Kinh doanh",
  "Công nghệ",
  "Thời trang",
  "Hiking",
  "Tình nguyện",
];

const Profile = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [dark, setDark] = useState(
    document.documentElement.classList.contains("dark"),
  );
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { t, i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  // Edit form state
  const [editName, setEditName] = useState(profile?.name || "");
  const [editAge, setEditAge] = useState(profile?.age?.toString() || "");
  const [editBio, setEditBio] = useState(profile?.bio || "");
  const [editGender, setEditGender] = useState(profile?.gender || "");
  const [editGenderPref, setEditGenderPref] = useState(
    profile?.gender_preference || "",
  );
  const [editInterests, setEditInterests] = useState<string[]>(
    profile?.interests || [],
  );
  const [editCity, setEditCity] = useState(profile?.city || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Real stats from DB
  const [realStats, setRealStats] = useState({ matches: 0, likes: 0 });
  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const { count: matchCount } = await supabase
        .from("matches")
        .select("*", { count: "exact", head: true })
        .or(`user1.eq.${user.id},user2.eq.${user.id}`);
      const { count: likeCount } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("to_user", user.id);
      setRealStats({ matches: matchCount || 0, likes: likeCount || 0 });
    };
    fetchStats();
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `avatar-${user.id}.${ext}`;

      // Upload file (upsert to overwrite previous avatar)
      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadErr) throw uploadErr;

      // Use signed URL (works even if bucket is not public)
      const { data: signedData, error: signErr } = await supabase.storage
        .from("avatars")
        .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10); // 10 year expiry

      if (signErr || !signedData?.signedUrl) {
        throw signErr || new Error("Không thể tạo URL ảnh");
      }

      const avatarUrl = signedData.signedUrl;
      console.log("Avatar URL:", avatarUrl);

      // Update profile with new avatar URL
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", user.id);

      if (updateErr) throw updateErr;

      await refreshProfile();
      toast({ title: "Đã cập nhật ảnh đại diện! 📸" });
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      toast({
        title: "Lỗi tải ảnh",
        description: err?.message || "Không thể tải ảnh lên",
        variant: "destructive",
      });
    }
    setUploadingAvatar(false);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const completionPercent = useMemo(() => {
    if (!profile) return 0;
    let points = 0;
    if (profile.name) points += 20;
    if (profile.avatar_url) points += 20;
    if (profile.bio) points += 20;
    if (profile.interests?.length > 0) points += 20;
    if (profile.age) points += 20;
    return points;
  }, [profile]);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  const startEditing = () => {
    setEditName(profile?.name || "");
    setEditAge(profile?.age?.toString() || "");
    setEditBio(profile?.bio || "");
    setEditGender(profile?.gender || "");
    setEditGenderPref(profile?.gender_preference || "");
    setEditInterests(profile?.interests || []);
    setEditCity(profile?.city || "");
    setEditing(true);
  };

  const toggleInterest = (t: string) => {
    setEditInterests((p) =>
      p.includes(t) ? p.filter((x) => x !== t) : p.length < 8 ? [...p, t] : p,
    );
  };

  const saveProfile = async () => {
    if (!user) return;
    if (!editName.trim()) {
      toast({
        title: "⚠️ Tên không được để trống",
        description: "Vui lòng nhập tên hiển thị của bạn.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name: editName.trim(),
        age: editAge ? parseInt(editAge) : null,
        bio: editBio.trim(),
        gender: editGender || null,
        gender_preference: editGenderPref || null,
        interests: editInterests,
        city: editCity.trim(),
      })
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Đã lưu! ✅" });
      await refreshProfile();
      setEditing(false);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [showGold, setShowGold] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Notification preferences (local state)
  const [notifMatches, setNotifMatches] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [notifConnections, setNotifConnections] = useState(true);

  // Support form state
  const [supportCategory, setSupportCategory] = useState("");
  const [supportDesc, setSupportDesc] = useState("");
  const [supportEmail, setSupportEmail] = useState(user?.email || "");
  const [supportSending, setSupportSending] = useState(false);

  const handleSupportSubmit = async () => {
    if (!supportCategory || !supportDesc.trim()) {
      toast({ title: t("profile.support_modal.error"), variant: "destructive" });
      return;
    }
    setSupportSending(true);
    // Simulate sending
    await new Promise((r) => setTimeout(r, 1000));
    toast({ title: t("profile.support_modal.success"), description: t("profile.support_modal.success_desc") });
    setSupportCategory("");
    setSupportDesc("");
    setSupportSending(false);
    setShowSupport(false);
  };

  // Use profile directly, or fallback to show page immediately
  const displayProfile = profile || {
    id: user?.id || "",
    name: user?.email?.split("@")[0] || "User",
    age: null,
    gender: null,
    gender_preference: null,
    bio: "",
    avatar_url: "",
    photos: [] as string[],
    interests: [] as string[],
    occupation: "",
    university: "",
    city: "",
    lat: null,
    lng: null,
    is_verified: false,
    is_online: true,
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  const avatarUrl =
    displayProfile.avatar_url ||
    `https://api.dicebear.com/7.x/lorelei/svg?seed=${user?.id}&backgroundColor=ffd5dc`;

  return (
    <div className="space-y-6 animate-fade-in pb-24 max-w-md mx-auto">
      {/* Header Profile Section */}
      <div className="relative pt-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-card shadow-romantic group-hover:scale-105 transition-transform duration-500">
              <img
                src={avatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 w-10 h-10 rounded-2xl gradient-hot text-white border-2 border-card shadow-glow flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            >
              {uploadingAvatar ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
            </button>
            {displayProfile.is_verified && (
              <div className="absolute top-0 -right-2 w-8 h-8 rounded-full bg-white shadow-soft flex items-center justify-center border border-superblue-100">
                <Verified className="w-5 h-5 text-superblue-500 fill-white" />
              </div>
            )}
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black italic font-serif-display items-center justify-center flex gap-1.5">
              {displayProfile.name ||
                user?.email?.split("@")[0] ||
                "Chưa đặt tên"}
              {displayProfile.age && `, ${displayProfile.age}`}
            </h2>
            {!displayProfile.name && (
              <p className="text-xs text-primary font-bold mt-1 animate-pulse">
                {t("profile.no_name_warning")}
              </p>
            )}
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1">
              {[
                displayProfile.university,
                displayProfile.occupation,
                displayProfile.city,
              ]
                .filter(Boolean)
                .join(" • ") || t("profile.no_info")}
            </p>
          </div>
        </div>
      </div>

      {/* Completion Tracker */}
      <div className="mx-1 p-5 rounded-3xl bg-card border border-border/5 shadow-soft space-y-3">
        <div className="flex justify-between items-center px-1">
          <h4 className="text-xs font-black uppercase tracking-wider">
            {t("profile.completion", { percent: completionPercent })}
          </h4>
          <span className="text-[10px] font-bold text-primary animate-pulse">
            {t("profile.get_more_likes")}
          </span>
        </div>
        <Progress
          value={completionPercent}
          className="h-2.5 rounded-full bg-primary/10"
        />
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-3 gap-3 mx-1">
        {[
          {
            label: "Matches",
            value: realStats.matches.toString(),
            icon: Target,
            color: "text-red-500",
          },
          {
            label: "Likes",
            value:
              realStats.likes > 999
                ? `${(realStats.likes / 1000).toFixed(1)}k`
                : realStats.likes.toString(),
            icon: Heart,
            color: "text-pink-500",
          },
          { label: "Views", value: "—", icon: Eye, color: "text-purple-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card p-4 rounded-3xl border border-border/5 shadow-soft text-center group hover:shadow-card transition-all"
          >
            <div
              className={`w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}
            >
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-lg font-black">{stat.value}</div>
            <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mx-1">
        <button
          onClick={startEditing}
          className="flex items-center justify-center gap-2 rounded-3xl h-14 font-bold shadow-soft bg-card border border-border/10 hover:bg-muted/80 transition-all active:scale-[0.97] text-sm"
        >
          <Edit className="w-4 h-4 text-primary" />
          <span>{t("profile.edit")}</span>
        </button>
        <button
          onClick={() => setShowGold(true)}
          className="flex items-center justify-center gap-2 rounded-3xl h-14 font-bold gradient-gold text-white shadow-glow border-0 hover:scale-105 active:scale-95 transition-all text-sm"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>{t("profile.premium")}</span>
        </button>
      </div>

      {/* Settings Sections */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-4">
            {t("profile.account_security")}
          </h4>
          <div className="bg-card rounded-[2rem] border border-border/5 shadow-soft overflow-hidden mx-1 divide-y divide-border/5">
            {/* i18n Language Switcher */}
            <div className="bg-card rounded-3xl p-6 shadow-soft border border-border/10 space-y-4">
              <div className="flex items-center gap-3 mb-2 px-1">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base tracking-tight leading-none text-foreground">
                    {t("profile.language")}
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">
                    {t("profile.display_language")}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleLanguageChange("vi")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold transition-all ${
                    i18n.language === "vi"
                      ? "bg-primary text-white shadow-glow ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  Tiếng Việt
                </button>
                <button
                  onClick={() => handleLanguageChange("en")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold transition-all ${
                    i18n.language === "en"
                      ? "bg-primary text-white shadow-glow ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            <button
              onClick={toggleDark}
              className="w-full flex items-center justify-between p-4 px-6 hover:bg-muted/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center">
                  {dark ? (
                    <Moon className="w-5 h-5 text-primary" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <span className="text-sm font-bold tracking-tight">
                  {dark ? t("profile.dark_mode") : t("profile.light_mode")}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setShowNotifications(true)}
              className="w-full flex items-center justify-between p-4 px-6 hover:bg-muted/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-red-500" />
                </div>
                <span className="text-sm font-bold tracking-tight">
                  {t("profile.notifications")}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setShowGold(true)}
              className="w-full flex items-center justify-between p-4 px-6 hover:bg-muted/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-sm font-bold tracking-tight">
                  {t("profile.gold_plan")}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-4">
            {t("profile.other")}
          </h4>
          <div className="bg-card rounded-[2rem] border border-border/5 shadow-soft overflow-hidden mx-1 divide-y divide-border/5">
            <button
              onClick={() => setShowSupport(true)}
              className="w-full flex items-center justify-between p-4 px-6 hover:bg-muted/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-muted/30 flex items-center justify-center text-muted-foreground">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold tracking-tight">
                  {t("profile.support")}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setShowPrivacy(true)}
              className="w-full flex items-center justify-between p-4 px-6 hover:bg-muted/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-muted/30 flex items-center justify-center text-muted-foreground">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold tracking-tight">
                  {t("profile.privacy_policy")}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-between p-4 px-6 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group text-red-500"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                  <LogOut className="w-5 h-5" />
                </div>
                <span className="text-sm font-black tracking-tight uppercase">
                  {t("profile.sign_out")}
                </span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <p className="text-[9px] font-bold text-muted-foreground/50 text-center uppercase tracking-widest pt-4">
        Version 1.0.4 • {user?.email}
      </p>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setEditing(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-card rounded-t-[3rem] sm:rounded-[3rem] p-8 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-6 shadow-elevated"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-2xl font-black italic font-serif-display">
                    Edit Profile
                  </h3>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                    Làm mới bản thân để nổi bật hơn
                  </p>
                </div>
                <button
                  onClick={() => setEditing(false)}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5 px-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">
                    Họ & Tên
                  </label>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Tên hiển thị"
                    className="h-14 rounded-2xl bg-muted/40 border-0 px-6 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 px-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">
                      Tuổi
                    </label>
                    <Input
                      type="number"
                      value={editAge}
                      onChange={(e) => setEditAge(e.target.value)}
                      placeholder="Tuổi"
                      min={18}
                      max={50}
                      className="h-14 rounded-2xl bg-muted/40 border-0 px-6 font-bold"
                    />
                  </div>
                  <div className="space-y-1.5 px-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">
                      Giới tính
                    </label>
                    <select
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value)}
                      className="w-full h-14 rounded-2xl bg-muted/40 border-0 px-6 text-sm font-bold appearance-none"
                    >
                      <option value="">Chọn...</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 px-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">
                    Thành phố
                  </label>
                  <Input
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="Nơi ở hiện tại"
                    className="h-14 rounded-2xl bg-muted/40 border-0 px-6 font-bold"
                  />
                </div>

                <div className="space-y-1.5 px-1">
                  <div className="flex justify-between items-center ml-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      Giới thiệu bản thân
                    </label>
                    <span className="text-[9px] font-bold text-muted-foreground">
                      {editBio.length}/150
                    </span>
                  </div>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value.slice(0, 150))}
                    placeholder="Kể câu chuyện của bạn..."
                    className="w-full h-28 rounded-2xl bg-muted/40 border-0 p-5 text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:outline-none font-medium leading-relaxed"
                  />
                </div>

                <div className="space-y-3 px-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">
                    Muốn tìm kiếm
                  </label>
                  <div className="flex gap-2">
                    {(
                      [
                        ["male", "Nam"],
                        ["female", "Nữ"],
                        ["all", "Tất cả"],
                      ] as const
                    ).map(([v, l]) => (
                      <button
                        key={v}
                        onClick={() => setEditGenderPref(v)}
                        className={`flex-1 h-12 rounded-2xl text-xs font-black uppercase tracking-tighter transition-all ${editGenderPref === v ? "gradient-hot text-white shadow-glow" : "bg-muted/40 text-muted-foreground"}`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 px-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">
                    Sở thích ({editInterests.length}/8)
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1 scrollbar-none">
                    {interestTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleInterest(tag)}
                        className={`px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-tight transition-all ${editInterests.includes(tag) ? "gradient-hot text-white shadow-sm" : "bg-muted/40 text-muted-foreground hover:bg-muted/60"}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={saveProfile}
                disabled={saving}
                className="w-full h-16 rounded-3xl gradient-hot border-0 text-white font-black text-lg shadow-glow mt-4"
              >
                {saving ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {" "}
                    <Save className="w-5 h-5 mr-2" /> CẬP NHẬT HỒ SƠ{" "}
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Notifications Modal ═══ */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowNotifications(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-card rounded-t-[3rem] sm:rounded-[3rem] p-8 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-6 shadow-elevated"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-2xl font-black italic font-serif-display">
                    {t("profile.notifications_modal.title")}
                  </h3>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">
                    {t("profile.notifications_modal.subtitle")}
                  </p>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { key: "matches", label: t("profile.notifications_modal.new_matches"), desc: t("profile.notifications_modal.new_matches_desc"), state: notifMatches, toggle: setNotifMatches },
                  { key: "messages", label: t("profile.notifications_modal.new_messages"), desc: t("profile.notifications_modal.new_messages_desc"), state: notifMessages, toggle: setNotifMessages },
                  { key: "connections", label: t("profile.notifications_modal.connection_requests"), desc: t("profile.notifications_modal.connection_requests_desc"), state: notifConnections, toggle: setNotifConnections },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
                    <div className="flex-1 mr-4">
                      <p className="text-sm font-bold">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => item.toggle(!item.state)}
                      className={`w-12 h-7 rounded-full transition-all relative ${item.state ? "bg-primary" : "bg-muted"}`}
                    >
                      <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all ${item.state ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => {
                  toast({ title: t("profile.notifications_modal.saved") });
                  setShowNotifications(false);
                }}
                className="w-full h-14 rounded-3xl gradient-hot border-0 text-white font-black text-base shadow-glow"
              >
                <Save className="w-5 h-5 mr-2" /> {t("profile.edit_modal.save")}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Gold Plan Modal ═══ */}
      <AnimatePresence>
        {showGold && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowGold(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-card rounded-t-[3rem] sm:rounded-[3rem] p-8 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-6 shadow-elevated"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-2xl font-black italic font-serif-display">
                    {t("profile.gold_modal.title")}
                  </h3>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">
                    {t("profile.gold_modal.subtitle")}
                  </p>
                </div>
                <button
                  onClick={() => setShowGold(false)}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Basic */}
                <div className="rounded-3xl border-2 border-primary/30 bg-primary/5 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-black">{t("profile.gold_modal.basic")}</h4>
                    <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{t("profile.gold_modal.current_plan")}</span>
                  </div>
                  <p className="text-2xl font-black text-primary">{t("profile.gold_modal.basic_price")}</p>
                  <ul className="space-y-2">
                    {(t("profile.gold_modal.basic_features", { returnObjects: true }) as string[]).map((f: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary text-xs">✓</span>
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plus */}
                <div className="rounded-3xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 p-5 space-y-3 relative overflow-hidden">
                  <div className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-wider bg-amber-400 text-white px-2.5 py-1 rounded-full">
                    {t("profile.gold_modal.popular")}
                  </div>
                  <h4 className="text-lg font-black">{t("profile.gold_modal.plus")}</h4>
                  <p className="text-2xl font-black text-amber-600">{t("profile.gold_modal.plus_price")}</p>
                  <ul className="space-y-2">
                    {(t("profile.gold_modal.plus_features", { returnObjects: true }) as string[]).map((f: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-5 h-5 rounded-full bg-amber-400/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-amber-600 text-xs">✓</span>
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full h-12 rounded-2xl bg-amber-400 text-white font-bold text-sm hover:bg-amber-500 transition-all active:scale-[0.97]">
                    {t("profile.gold_modal.coming_soon")}
                  </button>
                </div>

                {/* Premium */}
                <div className="rounded-3xl border-2 border-purple-400/50 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 p-5 space-y-3">
                  <h4 className="text-lg font-black">{t("profile.gold_modal.premium")}</h4>
                  <p className="text-2xl font-black text-purple-600">{t("profile.gold_modal.premium_price")}</p>
                  <ul className="space-y-2">
                    {(t("profile.gold_modal.premium_features", { returnObjects: true }) as string[]).map((f: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-5 h-5 rounded-full bg-purple-400/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-600 text-xs">✓</span>
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm hover:opacity-90 transition-all active:scale-[0.97]">
                    {t("profile.gold_modal.coming_soon")}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Support Modal ═══ */}
      <AnimatePresence>
        {showSupport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowSupport(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-card rounded-t-[3rem] sm:rounded-[3rem] p-8 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-6 shadow-elevated"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-2xl font-black italic font-serif-display">
                    {t("profile.support_modal.title")}
                  </h3>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">
                    {t("profile.support_modal.subtitle")}
                  </p>
                </div>
                <button
                  onClick={() => setShowSupport(false)}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5 px-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">
                    {t("profile.support_modal.category")} *
                  </label>
                  <select
                    value={supportCategory}
                    onChange={(e) => setSupportCategory(e.target.value)}
                    className="w-full h-14 rounded-2xl bg-muted/40 border-0 px-6 text-sm font-bold appearance-none"
                  >
                    <option value="">{t("profile.support_modal.select_category")}</option>
                    <option value="bug">{t("profile.support_modal.categories.bug")}</option>
                    <option value="account">{t("profile.support_modal.categories.account")}</option>
                    <option value="safety">{t("profile.support_modal.categories.safety")}</option>
                    <option value="feedback">{t("profile.support_modal.categories.feedback")}</option>
                    <option value="other">{t("profile.support_modal.categories.other")}</option>
                  </select>
                </div>

                <div className="space-y-1.5 px-1">
                  <div className="flex justify-between items-center ml-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      {t("profile.support_modal.description")} *
                    </label>
                    <span className="text-[9px] font-bold text-muted-foreground">
                      {supportDesc.length}/500
                    </span>
                  </div>
                  <textarea
                    value={supportDesc}
                    onChange={(e) => setSupportDesc(e.target.value.slice(0, 500))}
                    placeholder={t("profile.support_modal.description_placeholder")}
                    className="w-full h-32 rounded-2xl bg-muted/40 border-0 p-5 text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:outline-none font-medium leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5 px-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-2">
                    {t("profile.support_modal.email")}
                  </label>
                  <Input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder={t("profile.support_modal.email_placeholder")}
                    className="h-14 rounded-2xl bg-muted/40 border-0 px-6 font-bold"
                  />
                </div>
              </div>

              <Button
                onClick={handleSupportSubmit}
                disabled={supportSending}
                className="w-full h-16 rounded-3xl gradient-hot border-0 text-white font-black text-lg shadow-glow mt-4"
              >
                {supportSending ? (
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>{t("profile.support_modal.submit")}</>
                )}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Privacy Policy Modal ═══ */}
      <AnimatePresence>
        {showPrivacy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowPrivacy(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-card rounded-t-[3rem] sm:rounded-[3rem] p-8 w-full max-w-md max-h-[90vh] overflow-y-auto space-y-6 shadow-elevated"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-2xl font-black italic font-serif-display">
                    {t("profile.privacy_modal.title")}
                  </h3>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">
                    {t("profile.privacy_modal.subtitle")}
                  </p>
                </div>
                <button
                  onClick={() => setShowPrivacy(false)}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground font-medium px-1">
                {t("profile.privacy_modal.last_updated")}
              </p>

              <div className="space-y-5">
                {["collection", "usage", "sharing", "security", "rights", "contact"].map((key) => (
                  <div key={key} className="space-y-2 px-1">
                    <h4 className="text-sm font-black">
                      {t(`profile.privacy_modal.sections.${key}.title`)}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(`profile.privacy_modal.sections.${key}.content`)}
                    </p>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => setShowPrivacy(false)}
                className="w-full h-14 rounded-3xl bg-muted hover:bg-muted/80 border-0 text-foreground font-black text-base"
              >
                <X className="w-5 h-5 mr-2" /> {t("profile.edit_modal.title") === "Edit Profile" ? "Close" : "Đóng"}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
