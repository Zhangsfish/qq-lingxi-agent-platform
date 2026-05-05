import type { UserNeedProfile } from "./profile-schema";
import { validateUserNeedProfile } from "./profile-validation";

export function parseUserNeedProfile(raw: string): UserNeedProfile {
  const trimmed = raw.trim();
  let parsed: unknown;

  try {
    parsed = JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Model did not return a JSON object");
    }

    try {
      parsed = JSON.parse(match[0]);
    } catch {
      throw new Error("Model returned invalid JSON");
    }
  }

  try {
    return validateUserNeedProfile(parsed) as UserNeedProfile;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown validation error";
    throw new Error(`Profile JSON validation failed: ${message}`);
  }
}
