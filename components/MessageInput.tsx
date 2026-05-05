import { FormEvent, useRef } from "react";

type MessageInputProps = {
  value: string;
  isLoading: boolean;
  isDisabled?: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  onClear: () => void;
};

export function MessageInput({
  value,
  isLoading,
  isDisabled = false,
  onChange,
  onSend,
  onClear,
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSend();
    textareaRef.current?.focus();
  }

  function handleClear() {
    onClear();
    textareaRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-[#d8e0ed] p-3">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={isDisabled}
        rows={3}
        placeholder={
          isDisabled
            ? "需求画像已基本清晰，请先生成用户画像，或点击继续追问。"
            : "例如：我想找一个适合我的二次元 QQ 群，但我不喜欢太吵太抽象的群。"
        }
        className="mb-3 w-full resize-none rounded-md border border-[#c7d2e2] bg-white px-3 py-2 text-sm leading-6 outline-none disabled:cursor-not-allowed disabled:bg-[#eef2f7] disabled:text-[#6a7688] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/20"
      />
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleClear}
          className="rounded-md border border-[#c7d2e2] px-4 py-2 text-sm font-medium text-[#354156] hover:bg-[#f3f6fb]"
        >
          清空
        </button>
        <button
          type="submit"
          disabled={isLoading || isDisabled || !value.trim()}
          className="rounded-md bg-[#2563eb] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-[#9db5e8]"
        >
          发送
        </button>
      </div>
    </form>
  );
}
