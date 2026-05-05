import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import {
  loadContentItemsByScene,
  loadPeople,
  loadPeopleByScene,
} from "@/lib/data-loaders";
import {
  attachPersonProfiles,
  buildPersonMatchingPromptInput,
  parsePersonMatchResult,
} from "@/lib/person-matcher";
import { validateUserNeedProfile } from "@/lib/profile-validation";
import { callSiliconFlow } from "@/lib/siliconflow";
import type { PersonMatchRequest } from "@/lib/person-match-schema";

function isPersonMatchRequest(body: unknown): body is PersonMatchRequest {
  return Boolean(
    body &&
      typeof body === "object" &&
      "profile" in body &&
      (body as PersonMatchRequest).profile,
  );
}

async function loadPersonMatcherPrompt() {
  const filePath = path.join(process.cwd(), "agents", "person_matcher_agent.md");
  return fs.readFile(filePath, "utf-8");
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;

    if (!isPersonMatchRequest(body)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const profile = validateUserNeedProfile(body.profile);
    const scenePeople = await loadPeopleByScene(profile.scene);
    const people = scenePeople.length > 0 ? scenePeople : await loadPeople();
    const contentItems = await loadContentItemsByScene(profile.scene);
    const systemPrompt = await loadPersonMatcherPrompt();
    const promptInput = buildPersonMatchingPromptInput(
      profile,
      people,
      contentItems,
    );
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
        maxTokens: 3200,
        temperature: 0.2,
        timeoutMs: 120_000,
      },
    );
    const parsedResult = parsePersonMatchResult(rawContent);
    const result = {
      ...parsedResult,
      candidate_count: people.length,
    };
    const { matchedPeople, filteredPeople } = attachPersonProfiles(
      result,
      people,
      contentItems,
    );

    return NextResponse.json({
      result,
      matchedPeople,
      filteredPeople,
      rawContent,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
