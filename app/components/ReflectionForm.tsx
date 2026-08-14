"use client";

import { useState } from "react";
import { saveReflection } from "@/app/actions";

type ReflectionData = {
  howWasYourDay: string;
  whatDidYouLearn: string;
  tomorrow: string;
  letGo: string;
};

type ReflectionFormProps = {
  initialData?: ReflectionData;
};

const MAX_LENGTH = 5000;

export default function ReflectionForm({
  initialData,
}: ReflectionFormProps) {
  const [howWasYourDay, setHowWasYourDay] = useState(
    initialData?.howWasYourDay ?? "",
  );

  const [whatDidYouLearn, setWhatDidYouLearn] = useState(
    initialData?.whatDidYouLearn ?? "",
  );

  const [tomorrow, setTomorrow] = useState(
    initialData?.tomorrow ?? "",
  );

  const [letGo, setLetGo] = useState(
    initialData?.letGo ?? "",
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(!!initialData);
  const [error, setError] = useState("");

  function handleChange(
    setter: (value: string) => void,
    value: string,
  ) {
    setter(value);
    setSaved(false);
    setError("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSaving) return;

    const fields = [
      howWasYourDay,
      whatDidYouLearn,
      tomorrow,
      letGo,
    ];

    const hasTooLongField = fields.some(
      (field) => field.length > MAX_LENGTH,
    );

    if (hasTooLongField) {
      setError(
        "Salah satu field terlalu panjang. Maksimal 5000 karakter.",
      );
      return;
    }

    setIsSaving(true);
    setSaved(false);
    setError("");

    try {
      await saveReflection({
        howWasYourDay,
        whatDidYouLearn,
        tomorrow,
        letGo,
      });

      setSaved(true);
    } catch (error) {
      console.error(error);
      setError(
        "Gagal menyimpan reflection. Coba lagi.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-6"
    >
      {/* How was your day */}
      <div>
        <label
          htmlFor="how-was-your-day"
          className="mb-2 block font-medium"
        >
          How was your day?
        </label>

        <textarea
          id="how-was-your-day"
          value={howWasYourDay}
          onChange={(event) =>
            handleChange(
              setHowWasYourDay,
              event.target.value,
            )
          }
          disabled={isSaving}
          maxLength={MAX_LENGTH}
          placeholder="Ceritakan bagaimana harimu..."
          className="min-h-32 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
        />

        <p className="mt-1 text-right text-xs text-zinc-500">
          {howWasYourDay.length}/{MAX_LENGTH}
        </p>
      </div>

      {/* What did you learn */}
      <div>
        <label
          htmlFor="what-did-you-learn"
          className="mb-2 block font-medium"
        >
          What did you learn?
        </label>

        <textarea
          id="what-did-you-learn"
          value={whatDidYouLearn}
          onChange={(event) =>
            handleChange(
              setWhatDidYouLearn,
              event.target.value,
            )
          }
          disabled={isSaving}
          maxLength={MAX_LENGTH}
          placeholder="Apa yang kamu pelajari hari ini?"
          className="min-h-32 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
        />

        <p className="mt-1 text-right text-xs text-zinc-500">
          {whatDidYouLearn.length}/{MAX_LENGTH}
        </p>
      </div>

      {/* Tomorrow */}
      <div>
        <label
          htmlFor="tomorrow"
          className="mb-2 block font-medium"
        >
          What should you do tomorrow?
        </label>

        <textarea
          id="tomorrow"
          value={tomorrow}
          onChange={(event) =>
            handleChange(
              setTomorrow,
              event.target.value,
            )
          }
          disabled={isSaving}
          maxLength={MAX_LENGTH}
          placeholder="Apa yang perlu dilakukan besok?"
          className="min-h-32 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
        />

        <p className="mt-1 text-right text-xs text-zinc-500">
          {tomorrow.length}/{MAX_LENGTH}
        </p>
      </div>

      {/* Let go */}
      <div>
        <label
          htmlFor="let-go"
          className="mb-2 block font-medium"
        >
          Something to let go
        </label>

        <textarea
          id="let-go"
          value={letGo}
          onChange={(event) =>
            handleChange(
              setLetGo,
              event.target.value,
            )
          }
          disabled={isSaving}
          maxLength={MAX_LENGTH}
          placeholder="Apa yang ingin kamu lepaskan hari ini?"
          className="min-h-32 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 disabled:cursor-not-allowed disabled:opacity-50"
        />

        <p className="mt-1 text-right text-xs text-zinc-500">
          {letGo.length}/{MAX_LENGTH}
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Save */}
      <button
        type="submit"
        disabled={isSaving}
        className="w-full rounded-lg bg-black px-4 py-3 text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving
          ? "Saving..."
          : saved
            ? "Saved ✓"
            : "Save Reflection"}
      </button>
    </form>
  );
}