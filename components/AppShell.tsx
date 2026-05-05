import type { DemoView } from "@/lib/demo-types";
import { LeftNav } from "./LeftNav";

type AppShellProps = {
  activeView: DemoView;
  rightPanel: React.ReactNode;
  children: React.ReactNode;
  onNavigate: (view: DemoView) => void;
};

export function AppShell({
  activeView,
  rightPanel,
  children,
  onNavigate,
}: AppShellProps) {
  return (
    <main className="min-h-screen bg-[#eef5ff] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-[1680px]">
        <LeftNav activeView={activeView} onNavigate={onNavigate} />
        <div className="flex min-w-0 flex-1 flex-col gap-3 px-3 py-4 sm:px-5 lg:flex-row">
          <section className="min-w-0 flex-1 rounded-[28px] bg-white/95 p-5 shadow-sm ring-1 ring-blue-100 sm:p-8">
            {children}
          </section>
          <aside className="w-full shrink-0 rounded-[28px] bg-white/95 p-5 shadow-sm ring-1 ring-blue-100 lg:w-[360px] xl:w-[400px]">
            {rightPanel}
          </aside>
        </div>
      </div>
    </main>
  );
}

