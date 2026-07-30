import { auth } from "~/server/auth";

export default async function Dashboard() {
  const session = await auth();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>
        Login as: {session?.user?.email}
      </p>
      <button type="button">Logout</button>
    </div>
  );
}