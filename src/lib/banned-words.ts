// Vietnamese banned/inappropriate words list
// This filters profanity, insults, and inappropriate content

const BANNED_WORDS: string[] = [
  // Vietnamese profanity & insults
  "đụ",
  "địt",
  "đĩ",
  "đéo",
  "đù",
  "đồ chó",
  "đồ khốn",
  "lồn",
  "lon",
  "buồi",
  "cặc",
  "cu",
  "dái",
  "chó",
  "khốn nạn",
  "mất dạy",
  "vô học",
  "ngu",
  "ngu si",
  "đần",
  "đần độn",
  "ngốc",
  "chết mẹ",
  "chết cha",
  "chết tiệt",
  "mẹ mày",
  "má mày",
  "bố mày",
  "cha mày",
  "wtf",
  "fuck",
  "shit",
  "bitch",
  "dick",
  "pussy",
  "ass",
  "dmm",
  "vcl",
  "vkl",
  "vl",
  "cc",
  "clgt",
  "dcm",
  "đcm",
  "dm",
  "cmm",
  "cmnr",
  "đkm",
  "dkm",
  // Harassment
  "giết",
  "hiếp",
  "cưỡng",
  // Scam
  "chuyển khoản",
  "transfer money",
  "send money",
  "số tài khoản",
  "bank account",
];

// Normalize Vietnamese text for matching (remove diacritics for alternate spellings)
function normalizeVietnamese(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/**
 * Check if text contains any banned word.
 * Returns the first matched banned word, or null if clean.
 */
export function containsBannedWord(text: string): string | null {
  const normalizedText = normalizeVietnamese(text);

  for (const word of BANNED_WORDS) {
    const normalizedWord = normalizeVietnamese(word);
    // Match as whole word or substring
    if (normalizedText.includes(normalizedWord)) {
      return word;
    }
  }
  return null;
}

/**
 * Replace banned words in text with asterisks.
 */
export function filterBannedWords(text: string): string {
  let result = text;
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(escapeRegex(word), "gi");
    result = result.replace(regex, "*".repeat(word.length));
  }
  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
