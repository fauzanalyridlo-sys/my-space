export type AIMemoryCommand =
  | {
      type: "forget";
      key: "name" | "preference" | "occupation" | "goal";
    }
  | {
      type: "none";
    };

export function parseAIMemoryCommand(
  message: string,
): AIMemoryCommand {
  const text = message.trim().toLowerCase();

  if (!text) {
    return { type: "none" };
  }

  if (
    text.includes("lupakan") ||
    text.includes("hapus") ||
    text.includes("jangan ingat")
  ) {
    if (
      text.includes("nama") ||
      text.includes("namaku")
    ) {
      return {
        type: "forget",
        key: "name",
      };
    }

    if (
      text.includes("preferensi") ||
      text.includes("kesukaan")
    ) {
      return {
        type: "forget",
        key: "preference",
      };
    }

    if (
      text.includes("pekerjaan") ||
      text.includes("profesi")
    ) {
      return {
        type: "forget",
        key: "occupation",
      };
    }

    if (
      text.includes("tujuan") ||
      text.includes("goal")
    ) {
      return {
        type: "forget",
        key: "goal",
      };
    }
  }

  return {
    type: "none",
  };
}
