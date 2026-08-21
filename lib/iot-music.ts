type ActiveMusicState = {
  songId: string;
  title: string;
  artist: string | null;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  updatedAt: number;
};

const activeMusicByUser = new Map<
  number,
  ActiveMusicState
>();

export function setActiveMusic(
  userId: number,
  music: ActiveMusicState,
) {
  activeMusicByUser.set(
    userId,
    music,
  );
}

export function getActiveMusic(
  userId: number,
) {
  return (
    activeMusicByUser.get(userId) ??
    null
  );
}

export function clearActiveMusic(
  userId: number,
) {
  activeMusicByUser.delete(userId);
}
