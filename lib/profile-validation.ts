import { z } from "zod";

const RouteSchema = z.enum([
  "person_first",
  "group_first",
  "content_first",
  "mixed",
  "uncertain",
]);

const ActionRouteSchema = z.enum([
  "person_first",
  "group_first",
  "content_first",
]);

export const UserNeedProfileSchema = z.object({
  scene: z.string(),
  surface_need: z.string(),
  core_need: z.string(),
  summary: z.string(),

  content_channel: z.object({
    content_need: z.string(),
    content_topics: z.array(z.string()),
    preferred_content_forms: z.array(z.string()),
    content_depth: z.string(),
    content_use_case: z.string(),
    content_ranking_criteria: z.array(z.string()),
    content_to_filter: z.array(z.string()),
    publishable_content_angle: z.array(z.string()),
    comment_interaction_style: z.string(),
    content_to_connection_triggers: z.array(z.string()),
  }),

  connection_channel: z.object({
    relationship_need: z.string(),
    target_community_type: z.string(),
    connection_intensity: z.string(),
    suitable_group_traits: z.array(z.string()),
    unsuitable_group_traits: z.array(z.string()),
    matching_criteria: z.array(z.string()),
    summary_for_matchmaker_agent: z.string(),
    summary_for_group_agent: z.string(),
  }),

  identity_slice: z.object({
    identity_slice_to_show: z.array(z.string()),
    identity_slice_to_hide: z.array(z.string()),
    self_presentation: z.string(),
    privacy_boundary: z.array(z.string()),
  }),

  preference_model: z.object({
    interests: z.array(z.string()),
    preferred_atmosphere: z.array(z.string()),
    disliked_atmosphere: z.array(z.string()),
    boundaries: z.array(z.string()),
    risk_signals: z.array(z.string()),
    uncertainty: z.array(z.string()),
    questions_for_next_round: z.array(z.string()),
    confidence: z.number().min(0).max(1),
  }),

  routing_intent: z
    .object({
      primary_route: RouteSchema,
      secondary_routes: z.array(ActionRouteSchema),
      reason: z.string(),
      recommended_cta: z.string(),
      confidence: z.number().min(0).max(1),
    })
    .optional(),
});

export type UserNeedProfileFromSchema = z.infer<typeof UserNeedProfileSchema>;

export function validateUserNeedProfile(input: unknown) {
  return UserNeedProfileSchema.parse(input);
}
