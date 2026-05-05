import { z } from "zod";

export const PersonProfileSchema = z.object({
  id: z.string(),
  display_name: z.string(),
  scene: z.string(),
  role_type: z.string(),
  bio: z.string(),
  expertise_tags: z.array(z.string()),
  content_style_tags: z.array(z.string()),
  values_tags: z.array(z.string()),
  suitable_for: z.array(z.string()),
  unsuitable_for: z.array(z.string()),
  interaction_boundary: z.array(z.string()),
  privacy_level: z.enum(["low", "medium", "high"]),
  connection_intensity: z.enum(["weak", "medium", "strong", "mixed"]),
  credibility_signals: z.array(z.string()),
  risk_flags: z.array(z.string()),
  agent_personality: z.string(),
  sample_questions_to_ask: z.array(z.string()),
  linked_group_ids: z.array(z.string()),
  authored_content_ids: z.array(z.string()),
});

export const PersonProfileListSchema = z.array(PersonProfileSchema);

export type PersonProfile = z.infer<typeof PersonProfileSchema>;
