"use client";

import { useState } from "react";
import type { PersonalityMessage } from "@/hooks/usePersonalityTest";
import { formatTechnicalTag } from "@/lib/display-labels";
import type {
  PersonalityQuestion,
  PersonalityTestPhase,
} from "@/lib/personality-schema";
import { SafeMarkdownText } from "./SafeMarkdownText";

type PersonaTestViewProps = {
  messages: PersonalityMessage[];
  currentQuestion: PersonalityQuestion | null;
  phase: PersonalityTestPhase;
  answeredCount: number;
  totalQuestions: number;
  needsVerification: string[];
  isLoading: boolean;
  error: string | null;
  onAnswer: (answer: string) => void;
  onReset: () => void;
};

function phaseLabel(phase: PersonalityTestPhase) {
  const labels: Record<PersonalityTestPhase, string> = {
    seed: "准备开始",
    questioning: "正在追问",
    final_ready: "正在生成人格卡",
    finished: "已完成人格卡",
  };
  return labels[phase];
}

function QuestionCard({ question }: { question: PersonalityQuestion }) {
  return (
    <div className="mt-5 rounded-[20px] border border-blue-100 bg-blue-50/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-950">{question.title}</h2>
        <div className="flex flex-wrap gap-2">
          {question.target_dimensions.map((dimension) => (
            <span
              key={dimension}
              className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700"
            >
              {formatTechnicalTag(dimension)}
            </span>
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm font-bold text-slate-500">为什么问这一题</p>
      <SafeMarkdownText
        content={question.why_asking}
        compact
        className="mt-1 text-slate-600"
      />
      <p className="mt-4 text-sm font-bold text-slate-500">问题</p>
      <SafeMarkdownText content={question.question} className="mt-1 text-slate-900" />
      <p className="mt-4 text-sm font-bold text-slate-500">回答提示</p>
      <SafeMarkdownText
        content={question.answer_hint}
        compact
        className="mt-1 text-slate-600"
      />
    </div>
  );
}

export function PersonaTestView({
  messages,
  currentQuestion,
  phase,
  answeredCount,
  totalQuestions,
  needsVerification,
  isLoading,
  error,
  onAnswer,
  onReset,
}: PersonaTestViewProps) {
  const [answer, setAnswer] = useState("");
  const latestAssistant = [...messages]
    .reverse()
    .find((message) => message.role === "assistant");
  const progress = totalQuestions
    ? Math.min(answeredCount / totalQuestions, 1) * 100
    : 0;

  function handleSubmit() {
    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer || isLoading) return;
    onAnswer(trimmedAnswer);
    setAnswer("");
  }

  return (
    <div className="grid h-full gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
      <section className="flex min-h-0 flex-col rounded-[26px] border border-blue-100 bg-blue-50/40 p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-blue-600">
              QQ-MBTI / 灵犀人格测试
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-slate-950">
              12 题认识你
            </h1>
          </div>
          <button
            type="button"
            onClick={onReset}
            disabled={isLoading}
            className="h-10 rounded-full border border-blue-200 bg-white px-4 text-sm font-bold text-blue-700 disabled:opacity-60"
          >
            重新开始
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto rounded-[22px] bg-white p-5">
          {latestAssistant ? (
            <SafeMarkdownText content={latestAssistant.content} />
          ) : null}
          {currentQuestion && phase !== "finished" ? (
            <QuestionCard question={currentQuestion} />
          ) : null}
          {!latestAssistant && !currentQuestion ? (
            <p className="text-slate-500">请先从首页进入人格测试。</p>
          ) : null}
        </div>

        {error ? (
          <div className="mt-4 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-3">
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            disabled={isLoading || phase === "finished"}
            placeholder="不用写标准答案，讲一个真实选择、场景或取舍就好。"
            className="min-h-32 resize-none rounded-[22px] border border-blue-100 bg-white p-4 text-base leading-7 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !answer.trim() || phase === "finished"}
              className="h-12 rounded-full bg-blue-600 px-6 text-base font-bold text-white transition hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? "灵犀理解中..." : "发送回答"}
            </button>
          </div>
        </div>
      </section>

      <aside className="rounded-[26px] border border-blue-100 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black tracking-normal text-slate-950">
          测试状态
        </h2>
        <div className="mt-5 space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-700">
              <span>进度</span>
              <span>
                {answeredCount} / {totalQuestions || 12}
              </span>
            </div>
            <div className="h-2 rounded-full bg-blue-100">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {[
            ["当前阶段", phaseLabel(phase)],
            ["当前题号", totalQuestions ? `Q${Math.min(answeredCount + 1, totalQuestions)}` : "待开始"],
            ["MBTI-like", "等待 12 题完成后生成"],
            ["待确认点", `${needsVerification.length} 项`],
          ].map(([title, text]) => (
            <div
              key={title}
              className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3"
            >
              <p className="text-sm font-bold text-slate-500">{title}</p>
              <p className="mt-1 text-base font-semibold text-slate-950">
                {text}
              </p>
            </div>
          ))}

          {needsVerification.length > 0 ? (
            <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm font-bold text-amber-700">还需要确认</p>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-amber-800">
                {needsVerification.slice(0, 3).map((item) => (
                  <li key={item}>
                    <SafeMarkdownText content={item} compact />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
