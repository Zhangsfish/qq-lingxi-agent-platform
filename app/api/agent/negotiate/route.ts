import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import {
  getContentItemById,
  getGroupById,
  getPersonById,
} from "@/lib/data-loaders";
import {
  buildNegotiationPromptInput,
  parseNegotiationResult,
} from "@/lib/negotiation";
import {
  NegotiationSourceSchema,
  NegotiationTargetTypeSchema,
  type NegotiationRequest,
} from "@/lib/negotiation-schema";
import { validateUserNeedProfile } from "@/lib/profile-validation";
import { callSiliconFlow } from "@/lib/siliconflow";

function parseNegotiationRequest(body: unknown): NegotiationRequest {
  if (!body || typeof body !== "object") {
    throw new Error("Invalid request body");
  }

  const request = body as Partial<NegotiationRequest>;
  if (!request.profile || !request.targetId) {
    throw new Error("Invalid request body");
  }

  return {
    profile: request.profile,
    soulProfile: request.soulProfile ?? null,
    targetType: NegotiationTargetTypeSchema.parse(request.targetType),
    targetId: request.targetId,
    source: NegotiationSourceSchema.parse(request.source),
    contentId: request.contentId ?? null,
  };
}

async function loadNegotiationPrompt() {
  const filePath = path.join(process.cwd(), "agents", "negotiation_agent.md");
  return fs.readFile(filePath, "utf-8");
}

export async function POST(req: NextRequest) {
  try {
    const requestBody = parseNegotiationRequest((await req.json()) as unknown);
    const profile = validateUserNeedProfile(requestBody.profile);
    const sourceContent = requestBody.contentId
      ? await getContentItemById(requestBody.contentId)
      : null;
    const systemPrompt = await loadNegotiationPrompt();

    if (requestBody.targetType === "group") {
      const targetProfile = await getGroupById(requestBody.targetId);
      if (!targetProfile) {
        return NextResponse.json(
          { error: `Group not found: ${requestBody.targetId}` },
          { status: 404 },
        );
      }

      const target = { type: "group" as const, profile: targetProfile };
      const promptInput = buildNegotiationPromptInput({
        request: requestBody,
        profile,
        soulProfile: requestBody.soulProfile,
        target,
        sourceContent,
      });
      const rawContent = await callSiliconFlow(
        systemPrompt,
        [{ role: "user", content: promptInput }],
        {
          maxRetries: 0,
          maxTokens: 2400,
          temperature: 0.2,
          timeoutMs: 120_000,
        },
      );
      const parsedResult = parseNegotiationResult(rawContent);
      const result = {
        ...parsedResult,
        target_type: "group" as const,
        target_id: requestBody.targetId,
        source: requestBody.source,
        content_id: requestBody.contentId ?? null,
      };

      return NextResponse.json({
        result,
        target,
        sourceContent,
        rawContent,
      });
    }

    const targetProfile = await getPersonById(requestBody.targetId);
    if (!targetProfile) {
      return NextResponse.json(
        { error: `Person not found: ${requestBody.targetId}` },
        { status: 404 },
      );
    }

    const target = { type: "person" as const, profile: targetProfile };
    const promptInput = buildNegotiationPromptInput({
      request: requestBody,
      profile,
      soulProfile: requestBody.soulProfile,
      target,
      sourceContent,
    });
    const rawContent = await callSiliconFlow(
      systemPrompt,
      [{ role: "user", content: promptInput }],
      {
        maxRetries: 0,
        maxTokens: 2400,
        temperature: 0.2,
        timeoutMs: 120_000,
      },
    );
    const parsedResult = parseNegotiationResult(rawContent);
    const result = {
      ...parsedResult,
      target_type: "person" as const,
      target_id: requestBody.targetId,
      source: requestBody.source,
      content_id: requestBody.contentId ?? null,
    };

    return NextResponse.json({
      result,
      target,
      sourceContent,
      rawContent,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
