import { Agent, AIModel } from "eidentic";
import { LibsqlStore } from "@eidentic/libsql";
import { createServer, serveNode } from "@eidentic/server";
import { openai } from "@ai-sdk/openai";

const store = new LibsqlStore("file:eidentic.db");
await store.migrate();

const agent = new Agent({
  id: "chat-agent",
  instructions:
    "You are a helpful assistant with persistent memory. Remember details the user shares and refer back to them naturally across turns.",
  model: new AIModel(openai("gpt-4o-mini")),
  store,
});

const app = createServer({
  agents: { "chat-agent": agent },
  cors: {
    origin: "http://localhost:5173",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

await serveNode(app, { port: 8787 });
console.log("Eidentic agent server running on http://localhost:8787");
