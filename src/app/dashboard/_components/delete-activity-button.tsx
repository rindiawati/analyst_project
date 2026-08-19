"use client";

import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";

export function DeleteActivityButton({ id }: { id: string }) {
  const router = useRouter();
  const utils = api.useUtils();

  const remove = api.activities.delete.useMutation({
    onSuccess: async () => {
      await utils.activities.list.invalidate();
      // Re-run the dashboard server component so the row disappears.
      router.refresh();
    },
  });

  return (
    <button
      type="button"
      aria-label="Delete run"
      disabled={remove.isPending}
      onClick={() => remove.mutate({ id })}
      className="text-sm text-white/40 transition hover:text-red-300 disabled:opacity-50"
    >
      {remove.isPending ? "Deleting…" : "Delete"}
    </button>
  );
}
