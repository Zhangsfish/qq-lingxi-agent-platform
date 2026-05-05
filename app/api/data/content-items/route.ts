import { NextRequest, NextResponse } from "next/server";
import {
  loadContentItems,
  loadContentItemsByScene,
} from "@/lib/data-loaders";

export async function GET(req: NextRequest) {
  try {
    const scene = req.nextUrl.searchParams.get("scene");
    const items = scene
      ? await loadContentItemsByScene(scene)
      : await loadContentItems();

    return NextResponse.json({ items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
