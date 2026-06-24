import React, { useCallback, useEffect, useMemo, useState } from "react";
import ChatWindow from "./ChatWindow";
import { sendChatMessage } from "../../services/chatApi";

function createId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function formatTime(ts = Date.now()) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function TypingText({ text, typing }) {
  // Basic typing animation by progressively revealing characters
  const [shown, setShown] = useState("");

  useEffect(() => {
    if (!typing) {
      setShown(text);
      return;
    }

    setShown("");
    let i = 0;
    const timer = setInterval(() => {
      i += 2;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, 18);

    return () => clearInterval(timer);
  }, [text, typing]);

  return <>{shown}</>;
}

function ChatBotWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => [
    {
      id: createId(),
      role: "bot",
      text: "Hi! I’m RajStore Assistant. Ask me about products, price, stock, or recommendations.",
      timestamp: formatTime(),
    },
  ]);

  const suggestions = useMemo(
    () => [
      "Show laptops",
      "Headphones under 4000",
      "Best electronics under 10000",
      "Available products",
    ],
    []
  );

  const close = () => {
    setOpen(false);
    setMinimized(false);
  };

  const send = useCallback(
    async (text) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg = {
        id: createId(),
        role: "user",
        text: trimmed,
        timestamp: formatTime(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      try {
        const data = await sendChatMessage(trimmed);

        const botMsg = {
          id: createId(),
          role: "bot",
          text: data?.replyText || "Sorry—something went wrong.",
          timestamp: formatTime(),
          products: data?.products || [],
        };

        setMessages((prev) => [...prev, botMsg]);
      } catch (e) {
        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "bot",
            text: "I couldn’t connect to the server. Please try again.",
            timestamp: formatTime(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  // Optional: restore recent chat history
  useEffect(() => {
    if (!open) return;
    // In this simple implementation we keep only the current session.
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="cb-fab"
        aria-label="Open chat"
        onClick={() => {
          setOpen(true);
          setMinimized(false);
        }}
      >
        <span aria-hidden="true">💬</span>
        <span className="cb-fab-text">Chat</span>
      </button>

      {open ? (
        <ChatWindow
          messages={messages.map((m) => ({
            ...m,
            // keep plain text; typing animation is optional per message
            text: m.text,
          }))}
          onSend={send}
          loading={loading}
          onClose={close}
          onMinimize={() => setMinimized(true)}
          minimized={minimized}
          suggestions={suggestions}
        />
      ) : null}
    </>
  );
}

export default ChatBotWidget;

