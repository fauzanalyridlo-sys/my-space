"use client";

import { useState } from "react";
import AddSongForm from "../components/AddSongForm";
import MusicPlayer from "../components/MusicPlayer";

type Song = {
  id: number;
  songId: string;
  title: string;
  artist: string | null;
  duration: number;
};

type MusicPageClientProps = {
  songs: Song[];
};

export default function MusicPageClient({
  songs,
}: MusicPageClientProps) {
 const [activeSongId, setActiveSongId] = useState<string | null>(
  null,
);

const [shouldPlaySongId, setShouldPlaySongId] = useState<
  string | null
>(null);

function handlePlay(songId: string) {
  setActiveSongId(songId);
  setShouldPlaySongId(null);
}

function handleEnded(songId: string) {
  const index = songs.findIndex(
    (song) => song.songId === songId,
  );

  if (index === -1) return;

  const nextSong = songs[index + 1];

  if (nextSong) {
    setActiveSongId(nextSong.songId);
    setShouldPlaySongId(nextSong.songId);
  } else {
    setActiveSongId(null);
    setShouldPlaySongId(null);
  }
}

  function handlePrevious() {
  if (!activeSongId) return;

  const index = songs.findIndex(
    (song) => song.songId === activeSongId,
  );

  if (index <= 0) return;

  const previousSong = songs[index - 1];

  if (!previousSong) return;

  setActiveSongId(previousSong.songId);
  setShouldPlaySongId(previousSong.songId);
}

function handleNext() {
  if (!activeSongId) return;

  const index = songs.findIndex(
    (song) => song.songId === activeSongId,
  );

  if (index === -1) return;

  const nextSong = songs[index + 1];

  if (!nextSong) return;

  setActiveSongId(nextSong.songId);
  setShouldPlaySongId(nextSong.songId);
}

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">
          My Space Music
        </h1>

        <p className="mt-2 text-zinc-500">
          Your music and synced lyrics.
        </p>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">
            Your Songs
          </h2>

          <div className="mt-4 space-y-4">
            
            {songs.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No songs yet. Add your first song.
              </p>
            ) : (
              songs.map((song) => (
                <MusicPlayer
  key={song.id}
  songId={song.songId}
  title={song.title}
  artist={song.artist}
  duration={song.duration}
  isActive={activeSongId === song.songId}
  shouldPlay={shouldPlaySongId === song.songId}
  onPlay={() => handlePlay(song.songId)}
  onEnded={() => handleEnded(song.songId)}
  onPrevious={handlePrevious}
  onNext={handleNext}
  hasPrevious={
    activeSongId !== null &&
    songs.findIndex(
      (song) => song.songId === activeSongId,
    ) > 0
  }
  hasNext={
    activeSongId !== null &&
    songs.findIndex(
      (song) => song.songId === activeSongId,
    ) < songs.length - 1
  }
/>
              ))
            )}
          </div>

          <AddSongForm />
        </section>
      </div>
    </main>
  );
}