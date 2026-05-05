type SoftCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function SoftCard({ children, className = "" }: SoftCardProps) {
  return (
    <section
      className={`rounded-[28px] border border-blue-100 bg-white/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 ${className}`}
    >
      {children}
    </section>
  );
}
