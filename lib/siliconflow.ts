import https from "node:https";
import type { ChatMessage } from "./types";

const REQUEST_TIMEOUT_MS = 45_000;
const MAX_RETRIES = 2;

type SiliconFlowOptions = {
  maxRetries?: number;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
};

type SiliconFlowChatCompletion = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const cause =
      error.cause instanceof Error ? `: ${error.cause.message}` : "";
    return `${error.message}${cause}`;
  }

  return "Unknown error";
}

function postJson<TResponse>(
  url: string,
  apiKey: string,
  payload: unknown,
  timeoutMs: number,
): Promise<TResponse> {
  const requestUrl = new URL(url);
  const body = JSON.stringify(payload);

  return new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: requestUrl.hostname,
        path: `${requestUrl.pathname}${requestUrl.search}`,
        port: requestUrl.port || 443,
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
        timeout: timeoutMs,
      },
      (response) => {
        const chunks: Buffer[] = [];

        response.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });

        response.on("end", () => {
          const responseText = Buffer.concat(chunks).toString("utf-8");

          if (!response.statusCode || response.statusCode >= 400) {
            reject(
              new Error(
                `SiliconFlow API error: ${response.statusCode} ${responseText}`,
              ),
            );
            return;
          }

          try {
            resolve(JSON.parse(responseText) as TResponse);
          } catch {
            reject(new Error("SiliconFlow API returned invalid JSON"));
          }
        });
      },
    );

    request.on("timeout", () => {
      request.destroy(new Error("request timeout"));
    });

    request.on("error", reject);
    request.write(body);
    request.end();
  });
}

export async function callSiliconFlow(
  systemPrompt: string,
  messages: ChatMessage[],
  options: SiliconFlowOptions = {},
) {
  const apiKey = process.env.SILICONFLOW_API_KEY;
  const baseUrl =
    process.env.SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1";
  const model =
    process.env.SILICONFLOW_MODEL || "deepseek-ai/DeepSeek-V4-Flash";

  if (!apiKey) {
    throw new Error("Missing SILICONFLOW_API_KEY");
  }

  let lastNetworkError = "";
  const maxRetries = options.maxRetries ?? MAX_RETRIES;
  const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const data = await postJson<SiliconFlowChatCompletion>(
        `${baseUrl}/chat/completions`,
        apiKey,
        {
          model,
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 1000,
        },
        timeoutMs,
      );

      return data.choices?.[0]?.message?.content ?? "";
    } catch (error) {
      const message = getErrorMessage(error);

      if (message.startsWith("SiliconFlow API error")) {
        throw new Error(message);
      }

      lastNetworkError = message;

      if (attempt < maxRetries) {
        await sleep(800 * (attempt + 1));
        continue;
      }
    }
  }

  throw new Error(
    `SiliconFlow network error after ${maxRetries + 1} attempts: ${lastNetworkError}`,
  );
}
