import type { UserNeedProfile } from "@/lib/profile-schema";
import { formatRouteLabel } from "@/lib/display-labels";
import { LingxiBot } from "./LingxiBot";
import { SafeMarkdownText } from "./SafeMarkdownText";
import { TagPill } from "./TagPill";

type ProfileViewProps = {
  profile: UserNeedProfile | null;
  groupLoading: boolean;
  peopleLoading: boolean;
  realmLoading: boolean;
  groupError: string | null;
  peopleError: string | null;
  realmError: string | null;
  onInterview: () => void;
  onMatchGroups: () => void;
  onMatchPeople: () => void;
  onRecommendRealm: () => void;
};

const fallbackRows = [
  ["内容通道", "需要先通过对话生成画像"],
  ["连接通道", "生成后会展示适合的群、人和内容连接"],
  ["身份切面", "系统会保留隐私边界和自我呈现方式"],
  ["偏好模型", "系统会记录喜欢与排斥的内容氛围"],
];

export function ProfileView({
  profile,
  groupLoading,
  peopleLoading,
  realmLoading,
  groupError,
  peopleError,
  realmError,
  onInterview,
  onMatchGroups,
  onMatchPeople,
  onRecommendRealm,
}: ProfileViewProps) {
  const rows = profile
    ? [
        ["内容通道", profile.content_channel.content_need],
        ["连接通道", profile.connection_channel.relationship_need],
        ["身份切面", profile.identity_slice.self_presentation],
        [
          "偏好模型",
          profile.preference_model.interests.concat(
            profile.preference_model.preferred_atmosphere,
          ).join("、"),
        ],
      ]
    : fallbackRows;
  const primaryRoute = formatRouteLabel(profile?.routing_intent?.primary_route);

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-5xl font-black tracking-normal">你的场景画像</h1>
            <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              {profile ? "已生成画像" : "等待画像"}
            </span>
          </div>
          <p className="mt-4 text-lg text-slate-500">
            灵犀已经根据你的对话，抽象出你在当前场景下的需求截面
          </p>
        </div>
        <LingxiBot size="lg" />
      </div>

      <div className="rounded-[26px] border border-blue-100 bg-white p-4 shadow-sm">
        <div className="space-y-3">
          {rows.map(([title, text], index) => (
            <div
              key={title}
              className={`grid gap-4 rounded-[22px] p-5 sm:grid-cols-[140px_1fr] ${
                index === 0
                  ? "bg-blue-50"
                  : index === 1
                    ? "bg-emerald-50"
                    : index === 2
                      ? "bg-violet-50"
                      : "bg-rose-50"
              }`}
            >
              <h2 className="text-xl font-bold">{title}</h2>
              <SafeMarkdownText content={text} className="text-slate-600" />
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-[22px] border-2 border-blue-500 bg-blue-50/40 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold">路由意图</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                <TagPill tone="blue">首要路径：{primaryRoute}</TagPill>
                <TagPill tone="green">
                  置信度：{profile?.routing_intent?.confidence ?? 0}
                </TagPill>
                <TagPill tone="purple">
                  推荐动作：{profile?.routing_intent?.recommended_cta ?? "先访谈"}
                </TagPill>
              </div>
            </div>
            <button
              type="button"
              onClick={onInterview}
              className="rounded-[16px] border border-blue-200 bg-white px-5 py-3 text-sm font-bold text-blue-700"
            >
              查看原始访谈
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <button
          type="button"
          onClick={onRecommendRealm}
          disabled={!profile || realmLoading}
          className="rounded-[18px] bg-blue-600 px-6 py-5 text-lg font-bold text-white disabled:bg-blue-300"
        >
          {realmLoading ? "推荐中..." : "进入群域"}
        </button>
        <button
          type="button"
          onClick={onMatchPeople}
          disabled={!profile || peopleLoading}
          className="rounded-[18px] border border-blue-100 bg-white px-6 py-5 text-lg font-bold text-slate-900 shadow-sm disabled:text-slate-400"
        >
          {peopleLoading ? "匹配中..." : "匹配人 / 作者"}
        </button>
        <button
          type="button"
          onClick={onMatchGroups}
          disabled={!profile || groupLoading}
          className="rounded-[18px] border border-blue-100 bg-white px-6 py-5 text-lg font-bold text-slate-900 shadow-sm disabled:text-slate-400"
        >
          {groupLoading ? "匹配中..." : "匹配 QQ 群"}
        </button>
      </div>

      {groupError || peopleError || realmError ? (
        <div className="mt-4 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {groupError || peopleError || realmError}
        </div>
      ) : null}
    </div>
  );
}
