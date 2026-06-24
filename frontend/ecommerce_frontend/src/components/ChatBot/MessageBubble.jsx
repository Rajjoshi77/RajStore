import React from "react";

function MessageBubble({ role, text, timestamp }) {
  const isUser = role === "user";

  return (
    <div className={`cb-row ${isUser ? "cb-row-user" : "cb-row-bot"}`}>
      <div className={`cb-bubble ${isUser ? "cb-bubble-user" : "cb-bubble-bot"}`}>
        {text}
        {timestamp ? <div className="cb-timestamp">{timestamp}</div> : null}
      </div>
    </div>
  );
}

export default MessageBubble;

