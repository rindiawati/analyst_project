import { describe, expect, it } from "vitest";

import { checkActivityOwnership } from "./activities";

describe("checkActivityOwnership", () => {
  const ownerId = "user-1";

  it("allows the owner to act on their own activity", () => {
    expect(checkActivityOwnership({ userId: ownerId }, ownerId)).toEqual({
      ok: true,
    });
  });

  it("forbids acting on another user's activity", () => {
    expect(checkActivityOwnership({ userId: "user-2" }, ownerId)).toEqual({
      ok: false,
      code: "FORBIDDEN",
    });
  });

  it("reports NOT_FOUND when the activity does not exist", () => {
    expect(checkActivityOwnership(null, ownerId)).toEqual({
      ok: false,
      code: "NOT_FOUND",
    });
  });
});
