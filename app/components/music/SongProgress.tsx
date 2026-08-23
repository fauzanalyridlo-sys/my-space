"use client";

type SongProgressProps = {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
};

function formatTime(
  seconds: number,
) {
  if (!Number.isFinite(seconds)) {
    return "00:00";
  }

  const minutes =
    Math.floor(seconds / 60);

  const secs =
    Math.floor(seconds % 60);

  return `${String(minutes).padStart(
    2,
    "0",
  )}:${String(secs).padStart(
    2,
    "0",
  )}`;
}

export default function SongProgress({
  currentTime,
  duration,
  onSeek,
}: SongProgressProps) {
  return (
    <div className="mt-5">

      <input
        type="range"
        min="0"
        max={duration}
        step="0.1"
        value={
          Math.min(
            currentTime,
            duration,
          )
        }
        onChange={(event) => {
          onSeek(
            Number(
              event.target.value,
            ),
          );
        }}
        className="w-full"
        aria-label="Song progress"
      />

      <div className="mt-1 flex justify-between text-xs text-zinc-500">

        <span>
          {formatTime(currentTime)}
        </span>

        <span>
          {formatTime(duration)}
        </span>

      </div>

    </div>
  );
}