import type { ContentItem } from "./content-schema";
import type { GroupProfile } from "./group-schema";
import {
  NegotiationResultSchema,
  type NegotiationRequest,
  type NegotiationResult,
} from "./negotiation-schema";
import type { PersonProfile } from "./person-schema";

type NegotiationTarget =
  | { type: "group"; profile: GroupProfile }
  | { type: "person"; profile: PersonProfile };

type GroupTargetForPrompt = Pick<
  GroupProfile,
  | "id"
  | "name"
  | "scene"
  | "category"
  | "description"
  | "culture_tags"
  | "suitable_for"
  | "unsuitable_for"
  | "entry_rules"
  | "activity_level"
  | "connection_intensity"
  | "privacy_level"
  | "group_personality"
  | "sample_topics"
  | "risk_flags"
>;

type PersonTargetForPrompt = Pick<
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

type SourceContentForPrompt = Pick<
  ContentItem,
  | "id"
  | "title"
  | "scene"
  | "author_profile_id"
  | "linked_group_ids"
  | "content_type"
  | "summary"
  | "topics"
  | "quality_signals"
  | "filter_risks"
  | "connection_triggers"
  | "ranking_tags"
>;

function buildTargetForPrompt(
  target: NegotiationTarget,
): GroupTargetForPrompt | PersonTargetForPrompt {
  if (target.type === "group") {
    const group = target.profile;
    return {
      id: group.id,
      name: group.name,
      scene: group.scene,
      category: group.category,
      description: group.description,
      culture_tags: group.culture_tags,
      suitable_for: group.suitable_for,
      unsuitable_for: group.unsuitable_for,
      entry_rules: group.entry_rules,
      activity_level: group.activity_level,
      connection_intensity: group.connection_intensity,
      privacy_level: group.privacy_level,
      group_personality: group.group_personality,
      sample_topics: group.sample_topics,
      risk_flags: group.risk_flags,
    };
  }

  const person = target.profile;
  return {
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
  };
}

function buildSourceContentForPrompt(
  sourceContent?: ContentItem | null,
): SourceContentForPrompt | null {
  if (!sourceContent) return null;

  return {
    id: sourceContent.id,
    title: sourceContent.title,
    scene: sourceContent.scene,
    author_profile_id: sourceContent.author_profile_id,
    linked_group_ids: sourceContent.linked_group_ids,
    content_type: sourceContent.content_type,
    summary: sourceContent.summary,
    topics: sourceContent.topics,
    quality_signals: sourceContent.quality_signals,
    filter_risks: sourceContent.filter_risks,
    connection_triggers: sourceContent.connection_triggers,
    ranking_tags: sourceContent.ranking_tags,
  };
}

export function parseNegotiationResult(raw: string): NegotiationResult {
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
    return NegotiationResultSchema.parse(parsed);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown validation error";
    throw new Error(`Negotiation JSON validation failed: ${message}`);
  }
}

export function buildNegotiationPromptInput(args: {
  request: NegotiationRequest;
  profile: unknown;
  target: NegotiationTarget;
  sourceContent?: ContentItem | null;
}): string {
  return JSON.stringify(
    {
      task: "agent_to_agent_negotiation",
      instruction:
        "请根据 user_profile、target_profile 和 sourceContent 输出符合 schema 的 JSON。transcript 控制在 4 条，summary、risk、next_action、draft_message 保持简洁。target_type、target_id、source、content_id 必须与 request 一致。",
      request: {
        targetType: args.request.targetType,
        targetId: args.request.targetId,
        source: args.request.source,
        contentId: args.request.contentId ?? null,
      },
      user_profile: args.profile,
      target_type: args.target.type,
      target_profile: buildTargetForPrompt(args.target),
      source: args.request.source,
      sourceContent: buildSourceContentForPrompt(args.sourceContent),
    },
    null,
    2,
  );
}
