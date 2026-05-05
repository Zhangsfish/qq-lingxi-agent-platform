import { MessageInput } from "@/components/MessageInput";
import { MessageList } from "@/components/MessageList";
import type { ChatMessage } from "@/lib/types";

type ChatPanelProps = {
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  inputDisabled?: boolean;
  error: string | null;
  agentLabel: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onClear: () => void;
};

export function ChatPanel({
  messages,
  input,
  isLoading,
  inputDisabled = false,
  error,
  agentLabel,
  onInputChange,
  onSend,
  onClear,
}: ChatPanelProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-md border border-[#d8e0ed] bg-white">
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          agentLabel={agentLabel}
        />
      </div>

      {error ? (
        <div className="border-t border-[#f0c4c4] bg-[#fff5f5] px-4 py-3 text-sm text-[#b42318]">
          {error}
        </div>
      ) : null}

      <MessageInput
        value={input}
        isLoading={isLoading}
        isDisabled={inputDisabled}
        onChange={onInputChange}
        onSend={onSend}
        onClear={onClear}
      />
    </section>
  );
}
