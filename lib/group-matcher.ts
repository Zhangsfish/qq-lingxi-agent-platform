import type { GroupProfile } from "./group-schema";
import { buildPersonalityMatchingContext } from "./personality-context";
import type { PersonalityProfile } from "./personality-schema";
import {
  GroupMatchResultSchema,
  type FilteredGroup,
  type GroupMatchItem,
  type GroupMatchResult,
} from "./group-match-schema";

type CandidateGroupForPrompt = Pick<
  GroupProfile,
  | "id"
  | "name"
  | "scene"
  | "category"
  | "description"
  | "culture_tags"
  | "suitable_for"
  | "unsuitable_for"
  | "entry_rules"
  | "activity_level"
  | "connection_intensity"
  | "privacy_level"
  | "group_personality"
  | "sample_topics"
  | "risk_flags"
>;

export function parseGroupMatchResult(raw: string): GroupMatchResult {
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
    return GroupMatchResultSchema.parse(parsed);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown validation error";
    throw new Error(`Group match JSON validation failed: ${message}`);
  }
}

export function buildGroupMatchingPromptInput(
  profile: unknown,
  groups: GroupProfile[],
  soulProfile?: PersonalityProfile | null,
): string {
  const candidateGroups: CandidateGroupForPrompt[] = groups.map((group) => ({
    id: group.id,
    name: group.name,
    scene: group.scene,
    category: group.category,
    description: group.description,
    culture_tags: group.culture_tags,
    suitable_for: group.suitable_for,
    unsuitable_for: group.unsuitable_for,
    entry_rules: group.entry_rules,
    activity_level: group.activity_level,
    connection_intensity: group.connection_intensity,
    privacy_level: group.privacy_level,
    group_personality: group.group_personality,
    sample_topics: group.sample_topics,
    risk_flags: group.risk_flags,
  }));

  return JSON.stringify(
    {
      task: "match_user_profile_to_candidate_groups",
      instruction:
        "请根据 user_profile 和 candidate_groups 输出符合 schema 的 JSON。user_profile 是当前具体需求的首要依据；若 long_term_personality 不为空，将它作为长期价值、能量与边界适配的辅助依据，并在理由或风险中体现。只使用候选群中的 group_id。为了避免输出过长，请只返回 3 个 matches 和 1 个 filtered_out；reason、risk、summary 字段保持一句话。",
      user_profile: profile,
      long_term_personality: buildPersonalityMatchingContext(soulProfile),
      candidate_groups: candidateGroups,
    },
    null,
    2,
  );
}

export function attachGroupProfiles(
  result: GroupMatchResult,
  groups: GroupProfile[],
) {
  const groupsById = new Map(groups.map((group) => [group.id, group]));

  const matchedGroups = result.matches.flatMap((match: GroupMatchItem) => {
    const group = groupsById.get(match.group_id);
    return group ? [{ ...match, group }] : [];
  });

  const filteredGroups = result.filtered_out.flatMap(
    (filtered: FilteredGroup) => {
      const group = groupsById.get(filtered.group_id);
      return group ? [{ ...filtered, group }] : [];
    },
  );

  return {
    matchedGroups,
    filteredGroups,
  };
}
