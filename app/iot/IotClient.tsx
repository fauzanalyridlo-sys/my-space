"use client";

import { useState } from "react";
import { createIotDevice } from "@/app/actions";

type Device = {
  id: number;
  name: string;
  deviceToken: string;
  enabled: boolean;
};

type IotClientProps = {
  devices: Device[];
};

export default function IotClient({
  devices: initialDevices,
}: IotClientProps) {
  const [devices, setDevices] =
    useState<Device[]>(initialDevices);

  const [name, setName] = useState("My Space ESP32");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateDevice(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await createIotDevice(name);

      setDevices((current) => [
        result.device,
        ...current,
      ]);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gagal membuat device.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyToken(token: string) {
    try {
      await navigator.clipboard.writeText(token);
      alert("Device token berhasil disalin.");
    } catch {
      setError("Gagal menyalin device token.");
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">
          My Space IoT
        </h1>

        <p className="mt-2 text-zinc-500">
          Hubungkan ESP32 dengan My Space.
        </p>

        <section className="mt-8 rounded-xl border border-zinc-800 p-5">
          <h2 className="text-xl font-semibold">
            Tambah Device
          </h2>

          <form
            onSubmit={handleCreateDevice}
            className="mt-5 space-y-4"
          >
            <div>
              <label className="text-sm text-zinc-400">
                Nama Device
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Contoh: My Space ESP32"
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-transparent px-3 py-2"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
            >
              {loading
                ? "Membuat..."
                : "➕ Tambah ESP32"}
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
            Device Kamu
          </h2>

          <div className="mt-4 space-y-4">
            {devices.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Belum ada ESP32 yang terdaftar.
              </p>
            ) : (
              devices.map((device) => (
                <div
                  key={device.id}
                  className="rounded-xl border border-zinc-800 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">
                        {device.name}
                      </h3>

                      <p className="mt-1 text-sm text-zinc-500">
                        Status:{" "}
                        {device.enabled
                          ? "Enabled"
                          : "Disabled"}
                      </p>
                    </div>

                    <span
                      className={
                        device.enabled
                          ? "text-sm text-green-400"
                          : "text-sm text-zinc-500"
                      }
                    >
                      {device.enabled
                        ? "● Aktif"
                        : "● Nonaktif"}
                    </span>
                  </div>

                  <div className="mt-5">
                    <p className="text-sm text-zinc-400">
                      Device Token
                    </p>

                    <div className="mt-2 flex gap-2">
                      <code className="flex-1 overflow-x-auto rounded-lg bg-zinc-950 p-3 text-xs text-zinc-300">
                        {device.deviceToken}
                      </code>

                      <button
                        type="button"
                        onClick={() =>
                          copyToken(device.deviceToken)
                        }
                        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
