"use client";

import { useState } from "react";
import type { UserNeedProfile } from "@/lib/profile-schema";

type ProfilePanelProps = {
  profile: UserNeedProfile | null;
  rawContent?: string;
};

type FieldListProps = {
  title: string;
  items: string[];
};

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-[#52627a]">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-[#172033]">{value}</dd>
    </div>
  );
}

function FieldList({ title, items }: FieldListProps) {
  return (
    <div>
      <dt className="text-xs font-semibold text-[#52627a]">{title}</dt>
      <dd className="mt-2 flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <span
              key={item}
              className="rounded-md border border-[#c7d2e2] bg-[#f7f9fc] px-2 py-1 text-xs text-[#354156]"
            >
              {item}
            </span>
          ))
        ) : (
          <span className="text-sm text-[#6a7688]">暂无</span>
        )}
      </dd>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-[#d8e0ed] pt-4 first:border-t-0 first:pt-0">
      <h3 className="mb-3 text-base font-semibold text-[#172033]">{title}</h3>
      <dl className="grid gap-4 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

export function ProfilePanel({ profile, rawContent }: ProfilePanelProps) {
  const [copyStatus, setCopyStatus] = useState("");

  if (!profile) return null;

  async function handleCopyProfile() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(profile, null, 2));
      setCopyStatus("已复制");
    } catch {
      setCopyStatus("复制失败");
    }
  }

  return (
    <aside className="mt-4 rounded-md border border-[#d8e0ed] bg-white p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-[#52627a]">用户画像 JSON</p>
          <h2 className="mt-1 text-xl font-semibold text-[#172033]">
            双通道用户画像
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {copyStatus ? (
            <span className="text-sm text-[#52627a]">{copyStatus}</span>
          ) : null}
          <button
            type="button"
            onClick={handleCopyProfile}
            className="rounded-md bg-[#172033] px-3 py-2 text-sm font-medium text-white hover:bg-[#2a3548]"
          >
            复制画像 JSON
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <Section title="总体画像">
          <Field label="scene" value={profile.scene} />
          <Field label="surface_need" value={profile.surface_need} />
          <Field label="core_need" value={profile.core_need} />
          <Field label="summary" value={profile.summary} />
        </Section>

        <Section title="content_channel">
          <Field
            label="content_need"
            value={profile.content_channel.content_need}
          />
          <Field
            label="content_depth"
            value={profile.content_channel.content_depth}
          />
          <Field
            label="content_use_case"
            value={profile.content_channel.content_use_case}
          />
          <Field
            label="comment_interaction_style"
            value={profile.content_channel.comment_interaction_style}
          />
          <FieldList
            title="content_topics"
            items={profile.content_channel.content_topics}
          />
          <FieldList
            title="preferred_content_forms"
            items={profile.content_channel.preferred_content_forms}
          />
          <FieldList
            title="content_ranking_criteria"
            items={profile.content_channel.content_ranking_criteria}
          />
          <FieldList
            title="content_to_filter"
            items={profile.content_channel.content_to_filter}
          />
          <FieldList
            title="publishable_content_angle"
            items={profile.content_channel.publishable_content_angle}
          />
          <FieldList
            title="content_to_connection_triggers"
            items={profile.content_channel.content_to_connection_triggers}
          />
        </Section>

        <Section title="connection_channel">
          <Field
            label="relationship_need"
            value={profile.connection_channel.relationship_need}
          />
          <Field
            label="target_community_type"
            value={profile.connection_channel.target_community_type}
          />
          <Field
            label="connection_intensity"
            value={profile.connection_channel.connection_intensity}
          />
          <Field
            label="summary_for_matchmaker_agent"
            value={profile.connection_channel.summary_for_matchmaker_agent}
          />
          <Field
            label="summary_for_group_agent"
            value={profile.connection_channel.summary_for_group_agent}
          />
          <FieldList
            title="suitable_group_traits"
            items={profile.connection_channel.suitable_group_traits}
          />
          <FieldList
            title="unsuitable_group_traits"
            items={profile.connection_channel.unsuitable_group_traits}
          />
          <FieldList
            title="matching_criteria"
            items={profile.connection_channel.matching_criteria}
          />
        </Section>

        <Section title="identity_slice">
          <Field
            label="self_presentation"
            value={profile.identity_slice.self_presentation}
          />
          <FieldList
            title="identity_slice_to_show"
            items={profile.identity_slice.identity_slice_to_show}
          />
          <FieldList
            title="identity_slice_to_hide"
            items={profile.identity_slice.identity_slice_to_hide}
          />
          <FieldList
            title="privacy_boundary"
            items={profile.identity_slice.privacy_boundary}
          />
        </Section>

        <Section title="preference_model">
          <Field
            label="confidence"
            value={profile.preference_model.confidence}
          />
          <FieldList
            title="interests"
            items={profile.preference_model.interests}
          />
          <FieldList
            title="preferred_atmosphere"
            items={profile.preference_model.preferred_atmosphere}
          />
          <FieldList
            title="disliked_atmosphere"
            items={profile.preference_model.disliked_atmosphere}
          />
          <FieldList
            title="boundaries"
            items={profile.preference_model.boundaries}
          />
          <FieldList
            title="risk_signals"
            items={profile.preference_model.risk_signals}
          />
          <FieldList
            title="uncertainty"
            items={profile.preference_model.uncertainty}
          />
          <FieldList
            title="questions_for_next_round"
            items={profile.preference_model.questions_for_next_round}
          />
        </Section>

        <Section title="routing_intent">
          {profile.routing_intent ? (
            <>
              <Field
                label="primary_route"
                value={profile.routing_intent.primary_route}
              />
              <Field
                label="recommended_cta"
                value={profile.routing_intent.recommended_cta}
              />
              <Field label="reason" value={profile.routing_intent.reason} />
              <Field
                label="confidence"
                value={profile.routing_intent.confidence}
              />
              <FieldList
                title="secondary_routes"
                items={profile.routing_intent.secondary_routes}
              />
            </>
          ) : (
            <div className="text-sm text-[#6a7688]">暂无路由判断</div>
          )}
        </Section>
      </div>

      {rawContent ? (
        <details className="mt-5 rounded-md border border-[#d8e0ed] bg-[#f7f9fc] p-3">
          <summary className="cursor-pointer text-sm font-medium text-[#354156]">
            原始 JSON
          </summary>
          <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-xs leading-5 text-[#354156]">
            {rawContent}
          </pre>
        </details>
      ) : null}
    </aside>
  );
}
