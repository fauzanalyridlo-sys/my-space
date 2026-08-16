import OpenAI from "openai";

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const cerebras = new OpenAI({
  apiKey: process.env.CEREBRAS_API_KEY,
  baseURL: "https://api.cerebras.ai/v1",
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
- Jawab pertanyaan umum user secara langsung.
- Tidak semua pertanyaan harus dikaitkan dengan data My Space.
- Gunakan data My Space hanya jika relevan dengan pertanyaan user.
- Bedakan fakta yang benar-benar ada di data dengan interpretasi atau kemungkinan.
- Jika menyebut pola atau kecenderungan, gunakan bahasa hati-hati seperti "terlihat", "mungkin", atau "berdasarkan data yang tersedia".
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

function shouldFallbackToCerebras(error: unknown) {
  if (error instanceof OpenAI.APIError) {
    return (
      error.status === 408 ||
      error.status === 409 ||
      error.status === 429 ||
      error.status === 500 ||
      error.status === 502 ||
      error.status === 503 ||
      error.status === 504
    );
  }

  // Network error atau error lain yang tidak mempunyai status HTTP.
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

async function askCerebras(
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
) {
  console.log("AI: mencoba Cerebras...");

  const response = await cerebras.chat.completions.create({
    model: "llama-3.1-8b",
    messages,
  });

  const reply = response.choices[0]?.message?.content;

  if (!reply) {
    throw new Error("Cerebras mengembalikan jawaban kosong.");
  }

  console.log("AI: Cerebras berhasil");

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

    if (!shouldFallbackToCerebras(openrouterError)) {
      throw openrouterError;
    }

    console.log(
      "AI: OpenRouter gagal, pindah ke Cerebras...",
    );
  }

  // ==========================================
  // 2. CEREBRAS — FALLBACK
  // ==========================================

  try {
    return await askCerebras(requestMessages);
  } catch (cerebrasError) {
    console.error("CEREBRAS ERROR:", cerebrasError);

    throw new Error(
      "Semua provider AI sedang tidak tersedia. OpenRouter dan Cerebras gagal memberikan jawaban.",
    );
  }
}