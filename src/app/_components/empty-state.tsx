import Link from "next/link";

type EmptyStateAction = { label: string; href: string };

/**
 * One reusable empty state for every list view. Shows a friendly message and an
 * optional primary CTA. Pass `action` only when there is a real destination to
 * link to — never link to a route that doesn't exist yet.
 */
export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: EmptyStateAction;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-3 rounded-xl border border-dashed border-white/20 bg-white/5 px-6 py-12 text-center">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="max-w-sm text-sm text-white/60">{message}</p>
      {action ? (
        <Link
          href={action.href}
          className="mt-2 rounded-full bg-white/10 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
