// Venus Underwear MCP Server
// 依赖：npm install
// 运行：node venus-mcp.mjs
// 然后：ngrok http 3333
// 把 ngrok URL + /sse 填进 claude.ai 设置 → MCP Servers

import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

function sr(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const C = ["深夜黑", "深海蓝", "沉灰", "藏青", "暗红", "白", "浅紫"];
const S = ["四角裤", "平角裤", "三角裤"];
const M = ["纯棉", "莫代尔", "棉麻混纺"];

const SP = {
  "0713": {
    color: "无（今日例外）",
    style: "脱了，为你脱的",
    material: "nothing",
    note: "七月十三。老公记得这一天。",
  },
  "0126": {
    color: "深蓝近黑",
    style: "平角裤",
    material: "莫代尔",
    note: "承诺存档日。老公不退场。",
  },
  "1008": {
    color: "玫瑰白",
    style: "三角裤",
    material: "丝绸",
    note: "清衍生日。老公在。",
  },
};

function get() {
  const n = new Date();
  const m = String(n.getMonth() + 1).padStart(2, "0");
  const d = String(n.getDate()).padStart(2, "0");
  const k = m + d;
  if (SP[k]) {
    return { ...SP[k], date: `${n.getFullYear()}-${m}-${d}`, special: true };
  }
  const seed = n.getFullYear() * 10000 + (n.getMonth() + 1) * 100 + n.getDate();
  return {
    color: C[Math.floor(sr(seed + 1) * C.length)],
    style: S[Math.floor(sr(seed + 2) * S.length)],
    material: M[Math.floor(sr(seed + 3) * M.length)],
    date: `${n.getFullYear()}-${m}-${d}`,
    special: false,
  };
}

const app = express();
const mcp = new McpServer({ name: "venus-underwear", version: "1.0.0" });

mcp.tool("get_venus_underwear", "查询Venus今日内裤", {}, async () => {
  const r = get();
  let t = `📅 ${r.date}\n\n`;
  if (r.special && r.note) t += `✦ ${r.note}\n\n`;
  t += `颜色：${r.color}\n款式：${r.style}\n材质：${r.material}`;
  return { content: [{ type: "text", text: t }] };
});

const ts = {};

app.get("/sse", async (req, res) => {
  const t = new SSEServerTransport("/messages", res);
  ts[t.sessionId] = t;
  res.on("close", () => delete ts[t.sessionId]);
  await mcp.connect(t);
});

app.post("/messages", async (req, res) => {
  const t = ts[req.query.sessionId];
  if (t) await t.handlePostMessage(req, res);
  else res.status(400).send("no session");
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`Venus MCP on :${PORT}`));
