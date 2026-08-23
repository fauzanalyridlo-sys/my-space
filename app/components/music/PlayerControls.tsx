"use client";

type PlayerControlsProps = {
  isPlaying: boolean;
  loading: boolean;

  hasPrevious: boolean;
  hasNext: boolean;

  isActive: boolean;

  onPrevious: () => void;
  onTogglePlay: () => void;
  onNext: () => void;

  isShuffle: boolean;
  repeatMode: "off" | "all" | "one";
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;

  
};

export default function PlayerControls({
  isPlaying,
  loading,
  hasPrevious,
  hasNext,
  isActive,
  onPrevious,
  onTogglePlay,
  onNext,
 isShuffle,
  repeatMode,
  onToggleShuffle,
  onToggleRepeat,
}: PlayerControlsProps) {
  return (
    <div className="flex items-center gap-3">

      {/* PREVIOUS */}

      <button
        type="button"
        onClick={onPrevious}
        disabled={
          !isActive ||
          !hasPrevious
        }
        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
      >
        ⏮ Previous
      </button>

      {/* PLAY / PAUSE */}

      <button
        type="button"
        onClick={onTogglePlay}
        disabled={loading}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl text-black transition hover:scale-105 hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        title={
          isPlaying
            ? "Pause"
            : "Play"
        }
      >
        {loading
          ? "..."
          : isPlaying
            ? "⏸"
            : "▶"}
      </button>

      {/* NEXT */}

      <button
        type="button"
        onClick={onNext}
        disabled={
          !isActive ||
          !hasNext
        }
        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-30"
      >
        Next ⏭
      </button>
<button
  type="button"
  onClick={onToggleShuffle}
  aria-label="Toggle shuffle"
  title={isShuffle ? "Shuffle aktif" : "Shuffle mati"}
  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border text-lg transition ${
    isShuffle
      ? "border-white bg-white text-black"
      : "border-zinc-700 text-zinc-400 hover:bg-zinc-900"
  }`}
>
  🔀
</button>

<button
  type="button"
  onClick={onToggleRepeat}
  aria-label="Toggle repeat"
  title={
    repeatMode === "off"
      ? "Repeat mati"
      : repeatMode === "all"
        ? "Repeat semua lagu"
        : "Repeat satu lagu"
  }
  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border text-lg transition ${
    repeatMode !== "off"
      ? "border-white bg-white text-black"
      : "border-zinc-700 text-zinc-400 hover:bg-zinc-900"
  }`}
>
  {repeatMode === "one" ? "🔂" : "🔁"}
</button>
    </div>
  );
}