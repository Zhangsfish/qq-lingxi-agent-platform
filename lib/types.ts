export type AgentId = "user_agent" | "group_agent" | "matchmaker_agent";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AgentRespondRequest = {
  agentId: AgentId;
  messages: ChatMessage[];
};

export type AgentRespondResponse = {
  content: string;
};
