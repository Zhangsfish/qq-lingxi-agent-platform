import type { GroupMatchResponse } from "@/lib/group-match-schema";

type GroupMatchPanelProps = {
  response: GroupMatchResponse | null;
  onNegotiateGroup?: (groupId: string) => void;
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

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-[#52627a]">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-[#172033]">{value}</dd>
    </div>
  );
}

export function GroupMatchPanel({
  response,
  onNegotiateGroup,
  negotiatingTargetId,
}: GroupMatchPanelProps) {
  if (!response) return null;

  return (
    <section className="mt-4 rounded-md border border-[#d8e0ed] bg-white p-4">
      <div className="mb-4">
        <p className="text-sm font-medium text-[#52627a]">AI 群匹配</p>
        <h2 className="mt-1 text-xl font-semibold text-[#172033]">
          推荐候选群
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#52627a]">
          {response.result.overall_summary}
        </p>
      </div>

      <div className="space-y-4">
        {response.matchedGroups.map((match) => (
          <article
            key={match.group_id}
            className="rounded-md border border-[#d8e0ed] bg-[#fbfcfe] p-4"
          >
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#172033]">
                  {match.group.name}
                </h3>
                <p className="mt-1 text-sm text-[#52627a]">
                  {match.group.description}
                </p>
              </div>
              <div className="rounded-md bg-[#172033] px-3 py-2 text-sm font-semibold text-white">
                {match.fit_score}/100
              </div>
            </div>
            {onNegotiateGroup ? (
              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => onNegotiateGroup(match.group.id)}
                  disabled={negotiatingTargetId === match.group.id}
                  className="rounded-md border border-[#c7d2e2] bg-white px-3 py-2 text-sm font-medium text-[#354156] hover:bg-[#f3f6fb] disabled:cursor-not-allowed disabled:bg-[#eef2f7] disabled:text-[#6a7688]"
                >
                  {negotiatingTargetId === match.group.id
                    ? "协商中..."
                    : "发起 Agent 协商"}
                </button>
              </div>
            ) : null}

            <dl className="grid gap-4 sm:grid-cols-2">
              <Field
                label="recommendation_level"
                value={match.recommendation_level}
              />
              <Field label="suggested_next_action" value={match.suggested_next_action} />
              <Field label="reason" value={match.reason} />
              <Field label="risk" value={match.risk} />
              <Field label="summary_for_user" value={match.summary_for_user} />
              <Field
                label="summary_for_group_agent"
                value={match.summary_for_group_agent}
              />
              <div>
                <dt className="mb-2 text-xs font-semibold text-[#52627a]">
                  matched_traits
                </dt>
                <dd>
                  <TagList items={match.matched_traits} />
                </dd>
              </div>
              <div>
                <dt className="mb-2 text-xs font-semibold text-[#52627a]">
                  mismatched_traits
                </dt>
                <dd>
                  <TagList items={match.mismatched_traits} />
                </dd>
              </div>
              <div>
                <dt className="mb-2 text-xs font-semibold text-[#52627a]">
                  group.culture_tags
                </dt>
                <dd>
                  <TagList items={match.group.culture_tags} />
                </dd>
              </div>
              <div>
                <dt className="mb-2 text-xs font-semibold text-[#52627a]">
                  group.risk_flags
                </dt>
                <dd>
                  <TagList items={match.group.risk_flags} />
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      {response.filteredGroups.length > 0 ? (
        <div className="mt-5 border-t border-[#d8e0ed] pt-4">
          <h3 className="mb-3 text-base font-semibold text-[#172033]">
            过滤或谨慎项
          </h3>
          <div className="space-y-3">
            {response.filteredGroups.map((filtered) => (
              <article
                key={filtered.group_id}
                className="rounded-md border border-[#f0d3d3] bg-[#fffafa] p-3"
              >
                <h4 className="font-semibold text-[#172033]">
                  {filtered.group.name}
                </h4>
                <p className="mt-2 text-sm leading-6 text-[#354156]">
                  {filtered.reason}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#b42318]">
                  {filtered.risk}
                </p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
