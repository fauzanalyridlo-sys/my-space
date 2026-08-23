"use client";
import VolumeControl from "./music/VolumeControl";
import PlayerControls from "./music/PlayerControls";
import SongProgress from "./music/SongProgress";
import LyricsPanel, {
  type LyricLine,
} from "./music/LyricsPanel";

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
  playRequest: number;
  onPlay: () => void;
  onEnded: () => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  isShuffle: boolean;
repeatMode: "off" | "all" | "one";
onToggleShuffle: () => void;
onToggleRepeat: () => void;

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
  
  hasPrevious,
  hasNext,
 isShuffle,
  repeatMode,
  onPlay,
  onEnded,
  onPrevious,
  onNext,
  onToggleShuffle,
  onToggleRepeat,
}: MusicPlayerProps) {
  // ======================================================
  // REFS
  // ======================================================

  const audioRef =
    useRef<
      HTMLAudioElement | null
    >(null);

  // ======================================================
  // STATE
  // ======================================================

  
  const [audioUrl, setAudioUrl] =
    useState("");

    const [coverUrl, setCoverUrl] =
  useState<string | null>(null);

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

    const [volume, setVolume] =
  useState(1);

const [isMuted, setIsMuted] =
  useState(false);

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

setCoverUrl(
  urls.coverUrl,
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

  // STOP JIKA BUKAN LAGU AKTIF

useEffect(() => {
  const audio = audioRef.current;

  if (!audio || isActive) {
    return;
  }

  audio.pause();
  audio.currentTime = 0;
}, [isActive]);

  // ======================================================
  // AUTOPLAY
  // ======================================================

  useEffect(() => {
  const audio = audioRef.current;

  if (
    !audio ||
    !isActive ||
    !shouldPlay ||
    !audioUrl
  ) {
    return;
  }

  // ==========================================
  // RESTART SONG
  // ==========================================

  if (audio.ended) {
    audio.currentTime = 0;
  }

  audio
    .play()
    .then(async () => {
      setIsPlaying(true);

      setCurrentTime(
        audio.currentTime,
      );

      await syncMusicState(
        true,
        audio.currentTime,
      );
    })
    .catch((error) => {
      // AbortError bisa terjadi ketika
      // audio sedang berganti/reset.
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      console.error(
        "Autoplay error:",
        error,
      );

      setError(
        "Lagu tidak bisa diputar otomatis.",
      );
    });
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

setCoverUrl(
  urls.coverUrl,
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
  //volume control//
  function handleVolumeChange(
  newVolume: number,
) {
  setVolume(newVolume);

  setIsMuted(
    newVolume === 0,
  );

  if (audioRef.current) {
    audioRef.current.volume =
      newVolume;

    audioRef.current.muted =
      newVolume === 0;
  }
}
//Mute / Unmute//
function handleToggleMute() {
  if (!audioRef.current) {
    return;
  }

  const nextMuted =
    !audioRef.current.muted;

  audioRef.current.muted =
    nextMuted;

  setIsMuted(
    nextMuted,
  );
}
//handleSeek//
function handleSeek(
  time: number,
) {
  const audio =
    audioRef.current;

  if (!audio) {
    return;
  }

  audio.currentTime =
    time;

  setCurrentTime(
    time,
  );
}

  // ======================================================
  // UI
  // ======================================================

  return (
  <div
    className="
      mt-5
      rounded-xl
      border
      border-zinc-800
      p-3
      sm:p-5
    "
  >

      {/* AUDIO */}

      <audio
  ref={audioRef}
  src={audioUrl}

  onTimeUpdate={(event) => {
    setCurrentTime(
      event.currentTarget.currentTime,
    );
  }}

  onPlay={() => {
    setIsPlaying(true);
  }}

  onPause={() => {
    setIsPlaying(false);
  }}

  onEnded={async () => {
  if (repeatMode === "one") {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.currentTime = 0;
    setCurrentTime(0);

    try {
      await audio.play();

      setIsPlaying(true);

      await syncMusicState(
        true,
        0,
      );
    } catch (error) {
      console.error(
        "Repeat one error:",
        error,
      );
    }

    return;
  }

  setIsPlaying(false);
  setCurrentTime(0);

  await syncMusicState(
    false,
    0,
  );

  onEnded();
}}

/>
      {/* SONG INFO */}
{/* PLAYER CARD */}

<div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">

{/* COVER */}

{/* COVER */}

{coverUrl ? (
  <div
    className="
      flex
      justify-center
      border-b
      border-zinc-800
      bg-zinc-950
      px-4
      py-6
      sm:px-6
      sm:py-8
    "
  >
    <img
      src={coverUrl}
      alt={`${title} cover`}
      className="
        h-40
        w-40
        rounded-xl
        object-cover
        shadow-2xl
        sm:h-56
        sm:w-56
        sm:rounded-2xl
      "
    />
  </div>
) : (
  <div
    className="
      flex
      justify-center
      border-b
      border-zinc-800
      bg-zinc-950
      px-4
      py-6
      sm:px-6
      sm:py-8
    "
  >
    <div
      className="
        flex
        h-40
        w-40
        items-center
        justify-center
        rounded-xl
        border
        border-zinc-800
        bg-zinc-900
        text-4xl
        text-zinc-600
        sm:h-56
        sm:w-56
        sm:rounded-2xl
        sm:text-5xl
      "
    >
      ♪
    </div>
  </div>
)}

  {/* SONG HEADER */}

  <div
  className="
    border-b
    border-zinc-800
    px-4
    py-5
    sm:px-6
    sm:py-6
  "
>
  <div
    className="
      flex
      flex-col
      gap-5
      sm:flex-row
      sm:items-start
      sm:justify-between
    "
  >

      {/* SONG INFO */}

      <div className="min-w-0">

        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
          <span>
            Now Playing
          </span>

          {isPlaying && (
            <span className="flex items-center gap-1 text-white">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Playing
            </span>
          )}
        </div>

        <h3
  className="
    mt-2
    truncate
    text-xl
    font-bold
    sm:mt-3
    sm:text-2xl
  "
>
  {title}
</h3>

        {artist && (
          <p className="mt-1 truncate text-xs text-zinc-500 sm:text-sm">
            {artist}
          </p>
        )}

      </div>

      {/* SONG ACTIONS */}

      <div
  className="
    flex
    w-full
    shrink-0
    gap-2
    sm:w-auto
  "
>

        <button
          type="button"
          onClick={() => {
            setEditError("");
            setIsEditing(true);
          }}
          className="
  flex-1
  rounded-lg
  border
  border-zinc-700
  px-3
  py-2
  text-sm
  text-zinc-300
  transition
  hover:bg-zinc-900
  sm:flex-none
"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="
  flex-1
  rounded-lg
  border
  border-red-900
  px-3
  py-2
  text-sm
  text-red-400
  transition
  hover:bg-red-950
  disabled:cursor-not-allowed
  disabled:opacity-50
  sm:flex-none
"
        >
          {isDeleting
            ? "Deleting..."
            : "Delete"}
        </button>

      </div>

    </div>

  </div>


  {/* PLAYER */}

  <div
  className="
    px-4
    py-5
    sm:px-6
    sm:py-6
  "
>

    {/* ERROR */}

    {error && (
      <p className="mb-4 text-sm text-red-400">
        {error}
      </p>
    )}


   {/* PROGRESS */}

<SongProgress
  currentTime={currentTime}
  duration={duration}
  onSeek={handleSeek}
/>


    {/* CONTROLS */}

    <div
  className="
    mt-6
    flex
    flex-col
    items-center
    justify-center
    gap-5
    sm:mt-8
    sm:flex-row
    sm:gap-6
  "
>

      <PlayerControls
    isPlaying={isPlaying}
    loading={loading}
    hasPrevious={hasPrevious}
    hasNext={hasNext}
    isActive={isActive}
    onPrevious={onPrevious}
    onTogglePlay={togglePlay}
    onNext={onNext}
     isShuffle={isShuffle}
  repeatMode={repeatMode}
  onToggleShuffle={onToggleShuffle}
  onToggleRepeat={onToggleRepeat}
/>

  <VolumeControl
    volume={volume}
    isMuted={isMuted}
    onVolumeChange={handleVolumeChange}
    onToggleMute={handleToggleMute}
  />

    </div>

  </div>

</div>

      {/* EDIT FORM */}

      {isEditing && (

        <form
          action={
            handleEdit
          }

          className="
  mt-5
  rounded-xl
  border
  border-zinc-800
  p-4
  sm:p-5
"
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

              {/* REPLACE MP3 */}

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

{/* REPLACE LRC */}

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

{/* REPLACE COVER */}

<div>
  <label className="mb-1 block text-sm text-zinc-400">
    Replace Cover
  </label>

  <input
    type="file"
    name="cover"
    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
    className="block w-full text-sm text-zinc-400"
  />

  <p className="mt-1 text-xs text-zinc-600">
    Kosongkan jika tidak ingin
    mengganti cover.
  </p>
</div>

            {editError && (

              <p className="text-sm text-red-400">
                {editError}
              </p>

            )}

<div
  className="
  w-full sm:w-auto
    flex
    flex-col
    gap-3
    sm:flex-row
  "
>

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

<LyricsPanel
  lyrics={lyrics}
  activeLyricIndex={
    activeLyricIndex
  }
/>

    </div>
  );
}