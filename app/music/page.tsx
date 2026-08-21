import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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

  return <MusicPageClient songs={songs} />;
}
