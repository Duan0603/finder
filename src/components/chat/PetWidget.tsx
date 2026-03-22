import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Flame, Star, Sparkles, AlertCircle, X, Info, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export interface MatchPet {
  match_id: string;
  streak_count: number;
  last_chat_date: string;
  pet_shape: "dog" | "cat" | "rabbit" | "bear" | "hamster";
  pet_name: string | null;
  happiness_score: number;
  level: number;
  background: string;
  accessories: string[];
}

interface PetWidgetProps {
  pet: MatchPet | null;
  partnerName: string;
}

const PET_EMOJIS = {
  dog: "🐶",
  cat: "🐱",
  rabbit: "🐰",
  bear: "🐻",
  hamster: "🐹",
};

export const PetWidget = ({ pet, partnerName }: PetWidgetProps) => {
  const [expanded, setExpanded] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setExpanded(false);
      }
    };
    if (expanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expanded]);

  if (!pet) return null;

  const handleChangeShape = async (newShape: string) => {
    if (pet.pet_shape === newShape) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("match_pets")
        .update({ pet_shape: newShape })
        .eq("match_id", pet.match_id);
      
      if (error) throw error;
      // Note: Real-time subscription in Messages.tsx will automatically update the UI
    } catch (err) {
      console.error("Error updating pet shape:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Determine Fire color based on streaks
  let FireIcon = Flame;
  let fireColor = "text-orange-500 fill-orange-500";
  let fireBg = "bg-orange-50 border-orange-200";
  let fireLabel = "Mới bắt đầu";

  if (pet.streak_count >= 30) {
    fireColor = "text-purple-500 fill-purple-500";
    fireBg = "bg-purple-50 border-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.4)]";
    fireLabel = "Lửa Tím";
  } else if (pet.streak_count >= 10) {
    fireColor = "text-blue-500 fill-blue-500";
    fireBg = "bg-blue-50 border-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.3)]";
    fireLabel = "Lửa Xanh";
  } else if (pet.streak_count >= 3) {
    fireColor = "text-red-500 fill-red-500";
    fireBg = "bg-red-50 border-red-200";
    fireLabel = "Lửa Đỏ";
  }

  // Determine mood
  const isHappy = pet.happiness_score >= 70;
  const isSad = pet.happiness_score <= 30;

  return (
    <>
      {/* Floating Pet Bubble */}
      <motion.button
        className="absolute top-20 right-4 z-40 bg-card rounded-full shadow-lg border-2 border-border/20 p-1 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95"
        animate={{
          y: [0, -6, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        onClick={() => setExpanded(true)}
      >
        <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-blue-50 shadow-inner">
          <span className={`text-3xl ${isHappy ? "animate-bounce" : isSad ? "grayscale opacity-80" : ""}`}>
            {PET_EMOJIS[pet.pet_shape]}
          </span>
          
          {/* Streak indicator badge */}
          {pet.streak_count > 0 && (
            <div className="absolute -bottom-2 -left-2 bg-white rounded-full px-1.5 py-0.5 border border-border/50 flex items-center shadow-sm z-50">
              <FireIcon className={`w-3 h-3 ${fireColor}`} />
              <span className={`text-[10px] font-black leading-none ml-0.5 ${fireColor.split(" ")[0]}`}>
                {pet.streak_count}
              </span>
            </div>
          )}

          {/* Level indicator badge */}
          <div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-300 to-yellow-500 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow-sm border border-white z-50">
            {pet.level}
          </div>
        </div>
      </motion.button>

      {/* Expanded Popup */}
      <AnimatePresence>
        {expanded && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-background/40 backdrop-blur-sm">
            <motion.div
              ref={popupRef}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-[320px] bg-card rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-border/50 overflow-hidden relative"
            >
              {/* Close button */}
              <button 
                onClick={() => setExpanded(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-muted-foreground hover:bg-black/10 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Popup Header & Pet Avatar */}
              <div className="pt-8 pb-6 px-6 relative bg-gradient-to-b from-blue-50/50 to-transparent flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full bg-white shadow-soft border-4 border-white flex items-center justify-center text-6xl relative z-10">
                    <span className={`${isHappy ? "animate-bounce" : ""}`}>{PET_EMOJIS[pet.pet_shape]}</span>
                  </div>
                  {/* Decorative glow */}
                  <div className={`absolute inset-0 rounded-full blur-xl scale-110 z-0 ${isHappy ? "bg-yellow-400/40" : isSad ? "bg-gray-400/30" : "bg-blue-400/30"}`} />
                </div>
                
                <h3 className="font-black text-lg text-center leading-tight">Pet của<br/>{partnerName} & Bạn</h3>
                
                <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${fireBg}`}>
                  <FireIcon className={`w-4 h-4 ${fireColor}`} />
                  <span className={`font-black text-sm ${fireColor.split(" ")[0]}`}>
                    Streak: {pet.streak_count} ngày
                  </span>
                </div>
              </div>

              {/* Status Section */}
              <div className="px-6 pb-6 space-y-4">
                
                {/* Pet Selection */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Đổi thú cưng</span>
                    {isUpdating && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
                  </div>
                  <div className="flex justify-between items-center bg-muted/40 p-2 rounded-2xl border border-border/50">
                    {(Object.keys(PET_EMOJIS) as Array<keyof typeof PET_EMOJIS>).map((shape) => (
                      <button
                        key={shape}
                        onClick={() => handleChangeShape(shape)}
                        disabled={isUpdating}
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                          pet.pet_shape === shape 
                            ? "bg-white shadow-soft scale-110 border border-border/20 z-10" 
                            : "opacity-60 hover:opacity-100 hover:scale-110 hover:bg-white/50"
                        }`}
                      >
                        {PET_EMOJIS[shape]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500" /> Cấp độ {pet.level}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Lv tiếp theo {">"}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full" 
                      style={{ width: `${(pet.streak_count % 30) / 30 * 100}%` }} 
                    />
                  </div>
                </div>

                {/* Happiness Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                      <Heart className={`w-3.5 h-3.5 ${isSad ? "text-red-400" : isHappy ? "text-green-500" : "text-primary"}`} /> 
                      Hạnh phúc
                    </span>
                    <span className="text-[10px] text-muted-foreground">{pet.happiness_score}/100</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isHappy ? "bg-green-500" : isSad ? "bg-red-400" : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, pet.happiness_score))}%` }}
                    />
                  </div>
                </div>

                {/* Info Text */}
                <div className="bg-muted/30 p-3 rounded-2xl">
                  {isSad ? (
                     <p className="text-xs text-red-500/90 font-medium leading-relaxed flex gap-2">
                       <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                       Pet đang buồn vì hai bạn ít chat. Hãy gửi tin nhắn ngay nhé!
                     </p>
                  ) : isHappy ? (
                    <p className="text-xs text-green-600/90 font-medium leading-relaxed flex gap-2">
                       <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                       Pet rất vui vẻ vì hai bạn nói chuyện thường xuyên!
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed flex gap-2">
                       <Info className="w-4 h-4 shrink-0 mt-0.5" />
                       Giữ chuỗi chat mỗi ngày để nâng cấp hình dáng và mở khóa phụ kiện cho Pet!
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
