# STEP2_REPORT

## 1. 本次实现内容

本次完成 Step 2：双通道用户画像抽取模块。

实现后，用户可以先与 `user_agent` 多轮对话，再点击「生成用户画像」。前端会将当前 `user_agent` 的对话历史提交到新的后端接口 `POST /api/agent/profile`，后端读取 `agents/user_profile_extractor_agent.md` 作为 system prompt，调用 SiliconFlow API，并将模型输出解析为结构化用户画像 JSON。

当前画像包含四个核心模块：

- `content_channel`
- `connection_channel`
- `identity_slice`
- `preference_model`

原有 `/api/agent/respond` 对话接口保持可用，三个原有 Agent 仍可正常回复。

## 2. 修改文件

新增文件：

```txt
agents/user_profile_extractor_agent.md
lib/profile-schema.ts
lib/profile-extractor.ts
app/api/agent/profile/route.ts
components/ProfilePanel.tsx
STEP2_REPORT.md
```

更新文件：

```txt
agents/user_agent.md
app/page.tsx
lib/siliconflow.ts
README.md
```

## 3. 新接口说明

新增接口：

```txt
POST /api/agent/profile
```

请求体：

```ts
{
  messages: {
    role: "user" | "assistant";
    content: string;
  }[];
}
```

响应体：

```ts
{
  profile: UserNeedProfile;
  rawContent: string;
}
```

错误响应：

```ts
{
  error: string;
}
```

接口逻辑：

1. 校验请求体中的 `messages`。
2. 读取 `agents/user_profile_extractor_agent.md`。
3. 将对话历史整理为 transcript。
4. 调用 SiliconFlow API。
5. 使用 `parseUserNeedProfile` 提取 JSON。
6. 返回结构化画像和原始模型输出。

## 4. 数据结构说明

核心类型定义在 `lib/profile-schema.ts`。

`UserNeedProfile` 包含：

- `scene`：当前匹配场景。
- `surface_need`：用户表面表达的需求。
- `core_need`：用户真正想满足的核心需求。
- `summary`：完整用户画像摘要。
- `content_channel`：内容需求、内容主题、内容形态、内容过滤、内容到连接触发点。
- `connection_channel`：关系需求、目标共同体类型、连接强度、适合/不适合的群特征、匹配摘要。
- `identity_slice`：当前场景可展示/应隐藏的身份截面和隐私边界。
- `preference_model`：兴趣、偏好氛围、排斥氛围、边界、风险信号、不确定项、下一轮问题和置信度。

JSON 解析工具定义在 `lib/profile-extractor.ts`。它先尝试直接 `JSON.parse`，失败后会从模型回复中提取第一个 JSON 对象再解析。

## 5. 手动测试记录

`npm run lint` 结果：

```txt
通过
```

`npm run dev` 结果：

```txt
成功启动
Local: http://localhost:3000
```

首页验证：

```txt
GET http://localhost:3000 -> 200
```

`/api/agent/respond` 是否可用：

```txt
user_agent -> 200
group_agent -> 200
matchmaker_agent -> 200
```

`/api/agent/profile` 是否可用：

```txt
POST /api/agent/profile -> 200
```

示例对话生成的画像 JSON 摘要：

```txt
scene: long_term_community_matching
content_channel: 已返回
connection_channel: 已返回
identity_slice: 已返回
preference_model: 已返回
```

测试输入使用任务文档中的三段样例：

```txt
我想要一个共同体。我想找到志同道合的人，认可的组织文化，和他们一起长期同行，但我找不到，也不知道去哪里找。

我希望能一起讨论世界观、人生选择，也可能一起做项目。大学时实验室那种共同投入、简单真诚的氛围很像。

我看重真诚、长期主义、思想密度、彼此成就，讨厌空谈、功利、情绪互舔、精英鄙视链和创业鸡血。
```

## 6. 当前问题

- 画像抽取比普通聊天慢，当前对 `/api/agent/profile` 使用更长单次超时。
- 画像 JSON 只做了解析，没有做运行时 schema 严格校验。
- 前端 `ProfilePanel` 已能展示结构化结果，但还没有提供复制 JSON、下载 JSON 或调试视图过滤。
- 画像只基于 `user_agent` 的当前历史，不会自动判断对话轮数是否足够。

## 7. 下一步建议

- 为 `UserNeedProfile` 增加运行时校验，例如逐字段检查必填字段和数组字段。
- 在前端增加“复制画像 JSON”按钮。
- 为画像抽取增加最小对话轮数提示，避免用户只输入一句话时生成低置信度画像。
- 后续 Step 3 可基于 `connection_channel.summary_for_matchmaker_agent` 接入匹配 Agent。
