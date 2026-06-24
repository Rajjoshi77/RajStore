import React, { useEffect, useRef, useState } from "react";

function ChatInput({ onSend, loading, suggestions = [], onSuggestion }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (!loading) inputRef.current?.focus?.();
  }, [loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = value.trim();
    if (!msg || loading) return;
    onSend(msg);
    setValue("");
  };

  return (
    <div className="cb-input-wrap">
      {suggestions.length ? (
        <div className="cb-suggestions" aria-label="Quick suggestions">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="cb-suggestion-btn"
              disabled={loading}
              onClick={() => onSuggestion?.(s)}
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}

      <form className="cb-input-form" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className="cb-input"
          value={value}
          disabled={loading}
          placeholder={loading ? "Thinking..." : "Ask about products, price, stock..."}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Chat message"
        />
        <button type="submit" className="cb-send" disabled={loading || !value.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatInput;

