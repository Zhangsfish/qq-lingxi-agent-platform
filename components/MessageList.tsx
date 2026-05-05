import type { ChatMessage } from "@/lib/types";

type MessageListProps = {
  messages: ChatMessage[];
  isLoading: boolean;
  agentLabel: string;
};

export function MessageList({
  messages,
  isLoading,
  agentLabel,
}: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center text-center text-sm text-[#6a7688]">
        输入一句话，选择不同 Agent，观察它们读取不同 .md prompt 后的回复差异。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message, index) => (
        <div
          key={`${message.role}-${index}`}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[85%] whitespace-pre-wrap rounded-md px-4 py-3 text-sm leading-6 ${
              message.role === "user"
                ? "bg-[#2563eb] text-white"
                : "bg-[#eef3f9] text-[#172033]"
            }`}
          >
            {message.content}
          </div>
        </div>
      ))}
      {isLoading ? (
        <div className="flex justify-start">
          <div className="rounded-md bg-[#eef3f9] px-4 py-3 text-sm text-[#52627a]">
            {agentLabel} 正在回复...
          </div>
        </div>
      ) : null}
    </div>
  );
}
