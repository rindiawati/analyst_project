"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/dashboard",
    });
  }

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <button type="submit">
        Login
      </button>
    </form>
  );
}