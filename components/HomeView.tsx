import { LingxiBot } from "./LingxiBot";
import { SoftCard } from "./SoftCard";

type HomeViewProps = {
  isLoading: boolean;
  onStart: (message: string) => void;
  onNavigateProfile: () => void;
  onNavigateGroup: () => void;
  onNavigateRealm: () => void;
};

const starters = [
  "我想找愿意讲转行经验的学长学姐",
  "我想找一个适合长期讨论的共同体",
  "我想先看真实的经验帖和攻略",
];

export function HomeView({
  isLoading,
  onStart,
  onNavigateProfile,
  onNavigateGroup,
  onNavigateRealm,
}: HomeViewProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-5xl font-black tracking-normal text-slate-950">
            灵犀
          </h1>
          <p className="mt-4 text-xl text-slate-500">
            让你发现更适合自己的群、内容与连接
          </p>
        </div>
        <div className="hidden rounded-full bg-blue-50 px-10 py-6 sm:block">
          <LingxiBot size="lg" />
        </div>
      </div>

      <div className="rounded-[28px] border-2 border-blue-500 bg-white p-6 shadow-sm">
        <h2 className="text-3xl font-bold tracking-normal">
          你现在想找什么？
        </h2>
        <p className="mt-3 text-base leading-7 text-slate-500">
          告诉我你的目标、兴趣或困惑，我来帮你找到合适的人、群和内容
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => onStart("我想找到适合自己的 QQ 群和人")}
            disabled={isLoading}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white shadow-sm disabled:bg-blue-300"
          >
            ↗
          </button>
          <div className="flex flex-wrap gap-3">
            {starters.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => onStart(starter)}
                disabled={isLoading}
                className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 disabled:opacity-60"
              >
                {starter}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <SoftCard>
          <div className="mb-8 h-28 rounded-[24px] bg-gradient-to-br from-blue-100 to-cyan-50" />
          <h3 className="text-2xl font-bold">匹配人 / 作者</h3>
          <p className="mt-3 min-h-14 text-sm leading-7 text-slate-500">
            帮你找到愿意交流的过来人、同好与优质作者
          </p>
          <button
            type="button"
            onClick={onNavigateProfile}
            className="mt-5 h-11 w-11 rounded-full bg-blue-600 text-lg font-bold text-white"
          >
            →
          </button>
        </SoftCard>
        <SoftCard>
          <div className="mb-8 h-28 rounded-[24px] bg-gradient-to-br from-emerald-100 to-cyan-50" />
          <h3 className="text-2xl font-bold">匹配 QQ 群</h3>
          <p className="mt-3 min-h-14 text-sm leading-7 text-slate-500">
            根据你的场景与偏好，推荐更适合加入的群聊共同体
          </p>
          <button
            type="button"
            onClick={onNavigateGroup}
            className="mt-5 h-11 w-11 rounded-full bg-emerald-500 text-lg font-bold text-white"
          >
            →
          </button>
        </SoftCard>
        <SoftCard>
          <div className="mb-8 h-28 rounded-[24px] bg-gradient-to-br from-violet-100 to-blue-50" />
          <h3 className="text-2xl font-bold">进入群域</h3>
          <p className="mt-3 min-h-14 text-sm leading-7 text-slate-500">
            先浏览真实经验、内容讨论与高质量攻略，再决定如何连接
          </p>
          <button
            type="button"
            onClick={onNavigateRealm}
            className="mt-5 h-11 w-11 rounded-full bg-violet-500 text-lg font-bold text-white"
          >
            →
          </button>
        </SoftCard>
      </div>
    </div>
  );
}

