import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { partnerProfile, chatHistory, userMessage } = await req.json();

    if (!partnerProfile || !userMessage) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `Bạn đang nhập vai là "${partnerProfile.name}", ${partnerProfile.age || 21} tuổi, ${partnerProfile.gender === "female" ? "nữ" : "nam"}.
Nghề nghiệp: ${partnerProfile.occupation || "Sinh viên"}
Trường: ${partnerProfile.university || "không rõ"}
Thành phố: ${partnerProfile.city || "Việt Nam"}
Sở thích: ${partnerProfile.interests?.join(", ") || "chưa rõ"}
Bio: ${partnerProfile.bio || ""}

QUY TẮC:
- Trả lời bằng tiếng Việt tự nhiên, thân thiện, dùng emoji vừa phải.
- Giữ câu trả lời ngắn gọn (1-3 câu), như đang chat trên app hẹn hò.
- Thể hiện tính cách phù hợp với bio và sở thích.
- KHÔNG bao giờ nói mình là AI. Hãy hoàn toàn nhập vai.
- Có thể hỏi lại để tạo cuộc trò chuyện thú vị.
- Đôi khi dùng từ viết tắt, slang tiếng Việt.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(chatHistory || []).slice(-10),
      { role: "user", content: userMessage },
    ];

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        max_tokens: 200,
        temperature: 0.85,
      }),
    });

    if (!res.ok) {
      console.error("Groq API error:", res.status, await res.text());
      return new Response(
        JSON.stringify({ reply: "Hmm, mình bị lag xíu 😅 Nhắn lại được không?" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "Haha, mình đang suy nghĩ 🤔";

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("chat-ai error:", err);
    return new Response(
      JSON.stringify({ reply: "Mạng mình hơi yếu, chờ xíu nha 📶" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
