"use client";

import { useEffect, useRef } from "react";
import LoginForm from "@/app/components/LoginForm";

const particles = [
  { left: "10%", top: "20%", delay: "0s" },
  { left: "20%", top: "70%", delay: "1s" },
  { left: "32%", top: "15%", delay: "2s" },
  { left: "45%", top: "80%", delay: "3s" },
  { left: "55%", top: "25%", delay: "1.5s" },
  { left: "68%", top: "65%", delay: "2.5s" },
  { left: "78%", top: "18%", delay: "4s" },
  { left: "88%", top: "72%", delay: "2s" },
  { left: "92%", top: "35%", delay: "4.5s" },
  { left: "5%", top: "50%", delay: "3.5s" },
];

export default function LoginPage() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!glowRef.current) return;

      glowRef.current.style.setProperty(
        "--mouse-x",
        `${event.clientX}px`,
      );

      glowRef.current.style.setProperty(
        "--mouse-y",
        `${event.clientY}px`,
      );
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#09090b] px-6">
      {/* Aurora background */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px] animate-[spin_12s_ease-in-out_infinite]"
        />

        <div
          className="absolute -right-32 top-1/4 h-[450px] w-[450px] rounded-full bg-blue-600/20 blur-[120px] animate-[pulse_8s_ease-in-out_infinite]"
        />

        <div
          className="absolute bottom-[-200px] left-1/3 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[130px] animate-[pulse_10s_ease-in-out_infinite]"
        />
      </div>

      {/* Interactive mouse glow */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 z-10 opacity-70"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(500px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(139,92,246,0.12), transparent 70%)",
        }}
      />

      {/* Floating particles */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        {particles.map((particle, index) => (
          <span
            key={index}
            className="absolute block h-[3px] w-[3px] rounded-full bg-white/80 shadow-[0_0_12px_rgba(255,255,255,0.5)] animate-[bounce_6s_ease-in-out_infinite]"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
            }}
          />
        ))}
      </div>

      {/* Login card */}
      <div className="relative z-20 flex min-h-screen items-center justify-center">
        <div
          className="
            w-full max-w-md
            rounded-3xl
            border border-white/10
            bg-white/[0.06]
            p-8
            shadow-2xl shadow-black/30
            backdrop-blur-2xl
            transition-all duration-500
            hover:border-white/15
            hover:bg-white/[0.08]
            hover:shadow-violet-500/10
          "
        >
          {/* Logo */}
          <div className="mb-8">
            <div
              className="
                mb-6
                flex h-12 w-12
                items-center justify-center
                rounded-2xl
                border border-white/10
                bg-white/10
                text-xl
                shadow-lg shadow-violet-500/10
                transition-transform duration-300
                hover:scale-110
              "
            >
              ✦
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white">
              Welcome back
            </h1>

            <p className="mt-2 text-zinc-400">
              Sign in to your My Space.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}