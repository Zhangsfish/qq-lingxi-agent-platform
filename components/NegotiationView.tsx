"use client";

import { useEffect, useMemo, useState } from "react";
import type { NegotiationResponse } from "@/lib/negotiation-schema";
import { LingxiBot } from "./LingxiBot";
import { TagPill } from "./TagPill";

type NegotiationViewProps = {
  response: NegotiationResponse | null;
  loading: boolean;
};

export function NegotiationView({ response, loading }: NegotiationViewProps) {
  const [visibleTranscriptCount, setVisibleTranscriptCount] = useState(0);
  const result = response?.result;
  const transcriptLength = result?.negotiation_transcript.length ?? 0;
  const targetName =
    response?.target.type === "group"
      ? response.target.profile.name
      : response?.target.profile.display_name;
  const negotiationKey = useMemo(
    () =>
      result
        ? `${result.target_type}:${result.target_id}:${result.source}:${
            result.content_id ?? ""
          }`
        : "empty",
    [result],
  );

  useEffect(() => {
    setVisibleTranscriptCount(0);

    if (!response || loading || transcriptLength === 0) return;

    let nextCount = 0;
    const timer = window.setInterval(() => {
      nextCount += 1;
      setVisibleTranscriptCount(Math.min(nextCount, transcriptLength));

      if (nextCount >= transcriptLength) {
        window.clearInterval(timer);
      }
    }, 600);

    return () => window.clearInterval(timer);
  }, [response, loading, negotiationKey, transcriptLength]);

  const visibleTranscript =
    result?.negotiation_transcript.slice(0, visibleTranscriptCount) ?? [];
  const isTranscriptComplete =
    !result || transcriptLength === 0 || visibleTranscriptCount >= transcriptLength;

  return (
    <div className="flex min-h-[780px] flex-col">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-5xl font-black tracking-normal">Agent 协商</h1>
            <TagPill>用户 Agent</TagPill>
            <TagPill tone="purple">
              {result?.target_type === "group" ? "群 Agent" : "人物 Agent"}
            </TagPill>
          </div>
          <p className="mt-4 text-lg text-slate-500">
            用户 Agent 正在自动协商，帮助你判断是否值得进一步连接
          </p>
        </div>
        <LingxiBot size="lg" />
      </div>

      {!response ? (
        <div className="rounded-[26px] border border-blue-100 bg-blue-50 p-8 text-center text-slate-600">
          {loading ? "Agent 正在协商..." : "请选择一个群或人物发起协商。"}
        </div>
      ) : (
        <>
          {transcriptLength === 0 ? (
            <div className="rounded-[26px] border border-blue-100 bg-blue-50 p-8 text-center text-slate-600">
              本次协商没有返回对话明细，直接展示协商结论。
            </div>
          ) : (
            <div className="flex-1 space-y-5">
              {visibleTranscript.map((item, index) => {
                const isUserAgent = item.speaker === "user_agent";
                const speakerLabel = isUserAgent
                  ? "用户 Agent"
                  : item.speaker === "group_agent"
                    ? "群 Agent"
                    : "人物 Agent";
                return (
                  <div
                    key={`${item.speaker}-${index}`}
                    className={`flex items-start gap-3 ${
                      isUserAgent ? "justify-start" : "justify-end"
                    }`}
                  >
                    {isUserAgent ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-black text-blue-600">
                        用
                      </div>
                    ) : null}
                    <div
                      className={`max-w-[76%] rounded-[22px] px-5 py-3 leading-7 shadow-sm ${
                        isUserAgent
                          ? "bg-blue-50 text-slate-800"
                          : "bg-violet-50 text-slate-800"
                      }`}
                    >
                      <p className="mb-1 text-xs font-bold text-slate-500">
                        {speakerLabel} · {item.purpose}
                      </p>
                      {item.message}
                    </div>
                    {!isUserAgent ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-black text-violet-600">
                        目
                      </div>
                    ) : null}
                  </div>
                );
              })}

              {!isTranscriptComplete ? (
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <LingxiBot size="sm" />
                  Agent 正在协商...
                </div>
              ) : null}
            </div>
          )}

          {isTranscriptComplete ? (
            <div className="mt-6 rounded-[26px] border-2 border-blue-500 bg-white p-5">
              <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
                <div className="border-b border-blue-100 pb-4 lg:border-r lg:border-b-0 lg:pr-5">
                  <p className="text-sm font-semibold text-slate-500">
                    匹配度评分
                  </p>
                  <p className="mt-2 text-5xl font-black text-emerald-500">
                    {result?.fit_score}
                  </p>
                  <p className="mt-4 text-sm font-semibold text-slate-500">
                    最终建议
                  </p>
                  <p className="mt-2 text-3xl font-black">
                    {result?.decision === "recommend"
                      ? "建议连接"
                      : result?.decision === "consider_with_caution"
                        ? "谨慎尝试"
                        : "不建议连接"}
                  </p>
                </div>
                <div>
                  <h2 className="text-xl font-bold">给你的总结</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {result?.summary_for_user}
                  </p>
                  <h3 className="mt-4 font-bold text-blue-600">下一步建议</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {result?.next_action}
                  </p>
                  <div className="mt-4 rounded-[18px] bg-blue-50 p-4 text-sm leading-7 text-blue-800">
                    {result?.draft_message}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {isTranscriptComplete ? (
            <p className="mt-3 text-sm text-slate-500">
              目标：{targetName || result?.target_id}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

