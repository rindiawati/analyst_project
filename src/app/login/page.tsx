"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
    });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-base px-4 text-white">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-surface p-8">
        <h1 className="text-center text-3xl font-extrabold">Login</h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          <button
            type="submit"
            className="mt-2 rounded-full bg-accent px-10 py-3 font-semibold text-accent-contrast transition hover:bg-accent/90"
          >
            Login
          </button>
        </form>
        <p className="text-center text-sm text-white/70">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-accent underline hover:opacity-80">
            Register
          </a>
        </p>
      </div>
    </main>
  );
}
