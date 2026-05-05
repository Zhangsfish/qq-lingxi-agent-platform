# STEP6_REPORT

## 1. 本次实现内容

本次完成 Step 6：群域内容推荐模块。

系统现在支持用户生成 `UserNeedProfile` 后点击“进入群域”，由 `/api/realm/recommend` 读取同 scene 的内容、作者人物画像和关联群画像，调用 SiliconFlow 生成推荐内容流、过滤内容和连接建议。前端新增 `RealmFeedPanel`，内容卡片可以直接发起：

- 和作者 Agent 协商
- 和关联群 Agent 协商

## 2. 修改文件

新增文件：

- `agents/realm_recommender_agent.md`
- `lib/realm-recommendation-schema.ts`
- `lib/realm-recommender.ts`
- `app/api/realm/recommend/route.ts`
- `components/RealmFeedPanel.tsx`
- `STEP6_REPORT.md`

修改文件：

- `app/page.tsx`
- `README.md`

## 3. 新接口说明

新增接口：

```txt
POST /api/realm/recommend
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
  recommendedItems,
  filteredItems,
  rawContent
}
```

其中 `recommendedItems` 和 `filteredItems` 会把内容关联回完整 content，并附加 `author` 和 `linkedGroups`。

## 4. 数据流说明

1. 用户生成画像。
2. 前端显示“进入群域”按钮。
3. 点击后请求 `/api/realm/recommend`。
4. 后端按 `profile.scene` 读取同 scene 的 `content_items`、people 和 groups。
5. 后端读取 `agents/realm_recommender_agent.md` 作为 system prompt。
6. `lib/realm-recommender.ts` 构造用户画像、候选内容、作者、关联群输入。
7. 调用 SiliconFlow 并解析 JSON。
8. API 层将 `candidate_count` 兜底修正为候选内容数量。
9. 结果关联完整内容、作者和群后返回前端。
10. 前端展示 `RealmFeedPanel`。

## 5. schema 校验说明

`lib/realm-recommendation-schema.ts` 定义：

- `ConnectableTargetSchema`
- `RealmRecommendedItemSchema`
- `RealmFilteredItemSchema`
- `RealmRecommendationResultSchema`
- `RealmRecommendationResponse`

校验重点：

- `fit_score` 限制为 0 到 100。
- `recommendation_level` 限制为 `strong_recommend`、`consider_with_caution`、`not_recommended`。
- `connectable_targets.target_type` 只能是 `person` 或 `group`。
- 模型返回不存在的 `content_id` 时，关联阶段忽略该条，保留其他有效结果。

## 6. 前端交互说明

`app/page.tsx` 新增：

- `realmResponse`
- `realmLoading`
- `realmError`
- `handleRecommendRealm`
- `handleNegotiatePersonFromContent`
- `handleNegotiateGroupFromContent`

当 `routing_intent.primary_route === "content_first"` 时，“进入群域”为主按钮；其他 route 下作为次级按钮展示。

`components/RealmFeedPanel.tsx` 展示：

- overall_summary
- 推荐内容列表
- 内容 title、type、summary、body、topics、quality_signals、filter_risks
- fit_score、recommendation_level、reason、risk、matched_traits
- 作者信息和关联群信息
- 过滤内容列表
- 内容卡片协商按钮

## 7. 群域推荐测试记录

测试请求：

```txt
POST /api/realm/recommend
scene=career_transition_matching
routing_intent.primary_route=content_first
```

结果：

```txt
STATUS=200
candidate_count=24
recommendedItems=6
filteredItems=2
recommendedItems[0].content 存在
recommendedItems[0].content.author 存在
recommendedItems[0].content.linkedGroups.length=1
```

结论：群域推荐通过。

## 8. 内容卡片协商测试记录

作者协商：

```txt
POST /api/agent/negotiate
targetType=person
targetId=person_career_001
source=realm_content
contentId=cnt_career_001_a
```

结果：

```txt
STATUS=200
target_type=person
source=realm_content
content_id=cnt_career_001_a
negotiation_transcript.length=4
sourceContent=true
```

关联群协商：

```txt
POST /api/agent/negotiate
targetType=group
targetId=grp_career_001
source=realm_content
contentId=cnt_career_001_a
```

结果：

```txt
STATUS=200
target_type=group
source=realm_content
content_id=cnt_career_001_a
negotiation_transcript.length=4
sourceContent=true
```

结论：内容卡片作者协商和关联群协商均通过。

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

本步骤未修改原有匹配和协商接口逻辑。`/api/agent/negotiate` 的 `realm_content` source 使用了 Step5 已预留的 `contentId` 字段。

## 10. 当前问题

群域推荐仍依赖 LLM JSON 稳定性。当前通过限制推荐数量、过滤数量、后端兜底 `candidate_count` 和忽略无效 `content_id` 降低风险。

前端已经展示完整内容 `body`，如果后续内容更长，需要考虑折叠、摘要优先和分页。

## 11. 下一步建议

下一步可以增加内容筛选、按 route 的推荐 tab，以及把用户对内容的点击/协商行为保存为会话状态，用于后续多轮推荐和协商优化。
