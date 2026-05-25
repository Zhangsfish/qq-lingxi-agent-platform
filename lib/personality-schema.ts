export type Confidence = "high" | "medium" | "low";

export type AxisResult = {
  leaning: string;
  evidence: string[];
  counter_evidence: string[];
  confidence: Confidence;
};

export type MbtiLikeProfile = {
  type_guess: string;
  candidate_types: string[];
  axis_analysis: {
    E_I: AxisResult;
    S_N: AxisResult;
    T_F: AxisResult;
    J_P: AxisResult;
  };
};

export type SoulProfile = {
  persona_name: string;
  core_theme: string[];
  value_rank: string[];
  not_to_do_list: string[];
  energy_mechanism: string[];
  capability_stack: string[];
  world_model: string[];
  risk_blindspots: string[];
};

export type PersonalityProfile = {
  mbti_like: MbtiLikeProfile;
  soul_profile: SoulProfile;
  needs_verification: string[];
};

export type PersonalityQuestion = {
  id: string;
  question_index: number;
  title: string;
  verify_target: string;
  why_asking: string;
  question: string;
  answer_hint: string;
  field_to_update: string;
  target_dimensions: string[];
  needs_followup_if_unclear: boolean;
  seed_basis?: string;
};

export type PersonalityAnswer = {
  question_id: string;
  user_answer: string;
  followups: string[];
  updated_fields: string[];
  is_clear: boolean;
};

export type PersonalityTurnEvaluation = {
  is_clear: boolean;
  updated_fields: string[];
  short_feedback: string;
  followup_question?: string;
  needs_verification?: string[];
};

export type PersonalityRespondMode =
  | "build_question_plan"
  | "ask_question"
  | "evaluate_answer"
  | "build_q12_draft"
  | "finalize_profile";

export type PersonalityTestPhase =
  | "seed"
  | "questioning"
  | "final_ready"
  | "finished";

export type PersonalityTestState = {
  initial_seed: string;
  phase: PersonalityTestPhase;
  current_question_index: number;
  questions: PersonalityQuestion[];
  answers: PersonalityAnswer[];
  needs_verification: string[];
  pending_answer?: PersonalityAnswer;
  followup_count?: number;
  temporary_profile?: Partial<PersonalityProfile>;
  q12_draft?: string;
  final_profile?: PersonalityProfile;
  raw_content?: string;
  is_fallback?: boolean;
};

export type PersonalityRespondRequest = {
  initial_seed: string;
  messages: {
    role: "user" | "assistant";
    content: string;
  }[];
  state: PersonalityTestState;
};

export type PersonalityRespondResponse = {
  assistant_message: string;
  state: PersonalityTestState;
  final_profile?: PersonalityProfile;
  raw_content?: string;
  is_final_ready: boolean;
  parse_error?: string;
  mode?: PersonalityRespondMode;
  model_called?: boolean;
  is_fallback?: boolean;
};

export function extractJsonBlock(text: string): string | null {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1);
  }

  return null;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isAxisResult(value: unknown): value is AxisResult {
  if (!isRecord(value)) return false;
  return (
    typeof value.leaning === "string" &&
    isStringArray(value.evidence) &&
    isStringArray(value.counter_evidence) &&
    (value.confidence === "high" ||
      value.confidence === "medium" ||
      value.confidence === "low")
  );
}

export function isPersonalityProfile(
  value: unknown,
): value is PersonalityProfile {
  if (!isRecord(value)) return false;

  const mbtiLike = value.mbti_like;
  const soulProfile = value.soul_profile;
  if (!isRecord(mbtiLike) || !isRecord(soulProfile)) return false;
  if (!isRecord(mbtiLike.axis_analysis)) return false;

  return (
    typeof mbtiLike.type_guess === "string" &&
    isStringArray(mbtiLike.candidate_types) &&
    isAxisResult(mbtiLike.axis_analysis.E_I) &&
    isAxisResult(mbtiLike.axis_analysis.S_N) &&
    isAxisResult(mbtiLike.axis_analysis.T_F) &&
    isAxisResult(mbtiLike.axis_analysis.J_P) &&
    typeof soulProfile.persona_name === "string" &&
    isStringArray(soulProfile.core_theme) &&
    isStringArray(soulProfile.value_rank) &&
    isStringArray(soulProfile.not_to_do_list) &&
    isStringArray(soulProfile.energy_mechanism) &&
    isStringArray(soulProfile.capability_stack) &&
    isStringArray(soulProfile.world_model) &&
    isStringArray(soulProfile.risk_blindspots) &&
    isStringArray(value.needs_verification)
  );
}
