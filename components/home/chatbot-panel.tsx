"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChatbotAsk } from "@/lib/api/chatbot";
import { Icon, icons } from "@/components/ui/icon";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  confidence?: number;
  grounded?: boolean;
  matchedSection?: { heading: string; category: string };
}

function renderMarkdown(text: string) {
  return text.split(/\n\n+/).map((para, pi) => {
    const parts = para.split(/\*\*([^*]+)\*\*/);
    return (
      <p key={pi} className={pi > 0 ? "mt-[6px]" : ""}>
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <strong key={i} className="font-semibold" style={{ color: "var(--aw-text)" }}>
              {part}
            </strong>
          ) : (
            part
          )
        )}
      </p>
    );
  });
}

function ConfidenceDot({ confidence }: { confidence: number }) {
  const color =
    confidence > 0.5
      ? "var(--aw-green)"
      : confidence > 0.3
      ? "var(--aw-accent)"
      : "var(--aw-text-3)";
  return (
    <span
      className="inline-flex items-center gap-[4px] text-[10px] px-[6px] py-[2px] rounded-full flex-shrink-0"
      style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}
    >
      <span className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ background: color }} />
      {Math.round(confidence * 100)}%
    </span>
  );
}

const SUGGESTIONS = [
  "How do I separate vocals from a song?",
  "What is Auto Trim?",
  "How does mastering work?",
];

export function ChatbotPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { mutate, isPending } = useChatbotAsk();

  const canSend = input.trim().length > 0 && !isPending;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  const handleSubmit = useCallback(
    (question?: string) => {
      const q = (question ?? input).trim();
      if (!q || isPending || q.length > 500) return;

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content: q },
      ]);
      setInput("");

      mutate(q, {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: data.answer,
              confidence: data.confidence,
              grounded: data.grounded,
              matchedSection: data.matched_sections[0],
            },
          ]);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: "Something went wrong. Please try again.",
              grounded: false,
              confidence: 0,
            },
          ]);
        },
      });
    },
    [input, isPending, mutate],
  );

  return (
    <div
      className="flex flex-col rounded-[16px] overflow-hidden"
      style={{
        background: "var(--aw-card)",
        border: "1px solid var(--aw-border)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-[10px] px-4 py-[10px]"
        style={{ borderBottom: "1px solid var(--aw-border)" }}
      >
        <div
          className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--aw-accent-dim)" }}
        >
          <Icon d={icons.sparkle} size={11} color="var(--aw-accent)" />
        </div>
        <span className="text-[13px] font-semibold" style={{ color: "var(--aw-text)" }}>
          Ask AudioWeave
        </span>
        <span
          className="ml-auto text-[10px] uppercase tracking-[0.06em] px-[7px] py-[2px] rounded-full"
          style={{
            color: "var(--aw-accent)",
            background: "var(--aw-accent-dim)",
            border: "1px solid rgba(232,160,85,0.2)",
          }}
        >
          AI
        </span>
      </div>

      {/* Messages area */}
      <div
        className="overflow-y-auto px-4 py-3 flex flex-col gap-[10px]"
        style={{ minHeight: 220, maxHeight: 360 }}
      >
        {messages.length === 0 && !isPending ? (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center mb-[10px]"
              style={{ background: "var(--aw-accent-dim)" }}
            >
              <Icon d={icons.sparkle} size={16} color="var(--aw-accent)" />
            </div>
            <p className="text-[12px] font-medium mb-[3px]" style={{ color: "var(--aw-text-2)" }}>
              Ask me anything about AudioWeave
            </p>
            <p className="text-[11px]" style={{ color: "var(--aw-text-3)" }}>
              Features, workflows, tips&hellip;
            </p>
            <div className="flex flex-wrap gap-[6px] justify-center mt-[12px]">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSubmit(s)}
                  className="text-[10px] px-[10px] py-[4px] rounded-full transition-all duration-150"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--aw-border)",
                    color: "var(--aw-text-3)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(232,160,85,0.3)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--aw-text-2)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--aw-border)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--aw-text-3)";
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} fade-in`}
              >
                {msg.role === "user" ? (
                  <div
                    className="max-w-[85%] px-3 py-[7px] rounded-[12px] rounded-tr-[3px] text-[12px]"
                    style={{
                      background: "var(--aw-accent-dim)",
                      border: "1px solid rgba(232,160,85,0.22)",
                      color: "var(--aw-text)",
                      lineHeight: 1.55,
                    }}
                  >
                    {msg.content}
                  </div>
                ) : (
                  <div className="max-w-[95%] flex flex-col gap-[5px]">
                    <div
                      className="px-3 py-[7px] rounded-[12px] rounded-tl-[3px] text-[12px] leading-relaxed"
                      style={{
                        background: "var(--aw-card-hi)",
                        border: "1px solid var(--aw-border-md)",
                        color: "var(--aw-text-2)",
                        opacity: msg.grounded === false ? 0.78 : 1,
                      }}
                    >
                      {renderMarkdown(msg.content)}
                      {msg.grounded === false && (
                        <p className="mt-[6px] text-[10px]" style={{ color: "var(--aw-text-3)" }}>
                          ⚠ Low confidence — treat as a rough guide.
                        </p>
                      )}
                    </div>
                    {(msg.matchedSection || msg.confidence != null) && (
                      <div className="flex items-center gap-[6px] px-1 flex-wrap">
                        {msg.matchedSection && (
                          <span className="text-[10px] truncate" style={{ color: "var(--aw-text-3)" }}>
                            {msg.matchedSection.category} › {msg.matchedSection.heading}
                          </span>
                        )}
                        {msg.confidence != null && <ConfidenceDot confidence={msg.confidence} />}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isPending && (
              <div className="flex items-start fade-in">
                <div
                  className="px-3 py-[8px] rounded-[12px] rounded-tl-[3px]"
                  style={{
                    background: "var(--aw-card-hi)",
                    border: "1px solid var(--aw-border)",
                  }}
                >
                  <div className="flex gap-[5px] items-center h-[16px]">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-[6px] h-[6px] rounded-full animate-pulse"
                        style={{
                          background: "var(--aw-text-3)",
                          animationDelay: `${i * 180}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-3">
        <div
          className="flex items-end gap-2 px-3 py-2 rounded-[10px] transition-all duration-150"
          style={{ background: "var(--aw-card-hi)", border: "1px solid var(--aw-border-md)" }}
          onFocus={() => {}}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask anything about AudioWeave…"
            maxLength={500}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-[12px] leading-relaxed placeholder:text-[color:var(--aw-text-3)]"
            style={{
              color: "var(--aw-text)",
              minHeight: "20px",
              maxHeight: "72px",
              overflowY: "auto",
            }}
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!canSend}
            aria-label="Send"
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 disabled:opacity-35"
            style={{
              background: canSend ? "var(--aw-accent)" : "rgba(255,255,255,0.06)",
              boxShadow: canSend ? "0 2px 8px rgba(232,160,85,0.25)" : "none",
            }}
          >
            <Icon
              d={icons.arrowUp}
              size={12}
              color={canSend ? "#000" : "var(--aw-text-3)"}
            />
          </button>
        </div>
        <p className="text-[10px] mt-[5px] px-1" style={{ color: "var(--aw-text-3)" }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
