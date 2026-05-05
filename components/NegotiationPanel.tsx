import type { NegotiationResponse } from "@/lib/negotiation-schema";

type NegotiationPanelProps = {
  response: NegotiationResponse | null;
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

export function NegotiationPanel({ response }: NegotiationPanelProps) {
  if (!response) return null;

  const { result, target, sourceContent } = response;
  const targetTitle =
    target.type === "group"
      ? target.profile.name
      : target.profile.display_name;
  const targetSubtitle =
    target.type === "group"
      ? target.profile.category
      : target.profile.role_type;
  const mainTags =
    target.type === "group"
      ? target.profile.culture_tags
      : target.profile.expertise_tags;

  return (
    <section className="mt-4 rounded-md border border-[#bfd3f7] bg-white p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#52627a]">
            Agent-to-Agent 协商
          </p>
          <h2 className="mt-1 text-xl font-semibold text-[#172033]">
            {targetTitle}
          </h2>
          <p className="mt-1 text-sm text-[#52627a]">{targetSubtitle}</p>
        </div>
        <div className="rounded-md bg-[#172033] px-3 py-2 text-sm font-semibold text-white">
          {result.fit_score}/100
        </div>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <Field label="target_type" value={result.target_type} />
        <Field label="decision" value={result.decision} />
        <Field label="source" value={result.source} />
        <Field label="confidence" value={result.confidence} />
        <div>
          <dt className="mb-2 text-xs font-semibold text-[#52627a]">
            target tags
          </dt>
          <dd>
            <TagList items={mainTags} />
          </dd>
        </div>
        <div>
          <dt className="mb-2 text-xs font-semibold text-[#52627a]">
            risk_flags
          </dt>
          <dd>
            <TagList items={target.profile.risk_flags} />
          </dd>
        </div>
        <div>
          <dt className="mb-2 text-xs font-semibold text-[#52627a]">
            key_alignment
          </dt>
          <dd>
            <TagList items={result.key_alignment} />
          </dd>
        </div>
        <div>
          <dt className="mb-2 text-xs font-semibold text-[#52627a]">
            key_risks
          </dt>
          <dd>
            <TagList items={result.key_risks} />
          </dd>
        </div>
        <div>
          <dt className="mb-2 text-xs font-semibold text-[#52627a]">
            open_questions
          </dt>
          <dd>
            <TagList items={result.open_questions} />
          </dd>
        </div>
        <Field label="next_action" value={result.next_action} />
        <Field label="summary_for_user" value={result.summary_for_user} />
        <Field
          label="summary_for_target_agent"
          value={result.summary_for_target_agent}
        />
        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold text-[#52627a]">
            draft_message
          </dt>
          <dd className="mt-2 whitespace-pre-wrap rounded-md border border-[#d8e0ed] bg-[#f7f9fc] p-3 text-sm leading-6 text-[#172033]">
            {result.draft_message}
          </dd>
        </div>
      </dl>

      {sourceContent ? (
        <div className="mt-5 rounded-md border border-[#d8e0ed] bg-[#fbfcfe] p-3">
          <h3 className="text-sm font-semibold text-[#172033]">
            触发内容：{sourceContent.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-[#52627a]">
            {sourceContent.summary}
          </p>
        </div>
      ) : null}

      <div className="mt-5 border-t border-[#d8e0ed] pt-4">
        <h3 className="mb-3 text-base font-semibold text-[#172033]">
          协商记录
        </h3>
        <div className="space-y-3">
          {result.negotiation_transcript.map((item, index) => (
            <article
              key={`${item.speaker}-${index}`}
              className="rounded-md border border-[#d8e0ed] bg-[#fbfcfe] p-3"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <h4 className="text-sm font-semibold text-[#172033]">
                  {item.speaker}
                </h4>
                <span className="text-xs text-[#52627a]">{item.purpose}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#354156]">
                {item.message}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
