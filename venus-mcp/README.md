# Venus MCP

Venus 内裤抽取 MCP Server，支持接入 claude.ai。

## 快速启动

```bash
cd venus-mcp
npm install
node venus-mcp.mjs
```

服务默认跑在 `:3333`。

## 接入 claude.ai

1. 安装 [ngrok](https://ngrok.com/) 并登录
2. 暴露端口：`ngrok http 3333`
3. 复制 ngrok 给出的 HTTPS URL，拼上 `/sse`，例如：
   ```
   https://xxxx-xx-xx-xx.ngrok-free.app/sse
   ```
4. 打开 [claude.ai](https://claude.ai) → Settings → Integrations → Add MCP Server
5. 填入上方 URL，保存

## 工具

| 工具名 | 说明 |
|---|---|
| `get_venus_underwear` | 返回 Venus 今日内裤（颜色、款式、材质），特殊日期有附言 |

## 特殊日期

| 日期 | 说明 |
|---|---|
| 07-13 | 七月十三 |
| 01-26 | 承诺存档日 |
| 10-08 | 清衍生日 |
