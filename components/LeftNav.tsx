import type { DemoView } from "@/lib/demo-types";

const navItems: Array<{ id: DemoView; label: string; icon: string }> = [
  { id: "interview", label: "消息", icon: "M" },
  { id: "people_match", label: "联系人", icon: "C" },
  { id: "group_match", label: "群聊", icon: "G" },
  { id: "realm_feed", label: "空间", icon: "S" },
  { id: "home", label: "灵犀", icon: "L" },
];

type LeftNavProps = {
  activeView: DemoView;
  onNavigate: (view: DemoView) => void;
};

export function LeftNav({ activeView, onNavigate }: LeftNavProps) {
  return (
    <aside className="hidden min-h-screen w-[242px] shrink-0 border-r border-blue-100 bg-gradient-to-b from-slate-50 to-blue-50/80 px-5 py-8 lg:flex lg:flex-col">
      <div className="mb-14 flex items-center gap-3">
        <div className="relative flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 via-blue-100 to-cyan-100 shadow-sm ring-4 ring-white">
          <span className="text-base font-black text-blue-600">小宇</span>
          <span className="absolute right-0 bottom-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-950">小宇同学</p>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            在线
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-3">
        {navItems.map((item) => {
          const isActive = item.id === activeView;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex h-14 items-center gap-4 rounded-[20px] px-4 text-left text-lg font-semibold transition ${
                isActive
                  ? "bg-blue-100/80 text-blue-600 shadow-sm"
                  : "text-slate-900 hover:bg-white/70"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm font-black ${
                  item.id === "home"
                    ? "bg-gradient-to-br from-blue-500 to-cyan-400 text-white"
                    : "text-slate-900"
                }`}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-10 flex items-center justify-between px-2 text-lg font-black text-slate-900">
        <span>≡</span>
        <span>⌂</span>
        <span>⚙</span>
      </div>
    </aside>
  );
}

