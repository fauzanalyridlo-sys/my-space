"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  deleteSong,
  getSongUrls,
  updateSong,
} from "@/app/actions";

type MusicPlayerProps = {
  songId: string;
  title: string;
  artist: string | null;
  duration: number;
  isActive: boolean;
  shouldPlay: boolean;
  onPlay: () => void;
  onEnded: () => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
};

type LyricLine = {
  time: number;
  text: string;
};

// ======================================================
// PARSE LRC
// ======================================================

function parseLrc(
  lrc: string,
): LyricLine[] {
  const lines: LyricLine[] = [];

  for (
    const line of lrc.split(/\r?\n/)
  ) {
    const match = line.match(
      /^\[(\d+):(\d+(?:\.\d+)?)\](.*)$/,
    );

    if (!match) {
      continue;
    }

    const minutes =
      Number(match[1]);

    const seconds =
      Number(match[2]);

    const text =
      match[3].trim();

    lines.push({
      time:
        minutes * 60 +
        seconds,
      text,
    });
  }

  return lines.sort(
    (a, b) =>
      a.time - b.time,
  );
}

// ======================================================
// FORMAT TIME
// ======================================================

function formatTime(
  seconds: number,
) {
  if (
    !Number.isFinite(seconds)
  ) {
    return "00:00";
  }

  const minutes =
    Math.floor(
      seconds / 60,
    );

  const secs =
    Math.floor(
      seconds % 60,
    );

  return `${String(
    minutes,
  ).padStart(
    2,
    "0",
  )}:${String(
    secs,
  ).padStart(
    2,
    "0",
  )}`;
}

// ======================================================
// GET ACTIVE LYRIC
// ======================================================

function getActiveLyric(
  lyrics: LyricLine[],
  currentTime: number,
): string {
  let activeLyric = "";

  for (
    const lyric of lyrics
  ) {
    if (
      lyric.time <= currentTime
    ) {
      activeLyric =
        lyric.text;
    } else {
      break;
    }
  }

  return activeLyric;
}

// ======================================================
// MUSIC PLAYER
// ======================================================

export default function MusicPlayer({
  songId,
  title,
  artist,
  duration,
  isActive,
  shouldPlay,
  onPlay,
  onEnded,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: MusicPlayerProps) {

  // ======================================================
  // REFS
  // ======================================================

  const audioRef =
    useRef<
      HTMLAudioElement | null
    >(null);

  const activeLyricRef =
    useRef<
      HTMLParagraphElement | null
    >(null);

  const lyricsContainerRef =
    useRef<
      HTMLDivElement | null
    >(null);

  // ======================================================
  // STATE
  // ======================================================

  const [audioUrl, setAudioUrl] =
    useState("");

  const [lyrics, setLyrics] =
    useState<
      LyricLine[]
    >([]);

  const [currentTime, setCurrentTime] =
    useState(0);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [isEditing, setIsEditing] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  const [editError, setEditError] =
    useState("");

  // ======================================================
  // SYNC MUSIC STATE KE API
  // ======================================================

  const syncMusicState =
    useCallback(
      async (
        playing: boolean,
        time?: number,
      ) => {
        try {
          const currentSongTime =
            time ??
            audioRef.current
              ?.currentTime ??
            0;

          const activeLyric =
            getActiveLyric(
              lyrics,
              currentSongTime,
            );

          await fetch(
            "/api/iot/music",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  songId,
                  title,
                  artist,
                  duration,

                  currentTime:
                    currentSongTime,

                  isPlaying:
                    playing,

                  activeLyric,
                }),
            },
          );
        } catch (error) {
          console.error(
            "IoT music sync error:",
            error,
          );
        }
      },
      [
        songId,
        title,
        artist,
        duration,
        lyrics,
      ],
    );

  // ======================================================
  // LOAD MP3 + LRC
  // ======================================================

  useEffect(() => {
    let cancelled = false;

    async function loadSong() {
      setLoading(true);

      setError("");

      try {
        const urls =
          await getSongUrls(
            songId,
          );

        const response =
          await fetch(
            urls.lyricsUrl,
          );

        if (
          !response.ok
        ) {
          throw new Error(
            "Gagal mengambil file LRC.",
          );
        }

        const lrcText =
          await response.text();

        if (
          cancelled
        ) {
          return;
        }

        const parsedLyrics =
          parseLrc(
            lrcText,
          );

        setAudioUrl(
          urls.audioUrl,
        );

        setLyrics(
          parsedLyrics,
        );
      } catch (error) {

        if (
          cancelled
        ) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Gagal memuat lagu.",
        );
      } finally {

        if (
          !cancelled
        ) {
          setLoading(false);
        }
      }
    }

    loadSong();

    return () => {
      cancelled = true;
    };
  }, [
    songId,
  ]);

  // ======================================================
  // STOP JIKA BUKAN LAGU AKTIF
  // ======================================================

  useEffect(() => {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    if (
      !isActive &&
      !audio.paused
    ) {
      audio.pause();

      audio.currentTime = 0;

      setCurrentTime(0);
    }
  }, [
    isActive,
  ]);

  // ======================================================
  // AUTOPLAY
  // ======================================================

  useEffect(() => {
    const audio =
      audioRef.current;

    if (
      !audio ||
      !isActive ||
      !shouldPlay ||
      !audioUrl
    ) {
      return;
    }

    audio
      .play()
      .then(
        async () => {
          setIsPlaying(
            true,
          );

          await syncMusicState(
            true,
            audio.currentTime,
          );
        },
      )
      .catch(
        (error) => {
          console.error(
            "Autoplay error:",
            error,
          );

          setError(
            "Lagu tidak bisa diputar otomatis.",
          );
        },
      );
  }, [
    isActive,
    shouldPlay,
    audioUrl,
    syncMusicState,
  ]);

  // ======================================================
  // ACTIVE LYRIC INDEX
  // ======================================================

  const activeLyricIndex =
    lyrics.reduce(
      (
        activeIndex,
        lyric,
        index,
      ) => {

        if (
          lyric.time <=
          currentTime
        ) {
          return index;
        }

        return activeIndex;
      },
      -1,
    );

  // ======================================================
  // SYNC LANGSUNG SAAT LIRIK BERUBAH
  //
  // INI BAGIAN UTAMA PERBAIKANNYA
  // ======================================================

  useEffect(() => {

    if (
      !isActive ||
      !isPlaying
    ) {
      return;
    }

    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    syncMusicState(
      true,
      audio.currentTime,
    );

  }, [
    activeLyricIndex,
    isActive,
    isPlaying,
    syncMusicState,
  ]);

  // ======================================================
  // BACKUP SYNC POSISI LAGU
  // SETIAP 1 DETIK
  // ======================================================

  useEffect(() => {

    if (
      !isActive ||
      !isPlaying
    ) {
      return;
    }

    const interval =
      setInterval(
        () => {

          const audio =
            audioRef.current;

          if (!audio) {
            return;
          }

          syncMusicState(
            true,
            audio.currentTime,
          );

        },
        1000,
      );

    return () => {
      clearInterval(
        interval,
      );
    };

  }, [
    isActive,
    isPlaying,
    syncMusicState,
  ]);

  // ======================================================
  // AUTO SCROLL LYRICS
  // ======================================================

  useEffect(() => {

    const container =
      lyricsContainerRef.current;

    const activeLyric =
      activeLyricRef.current;

    if (
      !container ||
      !activeLyric ||
      activeLyricIndex === -1
    ) {
      return;
    }

    const containerRect =
      container.getBoundingClientRect();

    const lyricRect =
      activeLyric.getBoundingClientRect();

    const isAbove =
      lyricRect.top <
      containerRect.top;

    const isBelow =
      lyricRect.bottom >
      containerRect.bottom;

    if (
      isAbove ||
      isBelow
    ) {
      activeLyric.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }

  }, [
    activeLyricIndex,
  ]);

  // ======================================================
  // EDIT SONG
  // ======================================================

  async function handleEdit(
    formData: FormData,
  ) {

    setIsSaving(
      true,
    );

    setEditError(
      "",
    );

    try {

      await updateSong(
        songId,
        formData,
      );

      setIsEditing(
        false,
      );

      const urls =
        await getSongUrls(
          songId,
        );

      const response =
        await fetch(
          urls.lyricsUrl,
        );

      if (
        !response.ok
      ) {
        throw new Error(
          "Gagal memuat lirik terbaru.",
        );
      }

      const lrcText =
        await response.text();

      const parsedLyrics =
        parseLrc(
          lrcText,
        );

      setAudioUrl(
        urls.audioUrl,
      );

      setLyrics(
        parsedLyrics,
      );

      if (
        audioRef.current
      ) {
        audioRef.current.pause();

        audioRef.current.currentTime =
          0;
      }

      setCurrentTime(
        0,
      );

      setIsPlaying(
        false,
      );

      await syncMusicState(
        false,
        0,
      );

    } catch (error) {

      setEditError(
        error instanceof Error
          ? error.message
          : "Gagal mengubah lagu.",
      );

    } finally {

      setIsSaving(
        false,
      );
    }
  }

  // ======================================================
  // PLAY / PAUSE
  // ======================================================

  async function togglePlay() {

    const audio =
      audioRef.current;

    if (
      !audio ||
      !audioUrl
    ) {
      return;
    }

    try {

      if (
        audio.paused
      ) {

        onPlay();

        await audio.play();

        setIsPlaying(
          true,
        );

        await syncMusicState(
          true,
          audio.currentTime,
        );

      } else {

        audio.pause();

        setIsPlaying(
          false,
        );

        await syncMusicState(
          false,
          audio.currentTime,
        );
      }

    } catch (error) {

      console.error(
        "Play error:",
        error,
      );

      setError(
        "Lagu tidak bisa diputar.",
      );
    }
  }

  // ======================================================
  // DELETE SONG
  // ======================================================

  async function handleDelete() {

    const confirmed =
      window.confirm(
        `Hapus lagu "${title}"? File MP3 dan LRC juga akan dihapus.`,
      );

    if (
      !confirmed
    ) {
      return;
    }

    try {

      setIsDeleting(
        true,
      );

      setError(
        "",
      );

      if (
        audioRef.current
      ) {
        audioRef.current.pause();
      }

      await syncMusicState(
        false,
        0,
      );

      await deleteSong(
        songId,
      );

    } catch (error) {

      console.error(
        "Delete song error:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Gagal menghapus lagu.",
      );

      setIsDeleting(
        false,
      );
    }
  }

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="mt-5 rounded-xl border border-zinc-800 p-5">

      {/* AUDIO */}

      <audio
        ref={audioRef}
        src={audioUrl}

        onTimeUpdate={(
          event,
        ) => {

          setCurrentTime(
            event.currentTarget
              .currentTime,
          );
        }}

        onPlay={() => {
          setIsPlaying(
            true,
          );
        }}

        onPause={() => {
          setIsPlaying(
            false,
          );
        }}

        onEnded={async () => {

          setIsPlaying(
            false,
          );

          await syncMusicState(
            false,
            0,
          );

          onEnded();
        }}
      />

      {/* SONG INFO */}

      <div>

        <h3 className="text-lg font-semibold">
          {title}
        </h3>

        {artist && (

          <p className="mt-1 text-sm text-zinc-500">
            {artist}
          </p>

        )}

      </div>

      {/* ERROR */}

      {error && (

        <p className="mt-4 text-sm text-red-400">
          {error}
        </p>

      )}

      {/* PROGRESS */}

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

          onChange={(
            event,
          ) => {

            const time =
              Number(
                event.target.value,
              );

            if (
              audioRef.current
            ) {

              audioRef.current.currentTime =
                time;
            }

            setCurrentTime(
              time,
            );
          }}

          className="w-full"
        />

        <div className="mt-1 flex justify-between text-xs text-zinc-500">

          <span>
            {formatTime(
              currentTime,
            )}
          </span>

          <span>
            {formatTime(
              duration,
            )}
          </span>

        </div>

      </div>

      {/* CONTROLS */}

      <div className="mt-4 flex flex-wrap items-center gap-3">

        <button
          type="button"

          onClick={
            onPrevious
          }

          disabled={
            !isActive ||
            !hasPrevious
          }

          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm disabled:opacity-30"
        >
          ⏮ Previous
        </button>

        <button
          type="button"

          onClick={
            togglePlay
          }

          disabled={
            loading ||
            !audioUrl
          }

          className="rounded-lg bg-white px-5 py-2 text-sm font-medium text-black disabled:opacity-50"
        >

          {loading
            ? "Loading..."
            : isPlaying
              ? "⏸ Pause"
              : "▶ Play"}

        </button>

        <button
          type="button"

          onClick={
            onNext
          }

          disabled={
            !isActive ||
            !hasNext
          }

          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm disabled:opacity-30"
        >
          Next ⏭
        </button>

        <button
          type="button"

          onClick={
            handleDelete
          }

          disabled={
            isDeleting
          }

          className="rounded-lg border border-red-900 px-4 py-2 text-sm text-red-400 transition hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-50"
        >

          {isDeleting
            ? "Deleting..."
            : "Delete"}

        </button>

        <button
          type="button"

          onClick={() => {

            setEditError(
              "",
            );

            setIsEditing(
              true,
            );
          }}

          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm"
        >
          Edit
        </button>

      </div>

      {/* EDIT FORM */}

      {isEditing && (

        <form
          action={
            handleEdit
          }

          className="mt-5 rounded-xl border border-zinc-800 p-5"
        >

          <h4 className="text-lg font-semibold">
            Edit Song
          </h4>

          <div className="mt-4 space-y-4">

            <div>

              <label className="mb-1 block text-sm text-zinc-400">
                Song Title
              </label>

              <input
                type="text"

                name="title"

                defaultValue={
                  title
                }

                required

                className="w-full rounded-lg border border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-white"
              />

            </div>

            <div>

              <label className="mb-1 block text-sm text-zinc-400">
                Artist
              </label>

              <input
                type="text"

                name="artist"

                defaultValue={
                  artist ?? ""
                }

                required

                className="w-full rounded-lg border border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-white"
              />

            </div>

            <div>

              <label className="mb-1 block text-sm text-zinc-400">
                Duration (seconds)
              </label>

              <input
                type="number"

                name="duration"

                min="1"

                defaultValue={
                  duration
                }

                required

                className="w-full rounded-lg border border-zinc-700 bg-transparent px-3 py-2 outline-none focus:border-white"
              />

            </div>

            <div>

              <label className="mb-1 block text-sm text-zinc-400">
                Replace MP3
              </label>

              <input
                type="file"

                name="audio"

                accept=".mp3,audio/mpeg"

                className="block w-full text-sm text-zinc-400"
              />

              <p className="mt-1 text-xs text-zinc-600">
                Kosongkan jika tidak ingin
                mengganti MP3.
              </p>

            </div>

            <div>

              <label className="mb-1 block text-sm text-zinc-400">
                Replace LRC
              </label>

              <input
                type="file"

                name="lyrics"

                accept=".lrc,text/plain"

                className="block w-full text-sm text-zinc-400"
              />

              <p className="mt-1 text-xs text-zinc-600">
                Kosongkan jika tidak ingin
                mengganti lirik.
              </p>

            </div>

            {editError && (

              <p className="text-sm text-red-400">
                {editError}
              </p>

            )}

            <div className="flex gap-3">

              <button
                type="submit"

                disabled={
                  isSaving
                }

                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black disabled:opacity-50"
              >

                {isSaving
                  ? "Saving..."
                  : "Save Changes"}

              </button>

              <button
                type="button"

                onClick={() => {

                  setIsEditing(
                    false,
                  );

                  setEditError(
                    "",
                  );
                }}

                disabled={
                  isSaving
                }

                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm"
              >
                Cancel
              </button>

            </div>

          </div>

        </form>

      )}

      {/* LYRICS */}

      <div
        ref={
          lyricsContainerRef
        }

        className="mt-6 h-64 overflow-y-auto rounded-lg bg-zinc-950 p-4"
      >

        {lyrics.length === 0 ? (

          <p className="text-sm text-zinc-600">
            Lirik belum tersedia.
          </p>

        ) : (

          <div className="space-y-3">

            {lyrics.map(
              (
                lyric,
                index,
              ) => {

                const distance =
                  Math.abs(
                    index -
                    activeLyricIndex,
                  );

                const lyricIsActive =
                  index ===
                  activeLyricIndex;

                let lyricClass =
                  "text-sm text-zinc-700 opacity-40";

                if (
                  distance === 1
                ) {

                  lyricClass =
                    "text-base text-zinc-400 opacity-70";
                }

                if (
                  lyricIsActive
                ) {

                  lyricClass =
                    "scale-105 text-lg font-bold text-white opacity-100";
                }

                return (

                  <p
                    key={`${lyric.time}-${index}`}

                    ref={
                      lyricIsActive
                        ? activeLyricRef
                        : null
                    }

                    className={`origin-center transition-all duration-300 ease-out ${lyricClass}`}
                  >
                    {lyric.text}
                  </p>

                );
              },
            )}

          </div>

        )}

      </div>

    </div>
  );
}