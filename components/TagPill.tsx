type TagPillProps = {
  children: React.ReactNode;
  tone?: "blue" | "green" | "purple" | "slate";
};

const toneClass = {
  blue: "border-blue-100 bg-blue-50 text-blue-700",
  green: "border-emerald-100 bg-emerald-50 text-emerald-700",
  purple: "border-violet-100 bg-violet-50 text-violet-700",
  slate: "border-slate-200 bg-slate-50 text-slate-600",
};

export function TagPill({ children, tone = "blue" }: TagPillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}
