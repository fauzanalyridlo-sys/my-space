"use client";

import {
  useEffect,
  useRef,
} from "react";

export type LyricLine = {
  time: number;
  text: string;
};

type LyricsPanelProps = {
  lyrics: LyricLine[];
  activeLyricIndex: number;
};

export default function LyricsPanel({
  lyrics,
  activeLyricIndex,
}: LyricsPanelProps) {

  const containerRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const activeLyricRef =
    useRef<HTMLParagraphElement | null>(
      null,
    );

  // ==========================================
  // AUTO SCROLL
  // ==========================================

  useEffect(() => {

    const container =
      containerRef.current;

    const activeLyric =
      activeLyricRef.current;

    if (
      !container ||
      !activeLyric ||
      activeLyricIndex === -1
    ) {
      return;
    }

    const containerHeight =
      container.clientHeight;

    const lyricTop =
      activeLyric.offsetTop;

    const lyricHeight =
      activeLyric.offsetHeight;

    // Posisi supaya lirik aktif
    // berada di tengah container

    const targetScroll =
      lyricTop -
      containerHeight / 2 +
      lyricHeight / 2;

    container.scrollTo({
      top: Math.max(
        0,
        targetScroll,
      ),
      behavior: "smooth",
    });

  }, [
    activeLyricIndex,
  ]);

  // ==========================================
  // EMPTY STATE
  // ==========================================

  if (lyrics.length === 0) {
    return (
      <div className="mt-6 flex h-80 items-center justify-center rounded-xl bg-zinc-950 p-4">

        <p className="text-sm text-zinc-600">
          Lirik belum tersedia.
        </p>

      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="
        relative
        mt-6
        h-80
        overflow-x-hidden
        overflow-y-auto
        rounded-xl
        bg-zinc-950
        px-6
        py-32
      "
    >

      <div className="space-y-5">

        {lyrics.map(
          (
            lyric,
            index,
          ) => {

            const distance =
              index -
              activeLyricIndex;

            const isActive =
              index ===
              activeLyricIndex;

            const isPast =
              index <
              activeLyricIndex;

            let lyricClass =
              "text-base text-zinc-600 opacity-40";

            // =================================
            // LIRIK SUDAH LEWAT
            // =================================

            if (isPast) {

              lyricClass =
                "text-base text-zinc-600 opacity-30";

            }

            // =================================
            // LIRIK AKTIF
            // =================================

            if (isActive) {

              lyricClass =
                `
                scale-105
                text-xl
                font-bold
                text-white
                opacity-100
                `;

            }

            // =================================
            // LIRIK BERIKUTNYA
            // =================================

            if (
              distance === 1
            ) {

              lyricClass =
                "text-lg text-zinc-400 opacity-80";

            }

            if (
              distance === 2
            ) {

              lyricClass =
                "text-base text-zinc-500 opacity-60";

            }

            return (

              <p
                key={`${lyric.time}-${index}`}

                ref={
                  isActive
                    ? activeLyricRef
                    : null
                }

                className={`
                  origin-center
                  text-center
                  transition-all
                  duration-500
                  ease-out
                  ${lyricClass}
                `}
              >

                {lyric.text}

              </p>

            );

          },
        )}

      </div>

    </div>
  );
}