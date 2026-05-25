import type { ContentItem } from "./content-schema";
import { buildPersonalityMatchingContext } from "./personality-context";
import type { PersonalityProfile } from "./personality-schema";
import {
  PersonMatchResultSchema,
  type FilteredPerson,
  type PersonMatchItem,
  type PersonMatchResult,
} from "./person-match-schema";
import type { PersonProfile } from "./person-schema";

type CandidatePersonForPrompt = Pick<
  PersonProfile,
  | "id"
  | "display_name"
  | "scene"
  | "role_type"
  | "bio"
  | "expertise_tags"
  | "content_style_tags"
  | "values_tags"
  | "suitable_for"
  | "unsuitable_for"
  | "interaction_boundary"
  | "privacy_level"
  | "connection_intensity"
  | "credibility_signals"
  | "risk_flags"
  | "agent_personality"
  | "sample_questions_to_ask"
  | "linked_group_ids"
  | "authored_content_ids"
>;

type ContentItemForPrompt = Pick<
  ContentItem,
  | "id"
  | "title"
  | "scene"
  | "author_profile_id"
  | "content_type"
  | "summary"
  | "topics"
  | "quality_signals"
  | "filter_risks"
  | "suitable_for"
  | "unsuitable_for"
  | "connection_triggers"
  | "ranking_tags"
>;

export function parsePersonMatchResult(raw: string): PersonMatchResult {
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
    return PersonMatchResultSchema.parse(parsed);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown validation error";
    throw new Error(`Person match JSON validation failed: ${message}`);
  }
}

export function buildPersonMatchingPromptInput(
  profile: unknown,
  people: PersonProfile[],
  contentItems: ContentItem[],
  soulProfile?: PersonalityProfile | null,
): string {
  const candidatePeople: CandidatePersonForPrompt[] = people.map((person) => ({
    id: person.id,
    display_name: person.display_name,
    scene: person.scene,
    role_type: person.role_type,
    bio: person.bio,
    expertise_tags: person.expertise_tags,
    content_style_tags: person.content_style_tags,
    values_tags: person.values_tags,
    suitable_for: person.suitable_for,
    unsuitable_for: person.unsuitable_for,
    interaction_boundary: person.interaction_boundary,
    privacy_level: person.privacy_level,
    connection_intensity: person.connection_intensity,
    credibility_signals: person.credibility_signals,
    risk_flags: person.risk_flags,
    agent_personality: person.agent_personality,
    sample_questions_to_ask: person.sample_questions_to_ask,
    linked_group_ids: person.linked_group_ids,
    authored_content_ids: person.authored_content_ids,
  }));

  const relevantContentItems: ContentItemForPrompt[] = contentItems.map(
    (item) => ({
      id: item.id,
      title: item.title,
      scene: item.scene,
      author_profile_id: item.author_profile_id,
      content_type: item.content_type,
      summary: item.summary,
      topics: item.topics,
      quality_signals: item.quality_signals,
      filter_risks: item.filter_risks,
      suitable_for: item.suitable_for,
      unsuitable_for: item.unsuitable_for,
      connection_triggers: item.connection_triggers,
      ranking_tags: item.ranking_tags,
    }),
  );

  return JSON.stringify(
    {
      task: "match_user_profile_to_candidate_people",
      instruction:
        "请根据 user_profile、candidate_people 和 related_content_items 输出符合 schema 的 JSON。user_profile 是当前具体需求的首要依据；若 long_term_personality 不为空，将它作为长期价值、能量与边界适配的辅助依据，并在理由或风险中体现。只使用候选人物中的 person_id。为了避免输出过长，请只返回 3 个 matches 和 1 个 filtered_out；reason、risk、summary 字段保持一句话；relevant_content_ids 只选择该人物 authored_content_ids 中最相关的 1-2 条。",
      user_profile: profile,
      long_term_personality: buildPersonalityMatchingContext(soulProfile),
      candidate_people: candidatePeople,
      related_content_items: relevantContentItems,
    },
    null,
    2,
  );
}

function getAuthoredContents(
  person: PersonProfile,
  contentItemsById: Map<string, ContentItem>,
  relevantContentIds?: string[],
) {
  const validRelevantContentIds = relevantContentIds?.filter((contentId) => {
    const item = contentItemsById.get(contentId);
    return item?.author_profile_id === person.id;
  });

  const contentIds =
    validRelevantContentIds && validRelevantContentIds.length > 0
      ? validRelevantContentIds
      : person.authored_content_ids;

  return contentIds.flatMap((contentId) => {
    const item = contentItemsById.get(contentId);
    return item ? [item] : [];
  });
}

export function attachPersonProfiles(
  result: PersonMatchResult,
  people: PersonProfile[],
  contentItems: ContentItem[],
) {
  const peopleById = new Map(people.map((person) => [person.id, person]));
  const contentItemsById = new Map(
    contentItems.map((item) => [item.id, item]),
  );

  const matchedPeople = result.matches.flatMap((match: PersonMatchItem) => {
    const person = peopleById.get(match.person_id);
    if (!person) return [];

    return [
      {
        ...match,
        person: {
          ...person,
          authoredContents: getAuthoredContents(
            person,
            contentItemsById,
            match.relevant_content_ids,
          ),
        },
      },
    ];
  });

  const filteredPeople = result.filtered_out.flatMap(
    (filtered: FilteredPerson) => {
      const person = peopleById.get(filtered.person_id);
      if (!person) return [];

      return [
        {
          ...filtered,
          person: {
            ...person,
            authoredContents: getAuthoredContents(person, contentItemsById),
          },
        },
      ];
    },
  );

  return {
    matchedPeople,
    filteredPeople,
  };
}
