import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";
import MusicPageClient from "./MusicPageClient";

export default async function MusicPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const userId = Number(session.user.id);

  const songs = await prisma.song.findMany({
  where: {
    userId,
  },
  orderBy: {
    createdAt: "desc",
  },
});

const songsWithCovers = await Promise.all(
  songs.map(async (song) => {
    console.log("SONG COVER DEBUG:", {
  songId: song.songId,
  title: song.title,
  coverPath: song.coverUrl,
});
    let coverUrl: string | null = null;

    if (song.coverUrl) {
      const { data, error } =
        await supabase.storage
          .from("music")
          .createSignedUrl(
            song.coverUrl,
            60 * 60,
          );

      if (!error && data?.signedUrl) {
        coverUrl = data.signedUrl;
      }
    }

    return {
      id: song.id,
      songId: song.songId,
      title: song.title,
      artist: song.artist,
      duration: song.duration,
      coverUrl,
    };
  }),
);

return (
  <MusicPageClient
    songs={songsWithCovers}
  />
);
}