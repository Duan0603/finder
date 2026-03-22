import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Send,
  ArrowLeft,
  Smile,
  Verified,
  Check,
  CheckCheck,
  MoreVertical,
  Phone,
  Video,
  Heart,
  Loader2,
  Image as ImageIcon,
  Trash2,
  X,
  Flame,
} from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { useAuth, Profile } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { containsBannedWord } from "@/lib/banned-words";
import { useToast } from "@/hooks/use-toast";
import { calculateStreak, StreakInfo } from "@/lib/streak";
import { PetWidget, MatchPet } from "@/components/chat/PetWidget";

// ========== AI CHAT (via Edge Function) ==========
async function chatWithGroq(
  partnerProfile: Profile,
  chatHistory: { role: string; content: string }[],
  userMessage: string,
): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke("chat-ai", {
      body: {
        partnerProfile,
        chatHistory: chatHistory.slice(-10),
        userMessage,
      },
    });

    if (error) {
      console.error("chat-ai invoke error:", error);
      return "Hmm, mình bị lag xíu 😅 Nhắn lại được không?";
    }

    return data?.reply || "Haha, mình đang suy nghĩ 🤔";
  } catch (err) {
    console.error("chat-ai fetch error:", err);
    return "Mạng mình hơi yếu, chờ xíu nha 📶";
  }
}

// ========== MOCK USERS (same as Explore) ==========
const mockUsers: Profile[] = [
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
  // Da Nang
  {
    id: "mock-dn-1",
    name: "Thanh Trúc",
    age: 21,
    gender: "female",
    gender_preference: "male",
    bio: "Sinh viên FPT Đà Nẵng 🎓 Thích chạy bộ ven biển Mỹ Khê.",
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
    bio: "Designer tại một startup Đà Nẵng 🎨",
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
    bio: "Yêu biển và ẩm thực Đà Nẵng 🌊🍜",
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
    bio: "Full-stack dev 💻 Fan bóng đá.",
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
    bio: "Dance crew member 💃✨",
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
    bio: "Barista & coffee roaster ☕",
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

// ========== LOCAL CHAT STORAGE ==========
interface LocalMessage {
  id: string;
  sender: "user" | "partner";
  content: string;
  timestamp: string;
  type?: "text" | "image";
}

function getChatKey(userId: string, partnerId: string) {
  return `campus-chat-${userId}-${partnerId}`;
}

function loadLocalChat(userId: string, partnerId: string): LocalMessage[] {
  try {
    const data = localStorage.getItem(getChatKey(userId, partnerId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalChat(
  userId: string,
  partnerId: string,
  messages: LocalMessage[],
) {
  localStorage.setItem(
    getChatKey(userId, partnerId),
    JSON.stringify(messages.slice(-100)),
  );
}

const getFireStyles = (count: number) => {
  if (count >= 30)
    return {
      text: "text-purple-500",
      bg: "bg-purple-500/10",
      fill: "fill-purple-500 text-purple-500",
    };
  if (count >= 10)
    return {
      text: "text-blue-500",
      bg: "bg-blue-500/10",
      fill: "fill-blue-500 text-blue-500",
    };
  if (count >= 3)
    return {
      text: "text-red-500",
      bg: "bg-red-500/10",
      fill: "fill-red-500 text-red-500",
    };
  return {
    text: "text-orange-500",
    bg: "bg-orange-500/10",
    fill: "fill-orange-500 text-orange-500",
  };
};

// ========== MAIN COMPONENT ==========
const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // DB-based conversations
  const [conversations, setConversations] = useState<
    {
      matchId: string;
      user: Profile;
      lastMessage?: {
        content: string;
        created_at: string;
        sender_id: string;
        seen: boolean;
      };
      pet?: MatchPet | null;
    }[]
  >([]);

  // Active chat state
  const [activePartner, setActivePartner] = useState<Profile | null>(null);
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const [pet, setPet] = useState<MatchPet | null>(null);
  const [dbMessages, setDbMessages] = useState<
    {
      id: string;
      sender_id: string;
      content: string;
      seen: boolean;
      created_at: string;
      type: string;
    }[]
  >([]);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  // Fire streak state
  const [streak, setStreak] = useState<StreakInfo>({
    days: 0,
    active: false,
    expiring: false,
    label: "",
    emoji: "",
  });
  const [conversationStreaks, setConversationStreaks] = useState<
    Map<string, StreakInfo>
  >(new Map());

  const isMockChat = activePartner?.id.startsWith("mock-");

  // Open chat from URL query ?chat=userId
  useEffect(() => {
    const chatId = searchParams.get("chat");
    if (chatId && !activePartner) {
      // Try mock user first
      const mock = mockUsers.find((u) => u.id === chatId);
      if (mock) {
        setActivePartner(mock);
        if (user) {
          setLocalMessages(loadLocalChat(user.id, mock.id));
        }
      } else if (user) {
        // Real DB user: fetch profile + find match
        const fetchRealUser = async () => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", chatId)
            .maybeSingle();
          if (profile) {
            setActivePartner(profile as Profile);
            // Find existing match between me and this user
            const { data: matchData } = await supabase
              .from("matches")
              .select("id")
              .or(
                `and(user1.eq.${user.id},user2.eq.${chatId}),and(user1.eq.${chatId},user2.eq.${user.id})`,
              )
              .maybeSingle();
            if (matchData) {
              setActiveMatchId(matchData.id);
            }
          }
        };
        fetchRealUser();
      }
    }
  }, [searchParams, user, activePartner]);

  // Calculate streak when an active partner is set
  useEffect(() => {
    if (!user || !activePartner) return;
    calculateStreak(user.id, activePartner.id, activeMatchId || undefined).then(
      setStreak,
    );
  }, [
    user,
    activePartner,
    activeMatchId,
    localMessages.length,
    dbMessages.length,
  ]);

  // Fetch DB conversations
  useEffect(() => {
    if (!user) return;
    const fetchConversations = async () => {
      setLoading(true);
      const { data: matches } = await supabase
        .from("matches")
        .select("*")
        .or(`user1.eq.${user.id},user2.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (!matches || matches.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const otherIds = matches.map((m: any) =>
        m.user1 === user.id ? m.user2 : m.user1,
      );
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("id", otherIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));

      const convos: typeof conversations = [];
      for (const m of matches) {
        const otherId = m.user1 === user.id ? m.user2 : m.user1;
        const profile = profileMap.get(otherId);
        if (!profile) continue;
        const { data: lastMsgs } = await supabase
          .from("messages")
          .select("*")
          .eq("match_id", m.id)
          .order("created_at", { ascending: false })
          .limit(1);
        const { data: petData } = await supabase
          .from("match_pets")
          .select("*")
          .eq("match_id", m.id)
          .maybeSingle();
        convos.push({
          matchId: m.id,
          user: profile as Profile,
          lastMessage: lastMsgs?.[0],
          pet: petData as MatchPet | null,
        });
      }
      setConversations(convos);
      setLoading(false);
    };
    fetchConversations();
  }, [user]);

  // Get mock conversations that have saved chats
  const mockConversations = user
    ? mockUsers
        .filter((m) => {
          const msgs = loadLocalChat(user.id, m.id);
          return msgs.length > 0;
        })
        .map((m) => {
          const msgs = loadLocalChat(user.id, m.id);
          const last = msgs[msgs.length - 1];
          return { user: m, lastMessage: last };
        })
    : [];

  // Fetch DB messages for active non-mock chat
  useEffect(() => {
    if (!activeMatchId || isMockChat) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("match_id", activeMatchId)
        .order("created_at", { ascending: true });
      setDbMessages(data || []);

      if (data && data.length > 0 && user) {
        await supabase
          .from("messages")
          .update({ seen: true })
          .eq("match_id", activeMatchId)
          .neq("sender_id", user.id);
      }
    };
    fetchMessages();

    const channel = supabase
      .channel(`messages:${activeMatchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${activeMatchId}`,
        },
        (payload) => {
          const newMessage = payload.new as any;
          setDbMessages((prev) => {
            if (prev.find((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${activeMatchId}`,
        },
        (payload) => {
          const deletedId = (payload.old as any)?.id;
          if (deletedId) {
            setDbMessages((prev) => prev.filter((m) => m.id !== deletedId));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeMatchId, user?.id, isMockChat]);

  // Pet Milestone logic
  const prevPetRef = useRef<MatchPet | null>(null);
  const [showMilestone, setShowMilestone] = useState<number | null>(null);

  useEffect(() => {
    if (pet && prevPetRef.current) {
      if (pet.streak_count > prevPetRef.current.streak_count) {
        const milestones = [3, 10, 30, 50, 80, 100];
        if (milestones.includes(pet.streak_count)) {
          setShowMilestone(pet.streak_count);
          // Hide milestone after 5s
          setTimeout(() => setShowMilestone(null), 5000);
        }
      }
    }
    prevPetRef.current = pet;
  }, [pet]);

  // Fetch Pet data for active chat
  useEffect(() => {
    if (!activeMatchId || isMockChat) {
      setPet(null);
      return;
    }
    const fetchPet = async () => {
      const { data } = await supabase
        .from("match_pets")
        .select("*")
        .eq("match_id", activeMatchId)
        .maybeSingle();
      setPet(data as MatchPet);
    };
    fetchPet();

    const petChannel = supabase
      .channel(`pet:${activeMatchId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_pets",
          filter: `match_id=eq.${activeMatchId}`,
        },
        (payload) => {
          if (payload.new) setPet(payload.new as MatchPet);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(petChannel);
    };
  }, [activeMatchId, isMockChat]);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, dbMessages, aiTyping]);

  // Delete message
  const deleteMessage = async (msgId: string, isDb: boolean) => {
    if (isDb && user) {
      // Try delete from Supabase DB
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", msgId);

      if (error) {
        console.error("DB delete failed:", error);
        // Try with sender_id constraint for RLS
        await supabase
          .from("messages")
          .delete()
          .eq("id", msgId)
          .eq("sender_id", user.id);
      }
      setDbMessages((prev) => prev.filter((m) => m.id !== msgId));
    }
    // Always also clean from local storage
    const updated = localMessages.filter((m) => m.id !== msgId);
    setLocalMessages(updated);
    if (user && activePartner)
      saveLocalChat(user.id, activePartner.id, updated);
  };

  // Upload image
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingImage(true);
    try {
      if (isMockChat && activePartner) {
        // Mock image upload: create a blob URL just for local demo
        const imageUrl = URL.createObjectURL(file);
        const userMsg: LocalMessage = {
          id: `msg-${Date.now()}`,
          sender: "user",
          content: imageUrl,
          timestamp: new Date().toISOString(),
          type: "image",
        };
        const updated = [...localMessages, userMsg];
        setLocalMessages(updated);
        saveLocalChat(user.id, activePartner.id, updated);

        // Mock AI response
        setTimeout(() => {
          const aiMsg: LocalMessage = {
            id: `msg-${Date.now()}-ai`,
            sender: "partner",
            content: "Wow ảnh đẹp quá! 😍",
            timestamp: new Date().toISOString(),
            type: "text",
          };
          const withAi = [...updated, aiMsg];
          setLocalMessages(withAi);
          saveLocalChat(user.id, activePartner.id, withAi);
        }, 1500);
      } else if (activePartner) {
        // Ensure we have a match_id
        let matchId = activeMatchId;
        if (!matchId) {
          const { data: existingMatch } = await supabase
            .from("matches")
            .select("id")
            .or(
              `and(user1.eq.${user.id},user2.eq.${activePartner.id}),and(user1.eq.${activePartner.id},user2.eq.${user.id})`,
            )
            .maybeSingle();
          if (existingMatch) {
            matchId = existingMatch.id;
          } else {
            const { data: newMatch } = await supabase
              .from("matches")
              .insert({ user1: user.id, user2: activePartner.id })
              .select("id")
              .single();
            if (newMatch) matchId = newMatch.id;
          }
          if (matchId) setActiveMatchId(matchId);
        }
        if (!matchId) throw new Error("Không thể tạo cuộc trò chuyện");

        // Upload to Supabase storage
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `chat_images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Use signed URL (works even if bucket is private)
        const { data: signedData, error: signErr } = await supabase.storage
          .from("avatars")
          .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10); // 10 year expiry

        if (signErr || !signedData?.signedUrl) {
          throw signErr || new Error("Không thể tạo URL ảnh");
        }

        await supabase.from("messages").insert({
          match_id: matchId,
          sender_id: user.id,
          content: signedData.signedUrl,
          type: "image",
        });
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      toast({
        title: "❌ Lỗi gửi ảnh",
        description: err?.message || "Không thể tải ảnh lên",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Send message (mock AI chat or DB)
  const sendMessage = useCallback(async () => {
    if (!newMsg.trim() || !user) return;
    const content = newMsg.trim();

    // Check banned words
    const banned = containsBannedWord(content);
    if (banned) {
      toast({
        title: "⚠️ Nội dung không phù hợp",
        description:
          "Tin nhắn chứa từ ngữ không được phép. Vui lòng chỉnh sửa.",
        variant: "destructive",
      });
      return;
    }

    setNewMsg("");

    if (isMockChat && activePartner) {
      // Add user message locally
      const userMsg: LocalMessage = {
        id: `msg-${Date.now()}`,
        sender: "user",
        content,
        timestamp: new Date().toISOString(),
        type: "text",
      };
      const updated = [...localMessages, userMsg];
      setLocalMessages(updated);
      saveLocalChat(user.id, activePartner.id, updated);

      // Call Groq API for AI response
      setAiTyping(true);
      const history = updated.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.content,
      }));

      const aiReply = await chatWithGroq(activePartner, history, content);

      const aiMsg: LocalMessage = {
        id: `msg-${Date.now()}-ai`,
        sender: "partner",
        content: aiReply,
        timestamp: new Date().toISOString(),
        type: "text",
      };
      const withAi = [...updated, aiMsg];
      setLocalMessages(withAi);
      saveLocalChat(user.id, activePartner.id, withAi);
      setAiTyping(false);
    } else if (activePartner) {
      // DB message — need a match_id
      let matchId = activeMatchId;

      // If no match exists yet, create one
      if (!matchId) {
        const { data: existingMatch } = await supabase
          .from("matches")
          .select("id")
          .or(
            `and(user1.eq.${user.id},user2.eq.${activePartner.id}),and(user1.eq.${activePartner.id},user2.eq.${user.id})`,
          )
          .maybeSingle();

        if (existingMatch) {
          matchId = existingMatch.id;
        } else {
          // Create new match
          const { data: newMatch, error: matchErr } = await supabase
            .from("matches")
            .insert({ user1: user.id, user2: activePartner.id })
            .select("id")
            .single();
          if (matchErr || !newMatch) {
            toast({
              title: "❌ Không thể gửi tin nhắn",
              description:
                matchErr?.message || "Không thể tạo cuộc trò chuyện.",
              variant: "destructive",
            });
            setNewMsg(content); // Restore the message
            return;
          }
          matchId = newMatch.id;
        }
        setActiveMatchId(matchId);
      }

      // Send the message
      const { error: msgErr } = await supabase.from("messages").insert({
        match_id: matchId,
        sender_id: user.id,
        content,
        type: "text",
      });
      if (msgErr) {
        toast({
          title: "❌ Lỗi gửi tin nhắn",
          description: msgErr.message,
          variant: "destructive",
        });
        setNewMsg(content); // Restore the message
      }
    }
  }, [
    newMsg,
    user,
    isMockChat,
    activePartner,
    localMessages,
    activeMatchId,
    toast,
  ]);

  const fmtTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ========== ACTIVE CHAT VIEW ==========
  if (activePartner) {
    const partnerAvatar =
      activePartner.avatar_url ||
      `https://api.dicebear.com/7.x/lorelei/svg?seed=${activePartner.id}&backgroundColor=ffd5dc`;

    // Unified messages list
    const allMessages = isMockChat
      ? localMessages.map((m) => ({
          id: m.id,
          isMe: m.sender === "user",
          content: m.content,
          timestamp: m.timestamp,
          type: m.type || "text",
          seen: true, // Local messages are always "seen"
        }))
      : dbMessages.map((m) => ({
          id: m.id,
          isMe: m.sender_id === user?.id,
          content: m.content,
          timestamp: m.created_at,
          type: m.type || "text",
          seen: m.seen,
        }));

    // Group messages by date for TikTok-style separators
    const getDateLabel = (dateStr: string): string => {
      const d = new Date(dateStr);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const msgDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const diffDays = Math.floor(
        (today.getTime() - msgDate.getTime()) / 86400000,
      );
      if (diffDays === 0) return "Hôm nay";
      if (diffDays === 1) return "Hôm qua";
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    // Build messages with date separators
    const messagesWithDates: {
      type: "date" | "msg";
      label?: string;
      msg?: (typeof allMessages)[0];
    }[] = [];
    let lastDateLabel = "";
    for (const msg of allMessages) {
      const dateLabel = getDateLabel(msg.timestamp);
      if (dateLabel !== lastDateLabel) {
        messagesWithDates.push({ type: "date", label: dateLabel });
        lastDateLabel = dateLabel;
      }
      messagesWithDates.push({ type: "msg", msg });
    }

    return (
      <div className="flex flex-col h-[calc(100vh-140px)] animate-fade-in bg-background relative">
        {/* Chat header */}
        <div className="flex items-center gap-3 p-4 border-b border-border/10 bg-card/50 backdrop-blur-xl sticky top-0 z-20">
          <button
            onClick={() => {
              setActivePartner(null);
              setActiveMatchId(null);
              setLocalMessages([]);
              setDbMessages([]);
              setSearchParams({});
            }}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate(`/user-profile?id=${activePartner.id}`)}
            className="relative"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border border-border/10">
              <img
                src={partnerAvatar}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            {activePartner.is_online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="font-bold text-sm tracking-tight truncate">
                {activePartner.name}
              </h3>
              {activePartner.is_verified && (
                <Verified className="w-3.5 h-3.5 text-blue-500 fill-white" />
              )}
              {(() => {
                // If we have pet data from DB, use it!
                if (pet && pet.streak_count > 0) {
                  const today = new Date().toISOString().split("T")[0];
                  const hasChattedToday = pet.last_chat_date === today;
                  const styles = getFireStyles(pet.streak_count);

                  return (
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-black px-2 py-0.5 rounded-full ${
                        hasChattedToday
                          ? `${styles.text} ${styles.bg} animate-pulse`
                          : "text-muted-foreground bg-muted"
                      }`}
                    >
                      <Flame
                        className={`w-3.5 h-3.5 ${hasChattedToday ? styles.fill : "fill-muted-foreground text-muted-foreground"}`}
                      />
                      {pet.streak_count}
                    </span>
                  );
                }

                // Mock local chat logic fallback
                if (streak.active) {
                  return (
                    <span className="inline-flex items-center gap-0.5 text-xs font-black text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full animate-pulse">
                      {streak.label}
                    </span>
                  );
                } else if (streak.days >= 1) {
                  return (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-full">
                      {streak.label}
                    </span>
                  );
                }
                return null;
              })()}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              {activePartner.is_online
                ? "Đang hoạt động"
                : isMockChat
                  ? "AI Chat"
                  : "Ngoại tuyến"}
              {streak.expiring && " • ⏳ Chuỗi sắp hết hạn!"}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
              <Phone className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
              <Video className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        <PetWidget pet={pet} partnerName={activePartner.name} />

        <AnimatePresence>
          {showMilestone !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
              className="absolute top-24 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-orange-400 to-rose-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border-2 border-white pointer-events-none"
            >
              <span className="text-2xl animate-bounce">🎉</span>
              <div>
                <p className="text-sm font-black tracking-tight leading-tight">
                  CHÚC MỪNG!
                </p>
                <p className="text-xs font-medium opacity-90">
                  Kích hoạt Lửa cấp {showMilestone} ngày 🔥
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {allMessages.length === 0 && !aiTyping && (
            <div className="text-center py-12 space-y-4 max-w-[280px] mx-auto animate-fade-in">
              <div className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center mx-auto shadow-inner">
                <Heart className="w-12 h-12 text-primary/20" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Gửi tin nhắn đầu tiên cho{" "}
                <span className="font-bold text-foreground">
                  {activePartner.name}
                </span>
                ! 🎉
              </p>
              {isMockChat && (
                <p className="text-xs text-muted-foreground/60">
                  💡 Chat được hỗ trợ bởi AI — trả lời theo tính cách của{" "}
                  {activePartner.name}
                </p>
              )}
            </div>
          )}

          <AnimatePresence initial={false}>
            {messagesWithDates.map((item, idx) => {
              if (item.type === "date") {
                return (
                  <div
                    key={`date-${idx}`}
                    className="flex items-center justify-center my-4"
                  >
                    <span className="text-[11px] font-bold text-muted-foreground/60 bg-muted/40 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">
                      {item.label}
                    </span>
                  </div>
                );
              }
              const msg = item.msg!;
              return (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={msg.id}
                  className="group relative"
                >
                  <div
                    className={`flex ${msg.isMe ? "justify-end" : "justify-start"} items-end gap-2`}
                  >
                    {!msg.isMe && (
                      <div className="w-7 h-7 rounded-full overflow-hidden shadow-sm shrink-0 mb-1">
                        <img
                          src={partnerAvatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {msg.isMe && (
                      <button
                        onClick={() => deleteMessage(msg.id, !isMockChat)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-500 hover:bg-red-50 rounded-full mb-1"
                        title="Xóa tin nhắn"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <div
                      className={`relative max-w-[75%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                        msg.isMe
                          ? "gradient-hot text-white rounded-br-md"
                          : "bg-muted/50 backdrop-blur-sm rounded-bl-md border border-border/5"
                      } ${msg.type === "image" ? "p-1.5" : ""}`}
                    >
                      {msg.type === "image" ? (
                        <img
                          src={msg.content}
                          alt="Chat image"
                          className="rounded-xl w-full max-w-[200px] min-h-[120px] object-cover bg-muted/20"
                          loading="eager"
                          onLoad={(e) => {
                            (e.target as HTMLImageElement).style.minHeight =
                              "auto";
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/200?text=Lỗi+tải+ảnh";
                          }}
                        />
                      ) : (
                        <p className="whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      )}
                      <div
                        className={`flex items-center gap-1.5 mt-1.5 select-none ${msg.isMe ? "justify-end" : ""}`}
                      >
                        <span
                          className={`text-[9px] font-medium tracking-tighter ${msg.isMe ? "text-white/70" : "text-muted-foreground/70"}`}
                        >
                          {fmtTime(msg.timestamp)}
                        </span>
                        {msg.isMe && (
                          <div className="flex">
                            {msg.seen ? (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-200" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-white/50" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* AI typing indicator */}
          {aiTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-end gap-2"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden shadow-sm shrink-0 mb-1">
                <img
                  src={partnerAvatar}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="bg-muted/50 backdrop-blur-sm rounded-2xl rounded-bl-md border border-border/5 px-4 py-3 flex items-center gap-1.5">
                <div className="flex gap-1">
                  <span
                    className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <span className="text-xs text-muted-foreground ml-1">
                  {activePartner.name} đang nhập...
                </span>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} className="h-4" />
        </div>

        {/* Input area */}
        <div className="p-4 bg-card/30 backdrop-blur-2xl border-t border-border/10 relative">
          <AnimatePresence>
            {showEmoji && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute bottom-full left-4 mb-2 z-50 shadow-elevated rounded-2xl overflow-hidden"
              >
                <div className="flex justify-between items-center bg-card p-2 border-b border-border/10">
                  <span className="text-xs font-bold px-2 text-muted-foreground">
                    Chọn Emoji
                  </span>
                  <button
                    onClick={() => setShowEmoji(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <EmojiPicker
                  onEmojiClick={(e) => {
                    setNewMsg((prev) => prev + e.emoji);
                  }}
                  searchDisabled
                  skinTonesDisabled
                  width={300}
                  height={350}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2">
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95 shrink-0 ${showEmoji ? "bg-primary/20 text-primary" : "hover:bg-muted text-muted-foreground"}`}
            >
              <Smile className="w-6 h-6" />
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
              disabled={uploadingImage}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="w-11 h-11 rounded-2xl hover:bg-muted flex items-center justify-center text-muted-foreground transition-all active:scale-95 shrink-0 disabled:opacity-50"
            >
              <ImageIcon className="w-6 h-6" />
            </button>
            <div className="flex-1 relative">
              <textarea
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                    setShowEmoji(false);
                  }
                }}
                placeholder="Nhắn tin..."
                rows={1}
                disabled={aiTyping || uploadingImage}
                className="w-full max-h-32 min-h-[44px] rounded-2xl bg-muted/40 border-0 focus:ring-2 focus:ring-primary/20 py-3 px-4 text-sm resize-none scrollbar-none transition-all disabled:opacity-50"
                style={{ height: "auto" }}
              />
            </div>
            <button
              onClick={() => {
                sendMessage();
                setShowEmoji(false);
              }}
              disabled={(!newMsg.trim() && !uploadingImage) || aiTyping}
              className="w-11 h-11 rounded-2xl gradient-hot flex items-center justify-center text-white shadow-romantic hover:scale-105 transition-all active:scale-90 disabled:opacity-40 disabled:scale-100 shrink-0"
            >
              {aiTyping || uploadingImage ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5 rotate-45 -translate-y-0.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== CONVERSATION LIST VIEW ==========
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-3xl font-black italic font-serif-display text-gradient-flame">
          Tin nhắn
        </h1>
        <div className="w-10 h-10 rounded-full border border-border/30 flex items-center justify-center hover:bg-muted transition-colors cursor-pointer">
          <MoreVertical className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      <div className="relative group">
        <Input
          placeholder="Tìm kiếm cuộc trò chuyện..."
          className="rounded-full h-12 bg-muted/30 border-0 px-6 focus:ring-2 focus:ring-primary/10 transition-all pl-12"
        />
        <svg
          className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Mock user quick chat list */}
      {mockConversations.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1 mb-2">
            💬 Cuộc trò chuyện
          </h3>
          {mockConversations.map((convo) => {
            const avatarUrl = convo.user.avatar_url;
            return (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                key={convo.user.id}
                onClick={() => {
                  setActivePartner(convo.user);
                  if (user)
                    setLocalMessages(loadLocalChat(user.id, convo.user.id));
                  setSearchParams({ chat: convo.user.id });
                }}
                className="w-full flex items-center gap-4 p-4 rounded-3xl transition-all text-left hover:bg-muted/30"
              >
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-[1.75rem] overflow-hidden shadow-card border-2 border-primary/20">
                    <img
                      src={avatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {convo.user.is_online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background shadow-sm" />
                  )}
                </div>
                <div className="flex-1 min-w-0 py-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="font-bold text-base tracking-tight truncate">
                        {convo.user.name}
                      </h3>
                      {convo.user.is_verified && (
                        <Verified className="w-3.5 h-3.5 text-blue-500 fill-white" />
                      )}
                      {(() => {
                        const s = conversationStreaks.get(convo.user.id);
                        if (s?.active)
                          return (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded-full">
                              {s.label}
                            </span>
                          );
                        return null;
                      })()}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {fmtTime(convo.lastMessage.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm truncate leading-tight text-muted-foreground">
                    {convo.lastMessage.sender === "user" ? "Bạn: " : ""}
                    {convo.lastMessage.content}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* DB conversations */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 p-4 items-center animate-pulse">
              <div className="w-16 h-16 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-48 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : conversations.length === 0 && mockConversations.length === 0 ? (
        <div className="text-center py-20 space-y-6 animate-fade-in">
          <div className="w-32 h-32 rounded-[3.5rem] bg-gradient-to-br from-primary/5 to-muted/10 flex items-center justify-center mx-auto shadow-inner relative">
            <Send className="w-12 h-12 text-primary/20 rotate-12" />
            <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-card shadow-card flex items-center justify-center rotate-[-12deg]">
              <Smile className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-black text-xl italic font-serif-display">
              Chưa có tin nhắn nào
            </h3>
            <p className="text-sm text-muted-foreground max-w-[260px] mx-auto leading-relaxed">
              Vào <span className="text-primary font-bold">Khám phá</span> để
              tìm bạn mới và bắt đầu trò chuyện! 💬
            </p>
          </div>
          <Button
            onClick={() => navigate("/explore")}
            className="rounded-full px-8 py-6 h-auto font-bold gradient-hot text-white border-0 shadow-glow transition-all active:scale-95"
          >
            Khám phá ngay
          </Button>
        </div>
      ) : (
        conversations.length > 0 && (
          <div className="space-y-1">
            {conversations.length > 0 && (
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1 mb-2">
                💌 Cuộc trò chuyện
              </h3>
            )}
            {conversations.map((convo) => {
              const avatarUrl =
                convo.user.avatar_url ||
                `https://api.dicebear.com/7.x/lorelei/svg?seed=${convo.user.id}&backgroundColor=ffd5dc`;
              const hasUnread =
                convo.lastMessage &&
                !convo.lastMessage.seen &&
                convo.lastMessage.sender_id !== user?.id;

              return (
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  key={convo.matchId}
                  onClick={() => {
                    setActiveMatchId(convo.matchId);
                    setActivePartner(convo.user);
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all text-left ${hasUnread ? "bg-primary/[0.03]" : ""}`}
                >
                  <div className="relative shrink-0">
                    <div
                      className={`w-16 h-16 rounded-[1.75rem] overflow-hidden shadow-card border-2 ${hasUnread ? "border-primary" : "border-transparent"}`}
                    >
                      <img
                        src={avatarUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {convo.user.is_online ? (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-background shadow-sm" />
                    ) : (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-muted-foreground/30 border-2 border-background shadow-sm" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 py-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h3
                          className={`font-bold text-base tracking-tight truncate ${hasUnread ? "text-foreground" : "text-foreground/90"}`}
                        >
                          {convo.user.name}
                        </h3>
                        {convo.user.is_verified && (
                          <Verified className="w-3.5 h-3.5 text-blue-500 fill-white" />
                        )}
                        {(() => {
                          if (convo.pet && convo.pet.streak_count > 0) {
                            const today = new Date()
                              .toISOString()
                              .split("T")[0];
                            const hasChattedToday =
                              convo.pet.last_chat_date === today;
                            const styles = getFireStyles(
                              convo.pet.streak_count,
                            );
                            return (
                              <span
                                className={`inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                                  hasChattedToday
                                    ? `${styles.text} ${styles.bg}`
                                    : "text-muted-foreground bg-muted/50"
                                }`}
                              >
                                <Flame
                                  className={`w-3 h-3 ${hasChattedToday ? styles.fill : "fill-muted-foreground text-muted-foreground"}`}
                                />
                                {convo.pet.streak_count}
                              </span>
                            );
                          }
                          const s = conversationStreaks.get(convo.user.id);
                          if (s?.active)
                            return (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded-full">
                                {s.label}
                              </span>
                            );
                          return null;
                        })()}
                      </div>
                      {convo.lastMessage && (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${hasUnread ? "text-primary" : "text-muted-foreground"}`}
                        >
                          {fmtTime(convo.lastMessage.created_at)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`text-sm truncate leading-tight ${hasUnread ? "text-foreground font-semibold" : "text-muted-foreground"}`}
                      >
                        {convo.lastMessage
                          ? (convo.lastMessage.sender_id === user?.id
                              ? "Bạn: "
                              : "") + convo.lastMessage.content
                          : "Match mới! Hãy gửi lời chào 👋"}
                      </p>
                      {hasUnread && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-glow flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

export default Messages;
