"use client";

import { useState } from "react";
import { loginAction } from "@/app/login/actions";

export default function LoginForm() {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    if (isLoading) return;

    setError("");

    const email = formData.get("email");
    const password = formData.get("password");

    if (typeof email !== "string" || !email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    if (typeof password !== "string" || !password) {
      setError("Password wajib diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginAction(formData);

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);

      setError("Terjadi kesalahan saat login. Coba lagi.");
      setIsLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      {/* Email */}
      <div className="group">
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-zinc-900"
        >
          Email
        </label>

        <div className="relative">
          <input
            id="email"
            name="email"
            type="email"
            required
            disabled={isLoading}
            autoComplete="email"
            placeholder="you@example.com"
            className="
              peer
              w-full
              rounded-xl
              border
              border-zinc-300
              bg-white
              px-4
              py-3
              text-zinc-900
              outline-none
              transition-all
              duration-200
              placeholder:text-zinc-400
              hover:border-zinc-400
              focus:border-zinc-500
              focus:ring-4
              focus:ring-zinc-900/10
              disabled:cursor-not-allowed
              disabled:bg-zinc-100
              disabled:opacity-60
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              -z-10
              rounded-xl
              bg-zinc-900/10
              opacity-0
              blur-xl
              transition-opacity
              duration-300
              peer-focus:opacity-100
            "
          />
        </div>
      </div>

      {/* Password */}
      <div className="group">
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-zinc-900"
        >
          Password
        </label>

        <div className="relative">
          <input
            id="password"
            name="password"
            type="password"
            required
            disabled={isLoading}
            autoComplete="current-password"
            placeholder="••••••••"
            className="
              peer
              w-full
              rounded-xl
              border
              border-zinc-300
              bg-white
              px-4
              py-3
              text-zinc-900
              outline-none
              transition-all
              duration-200
              placeholder:text-zinc-400
              hover:border-zinc-400
              focus:border-zinc-500
              focus:ring-4
              focus:ring-zinc-900/10
              disabled:cursor-not-allowed
              disabled:bg-zinc-100
              disabled:opacity-60
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              -z-10
              rounded-xl
              bg-zinc-900/10
              opacity-0
              blur-xl
              transition-opacity
              duration-300
              peer-focus:opacity-100
            "
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="
            flex
            items-center
            gap-3
            rounded-xl
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-sm
            text-red-600
            animate-[pulse_0.3s_ease-out]
          "
        >
          <span
            className="
              flex
              h-6
              w-6
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-red-100
              font-bold
              text-red-600
            "
          >
            !
          </span>

          <p>{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="
          group
          relative
          w-full
          overflow-hidden
          rounded-xl
          bg-black
          px-4
          py-3
          font-medium
          text-white
          shadow-sm
          transition-all
          duration-200
          hover:-translate-y-0.5
          hover:bg-zinc-800
          hover:shadow-lg
          hover:shadow-black/10
          active:translate-y-0
          active:scale-[0.98]
          disabled:cursor-not-allowed
          disabled:translate-y-0
          disabled:scale-100
          disabled:opacity-50
        "
      >
        {/* Hover glow */}
        <span
          className="
            pointer-events-none
            absolute
            inset-0
            -translate-x-full
            bg-gradient-to-r
            from-transparent
            via-white/10
            to-transparent
            transition-transform
            duration-700
            group-hover:translate-x-full
          "
        />

        <span className="relative flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <span
                className="
                  h-4
                  w-4
                  animate-spin
                  rounded-full
                  border-2
                  border-white/30
                  border-t-white
                "
              />

              <span>Signing in...</span>
            </>
          ) : (
            "Sign in"
          )}
        </span>
      </button>
    </form>
  );
}