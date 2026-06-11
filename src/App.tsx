import { useRef, useState, useEffect, type KeyboardEvent } from "react";
import { useEidenticStream } from "@eidentic/react";
import type { TextMessage } from "@eidentic/react";

const AGENT_ENDPOINT = "http://localhost:8787/v1/agents/chat-agent/query";

function ChatMessage({ msg }: { msg: TextMessage }) {
  return (
    <div className={`message message--${msg.role}`}>
      <span className="message__bubble">
        {msg.content}
        {msg.streaming && <span className="message__cursor" aria-hidden="true" />}
      </span>
    </div>
  );
}

export default function App() {
  const { messages, status, error, send, stop } = useEidenticStream(AGENT_ENDPOINT);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const text = input.trim();
    if (!text || status === "streaming") return;
    send(text);
    setInput("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const isStreaming = status === "streaming";

  return (
    <div className="app">
      <header className="header">
        <h1 className="header__title">Eidentic Chat</h1>
        <p className="header__subtitle">Memory-backed agent — remembers your conversation</p>
      </header>

      <main className="chat">
        {messages.length === 0 && (
          <div className="chat__empty">
            <p>Send a message to start chatting. The agent will remember details across turns.</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatMessage key={i} msg={msg} />
        ))}

        {isStreaming && messages.every((m) => !m.streaming) && (
          <div className="message message--assistant">
            <span className="message__bubble message__bubble--thinking">
              <span className="message__cursor" aria-hidden="true" />
            </span>
          </div>
        )}

        {error && (
          <div className="chat__error">
            <strong>Error:</strong> {error.message}
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      <footer className="composer">
        <textarea
          className="composer__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
          rows={2}
          disabled={isStreaming}
          aria-label="Message input"
        />
        <div className="composer__actions">
          {isStreaming ? (
            <button
              className="composer__btn composer__btn--stop"
              onClick={stop}
              type="button"
            >
              Stop
            </button>
          ) : (
            <button
              className="composer__btn composer__btn--send"
              onClick={handleSend}
              disabled={!input.trim()}
              type="button"
            >
              Send
            </button>
          )}
        </div>
        <p className="composer__hint">
          Status: <span className={`status status--${status}`}>{status}</span>
        </p>
      </footer>
    </div>
  );
}
