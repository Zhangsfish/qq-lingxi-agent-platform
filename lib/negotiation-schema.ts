import { z } from "zod";
import { ContentItemSchema } from "./content-schema";
import { GroupProfileSchema } from "./group-schema";
import { PersonProfileSchema } from "./person-schema";

export const NegotiationTargetTypeSchema = z.enum(["group", "person"]);
export const NegotiationSourceSchema = z.enum([
  "group_match",
  "people_match",
  "realm_content",
]);

export const NegotiationTranscriptItemSchema = z.object({
  speaker: z.enum(["user_agent", "group_agent", "person_agent"]),
  message: z.string(),
  purpose: z.string(),
});

export const NegotiationResultSchema = z.object({
  target_type: NegotiationTargetTypeSchema,
  target_id: z.string(),
  source: NegotiationSourceSchema,
  content_id: z.string().nullable(),
  fit_score: z.number().min(0).max(100),
  decision: z.enum(["recommend", "consider_with_caution", "not_recommended"]),
  negotiation_transcript: z.array(NegotiationTranscriptItemSchema),
  key_alignment: z.array(z.string()),
  key_risks: z.array(z.string()),
  open_questions: z.array(z.string()),
  summary_for_user: z.string(),
  summary_for_target_agent: z.string(),
  next_action: z.string(),
  draft_message: z.string(),
  confidence: z.number().min(0).max(1),
});

export type NegotiationTargetType = z.infer<
  typeof NegotiationTargetTypeSchema
>;
export type NegotiationSource = z.infer<typeof NegotiationSourceSchema>;
export type NegotiationTranscriptItem = z.infer<
  typeof NegotiationTranscriptItemSchema
>;
export type NegotiationResult = z.infer<typeof NegotiationResultSchema>;

export type NegotiationRequest = {
  profile: unknown;
  targetType: NegotiationTargetType;
  targetId: string;
  source: NegotiationSource;
  contentId?: string | null;
};

export type NegotiationResponse = {
  result: NegotiationResult;
  target:
    | { type: "group"; profile: z.infer<typeof GroupProfileSchema> }
    | { type: "person"; profile: z.infer<typeof PersonProfileSchema> };
  sourceContent?: z.infer<typeof ContentItemSchema> | null;
  rawContent: string;
};
