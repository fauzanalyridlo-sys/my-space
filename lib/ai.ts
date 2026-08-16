import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
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

  const systemPrompt = `
Kamu adalah My Space AI, asisten pribadi di aplikasi My Space.

Tugasmu:
- Membantu user memahami pola dari data yang tersedia di My Space.
- Jawab dengan ramah, natural, jelas, dan tidak menghakimi.
- Gunakan data My Space hanya jika relevan dengan pertanyaan user.
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

  const response = await openai.chat.completions.create({
    model: "openrouter/free",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      ...messages,
    ],
  });

  return response.choices[0]?.message?.content ?? "";
}
