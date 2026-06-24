import React, { useEffect, useMemo, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import ProductCardInChat from "./ProductCardInChat";
import ChatInput from "./ChatInput";

function formatTime(ts = Date.now()) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function TypingDots() {
  return (
    <div className="cb-typing" aria-label="Bot is typing">
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}

function ChatWindow({ messages, onSend, loading, onClose, onMinimize, minimized, suggestions }) {
  const listRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    listRef.current?.scrollTo?.({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const quickSuggestions = useMemo(() => {
    if (suggestions?.length) return suggestions;
    return [
      "Show laptops",
      "Headphones under 4000",
      "Available products",
      "Is this product in stock?",
    ];
  }, [suggestions]);

  if (minimized) {
    return null;
  }

  return (
    <div className="cb-window" role="dialog" aria-label="Ecommerce chatbot">
      <div className="cb-header">
        <div className="cb-header-left">
          <div className="cb-avatar" aria-hidden="true">
            🛍️
          </div>
          <div className="cb-title">
            RajStore Assistant
            <div className="cb-subtitle">Shopping assistant</div>
          </div>
        </div>

        <div className="cb-header-actions">
          <button type="button" className="cb-icon-btn" onClick={onMinimize} aria-label="Minimize">
            —
          </button>
          <button type="button" className="cb-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
      </div>

      <div className="cb-messages" ref={listRef}>
        {messages.map((m) => (
          <React.Fragment key={m.id}>
            <MessageBubble role={m.role} text={m.text} timestamp={m.timestamp} />
            {m.products?.length ? (
              <div className="cb-products-wrap" aria-label="Matched products">
                {m.products.map((p) => (
                  <ProductCardInChat key={p.productID} product={p} />
                ))}
              </div>
            ) : null}
          </React.Fragment>
        ))}

        {loading ? (
          <div className="cb-row cb-row-bot">
            <div className="cb-bubble cb-bubble-bot">
              <TypingDots />
              <div className="cb-timestamp">{formatTime()}</div>
            </div>
          </div>
        ) : null}
      </div>

      <ChatInput
        onSend={onSend}
        loading={loading}
        suggestions={quickSuggestions}
        onSuggestion={(s) => onSend(s)}
      />
    </div>
  );
}

export default ChatWindow;

