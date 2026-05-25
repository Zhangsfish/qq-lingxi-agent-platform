"use client";

import { useEffect, useState } from "react";
import type {
  PersonalityProfile,
  PersonalityQuestion,
  PersonalityRespondRequest,
  PersonalityRespondResponse,
  PersonalityTestState,
} from "@/lib/personality-schema";
import { isPersonalityProfile, isRecord } from "@/lib/personality-schema";

export type PersonalityMessage = {
  role: "user" | "assistant";
  content: string;
};

export const DEMO_INITIAL_PERSONALITY_SEED = `# 长期人格材料

## MBTI-like 初猜
用户可能接近 ENTP-like / INTP-like：表达欲和讨论欲较强，但真正恢复能量依赖独处建模。S/N 明显偏 N，习惯从真实案例中提炼结构；T/F 表达上偏 T，但底层价值排序很强；J/P 可能是先开放探索、再阶段性收束。

## 核心母题
用户长期关注“如何找到真正适合自己的位置”，以及“如何从混乱经验中建立可判断、可迁移的结构”。

## 价值排序
用户重视自由、真实、长期复利、判断力和高质量连接。面对冲突时，通常更愿意保护自主判断和长期成长。

## 不为清单
用户排斥空泛包装、强推销、无意义重复、低质量权威、无边界消耗和只追热点的社交环境。

## 能量机制
高质量讨论、真实案例、复杂系统拆解、从 0 到 1 搭建方案会带来能量；低密度噪音、机械重复和被强行微操会快速消耗能量。

## 能力结构
用户优势可能在结构化思考、跨学科联想、复杂问题拆解、表达说服、组织协调和路径判断。

## 风险盲区
可能过度抽象，低估执行细节和普通用户的简单需求；也可能在没有想清楚前行动不足。`;

const emptyState: PersonalityTestState = {
  initial_seed: "",
  phase: "seed",
  current_question_index: 0,
  questions: [],
  answers: [],
  needs_verification: [],
};

const PERSONALITY_STORAGE_KEY = "qq_lingxi_personality_profile_v1";
const PERSONALITY_STORAGE_VERSION = 1;

type SavedPersonalityProfile = {
  version: typeof PERSONALITY_STORAGE_VERSION;
  lastUpdatedAt: string;
  finalProfile: PersonalityProfile;
  rawContent: string;
  parseError: string | null;
};

function clearSavedPersonalityProfile() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(PERSONALITY_STORAGE_KEY);
  }
}

function readSavedPersonalityProfile(): SavedPersonalityProfile | null {
  if (typeof window === "undefined") return null;

  const serialized = window.localStorage.getItem(PERSONALITY_STORAGE_KEY);
  if (!serialized) return null;

  try {
    const parsed: unknown = JSON.parse(serialized);
    if (
      !isRecord(parsed) ||
      parsed.version !== PERSONALITY_STORAGE_VERSION ||
      typeof parsed.lastUpdatedAt !== "string" ||
      !isPersonalityProfile(parsed.finalProfile) ||
      typeof parsed.rawContent !== "string" ||
      (parsed.parseError !== null && typeof parsed.parseError !== "string")
    ) {
      clearSavedPersonalityProfile();
      return null;
    }

    return {
      version: PERSONALITY_STORAGE_VERSION,
      lastUpdatedAt: parsed.lastUpdatedAt,
      finalProfile: parsed.finalProfile,
      rawContent: parsed.rawContent,
      parseError: parsed.parseError,
    };
  } catch {
    clearSavedPersonalityProfile();
    return null;
  }
}

function savePersonalityProfile(
  finalProfile: PersonalityProfile,
  rawContent: string,
  parseError: string | null,
) {
  if (typeof window === "undefined") return;

  const value: SavedPersonalityProfile = {
    version: PERSONALITY_STORAGE_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    finalProfile,
    rawContent,
    parseError,
  };

  window.localStorage.setItem(PERSONALITY_STORAGE_KEY, JSON.stringify(value));
}

async function requestPersonality(
  requestBody: PersonalityRespondRequest,
): Promise<PersonalityRespondResponse> {
  const response = await fetch("/api/personality/respond", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const data = (await response.json()) as
    | PersonalityRespondResponse
    | { error?: string };

  if (!response.ok) {
    throw new Error("error" in data ? data.error : "人格测试请求失败");
  }

  if (!("state" in data)) {
    throw new Error("人格测试响应格式异常");
  }

  return data;
}

export function usePersonalityTest() {
  const [initialSeed, setInitialSeed] = useState("");
  const [messages, setMessages] = useState<PersonalityMessage[]>([]);
  const [state, setState] = useState<PersonalityTestState>(emptyState);
  const [finalProfile, setFinalProfile] = useState<PersonalityProfile | null>(
    null,
  );
  const [rawContent, setRawContent] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [isRestored, setIsRestored] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedProfile = readSavedPersonalityProfile();
    if (!savedProfile) return;

    setState({
      ...emptyState,
      phase: "finished",
      final_profile: savedProfile.finalProfile,
      raw_content: savedProfile.rawContent,
      needs_verification: savedProfile.finalProfile.needs_verification,
    });
    setFinalProfile(savedProfile.finalProfile);
    setRawContent(savedProfile.rawContent);
    setParseError(savedProfile.parseError);
    setIsRestored(true);
  }, []);

  async function startWithSeed(seed: string) {
    const trimmedSeed = seed.trim();
    if (!trimmedSeed || isLoading) return false;

    setIsLoading(true);
    setError(null);
    setParseError(null);
    setFinalProfile(null);
    setRawContent("");
    setIsRestored(false);
    clearSavedPersonalityProfile();
    setInitialSeed(trimmedSeed);
    setMessages([]);

    try {
      const data = await requestPersonality({
        initial_seed: trimmedSeed,
        messages: [],
        state: {
          ...emptyState,
          initial_seed: trimmedSeed,
        },
      });

      setState(data.state);
      setMessages([{ role: "assistant", content: data.assistant_message }]);
      return true;
    } catch (startError) {
      const message =
        startError instanceof Error ? startError.message : "人格测试启动失败";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  async function useDemoSeed() {
    setInitialSeed(DEMO_INITIAL_PERSONALITY_SEED);
    return startWithSeed(DEMO_INITIAL_PERSONALITY_SEED);
  }

  async function sendAnswer(answer: string) {
    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer || isLoading || state.phase === "finished") return null;

    const nextMessages: PersonalityMessage[] = [
      ...messages,
      { role: "user", content: trimmedAnswer },
    ];

    setIsLoading(true);
    setError(null);

    try {
      const data = await requestPersonality({
        initial_seed: initialSeed,
        messages: nextMessages,
        state,
      });

      setState(data.state);
      setMessages([
        ...nextMessages,
        { role: "assistant", content: data.assistant_message },
      ]);
      const completedProfile = data.final_profile ?? null;
      const completedRawContent = data.raw_content ?? "";
      const completedParseError = data.parse_error ?? null;
      setFinalProfile(completedProfile);
      setRawContent(completedRawContent);
      setParseError(completedParseError);
      if (data.is_final_ready && completedProfile) {
        savePersonalityProfile(
          completedProfile,
          completedRawContent,
          completedParseError,
        );
      }
      return data;
    } catch (answerError) {
      const message =
        answerError instanceof Error ? answerError.message : "人格测试提交失败";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  function resetPersonalityTest() {
    clearSavedPersonalityProfile();
    setInitialSeed("");
    setMessages([]);
    setState(emptyState);
    setFinalProfile(null);
    setRawContent("");
    setParseError(null);
    setIsRestored(false);
    setError(null);
    setIsLoading(false);
  }

  const currentQuestion: PersonalityQuestion | null =
    state.questions[state.current_question_index] ?? null;

  return {
    initialSeed,
    messages,
    state,
    currentQuestion,
    answeredCount: state.answers.length,
    totalQuestions: state.questions.length,
    finalProfile,
    rawContent,
    parseError,
    isRestored,
    needsVerification: state.needs_verification,
    isLoading,
    error,
    setInitialSeed,
    startWithSeed,
    useDemoSeed,
    sendAnswer,
    resetPersonalityTest,
  };
}
