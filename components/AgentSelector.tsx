import { agentConfigs } from "@/lib/agent-config";
import type { AgentId } from "@/lib/types";

type AgentSelectorProps = {
  selectedAgentId: AgentId;
  onChange: (agentId: AgentId) => void;
};

export function AgentSelector({
  selectedAgentId,
  onChange,
}: AgentSelectorProps) {
  return (
    <section className="mb-4 grid gap-3 sm:grid-cols-3">
      {agentConfigs.map((agent) => {
        const selected = agent.id === selectedAgentId;

        return (
          <button
            key={agent.id}
            type="button"
            onClick={() => onChange(agent.id)}
            className={`rounded-md border px-4 py-3 text-left transition ${
              selected
                ? "border-[#2563eb] bg-white shadow-sm"
                : "border-[#d8e0ed] bg-[#eef3f9] hover:bg-white"
            }`}
          >
            <span className="block text-sm font-semibold">{agent.label}</span>
            <span className="mt-1 block text-sm leading-5 text-[#52627a]">
              {agent.description}
            </span>
          </button>
        );
      })}
    </section>
  );
}
