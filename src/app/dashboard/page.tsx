import { auth } from "~/server/auth";
import { LogoutButton } from "./_components/logout-button";

export default async function Dashboard() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Dashboard
        </h1>
        <p className="text-2xl text-white">
          Login as: {session?.user?.email}
        </p>
        <LogoutButton />
      </div>
    </main>
  );
}
