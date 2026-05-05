import type { ChatMessage } from "@/lib/types";
import { LingxiBot } from "./LingxiBot";

type InterviewViewProps = {
  messages: ChatMessage[];
  input: string;
  isLoading: boolean;
  error: string | null;
  ready: boolean;
  profileLoading: boolean;
  profileError: string | null;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onClear: () => void;
  onGenerateProfile: () => void;
  onContinueInterview: () => void;
};

export function InterviewView({
  messages,
  input,
  isLoading,
  error,
  ready,
  profileLoading,
  profileError,
  onInputChange,
  onSend,
  onClear,
  onGenerateProfile,
  onContinueInterview,
}: InterviewViewProps) {
  return (
    <div className="flex h-full min-h-[780px] flex-col">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-5xl font-black tracking-normal">需求访谈</h1>
            <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              用户 Agent
            </span>
          </div>
          <p className="mt-4 text-lg text-slate-500">
            正在通过多轮对话理解你的需求，准备生成用户画像
          </p>
        </div>
        <LingxiBot size="lg" />
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="rounded-[26px] bg-blue-50 p-6 text-slate-500">
            你可以从“想找内容、找人、还是找适合加入的小群”开始。
          </div>
        ) : null}
        {messages.map((message, index) => {
          const isUser = message.role === "user";
          return (
            <div
              key={`${message.role}-${index}-${message.content.slice(0, 8)}`}
              className={`flex items-start gap-3 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser ? <LingxiBot size="sm" /> : null}
              <div
                className={`max-w-[72%] rounded-[22px] px-5 py-3 text-base leading-7 shadow-sm ${
                  isUser
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {message.content}
              </div>
              {isUser ? (
                <div className="h-9 w-9 rounded-full bg-slate-200" />
              ) : null}
            </div>
          );
        })}
        {isLoading ? (
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <LingxiBot size="sm" />
            灵犀正在整理追问...
          </div>
        ) : null}
      </div>

      {ready ? (
        <div className="mt-5 rounded-[24px] border-2 border-blue-500 bg-blue-50/60 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">画像信息已经基本清晰</h2>
              <p className="mt-2 text-sm text-slate-500">
                现在可以生成用户画像，也可以继续追问。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onGenerateProfile}
                disabled={profileLoading}
                className="rounded-[14px] bg-blue-600 px-6 py-3 text-sm font-bold text-white disabled:bg-blue-300"
              >
                {profileLoading ? "生成中..." : "生成用户画像"}
              </button>
              <button
                type="button"
                onClick={onContinueInterview}
                className="rounded-[14px] border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700"
              >
                继续追问
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-5 rounded-[24px] border border-blue-100 bg-white p-3 shadow-sm">
        <textarea
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          disabled={isLoading || ready}
          rows={3}
          placeholder={ready ? "先生成画像或选择继续追问" : "输入你的需求或补充信息"}
          className="w-full resize-none rounded-[18px] bg-slate-50 p-4 text-base outline-none ring-0 disabled:text-slate-400"
        />
        <div className="mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onClear}
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100"
          >
            清空
          </button>
          <button
            type="button"
            onClick={onSend}
            disabled={isLoading || ready || !input.trim()}
            className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white disabled:bg-blue-300"
          >
            发送
          </button>
        </div>
      </div>

      {error || profileError ? (
        <div className="mt-3 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || profileError}
        </div>
      ) : null}
    </div>
  );
}

