import type { ContentItem } from "./content-schema";
import type { GroupProfile } from "./group-schema";
import {
  RealmRecommendationResultSchema,
  type RealmFilteredItem,
  type RealmRecommendationResult,
  type RealmRecommendedItem,
} from "./realm-recommendation-schema";
import type { PersonProfile } from "./person-schema";

type ContentItemForPrompt = Pick<
  ContentItem,
  | "id"
  | "title"
  | "scene"
  | "source"
  | "author_profile_id"
  | "linked_group_ids"
  | "content_type"
  | "summary"
  | "body"
  | "topics"
  | "preferred_forms"
  | "quality_signals"
  | "filter_risks"
  | "suitable_for"
  | "unsuitable_for"
  | "connection_triggers"
  | "ranking_tags"
>;

type PersonForPrompt = Pick<
  PersonProfile,
  | "id"
  | "display_name"
  | "scene"
  | "role_type"
  | "bio"
  | "expertise_tags"
  | "content_style_tags"
  | "values_tags"
  | "credibility_signals"
  | "risk_flags"
  | "interaction_boundary"
>;

type GroupForPrompt = Pick<
  GroupProfile,
  | "id"
  | "name"
  | "scene"
  | "category"
  | "description"
  | "culture_tags"
  | "group_personality"
  | "risk_flags"
>;

export function parseRealmRecommendationResult(
  raw: string,
): RealmRecommendationResult {
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
    return RealmRecommendationResultSchema.parse(parsed);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown validation error";
    throw new Error(`Realm recommendation JSON validation failed: ${message}`);
  }
}

export function buildRealmRecommendationPromptInput(args: {
  profile: unknown;
  contentItems: ContentItem[];
  people: PersonProfile[];
  groups: GroupProfile[];
}): string {
  const candidateContent: ContentItemForPrompt[] = args.contentItems.map(
    (item) => ({
      id: item.id,
      title: item.title,
      scene: item.scene,
      source: item.source,
      author_profile_id: item.author_profile_id,
      linked_group_ids: item.linked_group_ids,
      content_type: item.content_type,
      summary: item.summary,
      body: item.body,
      topics: item.topics,
      preferred_forms: item.preferred_forms,
      quality_signals: item.quality_signals,
      filter_risks: item.filter_risks,
      suitable_for: item.suitable_for,
      unsuitable_for: item.unsuitable_for,
      connection_triggers: item.connection_triggers,
      ranking_tags: item.ranking_tags,
    }),
  );
  const authors: PersonForPrompt[] = args.people.map((person) => ({
    id: person.id,
    display_name: person.display_name,
    scene: person.scene,
    role_type: person.role_type,
    bio: person.bio,
    expertise_tags: person.expertise_tags,
    content_style_tags: person.content_style_tags,
    values_tags: person.values_tags,
    credibility_signals: person.credibility_signals,
    risk_flags: person.risk_flags,
    interaction_boundary: person.interaction_boundary,
  }));
  const linkedGroups: GroupForPrompt[] = args.groups.map((group) => ({
    id: group.id,
    name: group.name,
    scene: group.scene,
    category: group.category,
    description: group.description,
    culture_tags: group.culture_tags,
    group_personality: group.group_personality,
    risk_flags: group.risk_flags,
  }));

  return JSON.stringify(
    {
      task: "recommend_realm_content_for_user_profile",
      instruction:
        "请根据 user_profile、candidate_content_items、authors 和 linked_groups 输出符合 schema 的 JSON。为了避免输出过长，只返回 6 个 recommended_items 和 2 个 filtered_out；reason、risk、summary 字段保持一句话。connectable_targets 只使用内容的 author_profile_id 或 linked_group_ids。",
      user_profile: args.profile,
      candidate_content_items: candidateContent,
      authors,
      linked_groups: linkedGroups,
    },
    null,
    2,
  );
}

function attachContentData(
  content: ContentItem,
  peopleById: Map<string, PersonProfile>,
  groupsById: Map<string, GroupProfile>,
) {
  return {
    ...content,
    author: peopleById.get(content.author_profile_id) ?? null,
    linkedGroups: content.linked_group_ids.flatMap((groupId) => {
      const group = groupsById.get(groupId);
      return group ? [group] : [];
    }),
  };
}

export function attachRealmRecommendationData(args: {
  result: RealmRecommendationResult;
  contentItems: ContentItem[];
  people: PersonProfile[];
  groups: GroupProfile[];
}) {
  const contentById = new Map(
    args.contentItems.map((content) => [content.id, content]),
  );
  const peopleById = new Map(args.people.map((person) => [person.id, person]));
  const groupsById = new Map(args.groups.map((group) => [group.id, group]));

  const recommendedItems = args.result.recommended_items.flatMap(
    (item: RealmRecommendedItem) => {
      const content = contentById.get(item.content_id);
      if (!content) return [];
      return [
        {
          ...item,
          content: attachContentData(content, peopleById, groupsById),
        },
      ];
    },
  );

  const filteredItems = args.result.filtered_out.flatMap(
    (item: RealmFilteredItem) => {
      const content = contentById.get(item.content_id);
      if (!content) return [];
      return [
        {
          ...item,
          content: attachContentData(content, peopleById, groupsById),
        },
      ];
    },
  );

  return {
    recommendedItems,
    filteredItems,
  };
}
