import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import {
  loadContentItems,
  loadContentItemsByScene,
  loadGroupsByScene,
  loadPeopleByScene,
} from "@/lib/data-loaders";
import { validateUserNeedProfile } from "@/lib/profile-validation";
import {
  attachRealmRecommendationData,
  buildRealmRecommendationPromptInput,
  parseRealmRecommendationResult,
} from "@/lib/realm-recommender";
import type { RealmRecommendationRequest } from "@/lib/realm-recommendation-schema";
import { callSiliconFlow } from "@/lib/siliconflow";

function isRealmRecommendationRequest(
  body: unknown,
): body is RealmRecommendationRequest {
  return Boolean(
    body &&
      typeof body === "object" &&
      "profile" in body &&
      (body as RealmRecommendationRequest).profile,
  );
}

async function loadRealmRecommenderPrompt() {
  const filePath = path.join(
    process.cwd(),
    "agents",
    "realm_recommender_agent.md",
  );
  return fs.readFile(filePath, "utf-8");
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;

    if (!isRealmRecommendationRequest(body)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const profile = validateUserNeedProfile(body.profile);
    const sceneContentItems = await loadContentItemsByScene(profile.scene);
    const contentItems =
      sceneContentItems.length > 0
        ? sceneContentItems
        : await loadContentItems();
    const people = await loadPeopleByScene(profile.scene);
    const groups = await loadGroupsByScene(profile.scene);
    const systemPrompt = await loadRealmRecommenderPrompt();
    const promptInput = buildRealmRecommendationPromptInput({
      profile,
      soulProfile: body.soulProfile,
      contentItems,
      people,
      groups,
    });
    const rawContent = await callSiliconFlow(
      systemPrompt,
      [{ role: "user", content: promptInput }],
      {
        maxRetries: 0,
        maxTokens: 3600,
        temperature: 0.2,
        timeoutMs: 120_000,
      },
    );
    const parsedResult = parseRealmRecommendationResult(rawContent);
    const result = {
      ...parsedResult,
      scene: profile.scene,
      candidate_count: contentItems.length,
    };
    const { recommendedItems, filteredItems } =
      attachRealmRecommendationData({
        result,
        contentItems,
        people,
        groups,
      });

    return NextResponse.json({
      result,
      recommendedItems,
      filteredItems,
      rawContent,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
