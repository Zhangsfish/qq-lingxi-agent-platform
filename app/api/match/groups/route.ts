import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import {
  attachGroupProfiles,
  buildGroupMatchingPromptInput,
  parseGroupMatchResult,
} from "@/lib/group-matcher";
import { loadGroups, loadGroupsByScene } from "@/lib/data-loaders";
import { callSiliconFlow } from "@/lib/siliconflow";
import { validateUserNeedProfile } from "@/lib/profile-validation";
import type { GroupMatchRequest } from "@/lib/group-match-schema";

function isGroupMatchRequest(body: unknown): body is GroupMatchRequest {
  return Boolean(
    body &&
      typeof body === "object" &&
      "profile" in body &&
      (body as GroupMatchRequest).profile,
  );
}

async function loadGroupMatcherPrompt() {
  const filePath = path.join(process.cwd(), "agents", "group_matcher_agent.md");
  return fs.readFile(filePath, "utf-8");
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;

    if (!isGroupMatchRequest(body)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const profile = validateUserNeedProfile(body.profile);
    const sceneGroups = await loadGroupsByScene(profile.scene);
    const groups = sceneGroups.length > 0 ? sceneGroups : await loadGroups();
    const systemPrompt = await loadGroupMatcherPrompt();
    const promptInput = buildGroupMatchingPromptInput(profile, groups);
    const rawContent = await callSiliconFlow(
      systemPrompt,
      [
        {
          role: "user",
          content: promptInput,
        },
      ],
      {
        maxRetries: 0,
        maxTokens: 2600,
        temperature: 0.2,
        timeoutMs: 120_000,
      },
    );
    const result = parseGroupMatchResult(rawContent);
    const { matchedGroups, filteredGroups } = attachGroupProfiles(
      result,
      groups,
    );

    return NextResponse.json({
      result,
      matchedGroups,
      filteredGroups,
      rawContent,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
