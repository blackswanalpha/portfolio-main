"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { errorMessage } from "@/components/ui/states";
import { MAX_MESSAGE_LENGTH, MAX_REQUEST_MESSAGES } from "./limits";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
}

const STORAGE_KEY = "ai-chat-history-v1";
const MAX_STORED_MESSAGES = 50;

const GREETING: ChatMessage = {
  id: "greeting",
  role: "assistant",
  content:
    "Hi, I'm Victor's portfolio assistant. Ask about his skills, recent projects, experience or how to get in touch.",
  timestamp: 0,
};

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// --- Conversation store ------------------------------------------------------
// The conversation lives outside React (in memory, mirrored to sessionStorage)
// and is read with useSyncExternalStore. Messages are appended only from event
// handlers and request callbacks, never from effects, so Strict Mode's double
// effects cannot duplicate them, and the server render never reads storage.

const SERVER_SNAPSHOT: ChatMessage[] = [GREETING];
let cache: ChatMessage[] | null = null;
const listeners = new Set<() => void>();

function isMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const m = value as Record<string, unknown>;
  return (
    typeof m.id === "string" &&
    (m.role === "user" || m.role === "assistant") &&
    typeof m.content === "string" &&
    typeof m.timestamp === "number"
  );
}

function readStored(): ChatMessage[] {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [GREETING];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [GREETING];
    const seen = new Set<string>();
    const messages: ChatMessage[] = [];
    for (const item of parsed) {
      if (!isMessage(item) || seen.has(item.id)) continue; // drop corrupt entries and duplicates
      seen.add(item.id);
      messages.push(item.id === GREETING.id ? GREETING : item);
    }
    return messages.length > 0 ? messages.slice(-MAX_STORED_MESSAGES) : [GREETING];
  } catch {
    return [GREETING];
  }
}

function getSnapshot(): ChatMessage[] {
  if (cache === null) cache = readStored();
  return cache;
}

function getServerSnapshot(): ChatMessage[] {
  return SERVER_SNAPSHOT;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function writeMessages(next: ChatMessage[]) {
  cache = next.slice(-MAX_STORED_MESSAGES);
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Quota or blocked storage: the in-memory conversation still works.
  }
  listeners.forEach((listener) => listener());
}

function appendMessage(message: ChatMessage) {
  writeMessages([...getSnapshot(), message]);
}

// --- Hook --------------------------------------------------------------------

export function useAIChat() {
  const messages = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  // The panel unmounts when it closes: drop whatever is still in flight.
  useEffect(
    () => () => {
      controllerRef.current?.abort();
      controllerRef.current = null;
    },
    [],
  );

  /** Ask the route to answer the last user message in `history`. */
  const request = useCallback(async (history: ChatMessage[]) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history
            .filter((m) => m.id !== GREETING.id)
            .slice(-MAX_REQUEST_MESSAGES)
            .map(({ role, content }) => ({ role, content })),
        }),
        signal: controller.signal,
      });
      const data = (await response.json().catch(() => null)) as {
        reply?: unknown;
        error?: unknown;
      } | null;
      // Aborted (panel closed, conversation cleared, newer request): no state updates.
      if (controller.signal.aborted) return;

      if (!response.ok) {
        throw new Error(
          typeof data?.error === "string" && data.error
            ? data.error
            : `The assistant didn't answer (error ${response.status}). Try again.`,
        );
      }
      const reply = typeof data?.reply === "string" ? data.reply.trim() : "";
      if (!reply) throw new Error("The assistant sent an empty reply. Try again.");

      appendMessage({ id: generateId(), role: "assistant", content: reply, timestamp: Date.now() });
      setPending(false);
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(errorMessage(err, "The assistant didn't answer. Try again."));
      setPending(false);
    } finally {
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  }, []);

  /** Send a user message. Returns false when it was rejected (empty, too long, busy). */
  const sendMessage = useCallback(
    (content: string): boolean => {
      const text = content.trim();
      if (!text || text.length > MAX_MESSAGE_LENGTH || controllerRef.current) return false;
      appendMessage({ id: generateId(), role: "user", content: text, timestamp: Date.now() });
      void request(getSnapshot());
      return true;
    },
    [request],
  );

  /** Re-ask the last user message (after an error or an interrupted request). */
  const retry = useCallback(() => {
    const history = getSnapshot();
    if (controllerRef.current || history[history.length - 1]?.role !== "user") return;
    void request(history);
  }, [request]);

  /** Abort the in-flight request without touching state (used while closing). */
  const abort = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
  }, []);

  const clear = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    writeMessages([GREETING]);
    setPending(false);
    setError(null);
  }, []);

  const last = messages[messages.length - 1];
  // The last question has no answer and nothing is in flight: show the error
  // with a retry (also covers a request cut off by closing the panel).
  const unanswered = !pending && last?.role === "user";

  return { messages, pending, error, unanswered, sendMessage, retry, abort, clear };
}
