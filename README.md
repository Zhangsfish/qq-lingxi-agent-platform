# QQ 灵犀群域 - 多 Agent 对话底座

这是一个最小可运行的多 Agent 对话底座。前端选择 Agent 并发送消息，后端读取对应的 `agents/*.md` 文件作为 system prompt，再调用 SiliconFlow chat completions API。

## 安装

```bash
npm install
```

## 配置环境变量

在项目根目录创建 `.env.local`：

```env
SILICONFLOW_API_KEY=...
SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1
SILICONFLOW_MODEL=deepseek-ai/DeepSeek-V3.2
```

`SILICONFLOW_API_KEY` 只应保存在 `.env.local` 中，不要提交到 Git。

## 启动

```bash
npm run dev
```

默认本地访问地址：

```txt
http://localhost:3000
```

## 新增 Agent

1. 在 `agents/` 中新增 `xxx_agent.md`。
2. 在 `lib/types.ts` 中把新的 id 加入 `AgentId`。
3. 在 `lib/agent-config.ts` 中加入新 Agent 的显示信息和 Markdown 文件名。

## 当前模块结构

- `lib/agent-config.ts`：统一维护 Agent 配置。
- `lib/agents.ts`：根据 Agent 配置读取 prompt。
- `lib/siliconflow.ts`：调用硅基流动 API。
- `components/`：前端聊天组件。

## Step 2：用户画像抽取

新增接口：

```txt
POST /api/agent/profile
```

用途：将用户与 `user_agent` 的对话历史抽取为双通道用户画像。

输出包括：

- `content_channel`
- `connection_channel`
- `identity_slice`
- `preference_model`

## Step 2.1：画像模块加固

新增能力：

- 使用 `zod` 对 `UserNeedProfile` 做运行时校验。
- `ProfilePanel` 支持复制画像 JSON。
- 对话信息较少时显示画像质量提示。

## Step 3A：本地数据结构契约

新增数据文件：

- `data/groups.json`
- `data/content_items.json`

新增调试接口：

- `GET /api/data/groups`
- `GET /api/data/groups?scene=long_term_community_matching`
- `GET /api/data/content-items`
- `GET /api/data/content-items?scene=food_group_matching`

当前数据为最小样例数据，后续会由数据生成任务扩展。

## Step 3C：接入生成数据集

当前数据规模：

- groups：96
- content_items：192
- scenes：8

数据检查：

```bash
npm run check:data
```

调试接口：

- `GET /api/data/groups`
- `GET /api/data/groups?scene=long_term_community_matching`
- `GET /api/data/content-items`
- `GET /api/data/content-items?scene=food_group_matching`

## Step 4：AI 群匹配

新增接口：

```txt
POST /api/match/groups
```

输入：

- `UserNeedProfile`

输出：

- `matches`：推荐候选群
- `filtered_out`：不推荐或需谨慎的群
- `matchedGroups`：带完整群画像的推荐结果
- `filteredGroups`：带完整群画像的过滤结果

## Step 4.1：用户访谈五轮软收束

`user_agent` 默认在第 5 轮用户发言后提示“需求画像已经基本清晰”。

用户可以：

- 点击“生成用户画像”。
- 点击“继续追问”再补充一轮。

该机制用于避免用户无意识无限访谈，同时保留继续补充的自由度。

## Step 4.3：人物画像数据接入

新增数据文件：

- `data/people.json`

`content_items` 新增字段：

- `author_profile_id`

新增调试接口：

- `GET /api/data/people`
- `GET /api/data/people?scene=food_group_matching`

数据检查：

```bash
npm run check:data
```

## Step 4.4：AI 人物匹配

新增接口：

```txt
POST /api/match/people
```

输入：

- `UserNeedProfile`

输出：

- `matches`：推荐人物 / 作者 / KOL / 资深用户
- `filtered_out`：不推荐或需谨慎的人物
- `matchedPeople`：带完整人物画像和 `authoredContents` 的推荐结果
- `filteredPeople`：带完整人物画像和 `authoredContents` 的过滤结果

## Step 5：通用 Agent-to-Agent 协商

新增接口：

```txt
POST /api/agent/negotiate
```

输入：

- `profile`
- `targetType: group | person`
- `targetId`
- `source: group_match | people_match | realm_content`
- `contentId?: string | null`

当前前端入口：

- 从群匹配结果中的推荐群发起协商
- 从人物匹配结果中的推荐人物发起协商

后续可从群域内容卡片直接发起协商。

## Step 5.1：画像路由意图

`UserNeedProfile` 新增可选字段：

- `routing_intent.primary_route`
- `routing_intent.secondary_routes`
- `routing_intent.reason`
- `routing_intent.recommended_cta`
- `routing_intent.confidence`

用途：判断用户画像生成后优先进入匹配人、匹配群，还是进入群域。

## Step 6：群域内容推荐

新增接口：

```txt
POST /api/realm/recommend
```

输入：

- `UserNeedProfile`

输出：

- `recommendedItems`：推荐内容，附带作者和关联群
- `filteredItems`：过滤内容
- `rawContent`：模型原始输出

前端入口：

- 画像生成后点击“进入群域”
- 内容卡片可直接发起：
  - 和作者 Agent 协商
  - 和关联群 Agent 协商

## 关键文件

- `agents/user_agent.md`
- `agents/user_profile_extractor_agent.md`
- `agents/group_matcher_agent.md`
- `agents/person_matcher_agent.md`
- `agents/negotiation_agent.md`
- `agents/realm_recommender_agent.md`
- `agents/group_agent.md`
- `agents/matchmaker_agent.md`
- `lib/agent-config.ts`
- `lib/agents.ts`
- `lib/siliconflow.ts`
- `lib/profile-schema.ts`
- `lib/profile-extractor.ts`
- `lib/profile-validation.ts`
- `lib/group-schema.ts`
- `lib/person-schema.ts`
- `lib/content-schema.ts`
- `lib/data-loaders.ts`
- `lib/group-match-schema.ts`
- `lib/group-matcher.ts`
- `lib/person-match-schema.ts`
- `lib/person-matcher.ts`
- `lib/negotiation-schema.ts`
- `lib/negotiation.ts`
- `lib/realm-recommendation-schema.ts`
- `lib/realm-recommender.ts`
- `components/AgentSelector.tsx`
- `components/ChatPanel.tsx`
- `components/MessageList.tsx`
- `components/MessageInput.tsx`
- `components/ProfilePanel.tsx`
- `components/GroupMatchPanel.tsx`
- `components/PeopleMatchPanel.tsx`
- `components/NegotiationPanel.tsx`
- `components/RealmFeedPanel.tsx`
- `app/api/agent/respond/route.ts`
- `app/api/agent/profile/route.ts`
- `app/api/agent/negotiate/route.ts`
- `app/api/realm/recommend/route.ts`
- `app/api/match/groups/route.ts`
- `app/api/match/people/route.ts`
- `app/api/data/people/route.ts`
- `app/api/data/groups/route.ts`
- `app/api/data/content-items/route.ts`
- `app/page.tsx`

## Vercel 上线环境变量

部署到 Vercel 时，请在 Project Settings -> Environment Variables 中配置：

- SILICONFLOW_API_KEY
- SILICONFLOW_BASE_URL
- SILICONFLOW_MODEL
- DEMO_AUTH_USER
- DEMO_AUTH_PASSWORD

注意：

- 不要把真实 API key 写入代码或提交到 Git。
- DEMO_AUTH_USER / DEMO_AUTH_PASSWORD 配置后，Demo 页面和 API 会启用 Basic Auth。
- 如果本地不配置 DEMO_AUTH_USER / DEMO_AUTH_PASSWORD，则不会启用访问密码。
