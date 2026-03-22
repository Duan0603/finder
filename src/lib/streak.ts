import { supabase } from "./supabase";

/**
 * TikTok-style "Chuỗi lửa" (Fire Streak) system
 *
 * Rules:
 * - A streak starts after 3+ consecutive days of BOTH users messaging each other
 * - The 🔥 emoji + day count appears next to the chat
 * - If no messages are exchanged within 24h, the streak "fades" (warning)
 * - After 48h of no messages, the streak resets
 */

export interface StreakInfo {
  /** Number of consecutive days both users have exchanged messages */
  days: number;
  /** Whether the streak is active (>= 3 days) */
  active: boolean;
  /** Whether the streak is about to expire (< 12h left) */
  expiring: boolean;
  /** Label to display, e.g. "🔥 5" */
  label: string;
  /** Emoji representation based on streak level */
  emoji: string;
}

/**
 * Get the streak emoji based on streak length
 */
function getStreakEmoji(days: number): string {
  if (days >= 30) return "💎"; // Diamond for 30+ days
  if (days >= 14) return "⚡"; // Lightning for 14+ days
  if (days >= 7) return "🔥"; // Fire for 7+ days
  if (days >= 3) return "🔥"; // Fire for 3+ days
  return "";
}

/**
 * Calculate fire streak between two users based on their message history.
 * Works with real DB messages or local messages.
 */
export async function calculateStreak(
  userId: string,
  partnerId: string,
  matchId?: string,
): Promise<StreakInfo> {
  const noStreak: StreakInfo = {
    days: 0,
    active: false,
    expiring: false,
    label: "",
    emoji: "",
  };

  try {
    // For mock users, calculate from local storage
    if (partnerId.startsWith("mock-")) {
      return calculateLocalStreak(userId, partnerId);
    }

    if (!matchId) {
      // Try to find the match
      const { data: matchData } = await supabase
        .from("matches")
        .select("id")
        .or(
          `and(user1.eq.${userId},user2.eq.${partnerId}),and(user1.eq.${partnerId},user2.eq.${userId})`,
        )
        .maybeSingle();
      if (!matchData) return noStreak;
      matchId = matchData.id;
    }

    // Fetch messages from both sides, ordered by date
    const { data: messages } = await supabase
      .from("messages")
      .select("sender_id, created_at")
      .eq("match_id", matchId)
      .order("created_at", { ascending: true });

    if (!messages || messages.length === 0) return noStreak;

    return computeStreakFromMessages(
      messages.map((m) => ({
        senderId: m.sender_id,
        timestamp: m.created_at,
      })),
      userId,
      partnerId,
    );
  } catch {
    return noStreak;
  }
}

/**
 * Calculate streak from local storage messages (for mock/AI chats)
 */
function calculateLocalStreak(userId: string, partnerId: string): StreakInfo {
  const noStreak: StreakInfo = {
    days: 0,
    active: false,
    expiring: false,
    label: "",
    emoji: "",
  };

  try {
    const key = `campus_chat_${userId}_${partnerId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return noStreak;

    const messages = JSON.parse(raw);
    if (!messages || messages.length === 0) return noStreak;

    return computeStreakFromMessages(
      messages.map((m: any) => ({
        senderId: m.sender === "user" ? userId : partnerId,
        timestamp: m.timestamp,
      })),
      userId,
      partnerId,
    );
  } catch {
    return noStreak;
  }
}

/**
 * Core streak calculation logic
 * Both users must have sent at least 1 message each on a given day for it to count
 */
function computeStreakFromMessages(
  messages: { senderId: string; timestamp: string }[],
  userId: string,
  partnerId: string,
): StreakInfo {
  const noStreak: StreakInfo = {
    days: 0,
    active: false,
    expiring: false,
    label: "",
    emoji: "",
  };

  if (messages.length === 0) return noStreak;

  // Group messages by date (local timezone)
  const dayMap = new Map<string, Set<string>>();

  for (const msg of messages) {
    const date = new Date(msg.timestamp);
    const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    if (!dayMap.has(dayKey)) dayMap.set(dayKey, new Set());
    dayMap.get(dayKey)!.add(msg.senderId);
  }

  // Find days where BOTH users messaged
  const mutualDays: string[] = [];
  for (const [dayKey, senders] of dayMap.entries()) {
    if (senders.has(userId) && senders.has(partnerId)) {
      mutualDays.push(dayKey);
    }
  }

  // Sort dates
  mutualDays.sort();

  if (mutualDays.length === 0) return noStreak;

  // Count consecutive streak days ending at today or yesterday
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  // The streak must include today or yesterday to be active
  const lastMutualDay = mutualDays[mutualDays.length - 1];
  if (lastMutualDay !== todayKey && lastMutualDay !== yesterdayKey) {
    return noStreak; // Streak broken
  }

  // Count consecutive days backward from the last mutual day
  let streakDays = 1;
  for (let i = mutualDays.length - 2; i >= 0; i--) {
    const currentDate = new Date(mutualDays[i + 1]);
    const prevDate = new Date(mutualDays[i]);
    const diffMs = currentDate.getTime() - prevDate.getTime();
    const diffDays = Math.round(diffMs / 86400000);

    if (diffDays === 1) {
      streakDays++;
    } else {
      break; // Gap found, stop counting
    }
  }

  const active = streakDays >= 3;
  const emoji = getStreakEmoji(streakDays);

  // Check if expiring (last message was yesterday, not today)
  const expiring = lastMutualDay === yesterdayKey && lastMutualDay !== todayKey;

  return {
    days: streakDays,
    active,
    expiring,
    label: active
      ? `${emoji} ${streakDays}`
      : streakDays >= 1
        ? `${streakDays}/3 🔥`
        : "",
    emoji,
  };
}
