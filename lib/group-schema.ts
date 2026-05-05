import { z } from "zod";

export const GroupProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  scene: z.string(),
  category: z.string(),
  description: z.string(),
  culture_tags: z.array(z.string()),
  suitable_for: z.array(z.string()),
  unsuitable_for: z.array(z.string()),
  entry_rules: z.array(z.string()),
  member_size: z.number(),
  activity_level: z.enum(["low", "medium", "high"]),
  connection_intensity: z.enum(["weak", "medium", "strong", "mixed"]),
  privacy_level: z.enum(["open", "approval", "strict"]),
  group_personality: z.string(),
  sample_topics: z.array(z.string()),
  content_assets: z.array(z.string()),
  risk_flags: z.array(z.string()),
});

export const GroupProfileListSchema = z.array(GroupProfileSchema);

export type GroupProfile = z.infer<typeof GroupProfileSchema>;
