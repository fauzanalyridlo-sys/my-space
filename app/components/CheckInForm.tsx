"use client";

import { useState } from "react";
import { saveCheckIn } from "@/app/actions";

type CheckInData = {
  mood: number;
  energy: number;
  sleepHours: number | null;
  activities: string[];
};

type CheckInFormProps = {
  initialData?: CheckInData;
};

const activities = [
  "Work",
  "Study",
  "Gym",
  "Run",
  "Rest",
];

export default function CheckInForm({
  initialData,
}: CheckInFormProps) {
  const [mood, setMood] = useState(
    initialData?.mood ?? 3,
  );

  const [energy, setEnergy] = useState(
    initialData?.energy ?? 3,
  );

  const [sleepHours, setSleepHours] = useState(
    initialData?.sleepHours?.toString() ?? "",
  );

  const [selectedActivities, setSelectedActivities] =
    useState<string[]>(
      initialData?.activities ?? [],
    );

  const [isSaving, setIsSaving] = useState(false);
const [saved, setSaved] = useState(!!initialData);
const [error, setError] = useState("");

  function toggleActivity(activity: string) {
    if (isSaving) return;

    setSelectedActivities((current) =>
      current.includes(activity)
        ? current.filter((item) => item !== activity)
        : [...current, activity],
    );

    setSaved(false);
  }

  async function handleSave() {
    if (isSaving) return;

    setIsSaving(true);
    setSaved(false);
    setError("");

    try {
      await saveCheckIn({
        mood,
        energy,
        sleepHours: sleepHours
          ? Number(sleepHours)
          : null,
        activities: selectedActivities,
      });

      setSaved(true);
    } catch (error) {
      console.error(error);
      setError("Gagal menyimpan check-in. Coba lagi.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-8 space-y-8">
      {/* Mood */}
      <section>
        <h2 className="text-sm font-medium text-zinc-400">
          How are you feeling today?
        </h2>

        <div className="mt-4 grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              disabled={isSaving}
              onClick={() => {
                setMood(value);
                setSaved(false);
              }}
              className={`rounded-xl border px-3 py-4 text-2xl transition ${
                mood === value
                  ? "border-zinc-400 bg-zinc-800"
                  : "border-zinc-800 bg-zinc-900 hover:border-zinc-600"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {["😞", "😕", "😐", "🙂", "😄"][value - 1]}
            </button>
          ))}
        </div>
      </section>

      {/* Energy */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-400">
            Energy
          </h2>

          <span className="text-sm text-zinc-500">
            {energy}/5
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="5"
          value={energy}
          disabled={isSaving}
          onChange={(event) => {
            setEnergy(Number(event.target.value));
            setSaved(false);
          }}
          className="mt-4 w-full disabled:opacity-50"
        />
      </section>

      {/* Activities */}
      <section>
        <h2 className="text-sm font-medium text-zinc-400">
          Today I...
        </h2>

        <div className="mt-4 flex flex-wrap gap-2">
          {activities.map((activity) => {
            const selected =
              selectedActivities.includes(activity);

            return (
              <button
                key={activity}
                type="button"
                disabled={isSaving}
                onClick={() => toggleActivity(activity)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  selected
                    ? "border-zinc-400 bg-zinc-800 text-white"
                    : "border-zinc-800 text-zinc-400 hover:border-zinc-600"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {activity}
              </button>
            );
          })}
        </div>
      </section>

      {/* Sleep */}
      <section>
        <label
          htmlFor="sleep"
          className="text-sm font-medium text-zinc-400"
        >
          Sleep last night
        </label>

        <div className="mt-3 flex items-center gap-3">
          <input
            id="sleep"
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={sleepHours}
            disabled={isSaving}
            onChange={(event) => {
              setSleepHours(event.target.value);
              setSaved(false);
            }}
            placeholder="7.5"
            className="w-32 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white outline-none focus:border-zinc-400 disabled:opacity-50"
          />

          <span className="text-sm text-zinc-500">
            hours
          </span>
        </div>
      </section>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Save */}
      <button
        type="button"
        disabled={isSaving}
        onClick={handleSave}
        className="w-full rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving
          ? "Saving..."
          : saved
            ? "Saved ✓"
            : "Save today's check-in"}
      </button>
    </div>
  );
}