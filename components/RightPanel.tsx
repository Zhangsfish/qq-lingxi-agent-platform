import type { DemoView } from "@/lib/demo-types";
import type { UserNeedProfile } from "@/lib/profile-schema";
import { LingxiBot } from "./LingxiBot";

type RightPanelProps = {
  activeView: DemoView;
  profile: UserNeedProfile | null;
  userRoundCount: number;
};

const viewTitle: Record<DemoView, string> = {
  home: "灵犀能做什么",
  interview: "AI 当前理解到的信息",
  profile: "为什么这样推荐？",
  group_match: "当前画像摘要",
  people_match: "当前画像摘要",
  realm_feed: "推荐逻辑说明",
  negotiation: "目标信息",
};

export function RightPanel({
  activeView,
  profile,
  userRoundCount,
}: RightPanelProps) {
  const contentNeed =
    profile?.content_channel.content_need || "想看真实案例、经验帖、路径拆解";
  const connectionNeed =
    profile?.connection_channel.relationship_need ||
    "希望匹配愿意交流的人、群或内容";
  const preference =
    profile?.preference_model.interests.slice(0, 3).join("、") ||
    "真实、具体、可验证、非营销";
  const boundaries =
    profile?.preference_model.boundaries.slice(0, 3).join("、") ||
    "卖课号、过度包装、空泛鸡汤";

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-normal">
          {viewTitle[activeView]}
        </h2>
        <LingxiBot size="sm" />
      </div>

      {activeView === "home" ? (
        <div className="space-y-4">
          {[
            ["1", "生成画像", "通过对话理解你的目标、偏好与场景"],
            ["2", "推荐人 / 群 / 内容", "给出可解释的匹配建议与理由"],
            ["3", "Agent 自动协商", "用户 Agent 与群或人物 Agent 自动沟通"],
          ].map(([step, title, text]) => (
            <div
              key={step}
              className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                  {step}
                </span>
                <div>
                  <p className="text-lg font-semibold">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[22px] border border-blue-100 bg-white">
          {[
            ["内容需求", contentNeed],
            ["连接需求", connectionNeed],
            ["偏好", preference],
            ["排斥项", boundaries],
          ].map(([title, text]) => (
            <div key={title} className="border-b border-blue-50 p-4 last:border-0">
              <p className="text-base font-semibold">{title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      )}

      {activeView === "interview" ? (
        <div className="rounded-[22px] border border-blue-100 bg-blue-50/70 p-4">
          <div className="mb-2 flex items-center justify-between text-sm font-semibold">
            <span>访谈进度</span>
            <span>{Math.min(userRoundCount, 5)} / 5</span>
          </div>
          <div className="h-2 rounded-full bg-blue-100">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${Math.min(userRoundCount / 5, 1) * 100}%` }}
            />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            再完成到 5 轮左右，就可以生成更稳定的用户画像。
          </p>
        </div>
      ) : null}

      {activeView !== "home" ? (
        <div className="mt-auto rounded-[22px] bg-slate-50 p-4 text-sm leading-6 text-slate-500">
          推荐和协商结论会在 Agent 沟通后继续更新，当前页面保留可解释依据。
        </div>
      ) : null}
    </div>
  );
}

