"use client";

import { useState } from "react";
import Image from "next/image";
import AddSongForm from "../components/AddSongForm";
import MusicPlayer from "../components/MusicPlayer";

type Song = {
  id: number;
  songId: string;
  title: string;
  artist: string | null;
  duration: number;
  coverUrl: string | null;
};

type MusicPageClientProps = {
  songs: Song[];
};

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export default function MusicPageClient({
  songs,
}: MusicPageClientProps) {
  const [activeSongId, setActiveSongId] =
    useState<string | null>(
      songs[0]?.songId ?? null,
    );

  const [shouldPlaySongId, setShouldPlaySongId] =
    useState<string | null>(null);

    const [isShuffle, setIsShuffle] =
  useState(false);

const [repeatMode, setRepeatMode] =
  useState<"off" | "all" | "one">("off");

   const [playRequest, setPlayRequest] = useState(0);

  const activeSong =
    songs.find(
      (song) =>
        song.songId === activeSongId,
    ) ?? null;

  // ==========================================
  // PILIH / PLAY SONG
  // ==========================================

  function handleSelectSong(
    songId: string,
  ) {
    setActiveSongId(songId);

    // trigger autoplay
    setShouldPlaySongId(songId);
  }

  function handlePlay(
    songId: string,
  ) {
    setActiveSongId(songId);

    setShouldPlaySongId(null);
  }

  function toggleShuffle() {
  setIsShuffle((current) => !current);
}

function toggleRepeat() {
  setRepeatMode((current) => {
    const next =
      current === "off"
        ? "all"
        : current === "all"
          ? "one"
          : "off";

    return next;
  });
}

  // ==========================================
  // SONG ENDED
  // ==========================================

  function handleEnded(songId: string) {
  
  const currentIndex = songs.findIndex(
    (song) => song.songId === songId,
  );

  if (currentIndex === -1) {
    return;
  }

  // ==========================================
  // REPEAT ONE
  // ==========================================

  if (repeatMode === "one") {
  
  setActiveSongId(songId);

  // Matikan trigger dulu
  setShouldPlaySongId(null);

  // Aktifkan lagi setelah render berikutnya
  requestAnimationFrame(() => {
    setShouldPlaySongId(songId);
  });

  return;
}

  // ==========================================
  // SHUFFLE
  // ==========================================

  if (
    isShuffle &&
    songs.length > 1
  ) {
    const availableSongs =
      songs.filter(
        (song) =>
          song.songId !== songId,
      );

    const randomIndex =
      Math.floor(
        Math.random() *
          availableSongs.length,
      );

    const randomSong =
      availableSongs[randomIndex];

    if (randomSong) {
      setActiveSongId(
        randomSong.songId,
      );

      setShouldPlaySongId(
        randomSong.songId,
      );

      setPlayRequest(
        (current) => current + 1,
      );
    }

    return;
  }

  // ==========================================
  // NORMAL / REPEAT ALL
  // ==========================================

  const nextSong =
    songs[currentIndex + 1];

  if (nextSong) {
    setActiveSongId(
      nextSong.songId,
    );

    setShouldPlaySongId(
      nextSong.songId,
    );

    return;
  }

  // ==========================================
  // REPEAT ALL
  // ==========================================

  if (repeatMode === "all") {
    const firstSong = songs[0];

    if (firstSong) {
      setActiveSongId(
        firstSong.songId,
      );

      setShouldPlaySongId(
        firstSong.songId,
      );
    }

    return;
  }

  // ==========================================
  // REPEAT OFF
  // ==========================================

  setActiveSongId(null);
  setShouldPlaySongId(null);
}

  // ==========================================
  // PREVIOUS
  // ==========================================

  function handlePrevious() {
    if (!activeSongId) {
      return;
    }

    const index =
      songs.findIndex(
        (song) =>
          song.songId === activeSongId,
      );

    if (index <= 0) {
      return;
    }

    const previousSong =
      songs[index - 1];

    if (!previousSong) {
      return;
    }

    setActiveSongId(
      previousSong.songId,
    );

    setShouldPlaySongId(
      previousSong.songId,
    );
  }

  // ==========================================
  // NEXT
  // ==========================================

  function handleNext() {
    if (!activeSongId) {
      return;
    }

    const index =
      songs.findIndex(
        (song) =>
          song.songId === activeSongId,
      );

    if (
      index === -1 ||
      index >= songs.length - 1
    ) {
      return;
    }

    const nextSong =
      songs[index + 1];

    setActiveSongId(
      nextSong.songId,
    );

    setShouldPlaySongId(
      nextSong.songId,
    );
  }

  const activeSongIndex =
    songs.findIndex(
      (song) =>
        song.songId === activeSongId,
    );

  return (
    <main className="min-h-screen px-4 py-6 sm:p-8">
      <div className="mx-auto max-w-[1600px]">

        {/* HEADER */}

        <div>
  <h1 className="text-2xl font-bold sm:text-3xl">
    My Space Music
  </h1>

  <p className="mt-1 text-sm text-zinc-500 sm:mt-2 sm:text-base">
    Your music and synced lyrics.
  </p>
</div>

        {/* MAIN LAYOUT */}

        <section
  className="
    mt-6
    grid
    gap-6
    lg:mt-10
    lg:gap-8
    lg:grid-cols-[520px_minmax(0,1fr)]
  "
>

          {/* ===================================== */}
          {/* PLAYLIST */}
          {/* ===================================== */}

          <aside
  className="
    overflow-hidden
    rounded-xl
    border
    border-zinc-800
    bg-zinc-950
    sm:rounded-2xl
  "
>

            <div
  className="
    border-b
    border-zinc-800
    p-4
    sm:p-6
  "
>

              <h2 className="text-xl font-semibold">
                Your Songs
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                {songs.length} songs
              </p>

            </div>

            <div
  className="
    max-h-[500px]
    overflow-y-auto
    p-2
    sm:max-h-[650px]
    sm:p-3
  "
>

              {songs.length === 0 ? (

                <p className="p-4 text-sm text-zinc-500">
                  No songs yet.
                </p>

              ) : (

                songs.map(
                  (song, index) => {

                    const isActive =
  song.songId ===
  activeSongId;

return (

                      <button
                        key={song.id}
                        type="button"
                        onClick={() =>
                          handleSelectSong(
                            song.songId,
                          )
                        }
                        className={`
  group
  flex
  w-full
  items-center
  gap-3
  rounded-xl
  px-3
  py-3
  text-left
  transition
  sm:gap-4
  sm:px-4
  sm:py-4
                          ${
                            isActive
                              ? "bg-white text-black"
                              : "text-zinc-300 hover:bg-zinc-900"
                          }
                        `}
                      >

                        {/* NUMBER / PLAY */}

                        <div className="flex w-5 shrink-0 items-center justify-center text-xs sm:w-6 sm:text-sm">

                          {isActive ? (
                            <span>
                              ▶
                            </span>
                          ) : (
                            <span
                              className="
                                text-zinc-500
                                group-hover:hidden
                              "
                            >
                              {index + 1}
                            </span>
                          )}

                        </div>

{/* COVER */}

<div
  className="
    relative
    h-10
    w-10
    shrink-0
    overflow-hidden
    rounded-lg
    bg-zinc-800
    sm:h-12
    sm:w-12
  "
>
  {song.coverUrl ? (
    <Image
      src={song.coverUrl}
      alt={`Cover ${song.title}`}
      fill
      className="object-cover"
    />
  ) : (
    <div
      className="
        flex
        h-full
        w-full
        items-center
        justify-center
        text-lg
      "
    >
      🎵
    </div>
  )}
</div>

{/* SONG INFO */}
<div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium sm:text-base">
  {song.title}
</p>
                          {song.artist && (

                            <p
  className={`
    mt-1
    truncate
    text-xs
    sm:text-sm
    ${
      isActive
        ? "text-zinc-600"
        : "text-zinc-500"
    }
  `}
>
  {song.artist}
</p>

                          )}

                        </div>

                        {/* DURATION */}

                        <span
  className={`
    shrink-0
    text-xs
    sm:text-sm
    ${
      isActive
        ? "text-zinc-600"
        : "text-zinc-500"
    }
  `}
>
  {formatDuration(song.duration)}
</span>

                      </button>

                    );
                  },
                )

              )}

            </div>

            <div className="border-t border-zinc-800 p-4">
              <AddSongForm />
            </div>

          </aside>

          {/* ===================================== */}
          {/* ACTIVE PLAYER */}
          {/* ===================================== */}

          <section className="min-w-0">

            {activeSong ? (

              <MusicPlayer
                key={activeSong.songId}

                songId={
                  activeSong.songId
                }

                title={
                  activeSong.title
                }

                artist={
                  activeSong.artist
                }

                duration={
                  activeSong.duration
                }

                isActive={true}

                shouldPlay={
                  shouldPlaySongId ===
                  activeSong.songId
                }

                playRequest={playRequest}

                onPlay={() =>
                  handlePlay(
                    activeSong.songId,
                  )
                }

                onEnded={() =>
                  handleEnded(
                    activeSong.songId,
                  )
                }

                onPrevious={
                  handlePrevious
                }

                onNext={
                  handleNext
                }

                hasPrevious={
                  activeSongIndex > 0
                }

                hasNext={
                  activeSongIndex >= 0 &&
                  activeSongIndex <
                    songs.length - 1
                }
             isShuffle={isShuffle}
  repeatMode={repeatMode}
  onToggleShuffle={toggleShuffle}
  onToggleRepeat={toggleRepeat}
/>

            ) : (

              <div className="rounded-2xl border border-zinc-800 p-10 text-center text-zinc-500">
                Select a song to start listening.
              </div>

            )}

          </section>

        </section>

      </div>
    </main>
  );
}