import Image from "next/image";
import penguinManifest from "@/public/persona-penguins/persona_penguin_manifest.json";
import { formatConfidenceLabel } from "@/lib/display-labels";
import type { AxisResult, PersonalityProfile } from "@/lib/personality-schema";
import { SafeMarkdownText } from "./SafeMarkdownText";

type PersonaResultViewProps = {
  finalProfile: PersonalityProfile | null;
  parseError: string | null;
  needsVerification: string[];
  onEnterInterview: () => void;
  onRestart: () => void;
};

function AxisCard({
  label,
  axis,
}: {
  label: string;
  axis: AxisResult;
}) {
  return (
    <div className="rounded-[20px] border border-blue-100 bg-blue-50/50 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-lg font-black text-slate-950">{label}</p>
        <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-blue-700">
          {axis.leaning} · {formatConfidenceLabel(axis.confidence)}
        </span>
      </div>
      <p className="mt-3 text-sm font-bold text-slate-600">证据</p>
      <ul className="mt-1 space-y-1 text-sm leading-6 text-slate-600">
        {axis.evidence.map((item) => (
          <li key={item}>
            <SafeMarkdownText content={item} compact />
          </li>
        ))}
      </ul>
      {axis.counter_evidence.length > 0 ? (
        <>
          <p className="mt-3 text-sm font-bold text-slate-600">反证</p>
          <ul className="mt-1 space-y-1 text-sm leading-6 text-slate-500">
            {axis.counter_evidence.map((item) => (
              <li key={item}>
                <SafeMarkdownText content={item} compact />
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-lg font-black text-slate-950">{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
        {items.length > 0 ? (
          items.map((item) => (
            <li key={item}>
              <SafeMarkdownText content={item} compact />
            </li>
          ))
        ) : (
          <li>暂无明确结论，建议继续确认。</li>
        )}
      </ul>
    </div>
  );
}

function getPenguinAsset(typeGuess: string) {
  const type = typeGuess.match(/[EI][NS][TF][JP]/i)?.[0].toUpperCase();
  return (
    penguinManifest.items.find((item) => item.type === type) ??
    penguinManifest.items[0]
  );
}

export function PersonaResultView({
  finalProfile,
  parseError,
  needsVerification,
  onEnterInterview,
  onRestart,
}: PersonaResultViewProps) {
  if (!finalProfile) {
    return (
      <div className="flex h-full flex-col">
        <h1 className="text-4xl font-black tracking-normal text-slate-950">
          还没有生成灵犀人格
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-500">
          完成 12 题后，灵犀会在这里生成你的 QQ-MBTI、人格名和长期画像。
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="mt-6 h-12 w-fit rounded-full bg-blue-600 px-6 text-base font-bold text-white"
        >
          重新开始
        </button>
      </div>
    );
  }

  const { mbti_like: mbtiLike, soul_profile: soulProfile } = finalProfile;
  const penguin = getPenguinAsset(mbtiLike.type_guess);
  const verificationItems =
    needsVerification.length > 0 ? needsVerification : finalProfile.needs_verification;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex flex-col">
          <p className="text-sm font-bold text-blue-600">你的灵犀人格</p>
          <p className="mt-3 w-fit rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
            {mbtiLike.type_guess} · {penguin.penguinName}
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-normal text-slate-950">
            {soulProfile.persona_name}
          </h1>
          <p className="mt-3 max-w-3xl text-lg font-semibold leading-8 text-slate-800">
            {penguin.oneLine}
          </p>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-500">
            这是一份长期人格画像，用来帮助灵犀更好地理解你；具体找人、找群和找内容，
            会在下一步结合你的实际需求继续确认。
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-700">
            下一步会继续确认“你这次具体想找什么”。长期人格画像不会替你做决定，
            只会作为后续推荐和协商的参考。
          </p>
          <div className="mt-4 rounded-[18px] border border-amber-100 bg-amber-50 px-4 py-3">
            <p className="text-sm font-bold text-amber-800">需要留意的风险</p>
            <SafeMarkdownText
              content={
                soulProfile.risk_blindspots[0] ??
                "仍需通过后续真实场景继续校准。"
              }
              compact
              className="mt-1 text-amber-800"
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onEnterInterview}
              className="h-11 rounded-full bg-blue-600 px-5 text-sm font-bold text-white"
            >
              进入具体需求
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="h-11 rounded-full border border-blue-200 bg-white px-5 text-sm font-bold text-blue-700"
            >
              重测
            </button>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            当前 Demo 仅在本机保存。点击重测可清除人格结果并重新开始。
          </p>
        </div>
        <figure className="rounded-[22px] border border-blue-100 bg-blue-50/40 p-3">
          <Image
            src={penguin.withLabel}
            alt={`${penguin.type} ${penguin.penguinName}完整形象`}
            width={512}
            height={580}
            className="h-auto w-full object-contain"
            priority
          />
        </figure>
      </div>

      {parseError ? (
        <div className="mb-5 rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
          已生成备用人格结果：结构化解析不完整，但不影响本次展示。
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-4">
        <AxisCard label="E / I" axis={mbtiLike.axis_analysis.E_I} />
        <AxisCard label="S / N" axis={mbtiLike.axis_analysis.S_N} />
        <AxisCard label="T / F" axis={mbtiLike.axis_analysis.T_F} />
        <AxisCard label="J / P" axis={mbtiLike.axis_analysis.J_P} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ListBlock title="核心母题" items={soulProfile.core_theme} />
        <ListBlock title="价值排序" items={soulProfile.value_rank} />
        <ListBlock title="不为清单" items={soulProfile.not_to_do_list} />
        <ListBlock title="能量机制" items={soulProfile.energy_mechanism} />
        <ListBlock title="能力结构" items={soulProfile.capability_stack} />
        <ListBlock title="世界模型" items={soulProfile.world_model} />
        <ListBlock title="风险盲区" items={soulProfile.risk_blindspots} />
        <ListBlock title="还需要确认的地方" items={verificationItems} />
      </div>
    </div>
  );
}
