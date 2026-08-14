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

    if (
      typeof email !== "string" ||
      !email.trim()
    ) {
      setError("Email wajib diisi.");
      return;
    }

    if (
      typeof password !== "string" ||
      !password
    ) {
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
    <form
      action={handleSubmit}
      className="space-y-5"
    >
      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-zinc-900"
        >
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          required
          disabled={isLoading}
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 outline-none transition focus:border-zinc-500 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:opacity-60"
        />
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-zinc-900"
        >
          Password
        </label>

        <input
          id="password"
          name="password"
          type="password"
          required
          disabled={isLoading}
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 outline-none transition focus:border-zinc-500 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:opacity-60"
        />
      </div>

      {/* Error */}
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-black px-4 py-3 font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading
          ? "Signing in..."
          : "Sign in"}
      </button>
    </form>
  );
}