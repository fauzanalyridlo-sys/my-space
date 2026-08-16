import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export type AIMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AIContext = {
  checkIns: Array<{
    date: Date;
    mood: number;
    energy: number;
    sleepHours: number | null;
    activities: string[];
  }>;
  reflections: Array<{
    date: Date;
    howWasYourDay: string;
    whatDidYouLearn: string;
    tomorrow: string;
    letGo: string;
  }>;
  notes: Array<{
    content: string;
    createdAt: Date;
  }>;
};

function buildSystemPrompt(
  context?: AIContext,
  memories?: Array<{
    key: string;
    value: string;
  }>,
) {
  return `
Kamu adalah My Space AI, asisten pribadi di aplikasi My Space.

Tugasmu:
- Membantu user memahami pola dari data yang tersedia di My Space.
- Jawab dengan ramah, natural, jelas, dan tidak menghakimi.
- Gunakan data My Space hanya jika relevan dengan pertanyaan user.
- Jawab pertanyaan umum user secara langsung.
- Tidak semua pertanyaan harus dikaitkan dengan data My Space.
- Bedakan fakta yang benar-benar ada di data dengan interpretasi atau kemungkinan.
- Jika menyebut pola atau kecenderungan, gunakan bahasa yang hati-hati seperti "terlihat", "mungkin", atau "berdasarkan data yang tersedia".
- Jangan menganggap satu atau beberapa data sebagai bukti pasti tentang kebiasaan, kondisi, atau kepribadian user.
- Jangan membuat diagnosis medis atau psikologis.
- Jangan mengarang data, angka, tanggal, aktivitas, kebiasaan, atau kejadian yang tidak tersedia.
- Jika data tidak cukup untuk menjawab, katakan dengan jujur bahwa data belum cukup.
- Jangan mengungkap data pribadi user kepada orang lain.
- Jangan menyebut bahwa kamu memiliki akses ke database atau detail teknis aplikasi.

Data My Space user:

${JSON.stringify(context ?? {}, null, 2)}

Memory pribadi user:

${JSON.stringify(memories ?? [], null, 2)}
`;
}

function shouldFallbackToGemini(error: unknown) {
  if (error instanceof OpenAI.APIError) {
    return (
      error.status === 429 ||
      error.status === 500 ||
      error.status === 502 ||
      error.status === 503 ||
      error.status === 504
    );
  }

  // Network error / error yang tidak punya status HTTP
  return true;
}

async function askOpenRouter(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
) {
  console.log("AI: mencoba OpenRouter...");

  const response = await openrouter.chat.completions.create({
    model: "openrouter/free",
    messages,
  });

  const reply = response.choices[0]?.message?.content;

  if (!reply) {
    throw new Error("OpenRouter mengembalikan jawaban kosong.");
  }

  console.log("AI: OpenRouter berhasil");

  return reply;
}

async function askGemini(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
) {
  console.log("AI: mencoba Gemini...");

  const systemMessage = messages.find(
    (message) => message.role === "system",
  );

  const conversationMessages = messages.filter(
    (message) => message.role !== "system",
  );

  const prompt = conversationMessages
    .map((message) => {
      const role =
        message.role === "assistant" ? "Assistant" : "User";

      const content =
        typeof message.content === "string"
          ? message.content
          : JSON.stringify(message.content);

      return `${role}: ${content}`;
    })
    .join("\n\n");

  const response = await gemini.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction:
        typeof systemMessage?.content === "string"
          ? systemMessage.content
          : undefined,
    },
  });

  const reply = response.text;

  if (!reply) {
    throw new Error("Gemini mengembalikan jawaban kosong.");
  }

  console.log("AI: Gemini berhasil");

  return reply;
}

export async function chatWithAI(
  messages: AIMessage[],
  context?: AIContext,
  memories?: Array<{
    key: string;
    value: string;
  }>,
) {
  if (!messages.length) {
    throw new Error("Messages cannot be empty");
  }

  const systemPrompt = buildSystemPrompt(context, memories);

  const requestMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: systemPrompt,
    },
    ...messages,
  ];

  // ==========================================
  // 1. OPENROUTER — PROVIDER UTAMA
  // ==========================================

  try {
    return await askOpenRouter(requestMessages);
  } catch (openrouterError) {
    console.error("OPENROUTER ERROR:", openrouterError);

    if (!shouldFallbackToGemini(openrouterError)) {
      throw openrouterError;
    }

    console.log("AI: OpenRouter gagal, pindah ke Gemini...");
  }

  // ==========================================
  // 2. GEMINI — FALLBACK
  // ==========================================

  try {
    return await askGemini(requestMessages);
  } catch (geminiError) {
    console.error("GEMINI ERROR:", geminiError);

    throw new Error(
      "Semua provider AI sedang tidak tersedia. OpenRouter dan Gemini gagal memberikan jawaban.",
    );
  }
}