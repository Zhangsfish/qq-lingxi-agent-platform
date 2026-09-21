import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type SafeMarkdownTextProps = {
  content: string;
  className?: string;
  compact?: boolean;
};

export function SafeMarkdownText({
  content,
  className = "text-slate-800",
  compact = false,
}: SafeMarkdownTextProps) {
  const paragraphClassName = compact
    ? "my-1 text-sm leading-6 text-inherit"
    : "my-2 text-base leading-8 text-inherit";
  const listClassName = compact
    ? "my-1 space-y-1 pl-5 text-sm text-inherit"
    : "my-2 space-y-1 pl-6 text-inherit";

  return (
    <div
      className={`max-w-none ${compact ? "text-sm leading-6" : "text-base leading-8"} ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => (
            <h2 className="mb-3 mt-2 text-2xl font-bold text-slate-950">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mb-2 mt-3 text-lg font-semibold text-slate-900">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className={paragraphClassName}>{children}</p>,
          ul: ({ children }) => (
            <ul className={`${listClassName} list-disc`}>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className={`${listClassName} list-decimal`}>{children}</ol>
          ),
          li: ({ children }) => <li className="leading-7">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-950">
              {children}
            </strong>
          ),
          hr: () => <hr className="my-4 border-slate-200" />,
          code: ({ children }) => (
            <code className="rounded-md bg-slate-100 px-1.5 py-0.5 text-sm text-slate-800">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
