import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-base px-4 text-center text-white">
      <h1 className="text-6xl font-extrabold tracking-tight">404</h1>
      <p className="text-white/70">We couldn&apos;t find that page.</p>
      <Link
        href="/dashboard"
        className="mt-2 rounded-full bg-accent px-6 py-2 font-semibold text-accent-contrast transition hover:bg-accent/90"
      >
        Back to dashboard
      </Link>
    </main>
  );
}
