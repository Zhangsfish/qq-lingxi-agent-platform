import { z } from "zod";
import { ContentItemSchema } from "./content-schema";
import { GroupProfileSchema } from "./group-schema";
import { PersonProfileSchema } from "./person-schema";
import type { PersonalityProfile } from "./personality-schema";

export const ConnectableTargetSchema = z.object({
  target_type: z.enum(["person", "group"]),
  target_id: z.string(),
  reason: z.string(),
});

export const RealmRecommendedItemSchema = z.object({
  content_id: z.string(),
  rank: z.number(),
  fit_score: z.number().min(0).max(100),
  recommendation_level: z.enum([
    "strong_recommend",
    "consider_with_caution",
    "not_recommended",
  ]),
  reason: z.string(),
  risk: z.string(),
  matched_traits: z.array(z.string()),
  content_to_connection_value: z.string(),
  suggested_action: z.string(),
  connectable_targets: z.array(ConnectableTargetSchema),
});

export const RealmFilteredItemSchema = z.object({
  content_id: z.string(),
  reason: z.string(),
  risk: z.string(),
});

export const RealmRecommendationResultSchema = z.object({
  scene: z.string(),
  candidate_count: z.number(),
  recommended_items: z.array(RealmRecommendedItemSchema),
  filtered_out: z.array(RealmFilteredItemSchema),
  overall_summary: z.string(),
});

export type ConnectableTarget = z.infer<typeof ConnectableTargetSchema>;
export type RealmRecommendedItem = z.infer<
  typeof RealmRecommendedItemSchema
>;
export type RealmFilteredItem = z.infer<typeof RealmFilteredItemSchema>;
export type RealmRecommendationResult = z.infer<
  typeof RealmRecommendationResultSchema
>;

export type ContentWithAuthorAndGroups = z.infer<typeof ContentItemSchema> & {
  author?: z.infer<typeof PersonProfileSchema> | null;
  linkedGroups: z.infer<typeof GroupProfileSchema>[];
};

export type RealmRecommendationRequest = {
  profile: unknown;
  soulProfile?: PersonalityProfile | null;
};

export type RealmRecommendationResponse = {
  result: RealmRecommendationResult;
  recommendedItems: Array<
    RealmRecommendedItem & { content: ContentWithAuthorAndGroups }
  >;
  filteredItems: Array<
    RealmFilteredItem & { content: ContentWithAuthorAndGroups }
  >;
  rawContent: string;
};
