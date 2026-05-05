# STEP4_REPORT

## 1. 本次实现内容

本次完成 Step 4: AI QQ 群匹配模块。系统现在可以基于 `UserNeedProfile` 读取同 scene 的候选群，调用 SiliconFlow 群匹配 Agent 生成推荐结果、过滤结果和风险提示，并在前端展示匹配面板。

## 2. 修改文件

新增文件：

- `agents/group_matcher_agent.md`
- `lib/group-match-schema.ts`
- `lib/group-matcher.ts`
- `app/api/match/groups/route.ts`
- `components/GroupMatchPanel.tsx`
- `STEP4_REPORT.md`

修改文件：

- `app/page.tsx`
- `README.md`

## 3. 新接口说明

新增接口：

```txt
POST /api/match/groups
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
  matchedGroups,
  filteredGroups,
  rawContent
}
```

其中 `matchedGroups` 和 `filteredGroups` 会把模型输出的 `group_id` 关联回完整群画像，供前端直接展示。

## 4. 数据流说明

1. 前端在用户画像生成后显示“匹配 QQ 群”按钮。
2. 点击后向 `/api/match/groups` 发送当前 `profile`。
3. 后端校验 `profile`，按 `profile.scene` 读取同场景候选群。
4. 如果同 scene 候选群为空，则回退读取全部群数据。
5. 后端读取 `agents/group_matcher_agent.md` 作为 system prompt。
6. `lib/group-matcher.ts` 构造精简候选群输入，调用 SiliconFlow。
7. 模型输出经过 JSON 提取和 zod schema 校验。
8. 有效 `group_id` 被关联回完整 group profile。
9. 前端 `GroupMatchPanel` 展示推荐群、过滤群、匹配原因和风险提示。

## 5. schema 校验说明

`lib/group-match-schema.ts` 定义了：

- `GroupMatchItemSchema`
- `FilteredGroupSchema`
- `GroupMatchResultSchema`
- `GroupMatchResponse`

校验重点：

- `fit_score` 限制为 0 到 100。
- `recommendation_level` 限制为 `strong_recommend`、`consider_with_caution`、`not_recommended`。
- `matches`、`filtered_out` 必须符合结构。
- 模型返回不存在的 `group_id` 时，关联完整群画像阶段会忽略无效项，保留其余有效结果。

## 6. 前端交互说明

`app/page.tsx` 新增群匹配状态：

- `groupMatchResponse`
- `groupMatchLoading`
- `groupMatchError`

交互行为：

- 只有在 `user_agent` 已生成用户画像后才显示“匹配 QQ 群”按钮。
- 重新发送用户消息、清空对话或重新生成用户画像时，会清空旧的群匹配结果。
- 接口失败时在页面显示错误信息。
- 成功后由 `components/GroupMatchPanel.tsx` 展示推荐群和过滤群。

## 7. 手动测试记录

命令测试：

```txt
npm run check:data -> 通过
groups=96
content_items=192
```

```txt
npm run lint -> 通过
```

```txt
npm run dev -> 已启动
GET http://localhost:3000 -> 200
```

接口测试：

```txt
GET /api/data/groups -> 200, COUNT=96
GET /api/data/content-items -> 200, COUNT=192
GET /api/data/groups?scene=long_term_community_matching -> 200, COUNT=12
POST /api/agent/respond -> 200
POST /api/agent/profile -> 200
POST /api/match/groups -> 200
```

`/api/match/groups` 复测结果：

```txt
candidate_count=12
matches=3
filtered_out=1
matchedGroups=3
filteredGroups=1
```

前端手动测试：

```txt
生成用户画像 -> 成功
点击匹配 QQ 群 -> 成功
GroupMatchPanel 展示匹配结果 -> 成功
```

## 8. 当前问题

模型输出仍依赖 LLM JSON 稳定性。初次测试中 `/api/match/groups` 因模型输出 JSON 无效失败过一次，已通过收紧 prompt 输入、限制返回 3 个 `matches` 和 1 个 `filtered_out`、要求字段保持一句话后复测通过。

## 9. 下一步建议

后续可以加入更强的模型输出修复策略，例如失败后自动二次请求“只修复 JSON”，或在本地按候选群分数做规则兜底，降低 LLM 输出不稳定对体验的影响。
