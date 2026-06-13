import { useEffect, useRef, useState } from "react";
import { sendBeautyAdvisorMessage } from "../../services/aiService.js";

const INITIAL_MESSAGE = {
  role: "assistant",
  content:
    "Hi! I'm Aanya, your ALANKAAR beauty advisor ✨ Ask me anything about skincare, haircare, or finding the right product for you!",
};

function BeautyAdvisor() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, messages]);

  const parseMessageWithProducts = (text) => {
    const parts = text.split(/(\[PRODUCT:[^\]]+\])/g);
    return parts.map((part, index) => {
      const match = part.match(/\[PRODUCT:([^:]+):([^\]]+)\]/);
      if (match) {
        return (
          <a
            key={index}
            href={`/products/${match[2].trim()}`}
            className="advisor-product-link"
            onClick={() => setIsOpen(false)}
          >
            🛍️ {match[1].trim()}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // Build history — exclude the initial greeting and the message just sent
      const history = updatedMessages.slice(1, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendBeautyAdvisorMessage({
        message: trimmed,
        history,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
    setInput("");
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        type="button"
        id="beauty-advisor-fab"
        className="beauty-advisor-fab"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open AI Beauty Advisor"
      >
        {isOpen ? "✕" : "✨"}
        {!isOpen && (
          <span className="beauty-advisor-fab-label">AI Beauty Advisor</span>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="beauty-advisor-window" role="dialog" aria-label="Aanya Beauty Advisor">
          {/* Header */}
          <div className="beauty-advisor-header">
            <div className="beauty-advisor-header-info">
              <div className="beauty-advisor-avatar">✨</div>
              <div>
                <strong>Aanya</strong>
                <span className="beauty-advisor-status">
                  <span className="beauty-advisor-online-dot" />
                  AI Beauty Advisor
                </span>
              </div>
            </div>
            <div className="beauty-advisor-header-actions">
              <button
                type="button"
                id="beauty-advisor-reset-btn"
                className="beauty-advisor-icon-btn"
                onClick={handleReset}
                title="New conversation"
              >
                ↺
              </button>
              <button
                type="button"
                id="beauty-advisor-close-btn"
                className="beauty-advisor-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="beauty-advisor-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`beauty-advisor-message ${msg.role === "user" ? "user" : "assistant"}`}
              >
                {msg.role === "assistant" && (
                  <span className="beauty-advisor-message-avatar">✨</span>
                )}
                <div className="beauty-advisor-bubble">
                  {msg.role === "assistant"
                    ? parseMessageWithProducts(msg.content)
                    : msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="beauty-advisor-message assistant">
                <span className="beauty-advisor-message-avatar">✨</span>
                <div className="beauty-advisor-bubble beauty-advisor-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested questions — only shown before user sends first message */}
          {messages.length === 1 && (
            <div className="beauty-advisor-suggestions">
              {[
                "Best routine for oily skin?",
                "What products for hair damage?",
                "Recommend something for men",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="beauty-advisor-suggestion-chip"
                  onClick={() => {
                    setInput(suggestion);
                    inputRef.current?.focus();
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div className="beauty-advisor-input-area">
            <textarea
              ref={inputRef}
              id="beauty-advisor-input"
              className="beauty-advisor-input"
              placeholder="Ask about skincare, haircare, products..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              type="button"
              id="beauty-advisor-send-btn"
              className={`beauty-advisor-send ${!input.trim() || loading ? "disabled" : ""}`}
              onClick={handleSend}
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>

          <p className="beauty-advisor-disclaimer">
            Powered by Google Gemini · Recommendations based on ALANKAAR catalog
          </p>
        </div>
      )}
    </>
  );
}

export default BeautyAdvisor;
