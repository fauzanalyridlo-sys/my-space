import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import IotClient from "./IotClient";

export default async function IotPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = Number(session.user.id);

  const devices = await prisma.iotDevice.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      deviceToken: true,
      enabled: true,
    },
  });

  return <IotClient devices={devices} />;
}
