import { NextRequest, NextResponse } from "next/server";
import { loadAgentPrompt } from "@/lib/agents";
import { isAgentId } from "@/lib/agent-config";
import { callSiliconFlow } from "@/lib/siliconflow";
import type { AgentRespondRequest } from "@/lib/types";

function isAgentRespondRequest(body: unknown): body is AgentRespondRequest {
  if (!body || typeof body !== "object") return false;

  const candidate = body as Partial<AgentRespondRequest>;
  return (
    typeof candidate.agentId === "string" &&
    isAgentId(candidate.agentId) &&
    Array.isArray(candidate.messages) &&
    candidate.messages.every(
      (message) =>
        message &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string",
    )
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;

    if (!isAgentRespondRequest(body)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const systemPrompt = await loadAgentPrompt(body.agentId);
    const content = await callSiliconFlow(systemPrompt, body.messages);

    return NextResponse.json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
