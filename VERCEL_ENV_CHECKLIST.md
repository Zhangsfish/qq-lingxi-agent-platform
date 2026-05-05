# Vercel 环境变量清单

## Production / Preview 都建议配置

- `SILICONFLOW_API_KEY`
- `SILICONFLOW_BASE_URL`
- `SILICONFLOW_MODEL`
- `DEMO_AUTH_USER`
- `DEMO_AUTH_PASSWORD`

## 变量说明

- `SILICONFLOW_API_KEY`：SiliconFlow API key，只能配置在 Vercel 环境变量中。
- `SILICONFLOW_BASE_URL`：SiliconFlow API base URL。
- `SILICONFLOW_MODEL`：模型名称。
- `DEMO_AUTH_USER`：Demo 访问账号。
- `DEMO_AUTH_PASSWORD`：Demo 访问密码。

## 禁止事项

- 不要把 `SILICONFLOW_API_KEY` 写入代码。
- 不要使用 `NEXT_PUBLIC_SILICONFLOW_API_KEY`。
- 不要提交 `.env.local`。
- 不要把 Demo 密码写入 README 或报告。
- 不要在截图、聊天记录或日志中暴露真实 API key。

## 建议

- `DEMO_AUTH_USER` 可以使用简短账号。
- `DEMO_AUTH_PASSWORD` 使用强密码，不要使用弱密码。
- 如果 API key 曾在聊天、截图或日志中出现，部署前必须轮换。

