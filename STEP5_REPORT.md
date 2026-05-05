# STEP5_REPORT

## 1. 本次实现内容

本次完成 Step 5：通用 Agent-to-Agent 协商模块。

系统现在支持两类协商目标：

- `targetType="group"`：用户 Agent 与群 Agent 协商。
- `targetType="person"`：用户 Agent 与人物 Agent 协商。

前端已在群匹配结果和人物匹配结果的推荐卡片中加入“发起 Agent 协商”按钮，并通过 `NegotiationPanel` 展示协商记录、适配结论、风险提醒和下一步建议。

## 2. 修改文件

新增文件：

- `agents/negotiation_agent.md`
- `lib/negotiation-schema.ts`
- `lib/negotiation.ts`
- `app/api/agent/negotiate/route.ts`
- `components/NegotiationPanel.tsx`
- `STEP5_REPORT.md`

修改文件：

- `components/GroupMatchPanel.tsx`
- `components/PeopleMatchPanel.tsx`
- `app/page.tsx`
- `README.md`

## 3. 新接口说明

新增接口：

```txt
POST /api/agent/negotiate
```

请求体：

```ts
{
  profile: UserNeedProfile,
  targetType: "group" | "person",
  targetId: string,
  source: "group_match" | "people_match" | "realm_content",
  contentId?: string | null
}
```

返回体：

```ts
{
  result,
  target,
  sourceContent,
  rawContent
}
```

## 4. 数据流说明

1. 用户先生成 `UserNeedProfile`。
2. 用户通过“匹配 QQ 群”或“匹配人 / 作者”得到候选对象。
3. 用户在推荐卡片点击“发起 Agent 协商”。
4. 前端请求 `/api/agent/negotiate`。
5. 后端按 `targetType` 读取 group 或 person 画像。
6. 如果提供 `contentId`，后端读取 source content。
7. 后端读取 `agents/negotiation_agent.md` 作为 system prompt。
8. `lib/negotiation.ts` 构造协商输入并调用 SiliconFlow。
9. 模型输出经过 JSON 提取和 zod 校验。
10. API 返回协商结果，前端展示 `NegotiationPanel`。

## 5. schema 校验说明

`lib/negotiation-schema.ts` 定义：

- `NegotiationTargetTypeSchema`
- `NegotiationSourceSchema`
- `NegotiationTranscriptItemSchema`
- `NegotiationResultSchema`
- `NegotiationRequest`
- `NegotiationResponse`

校验重点：

- `target_type` 只能是 `group` 或 `person`。
- `source` 只能是 `group_match`、`people_match`、`realm_content`。
- `fit_score` 限制为 0 到 100。
- `decision` 只能是 `recommend`、`consider_with_caution`、`not_recommended`。
- transcript speaker 只能是 `user_agent`、`group_agent`、`person_agent`。
- `confidence` 限制为 0 到 1。

API 层会将 `target_type`、`target_id`、`source`、`content_id` 兜底修正为请求值，避免模型误写关键路由字段。

## 6. 前端交互说明

`components/GroupMatchPanel.tsx` 新增：

- `onNegotiateGroup`
- `negotiatingTargetId`

`components/PeopleMatchPanel.tsx` 新增：

- `onNegotiatePerson`
- `negotiatingTargetId`

`app/page.tsx` 新增状态：

- `negotiationResponse`
- `negotiationLoading`
- `negotiationError`
- `negotiatingTargetId`

用户重新发送消息、清空对话或重新生成画像时，会清空旧协商结果。协商成功后由 `components/NegotiationPanel.tsx` 展示目标对象、fit score、decision、transcript、alignment、risks、open questions、summary、next action 和 draft message。

## 7. 群协商测试记录

测试请求：

```txt
POST /api/agent/negotiate
targetType=group
targetId=grp_ltc_001
source=group_match
```

结果：

```txt
STATUS=200
target_type=group
source=group_match
negotiation_transcript.length=4
decision=recommend
draft_message 已生成，长度=378
```

结论：群协商通过，返回了入群申请草稿。

## 8. 人物协商测试记录

测试请求：

```txt
POST /api/agent/negotiate
targetType=person
targetId=person_career_001
source=people_match
```

结果：

```txt
STATUS=200
target_type=person
source=people_match
negotiation_transcript.length=4
decision=recommend
draft_message 已生成，长度=276
```

结论：人物协商通过，返回了连接/私聊开场草稿。

## 9. 回归测试记录

命令测试：

```txt
npm run check:data -> 通过
Data check passed.
groups=96
content_items=192
people=64
```

```txt
npm run lint -> 通过
```

```txt
npm run dev -> 已启动
GET http://localhost:3000 -> 200 OK
```

本步骤未修改数据文件，原有数据检查仍通过。

## 10. 当前问题

协商模块仍依赖 LLM JSON 稳定性。当前已通过简化 prompt、限制 transcript 数量、API 层兜底关键字段来降低风险。

本步骤预留了 `source="realm_content"` 和 `contentId`，但前端尚未从内容卡片直接发起协商。

## 11. 下一步建议

后续可以把协商结果保存为本地 session 记录，并新增从内容卡片发起协商的入口，让用户从“看到某条内容”直接进入“是否适合连接作者/群”的判断流程。
