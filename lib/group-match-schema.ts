import { z } from "zod";
import { GroupProfileSchema } from "./group-schema";

export const GroupMatchItemSchema = z.object({
  group_id: z.string(),
  fit_score: z.number().min(0).max(100),
  recommendation_level: z.enum([
    "strong_recommend",
    "consider_with_caution",
    "not_recommended",
  ]),
  reason: z.string(),
  risk: z.string(),
  matched_traits: z.array(z.string()),
  mismatched_traits: z.array(z.string()),
  suggested_next_action: z.string(),
  summary_for_user: z.string(),
  summary_for_group_agent: z.string(),
});

export const FilteredGroupSchema = z.object({
  group_id: z.string(),
  reason: z.string(),
  risk: z.string(),
});

export const GroupMatchResultSchema = z.object({
  scene: z.string(),
  candidate_count: z.number(),
  matches: z.array(GroupMatchItemSchema),
  filtered_out: z.array(FilteredGroupSchema),
  overall_summary: z.string(),
});

export type GroupMatchItem = z.infer<typeof GroupMatchItemSchema>;
export type FilteredGroup = z.infer<typeof FilteredGroupSchema>;
export type GroupMatchResult = z.infer<typeof GroupMatchResultSchema>;

export type GroupMatchRequest = {
  profile: unknown;
};

export type GroupMatchResponse = {
  result: GroupMatchResult;
  matchedGroups: Array<
    GroupMatchItem & { group: z.infer<typeof GroupProfileSchema> }
  >;
  filteredGroups: Array<
    FilteredGroup & { group: z.infer<typeof GroupProfileSchema> }
  >;
  rawContent: string;
};
