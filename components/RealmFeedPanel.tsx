import type { RealmRecommendationResponse } from "@/lib/realm-recommendation-schema";

type RealmFeedPanelProps = {
  response: RealmRecommendationResponse | null;
  onNegotiatePerson?: (personId: string, contentId: string) => void;
  onNegotiateGroup?: (groupId: string, contentId: string) => void;
  negotiatingTargetId?: string | null;
};

function TagList({ items }: { items: string[] }) {
  if (items.length === 0) {
    return <span className="text-sm text-[#6a7688]">暂无</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-md border border-[#c7d2e2] bg-[#f7f9fc] px-2 py-1 text-xs text-[#354156]"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function Field({ label, value }: { label: string | number; value: string | number }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-[#52627a]">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-[#172033]">{value}</dd>
    </div>
  );
}

export function RealmFeedPanel({
  response,
  onNegotiatePerson,
  onNegotiateGroup,
  negotiatingTargetId,
}: RealmFeedPanelProps) {
  if (!response) return null;

  return (
    <section className="mt-4 rounded-md border border-[#d8e0ed] bg-white p-4">
      <div className="mb-4">
        <p className="text-sm font-medium text-[#52627a]">群域内容推荐</p>
        <h2 className="mt-1 text-xl font-semibold text-[#172033]">
          推荐内容流
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#52627a]">
          {response.result.overall_summary}
        </p>
      </div>

      <div className="space-y-4">
        {response.recommendedItems.map((item) => (
          <article
            key={item.content_id}
            className="rounded-md border border-[#d8e0ed] bg-[#fbfcfe] p-4"
          >
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#172033]">
                  {item.content.title}
                </h3>
                <p className="mt-1 text-sm text-[#52627a]">
                  {item.content.content_type}
                </p>
              </div>
              <div className="rounded-md bg-[#172033] px-3 py-2 text-sm font-semibold text-white">
                {item.fit_score}/100
              </div>
            </div>

            <p className="text-sm leading-6 text-[#354156]">
              {item.content.summary}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#52627a]">
              {item.content.body}
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {item.content.author && onNegotiatePerson ? (
                <button
                  type="button"
                  onClick={() =>
                    onNegotiatePerson(
                      item.content.author?.id ?? "",
                      item.content.id,
                    )
                  }
                  disabled={negotiatingTargetId === item.content.author.id}
                  className="rounded-md border border-[#c7d2e2] bg-white px-3 py-2 text-sm font-medium text-[#354156] hover:bg-[#f3f6fb] disabled:cursor-not-allowed disabled:bg-[#eef2f7] disabled:text-[#6a7688]"
                >
                  {negotiatingTargetId === item.content.author.id
                    ? "协商中..."
                    : "和作者 Agent 协商"}
                </button>
              ) : null}
              {item.content.linkedGroups.map((group) =>
                onNegotiateGroup ? (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => onNegotiateGroup(group.id, item.content.id)}
                    disabled={negotiatingTargetId === group.id}
                    className="rounded-md border border-[#c7d2e2] bg-white px-3 py-2 text-sm font-medium text-[#354156] hover:bg-[#f3f6fb] disabled:cursor-not-allowed disabled:bg-[#eef2f7] disabled:text-[#6a7688]"
                  >
                    {negotiatingTargetId === group.id
                      ? "协商中..."
                      : `和关联群 Agent 协商：${group.name}`}
                  </button>
                ) : null,
              )}
            </div>

            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="rank" value={item.rank} />
              <Field
                label="recommendation_level"
                value={item.recommendation_level}
              />
              <Field label="reason" value={item.reason} />
              <Field label="risk" value={item.risk} />
              <Field
                label="content_to_connection_value"
                value={item.content_to_connection_value}
              />
              <Field label="suggested_action" value={item.suggested_action} />
              <div>
                <dt className="mb-2 text-xs font-semibold text-[#52627a]">
                  topics
                </dt>
                <dd>
                  <TagList items={item.content.topics} />
                </dd>
              </div>
              <div>
                <dt className="mb-2 text-xs font-semibold text-[#52627a]">
                  quality_signals
                </dt>
                <dd>
                  <TagList items={item.content.quality_signals} />
                </dd>
              </div>
              <div>
                <dt className="mb-2 text-xs font-semibold text-[#52627a]">
                  filter_risks
                </dt>
                <dd>
                  <TagList items={item.content.filter_risks} />
                </dd>
              </div>
              <div>
                <dt className="mb-2 text-xs font-semibold text-[#52627a]">
                  matched_traits
                </dt>
                <dd>
                  <TagList items={item.matched_traits} />
                </dd>
              </div>
            </dl>

            {item.content.author ? (
              <div className="mt-4 rounded-md border border-[#d8e0ed] bg-white p-3">
                <h4 className="text-sm font-semibold text-[#172033]">
                  作者：{item.content.author.display_name}
                </h4>
                <p className="mt-1 text-sm text-[#52627a]">
                  {item.content.author.role_type}
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <TagList items={item.content.author.credibility_signals} />
                  <TagList items={item.content.author.risk_flags} />
                </div>
              </div>
            ) : null}

            {item.content.linkedGroups.length > 0 ? (
              <div className="mt-4 space-y-3">
                {item.content.linkedGroups.map((group) => (
                  <div
                    key={group.id}
                    className="rounded-md border border-[#d8e0ed] bg-white p-3"
                  >
                    <h4 className="text-sm font-semibold text-[#172033]">
                      关联群：{group.name}
                    </h4>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <TagList items={group.culture_tags} />
                      <TagList items={group.risk_flags} />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {response.filteredItems.length > 0 ? (
        <div className="mt-5 border-t border-[#d8e0ed] pt-4">
          <h3 className="mb-3 text-base font-semibold text-[#172033]">
            过滤内容
          </h3>
          <div className="space-y-3">
            {response.filteredItems.map((item) => (
              <article
                key={item.content_id}
                className="rounded-md border border-[#f0d3d3] bg-[#fffafa] p-3"
              >
                <h4 className="font-semibold text-[#172033]">
                  {item.content.title}
                </h4>
                <p className="mt-2 text-sm leading-6 text-[#354156]">
                  {item.reason}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#b42318]">
                  {item.risk}
                </p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
