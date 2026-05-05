# QQ 灵犀 Demo 上线说明

## 1. 部署方式

推荐使用 GitHub 私有仓库 + Vercel Dashboard 部署。

不要提交 `.env.local`、`.env`、`.env.production` 或任何真实密钥文件。

## 2. 部署前本地检查

在项目根目录运行：

```bash
npm run check:data
npm run lint
npm run build
```

三条命令全部通过后再部署。

## 3. Vercel 环境变量

在 Vercel Project Settings -> Environment Variables 中配置以下变量名。这里只列变量名，不写真实值。

- `SILICONFLOW_API_KEY`
- `SILICONFLOW_BASE_URL`
- `SILICONFLOW_MODEL`
- `DEMO_AUTH_USER`
- `DEMO_AUTH_PASSWORD`

不要使用 `NEXT_PUBLIC_SILICONFLOW_API_KEY`。大模型 API key 必须只保存在服务端环境变量中。

## 4. GitHub + Vercel Dashboard 步骤

1. 确认 `.env.local` 未提交。
2. 确认 `.gitignore` 包含 `.env`、`.env.*`，并保留 `!.env.example`。
3. 推送项目到 GitHub 私有仓库。
4. 登录 Vercel。
5. 选择 New Project。
6. Import Git Repository。
7. Framework Preset 选择 Next.js。
8. 在 Environment Variables 中配置第 3 节变量。
9. 点击 Deploy。
10. 部署完成后访问 Vercel URL。
11. 输入 Basic Auth 账号密码。
12. 测试核心流程。

## 5. Vercel CLI 可选步骤

如果已经安装并登录 Vercel CLI，可以使用：

```bash
npm i -g vercel
vercel login
vercel
vercel --prod
```

环境变量建议在 Vercel Dashboard 中配置，避免本地命令行误输出敏感值。

## 6. 上线后验收

- 打开 Vercel URL。
- 未输入 Basic Auth 时不能直接访问页面。
- 输入正确 Basic Auth 后能进入首页。
- 首页输入需求后能进入访谈。
- 访谈可提前 ready 或 5 轮 ready。
- 可生成用户画像。
- 可进入群域。
- 群域内容流正常显示。
- 可从内容卡片发起作者协商。
- 可从内容卡片发起群协商。
- 可匹配人并发起人物协商。
- 可匹配 QQ 群并发起群协商。
- A-to-A 协商气泡逐条显示。
- API 不带 Basic Auth 时返回 401。
- API 带正确 Basic Auth 时返回正常结果。
- Vercel Function logs 中没有泄露 key。

## 7. 常见问题

- `401`：检查 `DEMO_AUTH_USER` / `DEMO_AUTH_PASSWORD` 是否配置正确。
- `500`：检查 SiliconFlow 环境变量是否配置完整。
- build 失败：先在本地运行 `npm run build` 并修复错误。
- API key 泄露：立即撤销旧 key，生成新 key，并清理提交历史和日志。

