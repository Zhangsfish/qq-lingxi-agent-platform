export type RoutingIntentRoute =
  | "person_first"
  | "group_first"
  | "content_first"
  | "mixed"
  | "uncertain";

export type RoutingIntentActionRoute =
  | "person_first"
  | "group_first"
  | "content_first";

export type RoutingIntent = {
  primary_route: RoutingIntentRoute;
  secondary_routes: RoutingIntentActionRoute[];
  reason: string;
  recommended_cta: string;
  confidence: number;
};

export type UserNeedProfile = {
  scene: string;
  surface_need: string;
  core_need: string;
  summary: string;
  content_channel: {
    content_need: string;
    content_topics: string[];
    preferred_content_forms: string[];
    content_depth: string;
    content_use_case: string;
    content_ranking_criteria: string[];
    content_to_filter: string[];
    publishable_content_angle: string[];
    comment_interaction_style: string;
    content_to_connection_triggers: string[];
  };
  connection_channel: {
    relationship_need: string;
    target_community_type: string;
    connection_intensity: string;
    suitable_group_traits: string[];
    unsuitable_group_traits: string[];
    matching_criteria: string[];
    summary_for_matchmaker_agent: string;
    summary_for_group_agent: string;
  };
  identity_slice: {
    identity_slice_to_show: string[];
    identity_slice_to_hide: string[];
    self_presentation: string;
    privacy_boundary: string[];
  };
  preference_model: {
    interests: string[];
    preferred_atmosphere: string[];
    disliked_atmosphere: string[];
    boundaries: string[];
    risk_signals: string[];
    uncertainty: string[];
    questions_for_next_round: string[];
    confidence: number;
  };
  routing_intent?: RoutingIntent;
};

export type UserProfileExtractRequest = {
  messages: {
    role: "user" | "assistant";
    content: string;
  }[];
};

export type UserProfileExtractResponse = {
  profile: UserNeedProfile;
  rawContent: string;
};
