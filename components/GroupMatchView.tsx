import type { GroupMatchResponse } from "@/lib/group-match-schema";
import { LingxiBot } from "./LingxiBot";
import { TagPill } from "./TagPill";

type GroupMatchViewProps = {
  response: GroupMatchResponse | null;
  loading: boolean;
  negotiatingTargetId: string | null;
  onMatch: () => void;
  onNegotiateGroup: (groupId: string) => void;
};

export function GroupMatchView({
  response,
  loading,
  negotiatingTargetId,
  onMatch,
  onNegotiateGroup,
}: GroupMatchViewProps) {
  const matches = response?.matchedGroups ?? [];
  const filtered = response?.filteredGroups ?? [];

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-normal">
            为你推荐的 QQ 群
          </h1>
          <p className="mt-3 text-lg text-slate-500">
            灵犀根据你的画像，从同场景群中筛选出更适合你的群
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <TagPill>转行探索</TagPill>
            <TagPill tone="green">真实案例偏好</TagPill>
            <TagPill tone="purple">长期交流倾向</TagPill>
          </div>
        </div>
        <LingxiBot size="lg" />
      </div>

      {matches.length === 0 ? (
        <EmptyMatch loading={loading} onMatch={onMatch} label="生成 QQ 群推荐" />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {matches.map((item) => (
            <article
              key={item.group_id}
              className="rounded-[24px] border border-blue-100 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                    群
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{item.group.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.group.scene} / {item.group.category}
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
              <p className="text-sm leading-6 text-slate-600">
                <span className="font-bold text-slate-900">为什么推荐：</span>
                {item.reason}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                <span className="font-bold text-slate-900">风险提醒：</span>
                {item.risk}
              </p>
              <button
                type="button"
                onClick={() => onNegotiateGroup(item.group_id)}
                disabled={Boolean(negotiatingTargetId)}
                className="mt-5 w-full rounded-[14px] bg-blue-600 px-5 py-3 text-sm font-bold text-white disabled:bg-blue-300"
              >
                {negotiatingTargetId === item.group_id
                  ? "协商中..."
                  : "发起 Agent 协商"}
              </button>
            </article>
          ))}
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="mt-5 rounded-[22px] bg-slate-50 p-4">
          <h2 className="mb-3 font-bold text-slate-600">被过滤的群</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {filtered.slice(0, 2).map((item) => (
              <div key={item.group_id} className="rounded-[18px] bg-white p-4">
                <p className="font-semibold">{item.group.name}</p>
                <p className="mt-1 text-sm text-slate-500">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EmptyMatch({
  loading,
  onMatch,
  label,
}: {
  loading: boolean;
  onMatch: () => void;
  label: string;
}) {
  return (
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
        {loading ? "生成中..." : label}
      </button>
    </div>
  );
}

