"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useLocale } from "@/contexts/LocaleContext";
import {
  type AimProfile,
  type AimBuddy,
  type AimRoom,
  type AimMessage,
  type AimStatus,
} from "@/lib/aim";
import { connectWebSocket } from "@/lib/realtime/websocket";
import type { ChatClientMessage, ChatServerMessage } from "@/lib/realtime/types";

type Thread =
  | { type: "room"; id: string; name: string; threadId: string }
  | { type: "buddy"; id: string; name: string; threadId: string };

function threadKey(t: Thread): string {
  return t.type === "room" ? `room:${t.threadId}` : `buddy:${t.threadId}`;
}

const EMPTY_PROFILE: AimProfile = {
  screenName: "",
  status: "online",
  awayMessage: "",
};

const WS_BASE = typeof window !== "undefined" ? (process.env.NEXT_PUBLIC_CHAT_WS_URL || `ws://${window.location.hostname}:3001`) : "";

export default function AimExperience() {
  const { data: session, status: sessionStatus } = useSession();
  const { t } = useLocale();
  const [profile, setProfile] = useState<AimProfile>(EMPTY_PROFILE);
  const [buddies, setBuddies] = useState<AimBuddy[]>([]);
  const [rooms, setRooms] = useState<AimRoom[]>([]);
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [messagesByThread, setMessagesByThread] = useState<Record<string, AimMessage[]>>({});
  const [input, setInput] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("disconnected");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileDirty, setProfileDirty] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<ReturnType<typeof connectWebSocket<ChatClientMessage, ChatServerMessage>> | null>(null);

  const isAuthed = sessionStatus === "authenticated" && !!session?.user;

  useEffect(() => {
    if (!isAuthed) {
      setLoading(false);
      return;
    }
    setLoadError(null);
    setLoading(true);
    Promise.all([
      fetch("/api/chat/profile").then((r) => (r.ok ? r.json() : Promise.reject(new Error("Profile failed")))),
      fetch("/api/chat/buddies").then((r) => (r.ok ? r.json() : Promise.reject(new Error("Buddies failed")))),
      fetch("/api/chat/rooms").then((r) => (r.ok ? r.json() : Promise.reject(new Error("Rooms failed")))),
    ])
      .then(([profileData, buddiesData, roomsData]) => {
        setProfile({ screenName: profileData.screenName ?? "", status: profileData.status ?? "online", awayMessage: profileData.awayMessage ?? "" });
        setBuddies(Array.isArray(buddiesData) ? buddiesData : []);
        setRooms(Array.isArray(roomsData) ? roomsData : []);
      })
      .catch(() => setLoadError("Could not load chat data"))
      .finally(() => setLoading(false));
  }, [isAuthed]);

  useEffect(() => {
    if (!profileDirty || !isAuthed) return;
    const id = setTimeout(() => {
      const payload = { screenName: profile.screenName, status: profile.status, awayMessage: profile.awayMessage };
      fetch("/api/chat/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
        .then((r) => { if (r.ok) setProfileDirty(false); })
        .catch(() => {});
    }, 800);
    return () => clearTimeout(id);
  }, [profile.screenName, profile.status, profile.awayMessage, profileDirty, isAuthed]);

  const key = activeThread ? threadKey(activeThread) : null;
  const messages = (key && messagesByThread[key]) || [];

  const setMessagesForThread = useCallback((threadKeyVal: string, updater: (prev: AimMessage[]) => AimMessage[]) => {
    setMessagesByThread((prev) => ({ ...prev, [threadKeyVal]: updater(prev[threadKeyVal] || []) }));
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeThread, messagesByThread]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !key || !activeThread) return;
    setInput("");
    const conn = wsRef.current;
    if (conn) {
      conn.send({ type: "send_message", threadId: activeThread.threadId, body: text });
    } else {
      fetch(`/api/chat/threads/${activeThread.threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      })
        .then((r) => r.ok ? r.json() : null)
        .then((data) => {
          if (data) setMessagesForThread(key, (prev) => [...prev, { id: data.id, author: data.author, content: data.content, at: data.at }]);
        })
        .catch(() => {});
    }
  };

  const openRoom = (room: AimRoom) => {
    const thread: Thread = { type: "room", id: room.id, name: room.name, threadId: room.id };
    setActiveThread(thread);
    const k = threadKey(thread);
    if (!messagesByThread[k]?.length) {
      fetch(`/api/chat/threads/${room.id}/messages`)
        .then((r) => (r.ok ? r.json() : { messages: [] }))
        .then((data) => setMessagesByThread((prev) => ({ ...prev, [k]: (data.messages || []).map((m: { id: string; author: string; content: string; at: number }) => ({ id: m.id, author: m.author, content: m.content, at: m.at })) })))
        .catch(() => setMessagesByThread((prev) => ({ ...prev, [k]: [] })));
    }
  };

  const openBuddy = (buddy: AimBuddy) => {
    fetch(`/api/chat/threads/dm?withUserId=${encodeURIComponent(buddy.id)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("DM failed"))))
      .then((data) => {
        const threadId = data.id as string;
        const thread: Thread = { type: "buddy", id: buddy.id, name: buddy.screenName, threadId };
        setActiveThread(thread);
        const k = threadKey(thread);
        if (!messagesByThread[k]?.length) {
          fetch(`/api/chat/threads/${threadId}/messages`)
            .then((res) => (res.ok ? res.json() : { messages: [] }))
            .then((resData) => setMessagesByThread((prev) => ({
              ...prev,
              [k]: (resData.messages || []).map((m: { id: string; author: string; content: string; at: number }) => ({ id: m.id, author: m.author, content: m.content, at: m.at })),
            })))
            .catch(() => setMessagesByThread((prev) => ({ ...prev, [k]: [] })));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (!activeThread || !isAuthed || !key) {
      wsRef.current?.close();
      wsRef.current = null;
      setConnectionStatus("disconnected");
      return;
    }
    setConnectionStatus("connecting");
    let closed = false;
    fetch("/api/chat/ws-token")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Token failed"))))
      .then((data) => {
        if (closed) return;
        const token = data.token as string;
        const url = `${WS_BASE}?threadId=${encodeURIComponent(activeThread.threadId)}&token=${encodeURIComponent(token)}`;
        const conn = connectWebSocket<ChatClientMessage, ChatServerMessage>({
          url,
          onMessage: (msg) => {
            if (msg.type === "message" && msg.payload) {
              setMessagesForThread(key, (prev) => {
                const exists = prev.some((m) => m.id === msg.payload.id);
                if (exists) return prev.map((m) => (m.id === msg.payload.id ? { ...m, author: msg.payload.author, content: msg.payload.content, at: msg.payload.at } : m));
                return [...prev, { id: msg.payload.id, author: msg.payload.author, content: msg.payload.content, at: msg.payload.at }];
              });
            }
          },
          onError: () => setConnectionStatus("disconnected"),
        });
        wsRef.current = conn;
        setConnectionStatus("connected");
      })
      .catch(() => setConnectionStatus("disconnected"));
    return () => {
      closed = true;
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [activeThread?.threadId, isAuthed, key, setMessagesForThread]);

  const statusColor = (s: AimStatus) =>
    s === "online" ? "bg-emerald-500" : s === "away" ? "bg-amber-500" : s === "busy" ? "bg-red-500" : "bg-neutral-400";

  if (!isAuthed) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center bg-white px-4 py-6 text-center text-[11px] text-neutral-500">
        <p>{t("chat.signInToChat")}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-white">
        <div className="shrink-0 border-b border-neutral-200 bg-neutral-50 px-3 py-2">
          <div className="h-6 w-48 animate-pulse rounded bg-neutral-200" />
          <div className="mt-2 h-4 w-full animate-pulse rounded bg-neutral-100" />
        </div>
        <div className="flex min-h-0 flex-1 gap-0">
          <div className="flex w-40 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50/80 p-2">
            <div className="h-3 w-16 animate-pulse rounded bg-neutral-200" />
            <div className="mt-2 space-y-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-full animate-pulse rounded bg-neutral-100" />
              ))}
            </div>
            <div className="mt-3 h-3 w-12 animate-pulse rounded bg-neutral-200" />
            <div className="mt-2 space-y-1">
              {[1, 2].map((i) => (
                <div key={i} className="h-4 w-full animate-pulse rounded bg-neutral-100" />
              ))}
            </div>
          </div>
          <div className="min-w-0 flex-1" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {loadError && (
        <div className="shrink-0 bg-amber-50 px-3 py-1.5 text-[11px] text-amber-800">
          {loadError}
        </div>
      )}
      {/* Profile strip */}
      <div className="shrink-0 border-b border-neutral-200 bg-neutral-50 px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={profile.screenName}
            onChange={(e) => { setProfile((p) => ({ ...p, screenName: e.target.value })); setProfileDirty(true); }}
            className="rounded border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-neutral-900"
            placeholder={t("chat.screenName")}
            aria-label={t("chat.screenName")}
          />
          <select
            value={profile.status}
            onChange={(e) => { setProfile((p) => ({ ...p, status: e.target.value as AimStatus })); setProfileDirty(true); }}
            className="rounded border border-neutral-200 bg-white px-2 py-1 text-[11px] text-neutral-700"
            aria-label={t("chat.status")}
          >
            <option value="online">{t("chat.statusOnline")}</option>
            <option value="away">{t("chat.statusAway")}</option>
            <option value="busy">{t("chat.statusBusy")}</option>
            <option value="offline">{t("chat.statusOffline")}</option>
          </select>
          <span className={`h-2 w-2 shrink-0 rounded-full ${statusColor(profile.status)}`} aria-hidden />
        </div>
        <input
          type="text"
          value={profile.awayMessage}
          onChange={(e) => { setProfile((p) => ({ ...p, awayMessage: e.target.value })); setProfileDirty(true); }}
          className="mt-1.5 w-full rounded border border-neutral-200 bg-white px-2 py-1 text-[11px] text-neutral-600"
          placeholder={t("chat.awayMessage")}
          aria-label={t("chat.awayMessage")}
        />
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Buddies + Rooms */}
        <div className="flex w-40 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50/80">
          <div className="shrink-0 border-b border-neutral-200 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            {t("chat.buddies")}
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto py-1">
            {buddies.length === 0 ? (
              <li className="px-2 py-3 text-[11px] text-neutral-500">
                {t("chat.noBuddies")}
              </li>
            ) : (
              buddies.map((b) => (
                <li key={b.id}>
                  <button
                    type="button"
                    onClick={() => openBuddy(b)}
                    className={`flex w-full items-center gap-1.5 px-2 py-1 text-left text-[11px] ${
                      activeThread?.type === "buddy" && activeThread.id === b.id
                        ? "bg-sky-100 font-medium text-sky-900"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusColor(b.status)}`} />
                    <span className="truncate">{b.screenName}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
          <div className="shrink-0 border-t border-neutral-200 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
            {t("chat.rooms")}
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto py-1">
            {rooms.length === 0 ? (
              <li className="px-2 py-3 text-[11px] text-neutral-500">
                {t("chat.noRooms")}
              </li>
            ) : (
              rooms.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => openRoom(r)}
                    className={`flex w-full items-center gap-1.5 px-2 py-1 text-left text-[11px] ${
                      activeThread?.type === "room" && activeThread.id === r.id
                        ? "bg-sky-100 font-medium text-sky-900"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    <span className="truncate">{r.name}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Active chat */}
        <div className="flex min-w-0 flex-1 flex-col">
          {activeThread ? (
            <>
              <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-3 py-1.5">
                <span className="truncate text-[11px] font-semibold text-neutral-800">
                  {activeThread.name}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-neutral-500">
                  {connectionStatus === "connecting" && t("chat.connecting")}
                  {connectionStatus === "connected" && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-emerald-500" aria-hidden />
                      {t("chat.realtime")}
                    </>
                  )}
                  {connectionStatus === "disconnected" && (
                    <span className="text-amber-600">{t("chat.disconnected")}</span>
                  )}
                </span>
              </div>
              <div
                ref={scrollRef}
                className="min-h-0 flex-1 overflow-y-auto px-3 py-2 text-[11px] text-neutral-700"
              >
                {messages.length === 0 ? (
                  <p className="text-neutral-500">{t("chat.noMessages")}</p>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className="mb-1.5">
                      <span className="font-semibold text-neutral-800">{m.author}:</span>{" "}
                      <span className="text-neutral-600">{m.content}</span>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={send} className="shrink-0 border-t border-neutral-200 p-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t("chat.placeholder")}
                    className="min-w-0 flex-1 rounded border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-[11px] text-neutral-900 placeholder:text-neutral-400 focus:border-sky-400 focus:ring-1 focus:ring-sky-400"
                    aria-label={t("chat.placeholder")}
                  />
                  <button
                    type="submit"
                    className="shrink-0 rounded border border-sky-300 bg-sky-50 px-3 py-1.5 text-[11px] font-medium text-sky-800 hover:bg-sky-100"
                  >
                    {t("chat.send")}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-6 text-center text-[11px] text-neutral-500">
              <p>{t("chat.noChatSelected")}</p>
              <p className="text-[10px]">{t("chat.buddies")} / {t("chat.rooms")}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
