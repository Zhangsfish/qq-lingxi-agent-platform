import type { RealmRecommendationResponse } from "@/lib/realm-recommendation-schema";
import { LingxiBot } from "./LingxiBot";
import { TagPill } from "./TagPill";

type RealmFeedViewProps = {
  response: RealmRecommendationResponse | null;
  loading: boolean;
  negotiatingTargetId: string | null;
  onRecommend: () => void;
  onNegotiatePerson: (personId: string, contentId: string) => void;
  onNegotiateGroup: (groupId: string, contentId: string) => void;
};

export function RealmFeedView({
  response,
  loading,
  negotiatingTargetId,
  onRecommend,
  onNegotiatePerson,
  onNegotiateGroup,
}: RealmFeedViewProps) {
  const items = response?.recommendedItems ?? [];
  const filtered = response?.filteredItems ?? [];

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-normal">群域</h1>
          <p className="mt-3 text-lg text-slate-500">
            你当前场景下更值得看的内容
          </p>
          <div className="mt-4 rounded-[16px] bg-blue-50 px-4 py-3 text-sm text-blue-700">
            根据你的画像，灵犀建议你先通过内容判断，再决定连接谁。
          </div>
        </div>
        <LingxiBot size="lg" />
      </div>

      {items.length === 0 ? (
        <div className="rounded-[26px] border border-blue-100 bg-blue-50 p-8 text-center">
          <p className="text-lg font-semibold text-slate-700">
            还没有生成群域推荐
          </p>
          <button
            type="button"
            onClick={onRecommend}
            disabled={loading}
            className="mt-5 rounded-[16px] bg-blue-600 px-7 py-3 font-bold text-white disabled:bg-blue-300"
          >
            {loading ? "推荐中..." : "生成内容推荐"}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => (
            <article
              key={item.content_id}
              className="rounded-[24px] border border-blue-100 bg-white p-4 shadow-sm"
            >
              <div className="mb-4 h-40 rounded-[20px] bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-5">
                <div className="h-full rounded-[16px] border border-dashed border-blue-200 bg-white/70" />
              </div>
              <div className="mb-3 flex flex-wrap gap-2">
                <TagPill>灵犀推荐</TagPill>
                <TagPill tone="green">{item.recommendation_level}</TagPill>
              </div>
              <h2 className="text-xl font-bold">{item.content.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {item.content.summary}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {item.reason}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {item.connectable_targets.slice(0, 2).map((target) => (
                  <button
                    key={`${target.target_type}-${target.target_id}`}
                    type="button"
                    onClick={() =>
                      target.target_type === "person"
                        ? onNegotiatePerson(target.target_id, item.content_id)
                        : onNegotiateGroup(target.target_id, item.content_id)
                    }
                    disabled={Boolean(negotiatingTargetId)}
                    className="rounded-full border border-blue-200 px-4 py-2 text-sm font-bold text-blue-700 disabled:text-blue-300"
                  >
                    {target.target_type === "person"
                      ? "和作者 Agent 协商"
                      : "和关联群 Agent 协商"}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="mt-5 rounded-[22px] bg-slate-50 p-4">
          <h2 className="mb-3 font-bold text-slate-600">已过滤掉的内容</h2>
          <div className="space-y-3">
            {filtered.slice(0, 3).map((item) => (
              <div key={item.content_id} className="rounded-[18px] bg-white p-4">
                <p className="font-semibold">{item.content.title}</p>
                <p className="mt-1 text-sm text-red-500">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

