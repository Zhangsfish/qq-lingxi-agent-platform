# TAIL FIX AUDIT

本报告只审查指定的三个问题，不修改业务代码。

## 涉及文件列表

- `components/LeftNav.tsx`
- `components/NegotiationView.tsx`
- `components/GroupMatchView.tsx`
- `components/PeopleMatchView.tsx`
- `components/RealmFeedView.tsx`
- `app/page.tsx`
- `lib/negotiation-schema.ts`
- `agents/user_agent.md`

## 1. 左侧头像当前实现

### 当前实现摘要

- 左侧头像由 `components/LeftNav.tsx` 的 `LeftNav` 组件渲染。
- 组件入口：`export function LeftNav({ activeView, onNavigate }: LeftNavProps)`，位于 `components/LeftNav.tsx:16`。
- 左侧导航项变量是 `navItems`，位于 `components/LeftNav.tsx:3`，但头像本身不由变量配置，不依赖用户数据，也没有图片资源。
- 头像是硬编码 JSX + Tailwind class 组合，位于 `components/LeftNav.tsx:20-23`：
  - 外层头像容器 class：
    - `relative h-13 w-13 overflow-hidden rounded-full bg-gradient-to-br from-blue-100 to-cyan-100`
  - 内部白色脸部/底层：
    - `absolute inset-2 rounded-full bg-white shadow-inner`
  - 内部深色人像块：
    - `absolute bottom-0 left-1/2 h-9 w-9 -translate-x-1/2 rounded-full bg-gradient-to-br from-slate-800 to-slate-500`
  - 在线状态点：
    - `absolute right-0 bottom-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-500`
- 昵称和在线状态同样写死在 `LeftNav` 内，不是从 profile 或登录用户读取。

### 最小修改方案

- 如果只是替换头像效果：只改 `components/LeftNav.tsx` 中 `components/LeftNav.tsx:20-23` 这段头像 JSX。
- 如果要使用设计图里的真人头像：新增本地静态图片，例如 `public/avatar-user.png`，然后在 `LeftNav` 中用 `next/image` 或普通 `img` 替换当前 CSS 头像。
- 如果后续要接真实用户信息：给 `LeftNav` 增加 `userName/avatarUrl/online` props，再从 `AppShell` 或页面状态传入。

## 2. A-to-A 协商结果当前实现

### 当前实现摘要

- 协商结果展示组件是 `components/NegotiationView.tsx`。
- 页面引入位置：`app/page.tsx:8`。
- negotiation 页面渲染位置：`app/page.tsx:546` 附近，`renderView()` 在非前六个 view 时返回 `NegotiationView`。
- 协商结果状态在 `app/page.tsx`：
  - `negotiationResponse` / `setNegotiationResponse`：`app/page.tsx:53`
  - `negotiationLoading`：同一区域
  - `negotiationError`：同一区域
  - `negotiatingTargetId`：同一区域

### API 返回后的进入页面流程

- 群匹配卡片触发：
  - `components/GroupMatchView.tsx:84` 调用 `onNegotiateGroup(item.group_id)`
  - 在 `app/page.tsx:505` 绑定到 `handleNegotiateGroup`
- 人物匹配卡片触发：
  - `components/PeopleMatchView.tsx:104` 调用 `onNegotiatePerson(item.person_id)`
  - 在 `app/page.tsx:517` 绑定到 `handleNegotiatePerson`
- 群域内容触发：
  - `components/RealmFeedView.tsx:80-83` 根据 target type 调用 `onNegotiatePerson` 或 `onNegotiateGroup`
  - 在 `app/page.tsx:530-533` 绑定到 content 来源的协商函数
- 以上入口最终都会进入 `app/page.tsx:385` 的 `negotiate(...)` 函数。
- `negotiate(...)` 在发起请求前先执行：
  - `setActiveView("negotiation")`：`app/page.tsx:398`
  - `setNegotiationLoading(true)`
  - `setNegotiatingTargetId(targetId)`
- 然后请求：
  - `fetch("/api/agent/negotiate", ...)`：`app/page.tsx:404`
- API 返回后：
  - 校验响应包含 `result`
  - 执行 `setNegotiationResponse(data)`：`app/page.tsx:430`
- 因为 `activeView` 已经切到 `"negotiation"`，状态更新后页面会重新渲染 `NegotiationView`。

### negotiation_transcript 渲染方式

- `NegotiationView` 读取：
  - `const result = response?.result`：`components/NegotiationView.tsx:11`
- transcript 渲染：
  - `result?.negotiation_transcript.map((item, index) => ...)`：`components/NegotiationView.tsx:42`
- speaker 判断：
  - `const isUserAgent = item.speaker === "user_agent"`：`components/NegotiationView.tsx:43`
- 展示逻辑：
  - `user_agent` 在左侧，蓝色气泡。
  - `group_agent` / `person_agent` 统一作为目标 Agent，在右侧，紫色气泡。
  - 气泡标题显示 `用户 Agent` 或 `目标 Agent`，并拼接 `item.purpose`：`components/NegotiationView.tsx:64`
  - 正文直接渲染 `item.message`：`components/NegotiationView.tsx:66`
- 协商摘要继续展示：
  - `result.summary_for_user`：`components/NegotiationView.tsx:99`
  - `result.next_action`
  - `result.draft_message`：`components/NegotiationView.tsx:106`

### 最小修改方案

- 如果只是让协商结果更明显：只改 `components/NegotiationView.tsx` 的展示布局，不动 API。
- 如果需要区分 `group_agent` 和 `person_agent`：在 `NegotiationView` 中根据 `item.speaker` 分别显示“群 Agent”和“人物 Agent”，不要继续统一写成“目标 Agent”。
- 如果需要避免 API 返回前页面空白：保留当前提前 `setActiveView("negotiation")` 的行为，但增强 loading 状态文案。

## 3. 用户访谈 ready 状态当前实现

### 当前实现摘要

- ready 状态在 `app/page.tsx` 计算。
- 常量：
  - `const USER_AGENT_SOFT_LIMIT = 5`：`app/page.tsx:29`
- 用户发言轮数：
  - `const userRoundCount = messages.filter((message) => message.role === "user").length`：`app/page.tsx:62`
- ready 判断：
  - `userRoundCount >= USER_AGENT_SOFT_LIMIT && !profile && !continueInterview && !isLoading`：`app/page.tsx:64-68`
- ready 传入访谈组件：
  - `ready={isInterviewReady}`：`app/page.tsx:467`
- 发送消息时也会用 ready 阻断继续发送：
  - `if (!trimmedInput || isLoading || isInterviewReady) return`：`app/page.tsx:72`

### 是否仍然只依赖用户发言轮数 >= 5

- 不是完全只依赖 `>= 5`，还有三个前端状态条件：
  - `!profile`
  - `!continueInterview`
  - `!isLoading`
- 但从“需求是否清晰”的角度看，当前 ready 没有读取 Agent 回复内容，也没有读取结构化早停字段。
- 也就是说，业务判断核心仍然是用户发言轮数达到 5 轮；没有实现“Agent 认为需求已清晰就提前 ready”的机制。

### agents/user_agent.md 是否存在提前结束或需求已清晰提示

- `agents/user_agent.md` 存在。
- 文件中存在访谈收束规则：
  - `agents/user_agent.md:19`：访谈收束规则
  - `agents/user_agent.md:21`：通常应在 5 轮用户发言内完成主要访谈
  - `agents/user_agent.md:23`：当认为用户画像已经足够清晰时
  - `agents/user_agent.md:25`：不要继续提出新的大范围问题
  - `agents/user_agent.md:27`：提醒用户现在可以生成用户画像
  - `agents/user_agent.md:28`：如果用户明确想继续补充，再继续追问
- 该提示是自然语言 prompt，不是结构化协议。
- 当前前端没有解析“需求已清晰”“可以生成画像”等文本，也没有后端字段把 early ready 返回给前端。

### 最小修改方案

- 最小前端方案：在 `app/page.tsx` 中增加一个 `agentSaysReady` 判断，基于最后一条 assistant message 是否包含稳定关键词，例如“可以生成用户画像”“画像已经足够清晰”。这改动最小，但依赖自然语言，稳定性一般。
- 更稳的方案：让 `/api/agent/respond` 返回结构化字段，例如 `readyToProfile: boolean` 或 `interviewStatus: "continue" | "ready"`，前端 ready 改为 `userRoundCount >= 5 || readyToProfile`。这需要改 API schema 和 agent respond 逻辑。
- 如果保持 Step7 不动后端：只改 `app/page.tsx` 和可能的 `agents/user_agent.md` 约定文案，不改 `/api/agent/profile`、匹配、协商、数据文件。

## 哪些文件不应修改

- 不应为这三个尾部问题修改数据文件：
  - `data/groups.json`
  - `data/content_items.json`
  - `data/people.json`
- 不应修改匹配与推荐 API：
  - `app/api/match/groups/route.ts`
  - `app/api/match/people/route.ts`
  - `app/api/realm/recommend/route.ts`
- 不应修改画像抽取 API，除非明确要做结构化 early ready：
  - `app/api/agent/profile/route.ts`
- 不应修改匹配、推荐、协商 schema，除非明确要新增协议字段：
  - `lib/group-match-schema.ts`
  - `lib/person-match-schema.ts`
  - `lib/realm-recommendation-schema.ts`
  - `lib/negotiation-schema.ts`
- 不应修改历史 Step 报告文件：
  - `STEP*.md`

## 风险点

- 左侧头像当前是 CSS 假头像，不是设计参考图中的真人头像；如果产品预期是真头像，需要引入静态资源或用户数据。
- `LeftNav` 中昵称、在线状态、头像均硬编码，后续接登录用户时需要拆 props。
- 协商页当前把 `group_agent` 和 `person_agent` 都显示成“目标 Agent”，信息足够但不够精确。
- 协商页面在 API 返回前已经切换到 negotiation view；如果 API 慢或失败，用户会先看到 loading 或错误，不会停留在原匹配页。
- ready 逻辑没有真正使用 `agents/user_agent.md` 的“需求已清晰”语义；即使 Agent 第 2-3 轮已经提示可以生成画像，前端也不会自动 ready。
- 如果用关键词解析 assistant 文本做 early ready，容易受文案变化影响。
- 如果改成结构化 early ready，需要同步改 API 响应类型、前端状态和可能的 prompt 输出约束，改动面更大。

## 建议修改顺序

1. 先修左侧头像：范围最小，只涉及 `components/LeftNav.tsx`，视觉收益直接。
2. 再修协商展示：只调整 `components/NegotiationView.tsx` 中 speaker label、loading/error 呈现，不碰 API。
3. 最后修 ready 逻辑：先决定采用“前端关键词最小方案”还是“后端结构化字段稳健方案”。如果选择稳健方案，再改 `/api/agent/respond`、类型定义和 `app/page.tsx`。

