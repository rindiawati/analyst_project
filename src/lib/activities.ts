export type ActivityOwner = { userId: string };

export type OwnershipCheck =
  | { ok: true }
  | { ok: false; code: "NOT_FOUND" | "FORBIDDEN" };

export function checkActivityOwnership(
  activity: ActivityOwner | null,
  userId: string,
): OwnershipCheck {
  if (activity === null) {
    return { ok: false, code: "NOT_FOUND" };
  }

  if (activity.userId !== userId) {
    return { ok: false, code: "FORBIDDEN" };
  }

  return { ok: true };
}
