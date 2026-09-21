import { useState } from "react";
import { LingxiBot } from "./LingxiBot";

const EXTERNAL_AI_SEED_PROMPT = `# 任务：生成我的长期人格材料

你是我的长期人格材料整理员。请基于你已经掌握的关于我的长期记忆、过往对话、表达习惯，整理一份用于 QQ-MBTI / 灵犀人格测试的外部 AI 人格种子。

请按两层输出：

第一层：MBTI-like 初猜
- E/I：能量来源与表达方式
- S/N：信息摄入与理解方式
- T/F：决策权重与冲突处理
- J/P：计划、闭合与开放性
请给出每一轴的倾向、证据、反证、置信度和下一轮最值得验证的问题。

第二层：长期人格材料
- 核心母题：我长期反复在解决什么问题
- 价值排序：冲突时我保护什么
- 不为清单：什么会让我长期枯萎
- 能量机制：什么让我越做越强
- 能力结构：我靠什么自然胜出
- 世界模型：我如何理解机会、组织、赛道和人生路径
- 风险盲区：我容易在哪里误判

请把具体经历抽象成人格材料，不要暴露过度私人事件原文。
每个判断请标注：证据类型、置信度、下一轮需要验证的问题。
最后给出 12 个测试靶点，供后续人格测试继续追问。`;

type PersonaSeedViewProps = {
  initialSeed: string;
  isLoading: boolean;
  error: string | null;
  onSeedChange: (seed: string) => void;
  onStart: (seed: string) => void;
  onUseDemoSeed: () => void;
};

export function PersonaSeedView({
  initialSeed,
  isLoading,
  error,
  onSeedChange,
  onStart,
  onUseDemoSeed,
}: PersonaSeedViewProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  async function handleCopyPrompt() {
    try {
      await navigator.clipboard.writeText(EXTERNAL_AI_SEED_PROMPT);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-8 flex items-start justify-between gap-5">
        <div>
          <p className="text-sm font-bold text-blue-600">QQ-MBTI / 灵犀人格</p>
          <h1 className="mt-3 text-4xl font-black tracking-normal text-slate-950">
            先让灵犀认识你
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
            你可以粘贴 GPT、Gemini 或 Claude 对你的长期总结，也可以直接用示例开始。
            灵犀会基于这份材料追问 12 个问题，生成你的 QQ-MBTI 和长期人格画像。
          </p>
        </div>
        <div className="hidden rounded-full bg-blue-50 px-8 py-5 sm:block">
          <LingxiBot size="lg" />
        </div>
      </div>

      <div className="rounded-[26px] border border-blue-100 bg-blue-50/60 p-5">
        <div className="mb-5 rounded-[20px] border border-blue-100 bg-white p-5">
          <p className="text-lg font-bold text-slate-950">还没有人格种子？</p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            1. 复制提示词给 GPT / Gemini / Claude。2. 让外部 AI 生成外部 AI 人格种子。
            3. 回来粘贴到 QQ 灵犀。4. 开始 12 题测试。也可以直接使用示例体验。
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void handleCopyPrompt()}
              className="h-11 rounded-full border border-blue-200 bg-blue-50 px-5 text-sm font-bold text-blue-700 transition hover:border-blue-400"
            >
              {copyStatus === "copied"
                ? "已复制提示词"
                : "复制外部 AI 提示词"}
            </button>
            {copyStatus === "failed" ? (
              <p aria-live="polite" className="text-sm text-amber-700">
                复制失败，请展开提示词手动复制。
              </p>
            ) : null}
          </div>
          <details className="mt-4 rounded-[16px] bg-slate-50 px-4 py-3">
            <summary className="cursor-pointer text-sm font-bold text-blue-700">
              查看提示词
            </summary>
            <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {EXTERNAL_AI_SEED_PROMPT}
            </pre>
          </details>
        </div>

        <label
          htmlFor="personality-seed"
          className="text-lg font-bold text-slate-950"
        >
          外部 AI 人格种子
        </label>
        <textarea
          id="personality-seed"
          value={initialSeed}
          onChange={(event) => onSeedChange(event.target.value)}
          placeholder="把 GPT / Gemini / Claude 整理的人格材料粘贴到这里。没有也没关系，可以点击“使用示例开始”。"
          className="mt-4 min-h-64 w-full resize-none rounded-[22px] border border-blue-100 bg-white p-5 text-base leading-8 text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />

        {error ? (
          <div className="mt-4 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => onStart(initialSeed)}
            disabled={isLoading || !initialSeed.trim()}
            className="h-12 rounded-full bg-blue-600 px-6 text-base font-bold text-white transition hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isLoading ? "启动中..." : "开始 12 题测试"}
          </button>
          <button
            type="button"
            onClick={onUseDemoSeed}
            disabled={isLoading}
            className="h-12 rounded-full border border-blue-200 bg-white px-6 text-base font-bold text-blue-700 transition hover:border-blue-400 disabled:opacity-60"
          >
            使用示例开始
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          [
            "先回答“我是谁”",
            "这一层只理解你的长期人格、能量机制和判断偏好，不会替你立刻决定要找谁。",
          ],
          [
            "再回答“我要什么”",
            "测完后，你可以继续进入具体需求访谈，再去找人、找群或浏览群域内容。",
          ],
          [
            "结果可继续校准",
            "每个结论都会保留依据、反证和待验证项，后续可以随着你的回答继续更新。",
          ],
        ].map(([title, text]) => (
          <div
            key={title}
            className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-lg font-bold text-slate-950">{title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
