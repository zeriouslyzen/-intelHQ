"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "@/contexts/LocaleContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function AiAssistPanel() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [open, messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    const reply: Message = {
      id: `a-${Date.now()}`,
      role: "assistant",
      content: t("ai.replyPlaceholder", { text }),
    };
    setMessages((prev) => [...prev, reply]);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-amber-300 bg-amber-50 shadow-lg hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
          aria-label={t("a11y.openAiAssist")}
        >
          <span className="text-sm font-semibold text-amber-800">AI</span>
        </button>
      )}
      {open && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/20 sm:bg-transparent"
          aria-modal="true"
          role="dialog"
        >
          <div
            className="flex h-full w-full max-w-md flex-col border-l border-neutral-200 bg-white shadow-xl sm:rounded-l-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
              <span className="text-sm font-semibold text-neutral-900">
                {t("ai.title")}
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                aria-label={t("a11y.close")}
              >
                <span className="text-lg leading-none">×</span>
              </button>
            </div>
            <p className="border-b border-neutral-100 px-4 py-2 text-[11px] text-neutral-500">
              {t("ai.subtitle")}
            </p>
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {messages.length === 0 && (
                <p className="text-sm text-neutral-500">
                  {t("ai.emptyHint")}
                </p>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.role === "user"
                      ? "ml-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-neutral-900"
                      : "mr-4 rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-800"
                  }
                >
                  {m.content}
                </div>
              ))}
            </div>
            <form
              className="border-t border-neutral-200 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("ai.placeholder")}
                  className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400"
                />
                <button
                  type="submit"
                  className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
                >
                  {t("ai.send")}
                </button>
              </div>
            </form>
          </div>
          <button
            type="button"
            className="absolute inset-0 -z-10"
            aria-label={t("a11y.close")}
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </>
  );
}
