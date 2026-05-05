# STEP5_1_REPORT

## 1. 本次实现内容

本次完成 Step 5.1：用户画像路由意图补丁。

`UserNeedProfile` 新增可选字段 `routing_intent`，用于判断画像生成后用户更适合优先进入匹配人、匹配群、进入群域、多路径或继续补充信息。前端根据 `routing_intent.primary_route` 调整“匹配人 / 作者”和“匹配 QQ 群”的主次展示，并为 `content_first` 预留“进入群域（下一步实现）”入口。

本步骤未修改群匹配、人物匹配和 Agent-to-Agent 协商核心逻辑。

## 2. 修改文件

- `agents/user_profile_extractor_agent.md`
- `lib/profile-schema.ts`
- `lib/profile-validation.ts`
- `components/ProfilePanel.tsx`
- `app/api/agent/profile/route.ts`
- `app/page.tsx`
- `README.md`
- `STEP5_1_REPORT.md`

## 3. routing_intent 字段说明

新增可选字段：

```ts
routing_intent?: {
  primary_route: "person_first" | "group_first" | "content_first" | "mixed" | "uncertain";
  secondary_routes: Array<"person_first" | "group_first" | "content_first">;
  reason: string;
  recommended_cta: string;
  confidence: number;
}
```

字段含义：

- `primary_route`：推荐用户优先进入的路径。
- `secondary_routes`：可选次级路径。
- `reason`：判断理由。
- `recommended_cta`：前端可展示的推荐行动文案。
- `confidence`：0 到 1 的路由判断置信度。

该字段为 optional，旧画像没有 `routing_intent` 时不会解析失败。

## 4. prompt 更新说明

`agents/user_profile_extractor_agent.md` 已在输出 JSON schema 中加入 `routing_intent`，并新增路由意图判断规则。

同时在 `/api/agent/profile` 加入轻量规则兜底：

- 明确找人、作者、学长学姐、前辈、搭子、KOL、资深从业者 -> `person_first`
- 明确找群、圈子、共同体、组织、社群环境 -> `group_first`
- 明确暂时不加人或加群，只想先看内容、案例、帖子、经验 -> `content_first`

兜底只修正路由字段，不改其他画像内容。

## 5. 前端按钮主次逻辑

`app/page.tsx` 在画像生成后展示“推荐路径”区域：

- `person_first`：主按钮为“匹配人 / 作者”，次按钮为“匹配 QQ 群”。
- `group_first`：主按钮为“匹配 QQ 群”，次按钮为“匹配人 / 作者”。
- `content_first`：主按钮样式展示禁用的“进入群域（下一步实现）”，人/群匹配为次按钮。
- `mixed`：人/群匹配都正常展示。
- `uncertain` 或缺失：保持可直接选择匹配入口，并提示路由判断不明确。

`components/ProfilePanel.tsx` 已新增 `routing_intent` 展示区；旧画像缺失时显示“暂无路由判断”。

## 6. 手动测试记录

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

三类 routing_intent 样例测试：

```txt
person_first 样例 -> POST /api/agent/profile 200
primary_route=person_first
recommended_cta=匹配人 / 作者
```

```txt
group_first 样例 -> POST /api/agent/profile 200
primary_route=group_first
recommended_cta=匹配 QQ 群
```

```txt
content_first 样例 -> POST /api/agent/profile 200
primary_route=content_first
recommended_cta=进入群域
```

## 7. 回归测试记录

旧功能烟测：

```txt
POST /api/agent/profile -> 200
POST /api/match/people -> 200, matches=3, matchedPeople=3
POST /api/match/groups -> 200, matches=3, matchedGroups=3
POST /api/agent/negotiate -> 200, target=group, transcript=4
```

结论：新增 optional `routing_intent` 后，生成画像、匹配 QQ 群、匹配人 / 作者、发起 Agent 协商均可继续使用。

## 8. 当前问题

`content_first` 当前只做前端入口预留，按钮显示为“进入群域（下一步实现）”，尚未实现群域内容推荐接口。

LLM 对路由判断可能出现偏差，因此本次增加了明确意图的规则兜底。后续如果路由场景更复杂，可以把路由判断拆成独立模块，并记录可解释的命中规则。

## 9. 下一步建议

下一步可以实现群域内容推荐路径，让 `content_first` 用户能够先进入内容浏览，再从内容卡片发起人物、群或 Agent 协商。
