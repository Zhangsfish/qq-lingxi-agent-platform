import type { AgentId } from "./types";

export type AgentConfig = {
  id: AgentId;
  label: string;
  description: string;
  filename: string;
};

export const agentConfigs: AgentConfig[] = [
  {
    id: "user_agent",
    label: "用户 Agent",
    description: "理解用户需求，追问偏好、边界和雷点。",
    filename: "user_agent.md",
  },
  {
    id: "group_agent",
    label: "群 Agent",
    description: "代表群说明文化、规则和适合的人。",
    filename: "group_agent.md",
  },
  {
    id: "matchmaker_agent",
    label: "匹配 Agent",
    description: "根据需求给出群类型匹配思路。",
    filename: "matchmaker_agent.md",
  },
];

export function isAgentId(value: string): value is AgentId {
  return agentConfigs.some((agent) => agent.id === value);
}

export function getAgentConfig(agentId: AgentId): AgentConfig {
  const config = agentConfigs.find((agent) => agent.id === agentId);
  if (!config) throw new Error("Unknown agentId");
  return config;
}
