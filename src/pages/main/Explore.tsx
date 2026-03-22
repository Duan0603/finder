import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Heart,
  Verified,
  X,
  ArrowRight,
  MessageCircle,
  Navigation,
  Locate,
  LayoutGrid,
  List,
  Map,
} from "lucide-react";
import { useAuth, Profile } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useToast } from "@/hooks/use-toast";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ========== MOCK VIETNAMESE USERS ==========
const mockUsers: (Profile & { distance?: number })[] = [
  {
    id: "mock-1",
    name: "Ngọc Trinh",
    age: 21,
    gender: "female",
    gender_preference: "male",
    bio: "Thích đi cafe và đọc sách 📚☕",
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
    bio: "Developer by day, gamer by night 🎮",
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
    bio: "Yêu thiên nhiên và động vật 🌿🐱",
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
    bio: "Kinh doanh & Travel lover ✈️",
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
    bio: "Dancing is my therapy 💃",
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
    bio: "Photographer | Coffee addict ☕📸",
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
    bio: "Volunteer & bookworm 📖💛",
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
    bio: "Gym rat & foodie 🏋️‍♂️🍜",
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

// ========== HAVERSINE ==========
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

// ========== INTEREST TAGS ==========
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

// ========== MAP COMPONENT (plain Leaflet) ==========
function LeafletMap({
  center,
  connectedUsers,
  onLocate,
  onMapClick,
}: {
  center: [number, number];
  connectedUsers: (Profile & { distance?: number })[];
  onLocate: () => void;
  onMapClick?: (lat: number, lng: number) => void;
}) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      map,
    );

    // Zoom control top-right
    L.control.zoom({ position: "topright" }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Click on map to set location manually
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update center
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setView(center, 14, { animate: true });

    // "You are here" marker
    const youIcon = L.divIcon({
      className: "you-marker-icon",
      html: `<div style="position:relative;width:20px;height:20px;">
        <div style="width:20px;height:20px;border-radius:50%;background:#E8311A;border:3px solid #fff;box-shadow:0 0 0 4px rgba(232,49,26,0.25),0 2px 8px rgba(0,0,0,0.2);"></div>
        <div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid rgba(232,49,26,0.2);animation:leaflet-ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
      </div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    if (markersRef.current) {
      // Clear only the "you" marker from before (we'll re-add everything)
    }

    // We'll handle all markers in the users effect below
  }, [center]);

  // Update user markers — only show connected (matched) users
  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;
    markersRef.current.clearLayers();

    // "You" marker
    const youIcon = L.divIcon({
      className: "you-marker-icon",
      html: `<div style="position:relative;width:20px;height:20px;">
        <div style="width:20px;height:20px;border-radius:50%;background:#E8311A;border:3px solid #fff;box-shadow:0 0 0 4px rgba(232,49,26,0.25),0 2px 8px rgba(0,0,0,0.2);"></div>
        <div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid rgba(232,49,26,0.2);animation:leaflet-ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
      </div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    L.marker(center, { icon: youIcon })
      .bindPopup(
        '<div style="text-align:center;font-weight:600;font-size:13px;">📍 Bạn đang ở đây</div>',
      )
      .addTo(markersRef.current);

    // Only show markers for connected (matched) users
    connectedUsers.forEach((u) => {
      if (!u.lat || !u.lng) return;

      const icon = L.divIcon({
        className: "user-marker-icon",
        html: `<div style="position:relative;width:44px;height:44px;">
          <div style="width:44px;height:44px;border-radius:50%;border:3px solid ${u.is_online ? "#22c55e" : "#fff"};overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.25);">
            <img src="${u.avatar_url}" style="width:100%;height:100%;object-fit:cover;background:#fde2e4;" />
          </div>
          ${u.is_online ? '<div style="position:absolute;bottom:1px;right:1px;width:12px;height:12px;border-radius:50%;background:#22c55e;border:2px solid #fff;"></div>' : ""}
          <div style="position:absolute;top:-4px;left:-4px;background:#22c55e;color:#fff;font-size:8px;font-weight:900;padding:1px 5px;border-radius:999px;border:1.5px solid #fff;">✓</div>
        </div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        popupAnchor: [0, -48],
      });

      const distText =
        u.distance !== undefined
          ? `<span style="color:#E8311A;font-weight:600;">• ${formatDist(u.distance)}</span>`
          : "";
      const verifiedBadge = u.is_verified
        ? ' <span style="color:#3b82f6;">✓</span>'
        : "";
      const tags =
        u.interests
          ?.slice(0, 3)
          .map(
            (t) =>
              `<span style="font-size:10px;font-weight:700;background:rgba(232,49,26,0.08);color:#E8311A;padding:2px 8px;border-radius:999px;display:inline-block;">${t}</span>`,
          )
          .join(" ") || "";

      const popup = `
        <div style="min-width:220px;padding:4px;">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
            <img src="${u.avatar_url}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid #fde2e4;background:#fde2e4;" />
            <div>
              <div style="font-weight:700;font-size:14px;">${u.name}${u.age ? `, ${u.age}` : ""}${verifiedBadge}</div>
              <div style="font-size:11px;color:#888;">📍 ${u.city || "Không rõ"} ${distText}</div>
            </div>
          </div>
          <div style="display:inline-flex;align-items:center;gap:4px;background:#dcfce7;color:#15803d;font-size:10px;font-weight:700;padding:3px 10px;border-radius:999px;margin-bottom:8px;">🤝 Đã kết nối</div>
          ${u.bio ? `<div style="font-size:12px;color:#666;margin-bottom:8px;line-height:1.4;">${u.bio}</div>` : ""}
          <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">${tags}</div>
          <div style="display:flex;gap:6px;">
            <a href="/user-profile?id=${u.id}" style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;background:linear-gradient(135deg,#E8311A,#ff6b4a);color:#fff;font-size:12px;font-weight:700;padding:8px 0;border-radius:12px;text-decoration:none;">👤 Xem hồ sơ</a>
            <a href="/messages?chat=${u.id}" style="flex:1;display:flex;align-items:center;justify-content:center;gap:4px;background:#f1f5f9;color:#334155;font-size:12px;font-weight:700;padding:8px 0;border-radius:12px;text-decoration:none;">💬 Nhắn tin</a>
          </div>
        </div>
      `;

      L.marker([u.lat, u.lng], { icon })
        .bindPopup(popup)
        .addTo(markersRef.current!);
    });
  }, [connectedUsers, center]);

  return (
    <div
      className="relative rounded-3xl overflow-hidden border border-border/10 shadow-elevated"
      style={{ height: "380px" }}
    >
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
      {/* Locate me button */}
      <button
        onClick={onLocate}
        className="absolute bottom-4 left-4 z-[1000] w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border border-gray-200"
        title="Về vị trí của tôi"
      >
        <Locate className="w-5 h-5 text-primary" />
      </button>
    </div>
  );
}

// ========== MAIN COMPONENT ==========
const Explore = () => {
  const { user, profile: myProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dbUsers, setDbUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterGender, setFilterGender] = useState<string>("all");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [filterDistance, setFilterDistance] = useState<number>(100);
  const [filterAgeMin, setFilterAgeMin] = useState<number>(18);
  const [filterAgeMax, setFilterAgeMax] = useState<number>(35);
  const [viewMode, setViewMode] = useState<"map" | "grid" | "list">("map");
  const [myLat, setMyLat] = useState<number>(myProfile?.lat || 10.8416);
  const [myLng, setMyLng] = useState<number>(myProfile?.lng || 106.8098);
  const [locationGranted, setLocationGranted] = useState(false);
  const [locationJustGranted, setLocationJustGranted] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [matchedUserIds, setMatchedUserIds] = useState<Set<string>>(new Set());
  const pageTopRef = useRef<HTMLDivElement>(null);

  // Scroll to top of the entire page smoothly
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Handle successful location
  const handleLocationSuccess = useCallback(
    (lat: number, lng: number) => {
      setMyLat(lat);
      setMyLng(lng);
      setLocationGranted(true);
      setLocationDenied(false);
      setLocationLoading(false);
      setLocationJustGranted(true);

      // Auto scroll to top when location is granted
      setTimeout(() => {
        scrollToTop();
      }, 100);

      // Clear the "just granted" animation after 2s
      setTimeout(() => {
        setLocationJustGranted(false);
      }, 2000);

      if (user) {
        supabase
          .from("profiles")
          .update({ lat, lng })
          .eq("id", user.id)
          .then(() => {});
      }
    },
    [user, scrollToTop],
  );

  // Prevent multiple location requests
  const locationRequested = useRef(false);

  // Get user geolocation
  const requestLocation = useCallback(() => {
    setLocationLoading(true);
    setLocationDenied(false);

    if (!navigator.geolocation) {
      console.warn("Geolocation API not available");
      const lat = myProfile?.lat || 10.8231;
      const lng = myProfile?.lng || 106.6297;
      handleLocationSuccess(lat, lng);
      return;
    }

    // Try low accuracy first (faster)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log(
          "✅ Got location (low accuracy):",
          pos.coords.latitude,
          pos.coords.longitude,
        );
        handleLocationSuccess(pos.coords.latitude, pos.coords.longitude);
      },
      (err1) => {
        console.warn(
          "⚠️ Low accuracy failed:",
          err1.message,
          "- trying high accuracy...",
        );
        // Retry with high accuracy
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log(
              "✅ Got location (high accuracy):",
              pos.coords.latitude,
              pos.coords.longitude,
            );
            handleLocationSuccess(pos.coords.latitude, pos.coords.longitude);
          },
          (err2) => {
            console.warn("❌ High accuracy also failed:", err2.message);
            // Use saved profile location or default
            if (myProfile?.lat && myProfile?.lng) {
              console.log(
                "📍 Using saved profile location:",
                myProfile.lat,
                myProfile.lng,
              );
              handleLocationSuccess(myProfile.lat, myProfile.lng);
              toast({
                title: "📍 Sử dụng vị trí đã lưu",
                description:
                  "Không thể lấy vị trí hiện tại. Đang sử dụng vị trí đã lưu của bạn.",
              });
            } else {
              console.log("📍 Using default HCM City location");
              handleLocationSuccess(10.8231, 106.6297);
              setLocationDenied(true);
              toast({
                title: "⚠️ Không thể xác định vị trí",
                description:
                  "Vui lòng cho phép truy cập vị trí hoặc chạm vào bản đồ để chọn vị trí.",
                variant: "destructive",
              });
            }
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        );
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  }, [handleLocationSuccess, myProfile]);

  useEffect(() => {
    if (locationRequested.current) return;
    locationRequested.current = true;
    requestLocation();
  }, [user]);

  // Fetch real users from DB
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchUsers = async () => {
      try {
        let query = supabase
          .from("profiles")
          .select("*")
          .neq("id", user.id)
          .not("name", "eq", "");
        if (filterGender !== "all") {
          query = query.eq("gender", filterGender);
        }
        const { data } = await query
          .order("last_active", { ascending: false })
          .limit(100);
        setDbUsers((data || []).filter((p) => p.name && p.name.trim() !== ""));
      } catch (e) {
        console.warn("Failed to fetch users:", e);
      }
      setLoading(false);
    };
    fetchUsers();
  }, [user, filterGender]);

  // Fetch matched (connected) user IDs
  useEffect(() => {
    if (!user) return;
    const fetchMatches = async () => {
      try {
        const { data: matches } = await supabase
          .from("matches")
          .select("user1, user2")
          .or(`user1.eq.${user.id},user2.eq.${user.id}`);
        if (matches) {
          const ids = new Set(
            matches.map((m: any) =>
              m.user1 === user.id ? m.user2 : m.user1
            )
          );
          setMatchedUserIds(ids);
        }
      } catch (e) {
        console.warn("Failed to fetch matches:", e);
      }
    };
    fetchMatches();

    // Listen for new matches in realtime
    const channel = supabase
      .channel("explore_matches")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "matches" },
        (payload) => {
          const m = payload.new as any;
          if (m.user1 === user.id || m.user2 === user.id) {
            const otherId = m.user1 === user.id ? m.user2 : m.user1;
            setMatchedUserIds((prev) => new Set([...prev, otherId]));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Merge DB + mock, calc distance, filter
  const allUsers = [...dbUsers, ...mockUsers]
    .filter((u) => u.id !== user?.id)
    .filter((u, i, arr) => arr.findIndex((x) => x.id === u.id) === i)
    .map((u) => ({
      ...u,
      distance:
        u.lat && u.lng ? haversineKm(myLat, myLng, u.lat, u.lng) : undefined,
    }))
    .filter((u) => {
      if (search.trim()) {
        const s = search.toLowerCase();
        if (
          !u.name.toLowerCase().includes(s) &&
          !u.city?.toLowerCase().includes(s) &&
          !u.bio?.toLowerCase().includes(s)
        )
          return false;
      }
      if (
        filterTags.length > 0 &&
        !filterTags.some((tag) => u.interests?.includes(tag))
      )
        return false;
      if (filterGender !== "all" && u.gender !== filterGender) return false;
      // Distance filter
      if (u.distance !== undefined && u.distance > filterDistance) return false;
      // Age filter
      if (u.age && (u.age < filterAgeMin || u.age > filterAgeMax)) return false;
      return true;
    })
    .sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));

  // Only pass connected (matched) users to the map
  const connectedUsers = allUsers.filter((u) => matchedUserIds.has(u.id));

  const toggleTag = (tag: string) => {
    setFilterTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <div ref={pageTopRef} className="space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h1 className="text-3xl font-black italic font-serif-display text-gradient-flame">
            Tìm bạn đồng hành
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-1 pl-1">
            {allUsers.length} người gần bạn
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex bg-muted/40 rounded-xl p-1 gap-0.5">
            {(
              [
                ["map", Map],
                ["grid", LayoutGrid],
                ["list", List],
              ] as const
            ).map(([mode, Icon]) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${viewMode === mode ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          <button
            onClick={requestLocation}
            className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center hover:bg-primary/10 transition-colors"
            title="Cập nhật vị trí"
          >
            <Locate className="w-5 h-5 text-primary" />
          </button>
        </div>
      </div>

      {/* ═══════ MAP (plain Leaflet) ═══════ */}
      {viewMode === "map" && (
        <motion.div
          animate={
            locationJustGranted
              ? { scale: [1, 1.01, 1], opacity: [0.8, 1] }
              : {}
          }
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <LeafletMap
            center={[myLat, myLng]}
            connectedUsers={connectedUsers}
            onLocate={requestLocation}
            onMapClick={(lat, lng) => {
              console.log("📍 Manual location set:", lat, lng);
              handleLocationSuccess(lat, lng);
            }}
          />
        </motion.div>
      )}

      {/* Location permission banner */}
      <AnimatePresence>
        {!locationGranted && (
          <motion.div
            initial={{ opacity: 1, height: "auto" }}
            exit={{
              opacity: 0,
              height: 0,
              marginTop: 0,
              marginBottom: 0,
              paddingTop: 0,
              paddingBottom: 0,
              overflow: "hidden",
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <Navigation className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  Bật vị trí để tìm bạn gần bạn
                </p>
                <p className="text-xs text-muted-foreground">
                  Cho phép truy cập vị trí để xem khoảng cách
                </p>
              </div>
              <button
                onClick={requestLocation}
                disabled={locationLoading}
                className="px-4 py-2 rounded-xl gradient-hot text-white text-xs font-bold shrink-0 disabled:opacity-70 flex items-center gap-2"
              >
                {locationLoading ? (
                  <>
                    <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang lấy...
                  </>
                ) : (
                  "Cho phép"
                )}
              </button>
            </div>

            {/* Location denied warning */}
            {locationDenied && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200"
              >
                <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Navigation className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800">
                    ⚠️ Không thể lấy vị trí
                  </p>
                  <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                    Trình duyệt đã chặn quyền truy cập vị trí. Để bật lại:
                  </p>
                  <ol className="text-xs text-amber-700 mt-2 space-y-1 list-decimal list-inside">
                    <li>
                      Nhấn vào biểu tượng <strong>🔒 ổ khóa</strong> trên thanh
                      địa chỉ
                    </li>
                    <li>
                      Tìm <strong>"Vị trí"</strong> hoặc{" "}
                      <strong>"Location"</strong>
                    </li>
                    <li>
                      Chọn <strong>"Cho phép"</strong> rồi tải lại trang
                    </li>
                  </ol>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-3 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors"
                  >
                    🔄 Tải lại trang
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location granted success toast */}
      <AnimatePresence>
        {locationJustGranted && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-200"
          >
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">
                📍 Đã lấy vị trí thành công!
              </p>
              <p className="text-xs text-green-600">
                Đang hiển thị bạn bè gần bạn nhất
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filter */}
      <div className="flex gap-2 sticky top-16 z-30 bg-background/80 backdrop-blur-xl p-1 -m-1">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, sở thích, trường học..."
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-card border border-border/10 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none shadow-soft font-medium"
          />
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-soft border border-border/10 ${showFilter ? "gradient-hot text-white" : "bg-card text-muted-foreground hover:bg-muted"}`}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-5 p-5 rounded-[2rem] bg-card border border-border/5 shadow-soft mb-2">
              {/* Gender filter */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                    Giới tính
                  </p>
                  {filterGender !== "all" && (
                    <button
                      onClick={() => setFilterGender("all")}
                      className="text-[10px] font-bold text-primary"
                    >
                      Đặt lại
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {(
                    [
                      ["all", "Tất cả"],
                      ["male", "Nam"],
                      ["female", "Nữ"],
                    ] as const
                  ).map(([v, l]) => (
                    <button
                      key={v}
                      onClick={() => setFilterGender(v)}
                      className={`flex-1 py-2.5 rounded-xl text-[11px] font-black tracking-tight transition-all border ${filterGender === v ? "gradient-hot text-white border-transparent shadow-glow" : "bg-muted/40 text-muted-foreground border-transparent"}`}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                    Khoảng cách
                  </p>
                  <span className="text-[11px] font-bold text-primary">
                    {filterDistance >= 100
                      ? "Không giới hạn"
                      : `${filterDistance} km`}
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={filterDistance}
                  onChange={(e) => setFilterDistance(Number(e.target.value))}
                  className="w-full h-2 bg-muted/60 rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground font-bold px-1">
                  <span>5 km</span>
                  <span>50 km</span>
                  <span>100 km</span>
                </div>
              </div>

              {/* Age range */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                    Độ tuổi
                  </p>
                  <span className="text-[11px] font-bold text-primary">
                    {filterAgeMin} – {filterAgeMax} tuổi
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={18}
                    max={35}
                    value={filterAgeMin}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setFilterAgeMin(Math.min(v, filterAgeMax - 1));
                    }}
                    className="flex-1 h-2 bg-muted/60 rounded-full appearance-none cursor-pointer accent-primary"
                  />
                  <span className="text-[10px] font-bold text-muted-foreground w-4 text-center">
                    —
                  </span>
                  <input
                    type="range"
                    min={18}
                    max={35}
                    value={filterAgeMax}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setFilterAgeMax(Math.max(v, filterAgeMin + 1));
                    }}
                    className="flex-1 h-2 bg-muted/60 rounded-full appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground font-bold px-1">
                  <span>18</span>
                  <span>25</span>
                  <span>35</span>
                </div>
              </div>

              {/* Interest tags */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                    Sở thích
                  </p>
                  {filterTags.length > 0 && (
                    <button
                      onClick={() => setFilterTags([])}
                      className="text-[10px] font-bold text-primary"
                    >
                      Xóa hết ({filterTags.length})
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto scrollbar-none p-1">
                  {interestTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-tight transition-all border ${filterTags.includes(tag) ? "gradient-hot text-white border-transparent shadow-sm" : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted/60"}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset all */}
              <button
                onClick={() => {
                  setFilterGender("all");
                  setFilterTags([]);
                  setFilterDistance(100);
                  setFilterAgeMin(18);
                  setFilterAgeMax(35);
                }}
                className="w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-wider text-muted-foreground hover:text-foreground border border-border/10 hover:bg-muted/40 transition-all"
              >
                ✕ Đặt lại tất cả
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters */}
      {(filterGender !== "all" || filterTags.length > 0) && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 animate-fade-in px-1">
          {filterGender !== "all" && (
            <Badge
              variant="secondary"
              className="rounded-full px-3 py-1 bg-primary/10 text-primary border-primary/20 flex gap-1 items-center shrink-0"
            >
              {filterGender === "male" ? "Nam" : "Nữ"}
              <button onClick={() => setFilterGender("all")}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filterTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="rounded-full px-3 py-1 bg-primary/10 text-primary border-primary/20 flex gap-1 items-center shrink-0"
            >
              {tag}
              <button onClick={() => toggleTag(tag)}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* User List / Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/4] rounded-3xl bg-muted" />
          ))}
        </div>
      ) : allUsers.length === 0 ? (
        <div className="text-center py-24 space-y-6 animate-fade-in">
          <div className="w-32 h-32 rounded-[3.5rem] bg-gradient-to-br from-primary/5 to-muted/10 flex items-center justify-center mx-auto shadow-inner">
            <Search className="w-12 h-12 text-primary/20" />
          </div>
          <div className="space-y-2">
            <h3 className="font-black text-xl italic font-serif-display">
              Không tìm thấy ai!
            </h3>
            <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
              Thử thay đổi bộ lọc nhé!
            </p>
          </div>
          <Button
            onClick={() => {
              setSearch("");
              setFilterGender("all");
              setFilterTags([]);
              setFilterDistance(100);
              setFilterAgeMin(18);
              setFilterAgeMax(35);
            }}
            variant="outline"
            className="rounded-full px-8 py-5 h-auto font-bold"
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      ) : viewMode === "list" ? (
        /* ═══ LIST VIEW ═══ */
        <div className="space-y-3">
          {allUsers.map((u, i) => {
            const avatarUrl =
              u.avatar_url ||
              `https://api.dicebear.com/7.x/lorelei/svg?seed=${u.id}&backgroundColor=ffd5dc`;
            const commonInterests = myProfile
              ? u.interests?.filter((x) => myProfile.interests?.includes(x)) ||
                []
              : [];

            return (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                key={u.id}
                onClick={() => navigate(`/user-profile?id=${u.id}`)}
                className="flex items-center gap-4 p-4 rounded-3xl bg-card border border-border/5 shadow-soft hover:shadow-card transition-all cursor-pointer group"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden shadow-card border-2 border-transparent group-hover:border-primary/30 transition-colors">
                    <img
                      src={avatarUrl}
                      alt=""
                      className="w-full h-full object-cover bg-primary/5"
                    />
                  </div>
                  {u.is_online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background shadow-sm" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-base tracking-tight truncate">
                      {u.name}
                      {u.age ? `, ${u.age}` : ""}
                    </h3>
                    {u.is_verified && (
                      <Verified className="w-3.5 h-3.5 text-blue-500 fill-white shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {u.city && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {u.city}
                      </span>
                    )}
                    {u.distance !== undefined && (
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {formatDist(u.distance)}
                      </span>
                    )}
                  </div>
                  {/* Interests */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {u.interests?.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${commonInterests.includes(tag) ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"}`}
                      >
                        {tag}
                      </span>
                    ))}
                    {commonInterests.length > 0 && (
                      <span className="text-[9px] font-bold text-primary">
                        ❤️ {commonInterests.length} chung
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/messages?chat=${u.id}`);
                    }}
                    className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* ═══ GRID VIEW ═══ */
        <div className="grid grid-cols-2 gap-4">
          {allUsers.map((u, i) => {
            const avatarUrl =
              u.avatar_url ||
              `https://api.dicebear.com/7.x/lorelei/svg?seed=${u.id}&backgroundColor=ffd5dc`;
            const commonInterests = myProfile
              ? u.interests?.filter((x) => myProfile.interests?.includes(x))
                  ?.length || 0
              : 0;

            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                key={u.id}
                onClick={() => navigate(`/user-profile?id=${u.id}`)}
                className="group relative rounded-[2.5rem] overflow-hidden bg-card border border-border/5 shadow-romantic hover:shadow-elevated transition-all cursor-pointer"
              >
                <div className="relative aspect-[3/4.2]">
                  <img
                    src={avatarUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 bg-primary/5"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  {/* Status Badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-col items-start">
                    {u.is_online && (
                      <div className="bg-green-500/90 backdrop-blur-md text-[8px] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-lg">
                        ACTIVE
                      </div>
                    )}
                    {u.distance !== undefined && (
                      <div className="bg-white/90 backdrop-blur-md text-[8px] text-gray-700 px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                        <MapPin className="w-2 h-2" />
                        {formatDist(u.distance)}
                      </div>
                    )}
                    {commonInterests > 0 && (
                      <div className="bg-primary/90 backdrop-blur-md text-[8px] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-lg flex items-center gap-1">
                        <Heart className="w-2 h-2 fill-white" /> MATCHY
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-1 min-w-0">
                      <h3 className="font-bold text-base truncate tracking-tight">
                        {u.name}
                        {u.age && `, ${u.age}`}
                      </h3>
                      {u.is_verified && (
                        <Verified className="w-3.5 h-3.5 text-blue-400 fill-white shrink-0" />
                      )}
                    </div>
                    {u.city && (
                      <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {u.city}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {u.interests?.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[8px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-md px-2 py-1 rounded-full border border-white/10"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="absolute bottom-4 right-4 flex flex-col gap-2 transform translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/messages?chat=${u.id}`);
                      }}
                      className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/30 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-white" />
                    </button>
                    <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Leaflet custom CSS */}
      <style>{`
        .user-marker-icon, .you-marker-icon { background: none !important; border: none !important; }
        .leaflet-popup-content-wrapper { border-radius: 16px !important; box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important; }
        .leaflet-popup-tip { display: none !important; }
        .leaflet-popup-content { margin: 12px 14px !important; }
        @keyframes leaflet-ping { 75%, 100% { transform: scale(2.5); opacity: 0; } }
      `}</style>
    </div>
  );
};

export default Explore;
