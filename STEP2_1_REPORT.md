# STEP2_1_REPORT

## 1. 本次实现内容

本次完成 Step 2.1 用户画像模块加固，范围包括：

- 为 `UserNeedProfile` 增加 `zod` 运行时 schema 校验。
- 在 `ProfilePanel` 增加「复制画像 JSON」按钮。
- 在 `user_agent` 对话信息较少时显示画像质量提示。

原有能力保持不变：

- 三个普通 Agent 仍可通过 `/api/agent/respond` 对话。
- 用户画像仍通过 `/api/agent/profile` 生成。
- `ProfilePanel` 继续展示 `content_channel`、`connection_channel`、`identity_slice`、`preference_model`。

## 2. 修改文件

新增：

```txt
lib/profile-validation.ts
STEP2_1_REPORT.md
```

修改：

```txt
lib/profile-extractor.ts
components/ProfilePanel.tsx
app/page.tsx
README.md
package.json
package-lock.json
```

## 3. 新增依赖

新增 npm 依赖：

```txt
zod
```

安装命令：

```bash
npm install zod --offline=false --prefer-online --registry=https://registry.npmmirror.com
```

安装结果：

```txt
成功
```

说明：当前环境存在错误代理变量指向 `127.0.0.1:9`，安装时使用了清空代理变量的环境执行。

## 4. 运行时校验说明

新增 `lib/profile-validation.ts`：

- 使用 `zod` 定义 `UserNeedProfileSchema`。
- 覆盖字段：
  - `scene`
  - `surface_need`
  - `core_need`
  - `summary`
  - `content_channel`
  - `connection_channel`
  - `identity_slice`
  - `preference_model`
- `preference_model.confidence` 校验为 `0` 到 `1` 的数字。
- 数组字段均校验为 `string[]`。

更新 `lib/profile-extractor.ts`：

- 保留原有 JSON 直接解析逻辑。
- 保留从模型文本中提取 JSON 对象的兜底逻辑。
- 解析后调用 `validateUserNeedProfile`。
- 校验失败时抛出 `Profile JSON validation failed: ...`。

因此 `/api/agent/profile` 返回 200 时，说明画像 JSON 已经通过运行时 schema 校验。

## 5. 前端交互说明

`components/ProfilePanel.tsx`：

- 改为客户端组件。
- 增加「复制画像 JSON」按钮。
- 点击后执行：

```ts
navigator.clipboard.writeText(JSON.stringify(profile, null, 2))
```

- 复制成功显示 `已复制`。
- 复制失败显示 `复制失败`。

`app/page.tsx`：

- 统计当前 `user_agent` 会话中的用户消息数量：

```ts
const userMessageCount = currentMessages.filter((message) => message.role === "user").length;
```

- 当 `userMessageCount === 0`：禁用「生成用户画像」按钮。
- 当 `userMessageCount === 1`：显示提示：

```txt
当前信息较少，生成的画像可能置信度偏低。建议再补充 1-2 轮。
```

- 当 `userMessageCount >= 2`：不显示低信息提示。

## 6. 手动测试记录

`npm install zod` 是否成功：

```txt
成功
```

`npm run lint` 是否通过：

```txt
通过
```

`npm run dev` 是否成功：

```txt
成功
Local: http://localhost:3000
GET http://localhost:3000 -> 200
```

`/api/agent/respond` 是否仍可用：

```txt
user_agent -> 200
group_agent -> 200
matchmaker_agent -> 200
```

`/api/agent/profile` 是否仍可用：

```txt
POST /api/agent/profile -> 200
scene: long_term_community_matching
content_channel / connection_channel / identity_slice / preference_model 均存在
画像结果已通过 zod 校验
```

复制 JSON 是否成功：

```txt
成功
点击「复制画像 JSON」后显示「已复制」
剪贴板内容包含 long_term_community_matching
```

低信息提示是否出现：

```txt
成功
user_agent 只有 1 条用户消息时出现低信息提示
```

空会话按钮禁用：

```txt
成功
user_agent 对话为空时「生成用户画像」按钮不可用
```

## 7. 当前问题

- `/api/agent/profile` 仍依赖 LLM 输出质量，虽然有 zod 校验，但校验失败时目前只返回错误，不会自动要求模型修复 JSON。
- 复制按钮依赖浏览器 Clipboard API，在非安全上下文或浏览器权限受限时可能失败。
- 低信息提示只根据用户消息数量判断，没有结合内容质量判断。

## 8. 下一步建议

- 为画像抽取增加一次 JSON 修复重试：当 zod 校验失败时，将错误字段反馈给模型要求重新输出。
- 在 `ProfilePanel` 增加“下载 JSON”按钮。
- 增加更细的画像质量评分，例如结合 `confidence`、不确定字段数量、用户消息长度。
- 为 `/api/agent/profile` 增加单元测试，覆盖 JSON 提取、zod 校验失败、confidence 越界等场景。
