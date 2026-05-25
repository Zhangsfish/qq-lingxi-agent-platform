import type { PersonMatchResponse } from "@/lib/person-match-schema";
import { formatSceneLabel } from "@/lib/display-labels";
import { LingxiBot } from "./LingxiBot";
import { SafeMarkdownText } from "./SafeMarkdownText";
import { TagPill } from "./TagPill";

type PeopleMatchViewProps = {
  response: PersonMatchResponse | null;
  loading: boolean;
  negotiatingTargetId: string | null;
  usesLongTermProfile: boolean;
  onMatch: () => void;
  onNegotiatePerson: (personId: string) => void;
};

export function PeopleMatchView({
  response,
  loading,
  negotiatingTargetId,
  usesLongTermProfile,
  onMatch,
  onNegotiatePerson,
}: PeopleMatchViewProps) {
  const matches = response?.matchedPeople ?? [];

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-normal">
            为你推荐的人 / 作者
          </h1>
          <p className="mt-3 text-lg text-slate-500">
            你可以先和这些人的 Agent 协商，再决定是否进一步连接
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <TagPill>真实案例偏好</TagPill>
            <TagPill tone="green">长期交流倾向</TagPill>
            <TagPill tone="purple">优先可验证经验</TagPill>
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-500">
            {usesLongTermProfile
              ? "本次推荐会优先依据你这次的具体需求，同时参考你的长期人格画像，用于判断群文化、沟通方式和长期适配度。"
              : "本次推荐优先依据你这次的具体需求；完成人格测试后，还可参考长期人格画像判断长期适配度。"}
          </p>
        </div>
        <LingxiBot size="lg" />
      </div>

      {matches.length === 0 ? (
        <div className="rounded-[26px] border border-blue-100 bg-blue-50 p-8 text-center">
          <p className="text-lg font-semibold text-slate-700">
            还没有生成匹配结果
          </p>
          <button
            type="button"
            onClick={onMatch}
            disabled={loading}
            className="mt-5 rounded-[16px] bg-blue-600 px-7 py-3 font-bold text-white disabled:bg-blue-300"
          >
            {loading ? "生成中..." : "生成人物推荐"}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {matches.map((item) => (
            <article
              key={item.person_id}
              className="rounded-[24px] border border-blue-100 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="h-16 w-16 shrink-0 rounded-full bg-gradient-to-br from-slate-800 to-slate-500" />
                  <div>
                    <h2 className="text-xl font-bold">
                      {item.person.display_name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.person.role_type} / {formatSceneLabel(item.person.scene)}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-600">
                  {item.fit_score} 分
                </span>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {item.matched_traits.slice(0, 4).map((trait) => (
                  <TagPill key={trait} tone="green">
                    {trait}
                  </TagPill>
                ))}
              </div>
              <div className="text-sm leading-6 text-slate-600">
                <span className="font-bold text-slate-900">擅长什么：</span>
                <SafeMarkdownText
                  content={item.summary_for_user}
                  compact
                  className="mt-1 text-slate-600"
                />
              </div>
              <div className="mt-2 text-sm leading-6 text-slate-600">
                <span className="font-bold text-slate-900">边界 / 风险提醒：</span>
                <SafeMarkdownText
                  content={item.risk}
                  compact
                  className="mt-1 text-slate-600"
                />
              </div>
              {item.person.authoredContents.length > 0 ? (
                <div className="mt-4 space-y-2 border-t border-blue-50 pt-3">
                  {item.person.authoredContents.slice(0, 2).map((content) => (
                    <p key={content.id} className="text-sm text-slate-500">
                      《{content.title}》
                    </p>
                  ))}
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => onNegotiatePerson(item.person_id)}
                disabled={Boolean(negotiatingTargetId)}
                className="mt-5 w-full rounded-[14px] bg-blue-600 px-5 py-3 text-sm font-bold text-white disabled:bg-blue-300"
              >
                {negotiatingTargetId === item.person_id
                  ? "协商中..."
                  : "发起 Agent 协商"}
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
