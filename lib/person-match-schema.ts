import { z } from "zod";
import { ContentItemSchema } from "./content-schema";
import { PersonProfileSchema } from "./person-schema";

export const PersonMatchItemSchema = z.object({
  person_id: z.string(),
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
  summary_for_person_agent: z.string(),
  relevant_content_ids: z.array(z.string()),
});

export const FilteredPersonSchema = z.object({
  person_id: z.string(),
  reason: z.string(),
  risk: z.string(),
});

export const PersonMatchResultSchema = z.object({
  scene: z.string(),
  candidate_count: z.number(),
  matches: z.array(PersonMatchItemSchema),
  filtered_out: z.array(FilteredPersonSchema),
  overall_summary: z.string(),
});

export type PersonMatchItem = z.infer<typeof PersonMatchItemSchema>;
export type FilteredPerson = z.infer<typeof FilteredPersonSchema>;
export type PersonMatchResult = z.infer<typeof PersonMatchResultSchema>;

export type PersonMatchRequest = {
  profile: unknown;
};

export type PersonWithContent = z.infer<typeof PersonProfileSchema> & {
  authoredContents: z.infer<typeof ContentItemSchema>[];
};

export type PersonMatchResponse = {
  result: PersonMatchResult;
  matchedPeople: Array<PersonMatchItem & { person: PersonWithContent }>;
  filteredPeople: Array<FilteredPerson & { person: PersonWithContent }>;
  rawContent: string;
};
