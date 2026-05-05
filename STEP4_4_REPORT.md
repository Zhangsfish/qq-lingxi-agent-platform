# STEP4_4_REPORT

## 1. 本次实现内容

本次完成 Step 4.4：AI 人物匹配模块。

系统现在可以基于 `UserNeedProfile` 读取同 scene 的候选人物画像和相关内容，调用 SiliconFlow 人物匹配 Agent，返回推荐人物、过滤人物、匹配理由、风险提示，并在前端提供“匹配人 / 作者”入口和结果面板。

本步骤只实现人物匹配能力，不实现 Agent-to-Agent 协商。

## 2. 修改文件

新增文件：

- `agents/person_matcher_agent.md`
- `lib/person-match-schema.ts`
- `lib/person-matcher.ts`
- `app/api/match/people/route.ts`
- `components/PeopleMatchPanel.tsx`
- `STEP4_4_REPORT.md`

修改文件：

- `app/page.tsx`
- `README.md`

## 3. 新接口说明

新增接口：

```txt
POST /api/match/people
```

请求体：

```ts
{
  profile: UserNeedProfile
}
```

返回体：

```ts
{
  result,
  matchedPeople,
  filteredPeople,
  rawContent
}
```

其中 `matchedPeople` 和 `filteredPeople` 会把模型返回的 `person_id` 关联回完整人物画像，并附带 `authoredContents`。

## 4. 数据流说明

1. 前端在用户画像生成后显示“匹配人 / 作者”按钮。
2. 点击后向 `/api/match/people` 发送当前 `profile`。
3. 后端校验 `profile`，按 `profile.scene` 读取同场景候选人物。
4. 后端读取同 scene 的 content_items 作为相关内容上下文。
5. 如果同 scene 候选人物为空，则回退读取全部人物。
6. 后端读取 `agents/person_matcher_agent.md` 作为 system prompt。
7. `lib/person-matcher.ts` 构造精简输入，调用 SiliconFlow。
8. 模型输出经过 JSON 提取和 zod schema 校验。
9. 后端将 `candidate_count` 兜底修正为实际候选人物数量。
10. 有效 `person_id` 被关联回完整 person profile，并附加相关 `authoredContents`。
11. 前端 `PeopleMatchPanel` 展示推荐人物、过滤人物、匹配原因、风险提示和相关内容。

## 5. schema 校验说明

`lib/person-match-schema.ts` 定义了：

- `PersonMatchItemSchema`
- `FilteredPersonSchema`
- `PersonMatchResultSchema`
- `PersonMatchResponse`

校验重点：

- `fit_score` 限制为 0 到 100。
- `recommendation_level` 限制为 `strong_recommend`、`consider_with_caution`、`not_recommended`。
- `matches`、`filtered_out` 必须符合结构。
- `relevant_content_ids` 必须是字符串数组；关联阶段会忽略不存在或不属于该人物的内容 id。
- 模型返回不存在的 `person_id` 时，关联完整人物画像阶段会忽略无效项，保留其余有效结果。

## 6. 前端交互说明

`app/page.tsx` 新增人物匹配状态：

- `peopleMatchResponse`
- `peopleMatchLoading`
- `peopleMatchError`

交互行为：

- 只有在 `user_agent` 已生成用户画像后才显示“匹配人 / 作者”按钮。
- 重新发送用户消息、清空对话或重新生成用户画像时，会清空旧的人物匹配结果。
- 接口失败时在页面显示错误信息。
- 不影响原有“匹配 QQ 群”按钮和 `GroupMatchPanel`。

`components/PeopleMatchPanel.tsx` 展示：

- `overall_summary`
- 推荐人物列表
- 每个人物的分数、推荐等级、理由、风险、匹配/不匹配特征
- 人物的 expertise、content_style、values、credibility、risk tags
- 相关 authoredContents 的 title 和 summary
- 过滤人物列表

## 7. 手动测试记录

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

数据接口测试：

```txt
GET /api/data/people?scene=career_transition_matching -> 200, COUNT=8
GET /api/data/content-items?scene=career_transition_matching -> 200, COUNT=24
GET /api/data/people -> 200, COUNT=64
GET /api/data/groups -> 200, COUNT=96
GET /api/data/content-items -> 200, COUNT=192
```

`/api/match/people` 真实调用测试：

```txt
POST /api/match/people -> 200
candidate_count=8
matches=3
filtered_out=1
matchedPeople=3
filteredPeople=1
authoredContents per matched person=1,1,1
```

前端代码路径已接入“匹配人 / 作者”按钮和 `PeopleMatchPanel`。本轮自动 Chrome 前端验证因当前环境启动 Chrome remote debugging 超时，未能完成浏览器级截图验证；接口和页面编译均已通过。

## 8. 当前问题

模型可能把 `candidate_count` 误写成推荐数量。本次已在 API 层将 `candidate_count` 兜底修正为实际候选人物数量，避免前端和下游逻辑误读。

人物匹配仍依赖 LLM JSON 稳定性。当前已通过精简 prompt 输入和限制返回 3 个 matches、1 个 filtered_out 降低输出不稳定风险。

## 9. 下一步建议

下一步可以新增人物详情接口和按作者查询内容接口，例如 `GET /api/data/people/[id]`、`GET /api/data/content-items?author=xxx`。随后再实现 Person Agent 协商，让用户可以从推荐人物进入一轮更具体的对话或提问建议。
