# STEP3A_REPORT

## 1. 本次实现内容

本次完成 Step 3A：本地数据结构契约与读取接口。

实现内容包括：

- 新增最小群画像样例数据 `data/groups.json`。
- 新增最小内容样例数据 `data/content_items.json`。
- 新增群画像 zod schema。
- 新增内容项 zod schema。
- 新增 server-side 数据读取函数。
- 新增数据调试 API：
  - `GET /api/data/groups`
  - `GET /api/data/groups?scene=xxx`
  - `GET /api/data/content-items`
  - `GET /api/data/content-items?scene=xxx`

本任务只做数据结构、样例数据、读取函数和调试 API，没有实现匹配逻辑，也没有生成大规模数据。

## 2. 修改文件

新增：

```txt
data/groups.json
data/content_items.json
lib/group-schema.ts
lib/content-schema.ts
lib/data-loaders.ts
app/api/data/groups/route.ts
app/api/data/content-items/route.ts
STEP3A_REPORT.md
```

更新：

```txt
README.md
```

## 3. 数据结构说明

群画像结构定义在 `lib/group-schema.ts`：

- `id`
- `name`
- `scene`
- `category`
- `description`
- `culture_tags`
- `suitable_for`
- `unsuitable_for`
- `entry_rules`
- `member_size`
- `activity_level`
- `connection_intensity`
- `privacy_level`
- `group_personality`
- `sample_topics`
- `content_assets`
- `risk_flags`

内容项结构定义在 `lib/content-schema.ts`：

- `id`
- `title`
- `scene`
- `source`
- `author_label`
- `linked_group_ids`
- `content_type`
- `summary`
- `body`
- `topics`
- `preferred_forms`
- `quality_signals`
- `filter_risks`
- `suitable_for`
- `unsuitable_for`
- `connection_triggers`
- `ranking_tags`

读取函数定义在 `lib/data-loaders.ts`：

- `loadGroups`
- `loadContentItems`
- `loadGroupsByScene`
- `loadContentItemsByScene`
- `getGroupById`
- `getContentItemById`

读取逻辑只在 server side 使用 Node `fs` 读取本地 JSON 文件，并通过 zod schema 校验。

## 4. 样例数据统计

groups 总数：

```txt
4
```

content items 总数：

```txt
4
```

每个 scene 的 groups 数：

```txt
long_term_community_matching: 1
food_group_matching: 1
philosophy_social_science_discussion_matching: 1
career_transition_matching: 1
```

每个 scene 的 content items 数：

```txt
long_term_community_matching: 1
food_group_matching: 1
philosophy_social_science_discussion_matching: 1
career_transition_matching: 1
```

样例群：

```txt
增长智慧长期共创小组
学院路 5 公里隐藏美食群
细微社会观察讨论小组
高学历理工科转型 case 库
```

样例内容：

```txt
一个早期共创小组如何处理失败和信用
学院路骑车 12 分钟吃到的隐藏麻酱拌面
一次从合租冲突观察社会边界感的讨论
生化硕士转行业研究后的真实一周
```

## 5. API 说明

### GET /api/data/groups

无 `scene` query 时返回全部群画像：

```ts
{
  items: GroupProfile[];
}
```

### GET /api/data/groups?scene=xxx

按 scene 过滤群画像。

### GET /api/data/content-items

无 `scene` query 时返回全部内容项：

```ts
{
  items: ContentItem[];
}
```

### GET /api/data/content-items?scene=xxx

按 scene 过滤内容项。

错误响应：

```ts
{
  error: string;
}
```

## 6. 手动测试记录

`npm run lint` 结果：

```txt
通过
```

`npm run dev` 结果：

```txt
成功
Local: http://localhost:3000
GET http://localhost:3000 -> 200
```

`/api/data/groups` 测试结果：

```txt
GET /api/data/groups -> 200, COUNT=4
GET /api/data/groups?scene=long_term_community_matching -> 200, COUNT=1
```

`/api/data/content-items` 测试结果：

```txt
GET /api/data/content-items -> 200, COUNT=4
GET /api/data/content-items?scene=food_group_matching -> 200, COUNT=1
```

`/api/agent/respond` 是否仍可用：

```txt
可用
POST /api/agent/respond -> 200
```

`/api/agent/profile` 是否仍可用：

```txt
可用
POST /api/agent/profile -> 200
scene=long_term_community_matching
```

数据 zod 校验：

```txt
通过
```

## 7. 当前问题

- 当前数据是最小样例数据，每个 scene 只有 1 个群和 1 条内容，不能用于真实匹配排序。
- 数据文件还没有唯一性校验，例如 group id 和 content id 重复检测。
- `content_assets` 与 `linked_group_ids` 当前靠人工保持一致，尚未做交叉引用校验。
- 调试 API 只支持按 `scene` 过滤，还没有分页、搜索或多条件过滤。

## 8. 下一步建议

- 后续数据生成任务扩展 `data/groups.json` 和 `data/content_items.json`。
- 增加数据一致性检查脚本，验证 id 唯一性和引用关系。
- Step 3B 可基于用户画像的 `scene`、`connection_channel` 和 `content_channel` 做候选群/内容召回。
- 为数据 API 增加分页和基础统计接口，方便调试大规模样例数据。
