"use client";

type VolumeControlProps = {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (
    volume: number,
  ) => void;
  onToggleMute: () => void;
};

export default function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
}: VolumeControlProps) {
  return (
    <div className="ml-auto flex shrink-0 items-center gap-2">

      <button
        type="button"
        onClick={onToggleMute}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
        title={
          isMuted
            ? "Unmute"
            : "Mute"
        }
      >
        {isMuted || volume === 0
          ? "🔇"
          : volume < 0.5
            ? "🔉"
            : "🔊"}
      </button>

      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={
          isMuted
            ? 0
            : volume
        }
        onChange={(event) => {
          onVolumeChange(
            Number(
              event.target.value,
            ),
          );
        }}
        className="h-1 w-24 cursor-pointer accent-white"
        aria-label="Volume"
      />

    </div>
  );
}