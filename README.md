# Eidentic × React — Memory-backed Chat

A minimal but complete chat SPA that demonstrates how to wire a persistent-memory
agent backend (Node.js) to a streaming React frontend — using only the
[eidentic](https://github.com/eidentic/eidentic) SDK.

---

## What it does

| Layer | Technology | Role |
|---|---|---|
| Backend | `eidentic` + `@eidentic/server` | Hono-based agent server, SSE streaming |
| Storage | `@eidentic/libsql` (`LibsqlStore`) | SQLite-backed memory that persists across restarts |
| Frontend | React + `@eidentic/react` | `useEidenticStream` hook drives the chat UI |

The agent remembers facts you share across conversation turns. Close the tab,
reopen it with the same session, and it still knows what you told it.

---

## Prerequisites

- **Node.js** 18 or later
- An **OpenAI API key** (or swap the provider — see below)

---

## Install

```bash
git clone <this-repo>
cd eidentic-react-chat
npm install
```

---

## Configure

```bash
cp .env.example .env
# Edit .env and set OPENAI_API_KEY=sk-...
```

---

## Run

```bash
npm run dev
```

This starts both processes via `concurrently`:

| Process | URL |
|---|---|
| Agent server | http://localhost:8787 |
| Vite dev server | http://localhost:5173 |

Open http://localhost:5173 in your browser.

To run them in separate terminals instead:

```bash
# Terminal 1 — agent server
npm run dev:server

# Terminal 2 — Vite frontend
npm run dev:web
```

---

## How it works

1. **Server** (`server/index.ts`) — creates a `LibsqlStore` (SQLite file `eidentic.db`),
   attaches it to an `Agent`, then exposes the agent over HTTP with `createServer` +
   `serveNode`. The server mounts a CORS policy so the Vite origin
   (`http://localhost:5173`) can reach it.

2. **Frontend** (`src/App.tsx`) — calls `useEidenticStream` with the query endpoint
   `http://localhost:8787/v1/agents/chat-agent/query`. The hook returns:
   - `messages` — `TextMessage[]` (each has `role`, `content`, `streaming`)
   - `status` — `"idle" | "streaming" | "done" | "error" | "suspended"`
   - `send(text)` — POST a new user turn and start streaming the reply
   - `stop()` — abort an in-flight stream
   - `error` — `Error | null`

3. **Memory** — `LibsqlStore` persists every session's events and memory blocks in
   `eidentic.db`. The agent reads prior context on every turn, so it remembers
   what you told it even after a page reload.

---

## Production build

```bash
npm run build      # Vite frontend build → dist/
npm run typecheck  # tsc --noEmit for both frontend and server
```

---

## Swap provider

Eidentic is built on the [Vercel AI SDK](https://sdk.vercel.ai/), so any
`@ai-sdk/*` provider works. See `.env.example` for an Anthropic example.

---

## Links

- GitHub: https://github.com/eidentic/eidentic
- Docs: https://docs.eidentic.dev

---

## License

Apache-2.0 — see [LICENSE](./LICENSE).
