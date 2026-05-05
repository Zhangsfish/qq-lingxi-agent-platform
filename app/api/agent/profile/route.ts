import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { parseUserNeedProfile } from "@/lib/profile-extractor";
import { callSiliconFlow } from "@/lib/siliconflow";
import type {
  RoutingIntent,
  RoutingIntentActionRoute,
  RoutingIntentRoute,
  UserNeedProfile,
  UserProfileExtractRequest,
} from "@/lib/profile-schema";

function isProfileExtractRequest(
  body: unknown,
): body is UserProfileExtractRequest {
  if (!body || typeof body !== "object") return false;

  const candidate = body as Partial<UserProfileExtractRequest>;
  return (
    Array.isArray(candidate.messages) &&
    candidate.messages.length > 0 &&
    candidate.messages.every(
      (message) =>
        message &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string",
    )
  );
}

async function loadProfileExtractorPrompt() {
  const filePath = path.join(
    process.cwd(),
    "agents",
    "user_profile_extractor_agent.md",
  );
  return fs.readFile(filePath, "utf-8");
}

function formatConversation(messages: UserProfileExtractRequest["messages"]) {
  return messages
    .map((message) => {
      const label = message.role === "user" ? "用户" : "用户 Agent";
      return `${label}：${message.content}`;
    })
    .join("\n\n");
}

function buildRoutingIntent(
  primaryRoute: RoutingIntentRoute,
  reason: string,
  confidence: number,
): RoutingIntent {
  const recommendedCta =
    primaryRoute === "person_first"
      ? "匹配人 / 作者"
      : primaryRoute === "group_first"
        ? "匹配 QQ 群"
        : primaryRoute === "content_first"
          ? "进入群域"
          : primaryRoute === "mixed"
            ? "查看推荐路径"
            : "再补充几句";
  const secondaryRoutes: RoutingIntentActionRoute[] =
    primaryRoute === "person_first"
      ? ["group_first", "content_first"]
      : primaryRoute === "group_first"
        ? ["person_first", "content_first"]
        : primaryRoute === "content_first"
          ? ["person_first", "group_first"]
          : primaryRoute === "mixed"
            ? ["person_first", "group_first", "content_first"]
            : [];

  return {
    primary_route: primaryRoute,
    secondary_routes: secondaryRoutes,
    reason,
    recommended_cta: recommendedCta,
    confidence,
  };
}

function inferRoutingIntentFromMessages(
  messages: UserProfileExtractRequest["messages"],
): RoutingIntent | null {
  const text = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join("\n");

  const hasPersonIntent =
    /找.*(人|作者|学长|学姐|前辈|搭子|朋友|同好|KOL|kol|资深|从业者|伙伴|过来人)|懂.+的人|有真实经历的.+(学长|学姐|人)|聊聊/.test(
      text,
    );
  const hasGroupIntent =
    /找.*(群|圈子|共同体|组织|社群|讨论场)|进.*(群|圈子|共同体|组织|社群)|氛围适合的群/.test(
      text,
    );
  const hasContentIntent =
    /(看|看看|阅读|了解).*(内容|经验|case|案例|帖子|攻略|评价|文档|经验帖|岗位日常)|真实的.*(case|案例)|先想看看|先看/.test(
      text,
    );
  const rejectsConnectionNow =
    /(不想|暂时不想|还不想).*(加人|找人|认识人|加群|进群|连接)/.test(
      text,
    );

  if (rejectsConnectionNow && hasContentIntent) {
    return buildRoutingIntent(
      "content_first",
      "用户明确表示当前不想加人或加群，而是希望先查看内容、案例或经验。",
      0.92,
    );
  }

  if (hasPersonIntent) {
    return buildRoutingIntent(
      "person_first",
      "用户明确表达想找人、作者、学长学姐、前辈或有真实经历的人进一步交流。",
      0.9,
    );
  }

  if (hasGroupIntent) {
    return buildRoutingIntent(
      "group_first",
      "用户明确表达想找群、圈子、共同体、组织或适合自己的社群环境。",
      0.9,
    );
  }

  if (hasContentIntent) {
    return buildRoutingIntent(
      "content_first",
      "用户主要表达的是查看内容、经验、案例、帖子或真实评价。",
      0.86,
    );
  }

  return null;
}

function applyRoutingIntentFallback(
  profile: UserNeedProfile,
  messages: UserProfileExtractRequest["messages"],
) {
  const inferredRoutingIntent = inferRoutingIntentFromMessages(messages);

  if (!inferredRoutingIntent) {
    return profile;
  }

  return {
    ...profile,
    routing_intent: inferredRoutingIntent,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;

    if (!isProfileExtractRequest(body)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const systemPrompt = await loadProfileExtractorPrompt();
    const transcript = formatConversation(body.messages);
    const rawContent = await callSiliconFlow(
      systemPrompt,
      [
        {
          role: "user",
          content: `请根据以下对话历史抽取用户画像。不要复制空 schema，必须根据对话内容填写字段。\n\n${transcript}`,
        },
      ],
      {
      maxRetries: 0,
      maxTokens: 1800,
      temperature: 0.2,
      timeoutMs: 120_000,
      },
    );
    const profile = applyRoutingIntentFallback(
      parseUserNeedProfile(rawContent),
      body.messages,
    );

    return NextResponse.json({ profile, rawContent });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
