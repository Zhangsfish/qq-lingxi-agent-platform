import fs from "node:fs/promises";
import path from "node:path";
import { getAgentConfig } from "./agent-config";
import type { AgentId } from "./types";

export async function loadAgentPrompt(agentId: AgentId): Promise<string> {
  const config = getAgentConfig(agentId);
  const filePath = path.join(process.cwd(), "agents", config.filename);
  return fs.readFile(filePath, "utf-8");
}
