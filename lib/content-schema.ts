import { z } from "zod";

export const ContentItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  scene: z.string(),
  source: z.enum([
    "qq_space",
    "authorized_group",
    "group_doc",
    "author_post",
    "event_note",
  ]),
  author_label: z.string(),
  author_profile_id: z.string(),
  linked_group_ids: z.array(z.string()),
  content_type: z.string(),
  summary: z.string(),
  body: z.string(),
  topics: z.array(z.string()),
  preferred_forms: z.array(z.string()),
  quality_signals: z.array(z.string()),
  filter_risks: z.array(z.string()),
  suitable_for: z.array(z.string()),
  unsuitable_for: z.array(z.string()),
  connection_triggers: z.array(z.string()),
  ranking_tags: z.array(z.string()),
});

export const ContentItemListSchema = z.array(ContentItemSchema);

export type ContentItem = z.infer<typeof ContentItemSchema>;
