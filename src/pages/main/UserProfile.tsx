import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  MapPin,
  Verified,
  Briefcase,
  GraduationCap,
  Sparkles,
  Clock,
  Share2,
  Shield,
  Calendar,
  Globe,
  Star,
  Send,
} from "lucide-react";
import { useAuth, Profile } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { containsBannedWord } from "@/lib/banned-words";

// ========== REVIEWS TYPES ==========
interface Review {
  id: string;
  from_user: string;
  to_user: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer?: { name: string; avatar_url: string };
}

// Mock reviews for demo users
const mockReviews: Record<string, Review[]> = {
  "mock-1": [
    {
      id: "r1",
      from_user: "system",
      to_user: "mock-1",
      rating: 5,
      comment: "Người rất thân thiện và vui vẻ! 😊",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      reviewer: {
        name: "Minh Tuấn",
        avatar_url:
          "https://api.dicebear.com/7.x/lorelei/svg?seed=minhtuan&backgroundColor=c0aede",
      },
    },
    {
      id: "r2",
      from_user: "system",
      to_user: "mock-1",
      rating: 4,
      comment: "Nói chuyện thú vị lắm",
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      reviewer: {
        name: "Thu Hà",
        avatar_url:
          "https://api.dicebear.com/7.x/lorelei/svg?seed=thuha&backgroundColor=ffd5dc",
      },
    },
  ],
  "mock-2": [
    {
      id: "r3",
      from_user: "system",
      to_user: "mock-2",
      rating: 5,
      comment: "Dev giỏi, tâm huyết 💻",
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      reviewer: {
        name: "Ngọc Trinh",
        avatar_url:
          "https://api.dicebear.com/7.x/lorelei/svg?seed=ngoctrinh&backgroundColor=ffd5dc",
      },
    },
  ],
};

// ========== MOCK USERS (same as Explore) ==========
const mockUsers: (Profile & { distance?: number })[] = [
  {
    id: "mock-1",
    name: "Ngọc Trinh",
    age: 21,
    gender: "female",
    gender_preference: "male",
    bio: "Thích đi cafe và đọc sách 📚☕ Mình là người thích khám phá những quán cafe mới và đọc sách vào cuối tuần. Hy vọng tìm được bạn có cùng sở thích!",
    avatar_url:
      "https://api.dicebear.com/7.x/lorelei/svg?seed=ngoctrinh&backgroundColor=ffd5dc",
    photos: [],
    interests: ["Cafe", "Đọc sách", "Du lịch", "Chụp ảnh"],
    occupation: "Sinh viên",
    university: "ĐH FPT",
    city: "Hồ Chí Minh",
    lat: 10.8416,
    lng: 106.81,
    is_verified: true,
    is_online: true,
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-2",
    name: "Minh Tuấn",
    age: 23,
    gender: "male",
    gender_preference: "female",
    bio: "Developer by day, gamer by night 🎮 Full-stack developer đam mê công nghệ. Thích chơi game và xem phim Marvel vào cuối tuần.",
    avatar_url:
      "https://api.dicebear.com/7.x/lorelei/svg?seed=minhtuan&backgroundColor=c0aede",
    photos: [],
    interests: ["Game", "Công nghệ", "Thể thao", "Âm nhạc"],
    occupation: "Software Engineer",
    university: "ĐH Bách Khoa",
    city: "Hồ Chí Minh",
    lat: 10.85,
    lng: 106.795,
    is_verified: true,
    is_online: false,
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-3",
    name: "Thu Hà",
    age: 20,
    gender: "female",
    gender_preference: "male",
    bio: "Yêu thiên nhiên và động vật 🌿🐱 Tình nguyện viên tại trại cứu hộ động vật. Thích yoga buổi sáng và nấu ăn chay.",
    avatar_url:
      "https://api.dicebear.com/7.x/lorelei/svg?seed=thuha&backgroundColor=ffd5dc",
    photos: [],
    interests: ["Mèo", "Yoga", "Cắm trại", "Nấu ăn"],
    occupation: "Sinh viên",
    university: "ĐH Sư Phạm",
    city: "Hồ Chí Minh",
    lat: 10.855,
    lng: 106.802,
    is_verified: false,
    is_online: true,
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-4",
    name: "Đức Anh",
    age: 22,
    gender: "male",
    gender_preference: "female",
    bio: "Kinh doanh & Travel lover ✈️ Founder một startup nhỏ về e-commerce. Thích du lịch bụi và khám phá ẩm thực đường phố.",
    avatar_url:
      "https://api.dicebear.com/7.x/lorelei/svg?seed=ducanh&backgroundColor=b6e3f4",
    photos: [],
    interests: ["Du lịch", "Kinh doanh", "Thời trang", "Phim ảnh"],
    occupation: "Founder startup",
    university: "ĐH Kinh Tế",
    city: "Hồ Chí Minh",
    lat: 10.838,
    lng: 106.82,
    is_verified: true,
    is_online: true,
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-5",
    name: "Hương Ly",
    age: 21,
    gender: "female",
    gender_preference: "male",
    bio: "Dancing is my therapy 💃 Mình là vũ công contemporary và hip-hop. Thường biểu diễn tại các sự kiện và cuộc thi.",
    avatar_url:
      "https://api.dicebear.com/7.x/lorelei/svg?seed=huongly&backgroundColor=ffd5dc",
    photos: [],
    interests: ["Khiêu vũ", "Âm nhạc", "Thời trang", "Cafe"],
    occupation: "Sinh viên",
    university: "ĐH FPT",
    city: "Hồ Chí Minh",
    lat: 10.846,
    lng: 106.798,
    is_verified: false,
    is_online: false,
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-6",
    name: "Quốc Bảo",
    age: 24,
    gender: "male",
    gender_preference: "female",
    bio: "Photographer | Coffee addict ☕📸 Chuyên chụp ảnh chân dung và phong cảnh. Thích lang thang các con hẻm Sài Gòn để tìm góc ảnh đẹp.",
    avatar_url:
      "https://api.dicebear.com/7.x/lorelei/svg?seed=quocbao&backgroundColor=d1d4f9",
    photos: [],
    interests: ["Chụp ảnh", "Cafe", "Hiking", "Nghệ thuật"],
    occupation: "Photographer",
    university: "ĐH Mỹ Thuật",
    city: "Hồ Chí Minh",
    lat: 10.833,
    lng: 106.805,
    is_verified: true,
    is_online: true,
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-7",
    name: "Mai Phương",
    age: 20,
    gender: "female",
    gender_preference: "male",
    bio: "Volunteer & bookworm 📖💛 Tham gia nhiều dự án tình nguyện giáo dục. Mơ ước trở thành giáo viên và truyền cảm hứng cho trẻ em.",
    avatar_url:
      "https://api.dicebear.com/7.x/lorelei/svg?seed=maiphuong&backgroundColor=ffd5dc",
    photos: [],
    interests: ["Tình nguyện", "Đọc sách", "Yoga", "Du lịch"],
    occupation: "Sinh viên",
    university: "ĐH Quốc Gia",
    city: "Hồ Chí Minh",
    lat: 10.86,
    lng: 106.815,
    is_verified: false,
    is_online: true,
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-8",
    name: "Hoàng Nam",
    age: 23,
    gender: "male",
    gender_preference: "female",
    bio: "Gym rat & foodie 🏋️‍♂️🍜 Personal trainer tại một phòng gym ở Thủ Đức. Thích nấu ăn healthy và chia sẻ công thức.",
    avatar_url:
      "https://api.dicebear.com/7.x/lorelei/svg?seed=hoangnam&backgroundColor=b6e3f4",
    photos: [],
    interests: ["Thể thao", "Nấu ăn", "Game", "Phim ảnh"],
    occupation: "Personal Trainer",
    university: "ĐH TDTT",
    city: "Hồ Chí Minh",
    lat: 10.848,
    lng: 106.825,
    is_verified: true,
    is_online: false,
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  // ========== ĐÀ NẴNG USERS ==========
  {
    id: "mock-dn-1",
    name: "Thanh Trúc",
    age: 21,
    gender: "female",
    gender_preference: "male",
    bio: "Sinh viên FPT Đà Nẵng 🎓 Thích chạy bộ ven biển Mỹ Khê mỗi sáng và học lập trình web.",
    avatar_url:
      "https://api.dicebear.com/7.x/lorelei/svg?seed=thanhtruc&backgroundColor=ffd5dc",
    photos: [],
    interests: ["Thể thao", "Công nghệ", "Cafe", "Du lịch"],
    occupation: "Sinh viên IT",
    university: "ĐH FPT Đà Nẵng",
    city: "Đà Nẵng",
    lat: 15.9686,
    lng: 108.2612,
    is_verified: true,
    is_online: true,
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-dn-2",
    name: "Văn Khoa",
    age: 22,
    gender: "male",
    gender_preference: "female",
    bio: "Designer tại một startup Đà Nẵng 🎨 Thích surf và khám phá Bà Nà Hills vào cuối tuần.",
    avatar_url:
      "https://api.dicebear.com/7.x/lorelei/svg?seed=vankhoa&backgroundColor=b6e3f4",
    photos: [],
    interests: ["Nghệ thuật", "Thể thao", "Chụp ảnh", "Âm nhạc"],
    occupation: "UI/UX Designer",
    university: "ĐH Bách Khoa ĐN",
    city: "Đà Nẵng",
    lat: 16.054,
    lng: 108.202,
    is_verified: true,
    is_online: true,
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-dn-3",
    name: "Khánh Linh",
    age: 20,
    gender: "female",
    gender_preference: "male",
    bio: "Yêu biển và ẩm thực Đà Nẵng 🌊🍜 Hay đi Sơn Trà chụp ảnh voọc.",
    avatar_url:
      "https://api.dicebear.com/7.x/lorelei/svg?seed=khanhlinh&backgroundColor=ffd5dc",
    photos: [],
    interests: ["Chụp ảnh", "Du lịch", "Nấu ăn", "Yoga"],
    occupation: "Sinh viên",
    university: "ĐH Duy Tân",
    city: "Đà Nẵng",
    lat: 16.068,
    lng: 108.223,
    is_verified: false,
    is_online: true,
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-dn-4",
    name: "Hữu Phước",
    age: 23,
    gender: "male",
    gender_preference: "female",
    bio: "Full-stack dev 💻 Làm việc remote tại coworking space. Fan bóng đá và hay đá phủi ở Hòa Xuân.",
    avatar_url:
      "https://api.dicebear.com/7.x/lorelei/svg?seed=huuphuoc&backgroundColor=c0aede",
    photos: [],
    interests: ["Công nghệ", "Thể thao", "Game", "Cafe"],
    occupation: "Full-stack Developer",
    university: "ĐH FPT Đà Nẵng",
    city: "Đà Nẵng",
    lat: 15.975,
    lng: 108.253,
    is_verified: true,
    is_online: false,
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-dn-5",
    name: "Ngọc Ánh",
    age: 21,
    gender: "female",
    gender_preference: "male",
    bio: "Dance crew member 💃✨ Biểu diễn tại các sự kiện ở Đà Nẵng. Thích cà phê muối Hội An!",
    avatar_url:
      "https://api.dicebear.com/7.x/lorelei/svg?seed=ngocanh&backgroundColor=ffd5dc",
    photos: [],
    interests: ["Khiêu vũ", "Âm nhạc", "Cafe", "Thời trang"],
    occupation: "Sinh viên",
    university: "ĐH Kinh Tế ĐN",
    city: "Đà Nẵng",
    lat: 16.044,
    lng: 108.21,
    is_verified: false,
    is_online: false,
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-dn-6",
    name: "Bảo Long",
    age: 24,
    gender: "male",
    gender_preference: "female",
    bio: "Barista & coffee roaster ☕ Mở quán nhỏ ở Ngũ Hành Sơn. Thích trekking và camping dã ngoại.",
    avatar_url:
      "https://api.dicebear.com/7.x/lorelei/svg?seed=baolong&backgroundColor=d1d4f9",
    photos: [],
    interests: ["Cafe", "Hiking", "Cắm trại", "Chụp ảnh"],
    occupation: "Barista / Owner",
    university: "ĐH Đông Á",
    city: "Đà Nẵng",
    lat: 16.018,
    lng: 108.238,
    is_verified: true,
    is_online: true,
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

// Haversine
function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

// ========== INTEREST ICONS ==========
const interestEmojis: Record<string, string> = {
  "Âm nhạc": "🎵",
  "Du lịch": "✈️",
  "Thể thao": "⚽",
  "Đọc sách": "📚",
  "Nấu ăn": "🍳",
  "Chụp ảnh": "📸",
  "Phim ảnh": "🎬",
  Game: "🎮",
  "Khiêu vũ": "💃",
  Yoga: "🧘",
  "Cắm trại": "⛺",
  Cafe: "☕",
  Mèo: "🐱",
  Chó: "🐕",
  "Nghệ thuật": "🎨",
  "Kinh doanh": "💼",
  "Công nghệ": "💻",
  "Thời trang": "👗",
  Hiking: "🥾",
  "Tình nguyện": "💛",
};

const UserProfile = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile: myProfile } = useAuth();
  const { toast } = useToast();
  const [dbUser, setDbUser] = useState<
    (Profile & { distance?: number }) | null
  >(null);
  const [dbLoading, setDbLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [isMatched, setIsMatched] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [myReviewRating, setMyReviewRating] = useState(0);
  const [myReviewComment, setMyReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const userId = searchParams.get("id");
  const myLat = myProfile?.lat || 10.8231;
  const myLng = myProfile?.lng || 106.6297;

  // Instantly resolve mock users — NO loading state needed
  const mockUser = useMemo(() => {
    if (!userId) return null;
    const found = mockUsers.find((u) => u.id === userId);
    if (!found) return null;
    return {
      ...found,
      distance:
        found.lat && found.lng
          ? haversineKm(myLat, myLng, found.lat, found.lng)
          : undefined,
    };
  }, [userId, myLat, myLng]);

  // Only fetch from DB if not a mock user
  useEffect(() => {
    if (!userId || mockUser) return;
    setDbLoading(true);
    const fetchProfile = async () => {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        if (data) {
          setDbUser({
            ...data,
            distance:
              data.lat && data.lng
                ? haversineKm(myLat, myLng, data.lat, data.lng)
                : undefined,
          });
        }
      } catch {
        // ignore
      }
      setDbLoading(false);
    };
    fetchProfile();
  }, [userId, mockUser, myLat, myLng]);

  // Use mock user instantly, or DB user after fetch
  const profileUser = mockUser || dbUser;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ========== CHECK IF ALREADY LIKED (persistent) ==========
  useEffect(() => {
    if (!user || !userId) return;
    supabase
      .from("likes")
      .select("id")
      .eq("from_user", user.id)
      .eq("to_user", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setLiked(true);
      });
    // Also check if already matched
    supabase
      .from("matches")
      .select("id")
      .or(
        `and(user1.eq.${user.id},user2.eq.${userId}),and(user1.eq.${userId},user2.eq.${user.id})`,
      )
      .maybeSingle()
      .then(({ data }) => {
        if (data) setIsMatched(true);
      });
  }, [user, userId]);

  // ========== HANDLE LIKE/UNLIKE ==========
  const handleLikeToggle = useCallback(async () => {
    if (!user || !userId || likeLoading) return;
    setLikeLoading(true);

    if (liked) {
      // Unlike
      await supabase
        .from("likes")
        .delete()
        .eq("from_user", user.id)
        .eq("to_user", userId);
      setLiked(false);
      setIsMatched(false);
      toast({ title: "Đã hủy kết nối" });
    } else {
      // Send connection request (Like)
      const { error } = await supabase.from("likes").insert({
        from_user: user.id,
        to_user: userId,
      });
      if (!error) {
        setLiked(true);
        toast({
          title: "🤝 Đã gửi lời kết nối!",
          description: `Chờ ${profileUser?.name || "người này"} chấp nhận`,
        });

        // Check if match was created (mutual connection)
        const { data: matchData } = await supabase
          .from("matches")
          .select("id")
          .or(
            `and(user1.eq.${user.id},user2.eq.${userId}),and(user1.eq.${userId},user2.eq.${user.id})`,
          )
          .maybeSingle();
        if (matchData) {
          setIsMatched(true);
          toast({
            title: "🎉 Đã kết nối thành công!",
            description: `Vị trí của bạn và ${profileUser?.name} đã được chia sẻ trên bản đồ!`,
          });
        }
      }
    }
    setLikeLoading(false);
  }, [user, userId, liked, likeLoading, profileUser?.name, toast]);

  // ========== FETCH REVIEWS ==========
  useEffect(() => {
    if (!userId) return;

    if (userId.startsWith("mock-")) {
      const mr = mockReviews[userId] || [];
      setReviews(mr);
      if (mr.length > 0) {
        setAvgRating(mr.reduce((acc, r) => acc + r.rating, 0) / mr.length);
      }
      return;
    }

    // Fetch real reviews
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("to_user", userId)
        .order("created_at", { ascending: false });

      if (data && data.length > 0) {
        // Fetch reviewer profiles
        const reviewerIds = data.map((r: any) => r.from_user);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .in("id", reviewerIds);
        const pMap = new Map((profiles || []).map((p: any) => [p.id, p]));

        const enriched: Review[] = data.map((r: any) => ({
          ...r,
          reviewer: pMap.get(r.from_user) || {
            name: "Ẩn danh",
            avatar_url: "",
          },
        }));
        setReviews(enriched);
        setAvgRating(
          enriched.reduce((acc, r) => acc + r.rating, 0) / enriched.length,
        );

        // Check if current user already reviewed
        if (user) {
          const existing = enriched.find((r) => r.from_user === user.id);
          if (existing) {
            setHasReviewed(true);
            setMyReviewRating(existing.rating);
            setMyReviewComment(existing.comment);
          }
        }
      }
    };
    fetchReviews();
  }, [userId, user]);

  // ========== SUBMIT REVIEW ==========
  const submitReview = async () => {
    if (!user || !userId || myReviewRating === 0 || reviewSubmitting) return;
    if (userId.startsWith("mock-")) {
      toast({
        title: "Demo",
        description: "Không thể đánh giá người dùng demo",
      });
      return;
    }
    if (userId === user.id) {
      toast({
        title: "Lỗi",
        description: "Không thể tự đánh giá",
        variant: "destructive",
      });
      return;
    }

    // Check banned words
    const banned = containsBannedWord(myReviewComment);
    if (banned) {
      toast({
        title: "⚠️ Nội dung không phù hợp",
        description: `Vui lòng không sử dụng từ ngữ không phù hợp`,
        variant: "destructive",
      });
      return;
    }

    setReviewSubmitting(true);
    const { error } = await supabase.from("reviews").upsert(
      {
        from_user: user.id,
        to_user: userId,
        rating: myReviewRating,
        comment: myReviewComment,
      },
      { onConflict: "from_user,to_user" },
    );

    if (!error) {
      toast({ title: "✅ Đã gửi đánh giá!", description: "Cảm ơn bạn" });
      setHasReviewed(true);
      // Refresh reviews
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("to_user", userId)
        .order("created_at", { ascending: false });
      if (data) {
        const reviewerIds = data.map((r: any) => r.from_user);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .in("id", reviewerIds);
        const pMap = new Map((profiles || []).map((p: any) => [p.id, p]));
        const enriched: Review[] = data.map((r: any) => ({
          ...r,
          reviewer: pMap.get(r.from_user) || {
            name: "Ẩn danh",
            avatar_url: "",
          },
        }));
        setReviews(enriched);
        setAvgRating(
          enriched.reduce((acc, r) => acc + r.rating, 0) / enriched.length,
        );
      }
    } else {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
    setReviewSubmitting(false);
  };

  // Only show loading for DB user fetches
  if (dbLoading && !profileUser) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
        <p className="text-lg font-semibold text-muted-foreground">
          Không tìm thấy người dùng
        </p>
        <button
          onClick={() => navigate("/explore")}
          className="px-6 py-3 rounded-2xl gradient-hot text-white font-bold"
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  const u = profileUser;
  const avatarUrl =
    u.avatar_url ||
    `https://api.dicebear.com/7.x/lorelei/svg?seed=${u.id}&backgroundColor=ffd5dc`;
  const commonInterests = myProfile
    ? u.interests?.filter((x) => myProfile.interests?.includes(x)) || []
    : [];

  return (
    <div className="pb-24 animate-fade-in max-w-lg mx-auto">
      {/* ═══════ HERO SECTION ═══════ */}
      <div className="relative">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-black/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        {/* Share button */}
        <button className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-black/50 transition-colors">
          <Share2 className="w-5 h-5 text-white" />
        </button>

        {/* Avatar hero — full width */}
        <div className="relative w-full aspect-square sm:aspect-[4/3] max-h-[520px] overflow-hidden rounded-b-[3rem] bg-gradient-to-b from-pink-100 to-pink-50">
          <img
            src={avatarUrl}
            alt={u.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Name & basic info overlay */}
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black tracking-tight">
                {u.name}
                {u.age && <span className="font-light">, {u.age}</span>}
              </h1>
              {u.is_verified && (
                <Verified className="w-6 h-6 text-blue-400 fill-white" />
              )}
            </div>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {u.is_online && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-green-500/90 backdrop-blur-md px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  Đang hoạt động
                </span>
              )}
              {u.distance !== undefined && (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                  <MapPin className="w-3 h-3" />
                  {formatDist(u.distance)}
                </span>
              )}
              {u.city && (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                  <Globe className="w-3 h-3" />
                  {u.city}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ CONTENT ═══════ */}
      <div className="px-5 space-y-6 mt-6">
        {/* Bio section */}
        {u.bio && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 rounded-[2rem] bg-card border border-border/5 shadow-soft"
          >
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Giới thiệu
            </h3>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {u.bio}
            </p>
          </motion.div>
        )}

        {/* Info cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-3"
        >
          {u.occupation && (
            <div className="p-4 rounded-2xl bg-card border border-border/5 shadow-soft">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2.5">
                <Briefcase className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                Công việc
              </p>
              <p className="text-sm font-bold mt-1 truncate">{u.occupation}</p>
            </div>
          )}
          {u.university && (
            <div className="p-4 rounded-2xl bg-card border border-border/5 shadow-soft">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center mb-2.5">
                <GraduationCap className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                Trường học
              </p>
              <p className="text-sm font-bold mt-1 truncate">{u.university}</p>
            </div>
          )}
          {u.city && (
            <div className="p-4 rounded-2xl bg-card border border-border/5 shadow-soft">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-2.5">
                <MapPin className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                Thành phố
              </p>
              <p className="text-sm font-bold mt-1 truncate">{u.city}</p>
            </div>
          )}
          <div className="p-4 rounded-2xl bg-card border border-border/5 shadow-soft">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center mb-2.5">
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
              Hoạt động
            </p>
            <p className="text-sm font-bold mt-1 truncate">
              {u.is_online ? "Đang online" : timeAgo(u.last_active)}
            </p>
          </div>
        </motion.div>

        {/* Interests */}
        {u.interests && u.interests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-5 rounded-[2rem] bg-card border border-border/5 shadow-soft"
          >
            <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Star className="w-3.5 h-3.5" />
              Sở thích
            </h3>
            <div className="flex flex-wrap gap-2">
              {u.interests.map((tag) => {
                const isCommon = commonInterests.includes(tag);
                return (
                  <span
                    key={tag}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                      isCommon
                        ? "gradient-hot text-white border-transparent shadow-sm"
                        : "bg-muted/40 text-foreground border-transparent"
                    }`}
                  >
                    <span>{interestEmojis[tag] || "✨"}</span>
                    {tag}
                    {isCommon && (
                      <span className="text-[8px] opacity-80 ml-0.5">
                        MATCH
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
            {commonInterests.length > 0 && (
              <p className="text-xs text-primary font-bold mt-3 flex items-center gap-1">
                <Heart className="w-3 h-3 fill-primary" />
                {commonInterests.length} sở thích chung với bạn!
              </p>
            )}
          </motion.div>
        )}

        {/* ═══════ REVIEWS SECTION ═══════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-5 rounded-[2rem] bg-card border border-border/5 shadow-soft"
        >
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Star className="w-3.5 h-3.5" />
            Đánh giá ({reviews.length})
          </h3>

          {/* Average rating */}
          {reviews.length > 0 && (
            <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-muted/30">
              <span className="text-3xl font-black text-primary">
                {avgRating.toFixed(1)}
              </span>
              <div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${s <= Math.round(avgRating) ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/20"}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {reviews.length} đánh giá
                </p>
              </div>
            </div>
          )}

          {/* Review list */}
          <div className="space-y-3 mb-4">
            {reviews.slice(0, 5).map((rv) => (
              <div
                key={rv.id}
                className="flex gap-3 p-3 rounded-2xl bg-muted/20"
              >
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-primary/5">
                  <img
                    src={
                      rv.reviewer?.avatar_url ||
                      `https://api.dicebear.com/7.x/lorelei/svg?seed=${rv.from_user}`
                    }
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold truncate">
                      {rv.reviewer?.name || "Ẩn danh"}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${s <= rv.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/20"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {rv.comment && (
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {rv.comment}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground/50 mt-1">
                    {new Date(rv.created_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Chưa có đánh giá nào
              </p>
            )}
          </div>

          {/* Write review form */}
          {user && userId !== user.id && !userId?.startsWith("mock-") && (
            <div className="border-t border-border/10 pt-4">
              <h4 className="text-xs font-bold text-muted-foreground mb-3">
                {hasReviewed ? "📝 Cập nhật đánh giá" : "✍️ Viết đánh giá"}
              </h4>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setMyReviewRating(s)}
                    className="transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`w-7 h-7 ${s <= myReviewRating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/20 hover:text-yellow-300"}`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={myReviewComment}
                onChange={(e) => setMyReviewComment(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn..."
                rows={2}
                className="w-full rounded-2xl bg-muted/30 border-0 px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={submitReview}
                disabled={myReviewRating === 0 || reviewSubmitting}
                className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-2xl gradient-hot text-white font-bold text-sm shadow-romantic transition-all active:scale-95 disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
                {reviewSubmitting
                  ? "Đang gửi..."
                  : hasReviewed
                    ? "Cập nhật"
                    : "Gửi đánh giá"}
              </button>
            </div>
          )}
        </motion.div>

        {/* Verification & Safety */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="p-5 rounded-[2rem] bg-card border border-border/5 shadow-soft"
        >
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            Xác minh & An toàn
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${u.is_verified ? "bg-blue-500/10" : "bg-muted/50"}`}
              >
                <Verified
                  className={`w-4 h-4 ${u.is_verified ? "text-blue-500" : "text-muted-foreground"}`}
                />
              </div>
              <div>
                <p className="text-sm font-bold">
                  {u.is_verified ? "Đã xác minh danh tính" : "Chưa xác minh"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {u.is_verified
                    ? "Người dùng đã xác minh qua email hoặc số điện thoại"
                    : "Người dùng chưa hoàn tất xác minh"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold">
                  Tham gia{" "}
                  {new Date(u.created_at).toLocaleDateString("vi-VN", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  Thành viên Campus Connect
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══════ FIXED BOTTOM BAR ═══════ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-xl border-t border-border/10">
        <div className="max-w-lg mx-auto flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLikeToggle}
            disabled={likeLoading}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all ${
              isMatched
                ? "bg-green-500 text-white shadow-lg"
                : liked
                  ? "gradient-hot text-white shadow-glow"
                  : "bg-primary/5 text-primary hover:bg-primary/10"
            } ${likeLoading ? "opacity-50" : ""}`}
          >
            {isMatched ? (
              <>✅ Đã kết nối</>
            ) : liked ? (
              <>🤝 Đã gửi lời kết nối</>
            ) : (
              <>🤝 Kết nối</>
            )}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/messages?chat=${u.id}`)}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-card border border-border/10 shadow-soft hover:bg-muted/50 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            💬 Nhắn tin
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
