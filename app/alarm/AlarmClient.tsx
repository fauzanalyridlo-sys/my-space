"use client";

import { useState } from "react";
import {
  createAlarm,
  toggleAlarm,
  deleteAlarm,
} from "@/app/actions";

type Alarm = {
  id: number;
  time: string;
  label: string;
  enabled: boolean;
};

type AlarmClientProps = {
  alarms: Alarm[];
};

export default function AlarmClient({
  alarms: initialAlarms,
}: AlarmClientProps) {
  const [alarms, setAlarms] = useState(initialAlarms);
  const [time, setTime] = useState("07:00");
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateAlarm(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      formData.set("time", time);
      formData.set("label", label);

      const result = await createAlarm(formData);

setAlarms((current) =>
  [...current, result.alarm].sort((a, b) =>
    a.time.localeCompare(b.time),
  ),
);

      setLabel("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gagal membuat alarm.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(alarm: Alarm) {
    try {
      const result = await toggleAlarm(alarm.id);

      setAlarms((current) =>
        current.map((item) =>
          item.id === alarm.id
            ? {
                ...item,
                enabled: result.enabled,
              }
            : item,
        ),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengubah alarm.",
      );
    }
  }

  async function handleDelete(alarm: Alarm) {
    const confirmed = window.confirm(
      `Hapus alarm "${alarm.label}"?`,
    );

    if (!confirmed) return;

    try {
      await deleteAlarm(alarm.id);

      setAlarms((current) =>
        current.filter((item) => item.id !== alarm.id),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gagal menghapus alarm.",
      );
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">
          My Space Alarm
        </h1>

        <p className="mt-2 text-zinc-500">
          Atur alarm untuk aktivitasmu.
        </p>

        <section className="mt-8 rounded-xl border border-zinc-800 p-5">
          <h2 className="text-xl font-semibold">
            Tambah Alarm
          </h2>

          <form
            onSubmit={handleCreateAlarm}
            className="mt-5 space-y-4"
          >
            <div>
              <label className="text-sm text-zinc-400">
                Waktu
              </label>

              <input
                type="time"
                value={time}
                onChange={(event) =>
                  setTime(event.target.value)
                }
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-transparent px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400">
                Nama Alarm
              </label>

              <input
                type="text"
                value={label}
                onChange={(event) =>
                  setLabel(event.target.value)
                }
                placeholder="Contoh: Bangun tidur"
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-transparent px-3 py-2"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
            >
              {loading ? "Menyimpan..." : "⏰ Tambah Alarm"}
            </button>
          </form>
        </section>

        {error && (
          <p className="mt-4 rounded-lg border border-red-900 bg-red-950/30 p-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <section className="mt-8">
          <h2 className="text-xl font-semibold">
            Alarm Kamu
          </h2>

          {alarms.length === 0 ? (
            <p className="mt-4 text-sm text-zinc-500">
              Belum ada alarm.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {alarms.map((alarm) => (
                <div
                  key={alarm.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 p-4"
                >
                  <div>
                    <p className="text-2xl font-semibold">
                      {alarm.time}
                    </p>

                    <p className="mt-1 text-sm text-zinc-500">
                      {alarm.label}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleToggle(alarm)
                      }
                      className={`rounded-lg px-3 py-2 text-sm ${
                        alarm.enabled
                          ? "bg-white text-black"
                          : "border border-zinc-700 text-zinc-500"
                      }`}
                    >
                      {alarm.enabled ? "ON" : "OFF"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(alarm)
                      }
                      className="rounded-lg border border-red-900 px-3 py-2 text-sm text-red-400"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}