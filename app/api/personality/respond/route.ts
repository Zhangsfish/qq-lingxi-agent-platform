import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { callSiliconFlow } from "@/lib/siliconflow";
import {
  extractJsonBlock,
  isPersonalityProfile,
  isRecord,
  type PersonalityAnswer,
  type PersonalityProfile,
  type PersonalityQuestion,
  type PersonalityRespondMode,
  type PersonalityRespondRequest,
  type PersonalityRespondResponse,
  type PersonalityTestState,
  type PersonalityTurnEvaluation,
} from "@/lib/personality-schema";

const personalityQuestions: PersonalityQuestion[] = [
  {
    id: "q1_energy",
    question_index: 1,
    title: "Q1：你从哪里恢复能量",
    verify_target: "E/I：外部互动还是独处整理更补充能量",
    why_asking: "先确认你的恢复方式，避免把表达活跃误判为真正的能量来源。",
    question:
      "经历一段高强度学习、工作或项目后，什么最能让你恢复状态：和人高质量讨论，还是一个人安静整理？请讲一个最近的真实场景。",
    answer_hint: "描述当时怎么恢复、为什么有效，以及什么会让你更累。",
    field_to_update: "mbti_like.axis_analysis.E_I",
    target_dimensions: ["E/I", "energy_source"],
    needs_followup_if_unclear: true,
  },
  {
    id: "q2_information",
    question_index: 2,
    title: "Q2：你怎么理解新东西",
    verify_target: "S/N：具体事实步骤还是抽象结构趋势",
    why_asking: "了解你的信息入口，才能区分案例偏好与抽象推理偏好。",
    question:
      "面对一个新方向，你通常先找真实案例和具体路径，还是先建立框架、趋势和底层机制？请举一个最近学习新东西的例子。",
    answer_hint: "比较你喜欢的资料类型、笔记方式和判断依据。",
    field_to_update: "mbti_like.axis_analysis.S_N",
    target_dimensions: ["S/N", "information_style"],
    needs_followup_if_unclear: true,
  },
  {
    id: "q3_decision",
    question_index: 3,
    title: "Q3：冲突时你先保护什么",
    verify_target: "T/F：原则效率还是关系感受",
    why_asking: "冲突情境更容易显露你真实的判断权重。",
    question:
      "团队或关系里出现分歧时，你更容易先保护规则、效率和逻辑一致性，还是先照顾人的状态和关系感受？请讲一个取舍场景。",
    answer_hint: "说明当时最怕损失什么，以及最后怎么判断。",
    field_to_update: "mbti_like.axis_analysis.T_F",
    target_dimensions: ["T/F", "decision_weight"],
    needs_followup_if_unclear: true,
  },
  {
    id: "q4_closure",
    question_index: 4,
    title: "Q4：你如何从探索走向决定",
    verify_target: "J/P：路线图闭环还是开放试探",
    why_asking: "长期任务中的推进习惯比单次计划更能说明你的闭合方式。",
    question:
      "做长期任务时，你更需要清晰路线图和截止点，还是更喜欢先试探、边走边调？什么情况下你会从开放探索切到明确执行？",
    answer_hint: "描述一个你推进论文、课程或项目的过程。",
    field_to_update: "mbti_like.axis_analysis.J_P",
    target_dimensions: ["J/P", "closure_style"],
    needs_followup_if_unclear: true,
  },
  {
    id: "q5_core_theme",
    question_index: 5,
    title: "Q5：你总被什么问题抓住",
    verify_target: "长期反复吸引你的核心问题",
    why_asking: "人格层不仅要给出类型，也要提炼你长期投入的主题。",
    question:
      "如果回看过去一年，你反复想、反复聊、反复想解决的核心问题是什么？它为什么一直抓住你？",
    answer_hint: "可以是成长、判断力、转型、真实经验、关系边界或创造表达。",
    field_to_update: "soul_profile.core_theme",
    target_dimensions: ["core_theme"],
    needs_followup_if_unclear: true,
  },
  {
    id: "q6_values",
    question_index: 6,
    title: "Q6：你的价值优先级",
    verify_target: "冲突时保护什么、牺牲什么",
    why_asking: "排序比口号更能形成后续匹配中的边界依据。",
    question:
      "如果真实、效率、自由、稳定、被认可、长期成长发生冲突，你最会保护哪两个？最愿意牺牲哪一个？",
    answer_hint: "按优先级说，并补一句原因或真实取舍。",
    field_to_update: "soul_profile.value_rank",
    target_dimensions: ["value_rank"],
    needs_followup_if_unclear: true,
  },
  {
    id: "q7_not_to_do",
    question_index: 7,
    title: "Q7：什么会让你不像自己",
    verify_target: "哪些事会让你长期枯萎",
    why_asking: "明确不适配条件，才能在推荐时避免消耗型连接。",
    question:
      "什么样的任务、关系或环境会让你很快失去能量，甚至觉得自己被消耗、被控制、变得不像自己？",
    answer_hint: "给出具体触发点，如无意义重复、过度表演或无边界消耗。",
    field_to_update: "soul_profile.not_to_do_list",
    target_dimensions: ["not_to_do_list", "boundaries"],
    needs_followup_if_unclear: true,
  },
  {
    id: "q8_energy",
    question_index: 8,
    title: "Q8：什么让你越做越强",
    verify_target: "越做越强和迅速耗竭的机制",
    why_asking: "这部分会补充 MBTI 无法描述的持续投入机制。",
    question:
      "哪些事情会让你越做越兴奋、越做越清醒？哪些事情会让你迅速耗竭？二者的差别是什么？",
    answer_hint: "尽量说明机制，而不只是活动名称。",
    field_to_update: "soul_profile.energy_mechanism",
    target_dimensions: ["energy_mechanism"],
    needs_followup_if_unclear: true,
  },
  {
    id: "q9_capability",
    question_index: 9,
    title: "Q9：你靠什么自然胜出",
    verify_target: "自然胜出与可复制能力",
    why_asking: "后续连接建议需要知道你能贡献和持续积累的部分。",
    question:
      "别人通常会在哪些事情上来找你帮忙？这些能力里，哪些是你自然擅长的，哪些是后来训练出来的？",
    answer_hint: "结合学习、研究、写作、组织、分析或沟通举例。",
    field_to_update: "soul_profile.capability_stack",
    target_dimensions: ["capability_stack"],
    needs_followup_if_unclear: true,
  },
  {
    id: "q10_world_model",
    question_index: 10,
    title: "Q10：你如何判断机会",
    verify_target: "如何判断机会、路径、组织和社会结构",
    why_asking: "你的投入标准会影响适合进入的内容与连接环境。",
    question:
      "当你判断一个机会、方向、团队或圈子值不值得投入时，你最看重哪些信号？哪些信号会让你迅速警惕？",
    answer_hint: "说出你相信的长期规律，或明确不相信的信号。",
    field_to_update: "soul_profile.world_model",
    target_dimensions: ["world_model"],
    needs_followup_if_unclear: true,
  },
  {
    id: "q11_risk",
    question_index: 11,
    title: "Q11：你容易在哪里误判",
    verify_target: "容易误判的位置",
    why_asking: "识别盲点能让人格结论保留必要的反证和提醒。",
    question:
      "你觉得自己最容易在哪类事情上误判？请说一个后来意识到偏差的例子。",
    answer_hint: "例如过度抽象、低估执行、低估关系成本或过度理想化。",
    field_to_update: "soul_profile.risk_blindspots",
    target_dimensions: ["risk_blindspots"],
    needs_followup_if_unclear: true,
  },
  {
    id: "q12_draft",
    question_index: 12,
    title: "Q12：校准你的灵犀人格草案",
    verify_target: "最终画像是否被你本人认可",
    why_asking: "最后由你确认草案中的准确处、偏差和缺口。",
    question:
      "请看上面的暂定人格草案：哪三处最准？哪一处最不准？还缺少什么关键点？",
    answer_hint: "按 1. 最准三处 2. 最不准一处 3. 缺少的关键点 回答。",
    field_to_update: "final_profile_calibration",
    target_dimensions: ["calibration"],
    needs_followup_if_unclear: true,
  },
];

function compactText(text: string, maxLength = 120) {
  const compacted = text.replace(/\s+/g, " ").trim();
  if (compacted.length <= maxLength) return compacted;
  return `${compacted.slice(0, maxLength)}...`;
}

function buildSeedSummary(initialSeed: string) {
  const compacted = initialSeed.replace(/\s+/g, " ").trim();
  if (!compacted) {
    return "初始画像暂时较少，我会先建立一份可以继续确认的人格画像。";
  }

  const sentences = compacted
    .split(/(?<=[。！？!?])\s*/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, 3);

  return compactText(sentences.join(" "), 180);
}

function isPersonalityRespondRequest(
  body: unknown,
): body is PersonalityRespondRequest {
  if (!body || typeof body !== "object") return false;
  const candidate = body as Partial<PersonalityRespondRequest>;
  return (
    typeof candidate.initial_seed === "string" &&
    Array.isArray(candidate.messages) &&
    Boolean(candidate.state)
  );
}

async function loadPersonalityPrompt() {
  const filePath = path.join(
    process.cwd(),
    "agents",
    "personality_distiller_agent.md",
  );
  return fs.readFile(filePath, "utf-8");
}

function logPersonalityRun(
  mode: PersonalityRespondMode,
  startedAt: number,
  outcome: "success" | "fallback" | "no_call",
) {
  console.info(
    `[personality/respond] mode=${mode} modelCall=${outcome !== "no_call"} outcome=${outcome} durationMs=${Date.now() - startedAt}`,
  );
}

function createInitialState(initialSeed: string): PersonalityTestState {
  return {
    initial_seed: initialSeed,
    phase: "questioning",
    current_question_index: 0,
    questions: personalityQuestions,
    answers: [],
    needs_verification: [],
    is_fallback: false,
  };
}

function answerSnippet(state: PersonalityTestState, questionId: string) {
  const answer = state.answers.find((item) => item.question_id === questionId);
  return answer ? compactText(answer.user_answer, 48) : "仍待 Q12 确认";
}

function buildDraftFromAnswers(state: PersonalityTestState) {
  return [
    "根据前 11 题，我先给出一个暂定人格草案，供你确认：",
    "",
    `- MBTI-like：需要综合四轴回答校准。Q1 线索：${answerSnippet(state, "q1_energy")}；Q2 线索：${answerSnippet(state, "q2_information")}。`,
    "- 灵犀人格名：由最终校准结果生成。",
    `- 核心母题：${answerSnippet(state, "q5_core_theme")}。`,
    `- 最重要价值：${answerSnippet(state, "q6_values")}。`,
    `- 最硬不为清单：${answerSnippet(state, "q7_not_to_do")}。`,
    `- 最强能力结构：${answerSnippet(state, "q9_capability")}。`,
    `- 最大风险盲区：${answerSnippet(state, "q11_risk")}。`,
  ].join("\n");
}

function summarizeAnswers(state: PersonalityTestState) {
  return state.answers.map((answer, index) => ({
    question_index: index + 1,
    question_id: answer.question_id,
    answer: compactText(answer.user_answer, 300),
    updated_fields: answer.updated_fields,
    is_clear: answer.is_clear,
  }));
}

function parseModelJson(rawContent: string) {
  const jsonBlock = extractJsonBlock(rawContent);
  if (!jsonBlock) throw new Error("Model did not return JSON");
  return JSON.parse(jsonBlock) as unknown;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function questionFromModel(
  candidate: unknown,
  fallback: PersonalityQuestion,
): PersonalityQuestion | null {
  const questionCandidate =
    isRecord(candidate) && isRecord(candidate.next_question)
      ? candidate.next_question
      : candidate;
  if (!isRecord(questionCandidate)) return null;

  const title = questionCandidate.question_title;
  const whyAsking = questionCandidate.why_asking;
  const questionText = questionCandidate.question_text;
  const answerHint = questionCandidate.answer_hint;
  const dimensions = questionCandidate.target_dimensions;
  if (
    typeof title !== "string" ||
    typeof whyAsking !== "string" ||
    typeof questionText !== "string" ||
    typeof answerHint !== "string" ||
    !isStringArray(dimensions)
  ) {
    return null;
  }

  return {
    ...fallback,
    title,
    why_asking: whyAsking,
    question: questionText,
    answer_hint: answerHint,
    target_dimensions: dimensions,
    needs_followup_if_unclear:
      typeof questionCandidate.needs_followup_if_unclear === "boolean"
        ? questionCandidate.needs_followup_if_unclear
        : true,
    seed_basis:
      typeof questionCandidate.seed_basis === "string"
        ? questionCandidate.seed_basis
        : undefined,
  };
}

async function generateQuestion(
  state: PersonalityTestState,
  questionIndex: number,
  mode: "build_question_plan" | "ask_question",
) {
  const startedAt = Date.now();
  const fallback = personalityQuestions[questionIndex];

  try {
    const rawContent = await callSiliconFlow(
      await loadPersonalityPrompt(),
      [
        {
          role: "user",
          content: JSON.stringify(
            {
              task:
                mode === "build_question_plan"
                  ? "build_first_customized_question"
                  : "build_next_customized_question",
              initial_personality_seed: state.initial_seed,
              completed_answers: summarizeAnswers(state),
              fixed_validation_slot: fallback,
              q12_draft: state.q12_draft ?? null,
              output_schema: {
                question_index: fallback.question_index,
                question_title: "Qx：简短标题",
                why_asking: "结合已有材料，说明本题为什么需要问",
                question_text: "只问一个可以通过真实场景回答的问题",
                answer_hint: "用户怎样回答更有帮助",
                target_dimensions: fallback.target_dimensions,
                needs_followup_if_unclear: true,
                seed_basis: "本题引用的 Seed 或前序回答线索",
              },
              constraints: [
                "必须覆盖 fixed_validation_slot 的维度和更新字段，不得改题号。",
                "问题必须参考 Seed 或已答内容，不能只复述固定模板。",
                "不得要求用户披露敏感隐私原文。",
                "仅返回 JSON，不返回 markdown。",
              ],
            },
            null,
            2,
          ),
        },
      ],
      {
        maxRetries: 0,
        maxTokens: 900,
        temperature: 0.45,
        timeoutMs: 45_000,
      },
    );
    const generated = questionFromModel(parseModelJson(rawContent), fallback);
    if (!generated) throw new Error("Question JSON validation failed");
    logPersonalityRun(mode, startedAt, "success");
    return { question: generated, isFallback: false };
  } catch {
    logPersonalityRun(mode, startedAt, "fallback");
    return {
      question: {
        ...fallback,
        seed_basis: buildSeedSummary(state.initial_seed),
      },
      isFallback: true,
    };
  }
}

function fallbackEvaluation(
  question: PersonalityQuestion,
  userAnswer: string,
): PersonalityTurnEvaluation {
  const isClear = userAnswer.trim().length >= 16;
  return {
    is_clear: isClear,
    updated_fields: [question.field_to_update],
    short_feedback: isClear
      ? "这段回答包含了可以用于校准的场景或取舍。"
      : "这段回答还不足以稳定判断该维度。",
    followup_question: isClear
      ? undefined
      : `请为“${question.verify_target}”补一个具体场景、原因或取舍边界。`,
    needs_verification: isClear ? [] : [`${question.title} 还需要确认`],
  };
}

async function evaluateAnswer(
  state: PersonalityTestState,
  question: PersonalityQuestion,
  userAnswer: string,
) {
  const startedAt = Date.now();
  try {
    const rawContent = await callSiliconFlow(
      await loadPersonalityPrompt(),
      [
        {
          role: "user",
          content: JSON.stringify(
            {
              task: "evaluate_personality_answer",
              initial_personality_seed: state.initial_seed,
              completed_answers: summarizeAnswers(state),
              current_question: question,
              user_answer: userAnswer,
              output_schema: {
                is_clear: true,
                updated_fields: [question.field_to_update],
                short_feedback: "一句用户可读反馈",
                followup_question: "仅在不清晰时返回的一次追问",
                needs_verification: ["仅在证据不足时记录"],
              },
              constraints: [
                "回答清晰需要包含偏向、场景或可判断的取舍。",
                "只评估当前字段，不输出最终人格。",
                "每道主问题最多允许一次追问。",
                "仅返回 JSON。",
              ],
            },
            null,
            2,
          ),
        },
      ],
      {
        maxRetries: 0,
        maxTokens: 600,
        temperature: 0.2,
        timeoutMs: 45_000,
      },
    );
    const parsed = parseModelJson(rawContent);
    if (
      !isRecord(parsed) ||
      typeof parsed.is_clear !== "boolean" ||
      typeof parsed.short_feedback !== "string" ||
      !isStringArray(parsed.updated_fields)
    ) {
      throw new Error("Evaluation JSON validation failed");
    }
    const evaluation: PersonalityTurnEvaluation = {
      is_clear: parsed.is_clear,
      updated_fields:
        parsed.updated_fields.length > 0
          ? parsed.updated_fields
          : [question.field_to_update],
      short_feedback: parsed.short_feedback,
      followup_question:
        typeof parsed.followup_question === "string"
          ? parsed.followup_question
          : undefined,
      needs_verification: isStringArray(parsed.needs_verification)
        ? parsed.needs_verification
        : [],
    };
    logPersonalityRun("evaluate_answer", startedAt, "success");
    return { evaluation, isFallback: false };
  } catch {
    logPersonalityRun("evaluate_answer", startedAt, "fallback");
    return {
      evaluation: fallbackEvaluation(question, userAnswer),
      isFallback: true,
    };
  }
}

async function buildQ12Draft(state: PersonalityTestState) {
  const startedAt = Date.now();
  try {
    const rawContent = await callSiliconFlow(
      await loadPersonalityPrompt(),
      [
        {
          role: "user",
          content: JSON.stringify(
            {
              task: "build_q12_personality_draft",
              initial_personality_seed: state.initial_seed,
              completed_answers: summarizeAnswers(state),
              output_schema: { draft_markdown: "简洁的人格草案 markdown" },
              constraints: [
                "仅根据 Seed 与前 11 题，保留不确定性。",
                "草案需覆盖 MBTI-like、人格名、核心母题、价值、不为、能力、风险。",
                "仅返回 JSON。",
              ],
            },
            null,
            2,
          ),
        },
      ],
      {
        maxRetries: 0,
        maxTokens: 1000,
        temperature: 0.3,
        timeoutMs: 45_000,
      },
    );
    const parsed = parseModelJson(rawContent);
    if (!isRecord(parsed) || typeof parsed.draft_markdown !== "string") {
      throw new Error("Draft JSON validation failed");
    }
    logPersonalityRun("build_q12_draft", startedAt, "success");
    return { draft: parsed.draft_markdown, isFallback: false };
  } catch {
    logPersonalityRun("build_q12_draft", startedAt, "fallback");
    return { draft: buildDraftFromAnswers(state), isFallback: true };
  }
}

function createFallbackProfile(
  state: PersonalityTestState,
  rawContent?: string,
): PersonalityProfile {
  const answerText = state.answers
    .map((answer) => answer.user_answer)
    .join(" / ");

  return {
    mbti_like: {
      type_guess: "INTJ-like",
      candidate_types: ["INTJ-like", "INFJ-like", "INTP-like"],
      axis_analysis: {
        E_I: {
          leaning: "I",
          evidence: ["更强调独处整理、深度消化和自主节奏。"],
          counter_evidence: ["仍需要高质量讨论来确认判断。"],
          confidence: "medium",
        },
        S_N: {
          leaning: "N",
          evidence: ["关注结构、机制、长期路径和抽象母题。"],
          counter_evidence: ["也重视真实案例和可验证经验。"],
          confidence: "medium",
        },
        T_F: {
          leaning: "T",
          evidence: ["倾向用逻辑一致性、证据和效率建立判断。"],
          counter_evidence: ["对关系边界和真实交流也有明确需求。"],
          confidence: "medium",
        },
        J_P: {
          leaning: "J",
          evidence: ["偏好路径拆解、阶段目标和可执行计划。"],
          counter_evidence: ["在探索早期需要保留试错空间。"],
          confidence: "medium",
        },
      },
    },
    soul_profile: {
      persona_name: "路径判断型探索者",
      core_theme: ["建立判断力", "从复杂经验中提炼路径", "寻找真实连接"],
      value_rank: ["真实", "长期成长", "自主判断", "可验证经验"],
      not_to_do_list: ["空泛包装", "强推销", "无边界消耗", "只表演不沉淀"],
      energy_mechanism: ["被高质量信息和真诚讨论充电", "被低密度噪音迅速消耗"],
      capability_stack: ["结构化整理", "路径拆解", "风险识别", "经验复盘"],
      world_model: ["真正有价值的机会通常能被证据、路径和人的状态共同验证"],
      risk_blindspots: ["可能过度分析", "可能延迟行动", "可能低估早期试错价值"],
    },
    needs_verification: [
      ...state.needs_verification,
      rawContent
        ? "本次已生成备用人格结果，部分结论还需要你继续确认。"
        : "后续可继续用真实长期记录确认画像。",
      `回答摘要：${answerText.slice(0, 120)}`,
    ],
  };
}

function buildFinalPrompt(state: PersonalityTestState) {
  return JSON.stringify(
    {
      task: "finalize_personality_profile",
      initial_personality_seed: state.initial_seed,
      completed_answers: summarizeAnswers(state),
      q12_draft: state.q12_draft ?? null,
      output_requirements: [
        "先给简短中文总结。",
        "最后必须输出 personality_profile_json。",
        "JSON 必须符合 mbti_like / soul_profile / needs_verification 结构。",
      ],
    },
    null,
    2,
  );
}

function getPersonalityProfileCandidate(parsed: unknown) {
  if (isRecord(parsed) && "personality_profile_json" in parsed) {
    return parsed.personality_profile_json;
  }
  return parsed;
}

async function buildFinalResponse(
  state: PersonalityTestState,
): Promise<PersonalityRespondResponse> {
  const startedAt = Date.now();
  let rawContent = "";
  let finalProfile: PersonalityProfile | undefined;
  let parseError: string | undefined;
  let isFallback = state.is_fallback ?? false;

  try {
    rawContent = await callSiliconFlow(
      await loadPersonalityPrompt(),
      [{ role: "user", content: buildFinalPrompt(state) }],
      {
        maxRetries: 0,
        maxTokens: 1800,
        temperature: 0.3,
        timeoutMs: 120_000,
      },
    );

    const parsed = parseModelJson(rawContent);
    const candidate = getPersonalityProfileCandidate(parsed);
    if (!isPersonalityProfile(candidate)) {
      throw new Error("Parsed JSON does not match PersonalityProfile");
    }
    finalProfile = candidate;
    logPersonalityRun("finalize_profile", startedAt, "success");
  } catch (error) {
    parseError = error instanceof Error ? error.message : "Unknown parse error";
    finalProfile = createFallbackProfile(state, rawContent);
    isFallback = true;
    logPersonalityRun("finalize_profile", startedAt, "fallback");
  }

  const nextState: PersonalityTestState = {
    ...state,
    phase: "finished",
    final_profile: finalProfile,
    raw_content: rawContent,
    needs_verification: finalProfile.needs_verification,
    is_fallback: isFallback,
  };

  return {
    assistant_message:
      "12 题已经完成，我已经生成你的灵犀人格结果。你可以查看灵犀人格卡，也可以进入具体需求访谈。",
    state: nextState,
    final_profile: finalProfile,
    raw_content: rawContent,
    is_final_ready: true,
    parse_error: parseError,
    mode: "finalize_profile",
    model_called: true,
    is_fallback: isFallback,
  };
}

function replaceQuestion(
  state: PersonalityTestState,
  questionIndex: number,
  question: PersonalityQuestion,
) {
  return state.questions.map((item, index) =>
    index === questionIndex ? question : item,
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;

    if (!isPersonalityRespondRequest(body)) {
      return NextResponse.json(
        { error: "Invalid personality request body" },
        { status: 400 },
      );
    }

    const existingState =
      body.state.questions?.length > 0
        ? body.state
        : createInitialState(body.initial_seed);

    if (existingState.answers.length === 0 && body.messages.length === 0) {
      const baseState = createInitialState(body.initial_seed);
      const { question, isFallback } = await generateQuestion(
        baseState,
        0,
        "build_question_plan",
      );
      const initialState: PersonalityTestState = {
        ...baseState,
        questions: replaceQuestion(baseState, 0, question),
        is_fallback: isFallback,
      };
      return NextResponse.json({
        assistant_message: `我会基于你的人格种子和每一轮回答动态生成后续问题。先从这条线索开始：${buildSeedSummary(initialState.initial_seed)}`,
        state: initialState,
        is_final_ready: false,
        mode: "build_question_plan",
        model_called: true,
        is_fallback: isFallback,
      } satisfies PersonalityRespondResponse);
    }

    const lastUserMessage = [...body.messages]
      .reverse()
      .find((message) => message.role === "user");

    if (!lastUserMessage) {
      logPersonalityRun("ask_question", Date.now(), "no_call");
      return NextResponse.json({
        assistant_message: "请继续回答当前问题。",
        state: existingState,
        is_final_ready: false,
        mode: "ask_question",
        model_called: false,
        is_fallback: existingState.is_fallback,
      } satisfies PersonalityRespondResponse);
    }

    const currentQuestion =
      existingState.questions[existingState.current_question_index] ??
      personalityQuestions[personalityQuestions.length - 1];
    const combinedUserAnswer = existingState.pending_answer
      ? `${existingState.pending_answer.user_answer}\n补充：${lastUserMessage.content}`
      : lastUserMessage.content;
    const { evaluation, isFallback: evaluationFallback } = await evaluateAnswer(
      existingState,
      currentQuestion,
      combinedUserAnswer,
    );
    const followupCount = existingState.followup_count ?? 0;
    const isFallback = Boolean(existingState.is_fallback || evaluationFallback);

    if (
      !evaluation.is_clear &&
      currentQuestion.needs_followup_if_unclear &&
      followupCount < 1
    ) {
      const followup =
        evaluation.followup_question ??
        `请为“${currentQuestion.verify_target}”补一个具体场景、原因或取舍边界。`;
      const pendingAnswer: PersonalityAnswer = {
        question_id: currentQuestion.id,
        user_answer: combinedUserAnswer,
        followups: [followup],
        updated_fields: evaluation.updated_fields,
        is_clear: false,
      };
      const nextState: PersonalityTestState = {
        ...existingState,
        questions: replaceQuestion(existingState, existingState.current_question_index, {
          ...currentQuestion,
          title: `${currentQuestion.title}（补充）`,
          why_asking: "这条补充用于确认你的具体场景或取舍边界，完成后会进入下一题。",
          question: followup,
          answer_hint: "只需补充一个真实场景、原因或边界。",
        }),
        pending_answer: pendingAnswer,
        followup_count: followupCount + 1,
        is_fallback: isFallback,
      };

      return NextResponse.json({
        assistant_message: `${evaluation.short_feedback}\n\n**再补充一次即可继续。**`,
        state: nextState,
        is_final_ready: false,
        mode: "evaluate_answer",
        model_called: true,
        is_fallback: isFallback,
      } satisfies PersonalityRespondResponse);
    }

    const answer: PersonalityAnswer = {
      question_id: currentQuestion.id,
      user_answer: combinedUserAnswer,
      followups: existingState.pending_answer?.followups ?? [],
      updated_fields: evaluation.updated_fields,
      is_clear: evaluation.is_clear,
    };
    const needsVerification = evaluation.is_clear
      ? existingState.needs_verification
      : [
          ...existingState.needs_verification,
          ...(evaluation.needs_verification?.length
            ? evaluation.needs_verification
            : [`${currentQuestion.title} 还需要确认`]),
        ];
    const nextAnswers = [...existingState.answers, answer];
    const nextQuestionIndex = Math.min(
      existingState.current_question_index + 1,
      personalityQuestions.length - 1,
    );
    let nextState: PersonalityTestState = {
      ...existingState,
      answers: nextAnswers,
      needs_verification: needsVerification,
      current_question_index: nextQuestionIndex,
      pending_answer: undefined,
      followup_count: 0,
      phase:
        nextAnswers.length >= personalityQuestions.length
          ? "final_ready"
          : "questioning",
      is_fallback: isFallback,
    };

    if (nextAnswers.length >= personalityQuestions.length) {
      return NextResponse.json(await buildFinalResponse(nextState));
    }

    if (nextQuestionIndex === personalityQuestions.length - 1) {
      const draftResult = await buildQ12Draft(nextState);
      nextState = {
        ...nextState,
        q12_draft: draftResult.draft,
        is_fallback: Boolean(nextState.is_fallback || draftResult.isFallback),
      };
    }

    const questionResult = await generateQuestion(
      nextState,
      nextQuestionIndex,
      "ask_question",
    );
    nextState = {
      ...nextState,
      questions: replaceQuestion(nextState, nextQuestionIndex, questionResult.question),
      is_fallback: Boolean(nextState.is_fallback || questionResult.isFallback),
    };
    const q12Draft =
      nextQuestionIndex === personalityQuestions.length - 1 &&
      nextState.q12_draft
        ? `\n\n${nextState.q12_draft}`
        : "";

    return NextResponse.json({
      assistant_message: `${evaluation.short_feedback}${q12Draft}`,
      state: nextState,
      is_final_ready: false,
      mode: "ask_question",
      model_called: true,
      is_fallback: nextState.is_fallback,
    } satisfies PersonalityRespondResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
