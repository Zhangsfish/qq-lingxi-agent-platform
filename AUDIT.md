# QQ 灵犀群域 - 多 Agent 对话底座工程审查报告

## 1. 当前项目概览

- 当前项目技术栈：Next.js 15、React 19、TypeScript、Tailwind CSS 4、Node.js、npm。
- 启动命令：

```bash
npm install
npm run dev
```

- 本地访问地址：

```txt
http://localhost:3000
```

- 当前已经实现的能力：
  - 前端可选择 3 个 Agent：用户 Agent、群 Agent、匹配 Agent。
  - 前端可输入消息并提交到后端 API。
  - 后端根据 `agentId` 读取 `agents/*.md` 作为 system prompt。
  - 后端调用 SiliconFlow chat completions API。
  - 前端展示 assistant 回复、loading 状态、错误状态，并支持清空会话。

- 当前项目仍然只是 Step 1 底座：已经跑通“选择 Agent -> 读取 prompt -> 调用 LLM -> 返回回复”的基础链路，但还没有进入业务匹配流程，也没有用户画像抽取、群画像、候选群检索、匹配打分或结构化 JSON 输出。

## 2. 当前文件结构

关键文件结构如下：

```txt
qq-lingxi-agent-platform/
  agents/
    user_agent.md
    group_agent.md
    matchmaker_agent.md
  app/
    api/
      agent/
        respond/
          route.ts
    globals.css
    layout.tsx
    page.tsx
  lib/
    agents.ts
    siliconflow.ts
    types.ts
  .env.local
  .gitignore
  eslint.config.mjs
  next.config.ts
  package.json
  postcss.config.mjs
  README.md
  tsconfig.json
```

关键文件职责：

- `agents/user_agent.md`：定义用户 Agent 的 system prompt。
- `agents/group_agent.md`：定义群 Agent 的 system prompt。
- `agents/matchmaker_agent.md`：定义匹配 Agent 的 system prompt。
- `lib/types.ts`：定义 Agent、消息和 API 请求/响应类型。
- `lib/agents.ts`：维护允许读取的 Agent 文件映射，并从 `agents/` 读取 prompt。
- `lib/siliconflow.ts`：封装 SiliconFlow API 调用、超时和重试逻辑。
- `app/api/agent/respond/route.ts`：接收前端请求，校验 body，读取 prompt，调用 LLM，返回 JSON。
- `app/page.tsx`：实现当前所有前端聊天 UI、Agent 选择、消息状态和请求逻辑。
- `README.md`：说明安装、环境变量、启动方式和新增 Agent 的步骤。
- `.env.local`：保存 SiliconFlow API Key、base URL 和 model 配置，不应提交到 Git。

## 3. Agent 底座链路检查

当前请求链路：

```txt
前端选择 agentId
-> 前端提交 messages
-> API route 接收请求
-> 读取 agents/{agentId}.md
-> 调用 SiliconFlow API
-> 返回回复
-> 前端展示
```

逐项确认：

- 前端选择 `agentId`：已实现，`app/page.tsx` 中的 `agentOptions` 维护 3 个选项。
- 前端提交 `messages`：已实现，提交当前完整 `messages` 数组加上最新用户消息。
- API route 接收请求：已实现，`POST /api/agent/respond` 接收 JSON。
- 请求体校验：已实现基础校验，校验 `agentId`、`messages`、`role` 和 `content`。
- 读取 `agents/{agentId}.md`：已实现，通过白名单映射读取，不直接拼接用户传入文件名。
- 调用 SiliconFlow API：已实现，当前使用 `https.request`，并带有超时和重试。
- 返回回复：已实现，返回 `{ content }`。
- 前端展示：已实现，区分 user/assistant 气泡。

验收状态：本地 `GET /` 返回 200；三个 Agent 的 `POST /api/agent/respond` 测试均返回 200。

## 4. Agent 文件检查

当前 3 个 Agent 文件：

- `user_agent.md`：定义“用户 Agent”，负责和用户对话，理解用户想找什么群、什么人或什么共同体，并适当追问偏好、边界和雷点。
- `group_agent.md`：定义“群 Agent”，代表一个 QQ 群说明文化、边界、准入规则和适合的人。
- `matchmaker_agent.md`：定义“匹配 Agent”，根据用户需求判断可能适合的 QQ 群类型，并给出匹配思路。

Step 1 支撑情况：

- 当前 prompt 足够支撑 Step 1 的风格差异测试。
- 三个 Agent 的角色边界清楚，适合验证“同一句输入，不同 Agent 回复不同”。
- prompt 当前仍是自然语言对话指令，没有要求结构化输出。

下一阶段扩展建议：

- 为 `user_agent.md` 增加“多轮访谈后总结需求画像”的任务边界。
- 新增结构化抽取专用 prompt，例如 `user_profile_extractor_agent.md`。
- 将“对话回复”和“结构化 JSON 抽取”拆成不同能力，避免同一个 Agent 同时承担聊天和数据抽取。

## 5. 类型与接口检查

当前已有清晰类型定义：

- `AgentId = "user_agent" | "group_agent" | "matchmaker_agent"`
- `ChatMessage = { role: "user" | "assistant"; content: string }`
- `AgentRespondRequest = { agentId: AgentId; messages: ChatMessage[] }`
- `AgentRespondResponse = { content: string }`

评价：

- Step 1 类型足够清楚。
- `AgentId` 能防止任意字符串进入读取链路。
- `ChatMessage` 当前没有 `system` role，这符合前端只提交用户/助手历史、后端单独注入 system prompt 的设计。

建议但不在本次实现：

- Step 2 需要新增 `UserNeedProfile` 类型。
- Step 2 需要新增结构化响应类型，例如 `UserProfileExtractResponse`。
- 如果以后支持更多模型参数，可以新增 `LlmOptions` 或 `AgentRuntimeConfig`。

## 6. SiliconFlow API 检查

检查结果：

- API Key：只从 `process.env.SILICONFLOW_API_KEY` 读取，前端不会直接接触 API Key。
- base URL：从 `SILICONFLOW_BASE_URL` 读取，默认值为 `https://api.siliconflow.cn/v1`。
- model：从 `SILICONFLOW_MODEL` 读取，默认值仍为 `deepseek-ai/DeepSeek-V4-Flash`。
- 当前 `.env.local` 中使用的模型是 `deepseek-ai/DeepSeek-V3.2`，因为本机测试中 `DeepSeek-V4-Flash` 的 chat completions 请求出现长时间超时。
- API 错误：后端会把错误信息以 `{ error }` 返回给前端，前端显示错误文本。
- API Key 暴露：当前前端代码不会暴露 key；`.gitignore` 已包含 `.env.local`。

风险：

- 当前错误信息对用户偏原始，例如网络错误、超时、SiliconFlow API 原始错误会直接显示。
- `README.md` 仍写着 `deepseek-ai/DeepSeek-V4-Flash`，与当前 `.env.local` 的 `deepseek-ai/DeepSeek-V3.2` 不一致。
- `.env.local` 当前包含真实 key，虽然被 `.gitignore` 忽略，但仍需要避免截图、复制或提交。

## 7. 前端状态检查

检查结果：

- 支持选择 Agent：已支持，3 个选项以按钮形式展示。
- 支持连续对话：已支持，同一 Agent 下会把历史 `messages` 一起提交。
- 切换 Agent 后会话处理：当前不会自动清空历史。也就是说，如果用户先和用户 Agent 对话，再切换到群 Agent，旧 messages 会继续提交给新 Agent。
- 清空按钮：已实现，可清空 `messages`、`input` 和 `error`。
- loading 状态：已实现，提交时显示“当前 Agent 正在回复...”。
- error 状态：已实现，显示后端返回或前端请求错误。

评价：

- Step 1 可用。
- 切换 Agent 是否保留历史需要产品决策。当前行为适合测试“同一上下文切换不同 Agent”，但不适合严格隔离不同 Agent 会话。

建议但不在本次实现：

- Step 2 前建议将每个 Agent 的会话历史分开保存，或切换 Agent 时提示是否清空。
- 将 `agentOptions` 移到共享配置文件，避免前端选项与后端白名单长期重复维护。

## 8. 模块边界问题

当前模块边界：

- Agent prompt loader：已独立在 `lib/agents.ts`。
- LLM client：已独立在 `lib/siliconflow.ts`。
- API route：相对薄，主要做 body 校验、prompt 读取和 LLM 调用编排。
- 类型定义：已独立在 `lib/types.ts`。
- 前端组件：目前全部堆在 `app/page.tsx`。

评价：

- 后端模块边界基本适合 Step 1。
- 前端 `page.tsx` 已达到 7 KB 以上，后续继续加入 Step 2 表单、画像展示、JSON 结果、调试面板时会过大。
- 当前 Agent 映射分散在 3 处：`lib/types.ts`、`lib/agents.ts`、`app/page.tsx`，后续新增 Agent 容易漏改。

Step 2 扩展性：

- 可以在现有后端基础上新增结构化画像 API。
- 需要把“对话回复”和“画像抽取”拆开，避免影响现有聊天链路。
- 建议新增共享 Agent 配置模块，统一维护 id、文件名、显示名和说明。

## 9. 当前风险

当前主要工程风险：

1. Agent 会话隔离不明确：切换 Agent 后仍复用同一组 `messages`，可能导致新 Agent 被旧上下文污染。
2. 错误展示过于原始：前端会直接显示后端错误，例如 SiliconFlow 网络错误、超时或 API 原始文本。
3. 模型配置不一致：`README.md` 示例仍是 `DeepSeek-V4-Flash`，而当前 `.env.local` 改为 `DeepSeek-V3.2`。
4. Agent 配置重复：`AgentId`、后端文件白名单、前端 `agentOptions` 分散维护。
5. `page.tsx` 过大：目前聊天 UI、状态、请求逻辑和 Agent 配置都在一个文件里。
6. `.env.local` 管理风险：真实 key 不会进 Git，但新手操作时仍可能误复制、截图或外发。
7. API route 只有通用聊天接口：Step 2 的结构化 JSON 输出不应复用当前自然语言回复接口。
8. 当前没有自动化端到端测试：只能靠手工或命令行请求确认链路。

## 10. 下一步开发建议

只针对 Step 2：

> 实现用户 Agent 与用户多轮对话后，生成结构化用户需求画像 JSON。

建议新增文件：

```txt
agents/
  user_profile_extractor_agent.md
lib/
  agent-config.ts
  profile-schema.ts
  profile-extractor.ts
app/
  api/
    agent/
      profile/
        route.ts
components/
  AgentSelector.tsx
  ChatPanel.tsx
  MessageList.tsx
  ProfilePreview.tsx
```

建议新增类型：

```ts
export type UserNeedProfile = {
  targetCommunityType: string;
  interests: string[];
  preferredAtmosphere: string[];
  dislikedAtmosphere: string[];
  boundaries: string[];
  uncertainty: string[];
  confidence: number;
};

export type UserProfileExtractRequest = {
  messages: ChatMessage[];
};

export type UserProfileExtractResponse = {
  profile: UserNeedProfile;
  rawContent: string;
};
```

建议新增接口：

```txt
POST /api/agent/profile
```

建议 Step 2 开发顺序：

1. 先新增结构化画像类型和 extractor prompt。
2. 再新增 `/api/agent/profile`，只负责根据对话历史生成 JSON。
3. 前端增加“生成用户画像”按钮和 JSON 预览区域。
4. 保留当前 `/api/agent/respond`，不要把聊天回复和画像抽取混在同一个 route。

当前验证记录：

- `npm run lint`：通过。
- `GET http://localhost:3000`：返回 200。
- `POST /api/agent/respond`：
  - `user_agent`：返回 200。
  - `group_agent`：返回 200。
  - `matchmaker_agent`：返回 200。
