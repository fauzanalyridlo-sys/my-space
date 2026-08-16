import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export type ExtractedMemory = {
  key: string;
  value: string;
};

const ALLOWED_KEYS = new Set([
  "name",
  "preference",
  "occupation",
  "goal",
]);

export async function extractAIMemory(
  message: string,
): Promise<ExtractedMemory | null> {
  if (!message.trim()) {
    return null;
  }

  const uncertaintyPatterns = [
  /\bkayaknya\b/i,
  /\bsepertinya\b/i,
  /\bmungkin\b/i,
  /\brasanya\b/i,
  /\bkurasa\b/i,
  /\bbarangkali\b/i,
  /\baku rasa\b/i,
];

if (uncertaintyPatterns.some((pattern) => pattern.test(message))) {
  return null;
}

  const response = await openai.chat.completions.create({
    model: "openrouter/free",
    messages: [
      {
        role: "system",
        content: `
Kamu adalah memory extractor untuk aplikasi My Space.

Tugasmu adalah mencari SATU fakta pribadi yang BENAR-BENAR dinyatakan
secara eksplisit dan yakin oleh user.

Hanya simpan fakta yang:
1. Berasal langsung dari pernyataan user.
2. Tidak berupa dugaan.
3. Tidak berupa kemungkinan.
4. Tidak berupa pertanyaan.
5. Tidak membutuhkan interpretasi.
6. Menggambarkan informasi yang relatif stabil tentang user.

Jenis memory yang diperbolehkan:
- name
- preference
- occupation
- goal

ATURAN SANGAT PENTING:

Jika user menggunakan kata atau pola yang menunjukkan ketidakpastian,
JANGAN menyimpan memory.

Contoh ketidakpastian:
- kayaknya
- sepertinya
- mungkin
- mungkin saja
- rasanya
- seolah-olah
- kurasa
- menurutku
- aku rasa
- kemungkinan
- barangkali

Jika user bertanya atau meminta pendapat tentang dirinya,
JANGAN menyimpan memory.

Jika pernyataan hanya menggambarkan kondisi sementara seperti:
- capek
- sedih
- senang hari ini
- produktif hari ini
- lelah
- stres
maka JANGAN menyimpan memory.

Contoh:

User:
Namaku Rido.

Jawaban:
name=Rido

User:
Aku suka coding dengan Next.js.

Jawaban:
preference=coding dengan Next.js

User:
Aku memang suka coding.

Jawaban:
preference=coding

User:
Aku lebih suka TypeScript daripada JavaScript.

Jawaban:
preference=TypeScript daripada JavaScript

User:
Aku bekerja sebagai software engineer.

Jawaban:
occupation=software engineer

User:
Aku ingin belajar bahasa Jepang tahun ini.

Jawaban:
goal=belajar bahasa Jepang tahun ini

User:
Kayaknya aku suka coding.

Jawaban:
NONE

User:
Sepertinya aku suka coding.

Jawaban:
NONE

User:
Mungkin aku suka coding.

Jawaban:
NONE

User:
Aku rasa aku suka coding.

Jawaban:
NONE

User:
Menurutmu aku orang yang suka coding?

Jawaban:
NONE

User:
Aku capek hari ini.

Jawaban:
NONE

User:
Hari ini aku sangat produktif.

Jawaban:
NONE

User:
Menurutmu pekerjaan yang cocok untukku apa?

Jawaban:
NONE

Jangan menyimpulkan preference, occupation, goal, atau name dari konteks lain.

Jika user tidak menyatakan memory secara eksplisit dan yakin, jawab:
NONE

Jika ada memory yang layak disimpan, jawab HANYA satu baris:
key=value

Key HARUS salah satu dari:
name
preference
occupation
goal

Jangan mengembalikan lebih dari satu memory.
Jangan menggunakan Markdown.
Jangan memberikan penjelasan tambahan.

User:
Aku suka coding dengan TypeScript.

Jawaban:
preference=coding dengan TypeScript

User:
Aku suka menggunakan Next.js.

Jawaban:
preference=menggunakan Next.js

User:
Aku suka bahasa pemrograman TypeScript.

Jawaban:
preference=bahasa pemrograman TypeScript

Kalimat positif seperti:
- aku suka ...
- aku memang suka ...
- aku lebih suka ...
- aku senang menggunakan ...
- aku menyukai ...

dianggap sebagai preference yang eksplisit,
selama tidak mengandung kata ketidakpastian seperti
"mungkin", "kayaknya", "sepertinya", "kurasa", atau "aku rasa".
`,
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  const content =
    response.choices[0]?.message?.content?.trim() ?? "";

  if (!content || content === "NONE") {
    return null;
  }

  const firstLine = content
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);

  if (!firstLine) {
    return null;
  }

  const separatorIndex = firstLine.indexOf("=");

  if (separatorIndex <= 0) {
    return null;
  }

  const key = firstLine
    .slice(0, separatorIndex)
    .trim()
    .toLowerCase();

  const value = firstLine
    .slice(separatorIndex + 1)
    .trim();

  if (!ALLOWED_KEYS.has(key) || !value) {
    return null;
  }

  return {
    key,
    value,
  };
}