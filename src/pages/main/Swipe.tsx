import { useState, useCallback, useEffect, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  X,
  MapPin,
  Star,
  RotateCcw,
  Zap,
  MessageCircle,
  Info,
  Verified,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, Profile } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";

// ========== MOCK USERS FOR SWIPE ==========
const mockSwipeUsers: Profile[] = [
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
    id: "mock-1",
    name: "Ngọc Trinh",
    age: 21,
    gender: "female",
    gender_preference: "male",
    bio: "Thích đi cafe và đọc sách 📚☕ Hay ngồi ở những quán cafe vintage để viết nhật ký.",
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
    id: "mock-2",
    name: "Minh Tuấn",
    age: 23,
    gender: "male",
    gender_preference: "female",
    bio: "Developer by day, gamer by night 🎮 Đang làm startup về EdTech.",
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
    id: "mock-3",
    name: "Thu Hà",
    age: 20,
    gender: "female",
    gender_preference: "male",
    bio: "Yêu thiên nhiên và động vật 🌿🐱 Nuôi 3 bé mèo tên Mochi, Latte và Pudding.",
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
    bio: "Kinh doanh & Travel lover ✈️ Đã đi 15 quốc gia và luôn sẵn sàng cho chuyến đi tiếp theo.",
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
    bio: "Dancing is my therapy 💃 K-pop dance cover team leader.",
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
    id: "mock-dn-4",
    name: "Hữu Phước",
    age: 23,
    gender: "male",
    gender_preference: "female",
    bio: "Full-stack dev 💻 Làm việc remote tại coworking space. Fan bóng đá.",
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
    id: "mock-6",
    name: "Quốc Bảo",
    age: 24,
    gender: "male",
    gender_preference: "female",
    bio: "Photographer | Coffee addict ☕📸 Freelance chụp portrait và wedding.",
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
    id: "mock-dn-5",
    name: "Ngọc Ánh",
    age: 21,
    gender: "female",
    gender_preference: "male",
    bio: "Dance crew member 💃✨ Biểu diễn tại các sự kiện ở Đà Nẵng.",
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
    bio: "Barista & coffee roaster ☕ Mở quán nhỏ ở Ngũ Hành Sơn.",
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
  {
    id: "mock-7",
    name: "Mai Phương",
    age: 20,
    gender: "female",
    gender_preference: "male",
    bio: "Volunteer & bookworm 📖💛 Tình nguyện viên của nhiều tổ chức phi lợi nhuận.",
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
    bio: "Gym rat & foodie 🏋️‍♂️🍜 Personal trainer, thích nấu ăn healthy.",
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
];

// ========== DISTANCE CALC ==========
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
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

// ========== SWIPE CARD ==========
interface SwipeCardProps {
  card: Profile & { distance?: number };
  myProfile: Profile | null;
  onSwipe: (dir: "left" | "right" | "up") => void;
  isFront: boolean;
}

const SwipeCard = forwardRef<HTMLDivElement, SwipeCardProps>(
  ({ card, myProfile, onSwipe, isFront }, ref) => {
    const [expanded, setExpanded] = useState(false);
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-25, 25]);
    const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
    const likeOpacity = useTransform(x, [50, 150], [0, 1]);
    const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

    const avatarUrl =
      card.avatar_url ||
      `https://api.dicebear.com/7.x/lorelei/svg?seed=${card.id}&backgroundColor=ffd5dc`;

    const commonInterests = myProfile
      ? card.interests?.filter((i) => myProfile.interests?.includes(i)) || []
      : [];

    const handleDragEnd = (_: any, info: any) => {
      if (info.offset.x > 100) onSwipe("right");
      else if (info.offset.x < -100) onSwipe("left");
      else if (info.offset.y < -100) onSwipe("up");
    };

    return (
      <motion.div
        style={
          isFront
            ? { x, rotate, opacity, zIndex: 10 }
            : { scale: 0.95, y: 10, opacity: 0.5, zIndex: 5 }
        }
        drag={isFront ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        whileTap={isFront ? { scale: 0.98 } : {}}
        className="absolute inset-0 rounded-3xl overflow-hidden shadow-elevated bg-card touch-none select-none"
      >
        <div
          className={`relative transition-all duration-300 ${expanded ? "h-[45%]" : "h-full"}`}
        >
          <img
            src={avatarUrl}
            alt=""
            className="w-full h-full object-cover bg-gradient-to-b from-pink-100 to-pink-50 select-none"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Swipe Overlays */}
          {isFront && (
            <>
              <motion.div
                style={{ opacity: likeOpacity }}
                className="absolute top-10 left-6 border-4 border-green-500 rounded-xl px-5 py-2 rotate-[-20deg] z-30"
              >
                <span className="text-4xl font-black text-green-500 uppercase tracking-tighter">
                  LIKE
                </span>
              </motion.div>
              <motion.div
                style={{ opacity: nopeOpacity }}
                className="absolute top-10 right-6 border-4 border-red-500 rounded-xl px-5 py-2 rotate-[20deg] z-30"
              >
                <span className="text-4xl font-black text-red-500 uppercase tracking-tighter">
                  NOPE
                </span>
              </motion.div>
            </>
          )}

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-black tracking-tight">
                {card.name}
                {card.age && <span className="font-light">, {card.age}</span>}
              </h2>
              {card.is_verified && (
                <Verified className="w-6 h-6 text-blue-400 fill-white" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className="text-white/80 text-sm flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {card.city || "Nearby"}
              </span>
              {card.university && (
                <span className="text-white/60 text-sm">
                  • {card.university}
                </span>
              )}
              {card.distance !== undefined && (
                <span className="text-xs font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full">
                  📍 {formatDist(card.distance)}
                </span>
              )}
            </div>

            {/* Common interests */}
            {commonInterests.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs text-white/60">Chung:</span>
                {commonInterests.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold bg-primary/80 text-white px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              className="flex items-center gap-1 mt-3 bg-white/10 backdrop-blur-md rounded-full px-3 py-1 text-white/90 text-xs transition-colors hover:bg-white/20"
            >
              <Info className="w-3.5 h-3.5" />
              {expanded ? "Thu gọn" : "Xem thêm"}
              <ChevronUp
                className={`w-3.5 h-3.5 transition-transform ${expanded ? "" : "rotate-180"}`}
              />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="p-6 space-y-5 animate-slide-up overflow-y-auto h-[55%]">
            {card.bio && (
              <div>
                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Giới thiệu
                </h4>
                <p className="text-sm leading-relaxed">{card.bio}</p>
              </div>
            )}

            {card.occupation && (
              <div>
                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Nghề nghiệp
                </h4>
                <p className="text-sm">{card.occupation}</p>
              </div>
            )}

            {card.interests && card.interests.length > 0 && (
              <div>
                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  Sở thích
                </h4>
                <div className="flex flex-wrap gap-2">
                  {card.interests.map((tag) => (
                    <Badge
                      key={tag}
                      variant={
                        commonInterests.includes(tag) ? "default" : "secondary"
                      }
                      className={`rounded-full px-3 py-1 text-xs font-medium ${commonInterests.includes(tag) ? "gradient-hot text-white border-0 shadow-sm" : "bg-muted/50"}`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    );
  },
);

SwipeCard.displayName = "SwipeCard";

// ========== MAIN SWIPE COMPONENT ==========
const Swipe = () => {
  const { user, profile: myProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [cards, setCards] = useState<(Profile & { distance?: number })[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchPopup, setMatchPopup] = useState<Profile | null>(null);
  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());

  const myLat = myProfile?.lat || 10.8231;
  const myLng = myProfile?.lng || 106.6297;

  useEffect(() => {
    if (!user) return;
    const fetchUsers = async () => {
      try {
        setLoading(true);

        // Fetch real users from DB
        const { data: existingLikes } = await supabase
          .from("likes")
          .select("to_user")
          .eq("from_user", user.id);
        const excludeIds = new Set(
          (existingLikes || []).map((l: any) => l.to_user),
        );
        excludeIds.add(user.id);

        let query = supabase.from("profiles").select("*").neq("id", user.id);
        if (
          myProfile?.gender_preference &&
          myProfile.gender_preference !== "all"
        ) {
          query = query.eq("gender", myProfile.gender_preference);
        }

        const { data } = await query
          .order("last_active", { ascending: false })
          .limit(50);
        const dbUsers = (data || [])
          .filter((p: any) => !excludeIds.has(p.id) && p.name)
          .map((p: any) => ({
            ...p,
            distance:
              p.lat && p.lng
                ? haversineKm(myLat, myLng, p.lat, p.lng)
                : undefined,
          }));

        // Add mock users with distance
        const mockWithDist = mockSwipeUsers
          .filter((m) => !excludeIds.has(m.id))
          .map((m) => ({
            ...m,
            distance:
              m.lat && m.lng
                ? haversineKm(myLat, myLng, m.lat, m.lng)
                : undefined,
          }));

        // Merge — DB first, then mock, deduplicate
        const merged = [...dbUsers, ...mockWithDist].filter(
          (u, i, arr) => arr.findIndex((x) => x.id === u.id) === i,
        );

        // Shuffle for variety
        for (let i = merged.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [merged[i], merged[j]] = [merged[j], merged[i]];
        }

        setCards(merged);
        setCurrentIndex(0);
      } catch (err) {
        console.error("Error in fetchUsers (Swipe):", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user, myProfile?.gender_preference]);

  const handleSwipeEffect = useCallback(
    async (direction: "left" | "right" | "up") => {
      const currentCard = cards[currentIndex];
      if (!currentCard || !user) return;

      // Track swiped
      setSwipedIds((prev) => new Set(prev).add(currentCard.id));

      if (direction === "right" || direction === "up") {
        const isSuperLike = direction === "up";

        // For mock users, simulate a "match" randomly
        if (currentCard.id.startsWith("mock")) {
          // 40% chance of match with mock users
          if (Math.random() < 0.4) {
            setMatchPopup(currentCard);
          } else {
            toast({
              title: isSuperLike ? "⭐ Super Like!" : "❤️ Liked!",
              description: `Bạn đã ${isSuperLike ? "super like" : "thích"} ${currentCard.name}`,
            });
          }
        } else {
          // Real user: insert like into DB
          await supabase.from("likes").insert({
            from_user: user.id,
            to_user: currentCard.id,
            is_super_like: isSuperLike,
          });

          const { data: matchData } = await supabase
            .from("matches")
            .select("*")
            .or(
              `and(user1.eq.${user.id},user2.eq.${currentCard.id}),and(user1.eq.${currentCard.id},user2.eq.${user.id})`,
            )
            .maybeSingle();

          if (matchData) setMatchPopup(currentCard);
        }
      }

      setCurrentIndex((prev) => prev + 1);
    },
    [cards, currentIndex, user, toast],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
            <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
            <Heart className="absolute inset-0 m-auto w-8 h-8 text-primary fill-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm font-medium animate-pulse">
            Đang tìm kiếm người ấy...
          </p>
        </div>
      </div>
    );
  }

  if (currentIndex >= cards.length) {
    return (
      <div className="flex items-center justify-center h-[70vh] px-6">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center mx-auto shadow-inner">
            <Heart className="w-12 h-12 text-primary/30" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black italic font-serif-display">
              Hết rồi! 🎉
            </h3>
            <p className="text-sm text-muted-foreground max-w-[240px] mx-auto">
              Bạn đã xem hết hồ sơ phù hợp. Hãy quay lại sau nhé!
            </p>
          </div>
          <Button
            onClick={() => {
              setCurrentIndex(0);
              setSwipedIds(new Set());
            }}
            variant="outline"
            className="rounded-full px-8 py-6 h-auto font-bold shadow-soft hover:shadow-card transition-all"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Xem lại từ đầu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-140px)] flex flex-col pt-4">
      {/* Match popup */}
      <AnimatePresence>
        {matchPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setMatchPopup(null)}
          >
            <motion.div
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.5, y: 50, opacity: 0 }}
              className="text-center space-y-8 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-5xl font-black italic font-serif-display text-white drop-shadow-lg">
                It's a Match!
              </h2>
              <div className="flex items-center justify-center gap-4 py-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-glow relative z-10">
                    <img
                      src={
                        myProfile?.avatar_url ||
                        `https://api.dicebear.com/7.x/lorelei/svg?seed=${user?.id}`
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping" />
                </div>
                <Heart className="w-12 h-12 text-primary fill-primary animate-heartbeat drop-shadow-glow z-20" />
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-glow relative z-10">
                    <img
                      src={
                        matchPopup.avatar_url ||
                        `https://api.dicebear.com/7.x/lorelei/svg?seed=${matchPopup.id}`
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div
                    className="absolute -inset-4 bg-primary/20 rounded-full animate-ping"
                    style={{ animationDelay: "0.5s" }}
                  />
                </div>
              </div>
              <p className="text-white/80 text-lg leading-relaxed px-4">
                Bạn và{" "}
                <span className="font-bold text-white tracking-tight underline decoration-primary decoration-4 underline-offset-4">
                  {matchPopup.name}
                </span>{" "}
                đã thích nhau!
              </p>
              <div className="flex flex-col gap-4 pt-4">
                <Button
                  onClick={() => navigate(`/messages?chat=${matchPopup.id}`)}
                  className="gradient-hot text-white rounded-full h-16 text-lg font-bold shadow-glow border-0 transition-transform active:scale-95"
                >
                  Gửi tin nhắn ngay 💬
                </Button>
                <button
                  onClick={() => setMatchPopup(null)}
                  className="text-white/60 text-sm font-semibold hover:text-white transition-colors"
                >
                  Tiếp tục tìm kiếm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card counter */}
      <div className="text-center mb-3 px-4">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      <div className="relative flex-1 max-w-[400px] mx-auto w-full">
        {/* Back card (visual stack effect) */}
        {currentIndex + 1 < cards.length && (
          <div className="absolute inset-0 scale-[0.92] translate-y-6 opacity-30 blur-[1px]">
            <SwipeCard
              card={cards[currentIndex + 1]}
              myProfile={myProfile}
              onSwipe={() => {}}
              isFront={false}
            />
          </div>
        )}

        {/* Current card */}
        <AnimatePresence mode="popLayout">
          <SwipeCard
            key={cards[currentIndex].id}
            card={cards[currentIndex]}
            myProfile={myProfile}
            onSwipe={handleSwipeEffect}
            isFront={true}
          />
        </AnimatePresence>
      </div>

      {/* Action buttons — matching Tinder layout */}
      <div className="flex items-center justify-center gap-4 py-6 relative z-20">
        <button
          onClick={() =>
            currentIndex > 0 && setCurrentIndex((prev) => prev - 1)
          }
          disabled={currentIndex === 0}
          className="w-12 h-12 rounded-full bg-card shadow-card flex items-center justify-center text-yellow-500 hover:shadow-glow transition-all active:scale-90 disabled:opacity-20 flex-shrink-0"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* NOPE / X button */}
        <button
          onClick={() => handleSwipeEffect("left")}
          className="w-16 h-16 rounded-full bg-card shadow-card flex items-center justify-center text-red-500 hover:shadow-elevated hover:text-red-600 transition-all active:scale-90 flex-shrink-0 border-2 border-red-500/20"
        >
          <X className="w-8 h-8" strokeWidth={3} />
        </button>

        {/* Super Like / Star */}
        <button
          onClick={() => handleSwipeEffect("up")}
          className="w-12 h-12 rounded-full bg-card shadow-card flex items-center justify-center text-blue-500 hover:shadow-elevated transition-all active:scale-90 flex-shrink-0 border-2 border-blue-500/20"
        >
          <Star className="w-5 h-5 fill-blue-500/10" />
        </button>

        {/* LIKE / Heart button */}
        <button
          onClick={() => handleSwipeEffect("right")}
          className="w-16 h-16 rounded-full bg-green-500 shadow-glow flex items-center justify-center text-white hover:scale-110 hover:bg-green-400 transition-all active:scale-90 flex-shrink-0"
        >
          <Heart className="w-8 h-8 fill-white" />
        </button>

        {/* Message button — goes to AI chat */}
        <button
          onClick={() => navigate(`/messages?chat=${cards[currentIndex].id}`)}
          className="w-12 h-12 rounded-full bg-card shadow-card flex items-center justify-center text-primary hover:shadow-glow transition-all active:scale-90 flex-shrink-0 border-2 border-primary/20"
        >
          <MessageCircle className="w-5 h-5" />
        </button>

        {/* Boost / Zap */}
        <button className="w-12 h-12 rounded-full bg-card shadow-card flex items-center justify-center text-purple-500 hover:shadow-glow transition-all active:scale-90 flex-shrink-0 border-2 border-purple-500/20">
          <Zap className="w-5 h-5 fill-purple-500/10" />
        </button>
      </div>
    </div>
  );
};

export default Swipe;
