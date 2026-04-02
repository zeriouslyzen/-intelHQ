"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "intelhq_live_polling";

type LivePollingContextValue = {
  /** User chose continuous refresh (while tab is visible). */
  pollEnabled: boolean;
  setPollEnabled: (value: boolean) => void;
  /** Document is visible (foreground tab). */
  tabVisible: boolean;
  /** Poll on an interval: pollEnabled && tabVisible. */
  shouldPoll: boolean;
  /** Latest successful refresh from any site live metric consumer (tickers, panels, strips). */
  lastRefreshAt: Date | null;
  /** Call after a successful /api/live (or equivalent) pull. */
  reportFeedSuccess: () => void;
};

const LivePollingContext = createContext<LivePollingContextValue | null>(null);

export function LivePollingProvider({ children }: { children: ReactNode }) {
  /** Default off (snapshot): faster first load; user opts in to live polling. Persisted "1" enables. */
  const [pollEnabled, setPollEnabledState] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [lastRefreshAt, setLastRefreshAt] = useState<Date | null>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s === "1") setPollEnabledState(true);
    } catch {
      /* ignore */
    }
  }, []);

  const setPollEnabled = useCallback((value: boolean) => {
    setPollEnabledState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    onVis();
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const shouldPoll = pollEnabled && tabVisible;

  const reportFeedSuccess = useCallback(() => {
    setLastRefreshAt(new Date());
  }, []);

  const value = useMemo(
    () => ({
      pollEnabled,
      setPollEnabled,
      tabVisible,
      shouldPoll,
      lastRefreshAt,
      reportFeedSuccess,
    }),
    [pollEnabled, tabVisible, shouldPoll, lastRefreshAt, reportFeedSuccess]
  );

  return (
    <LivePollingContext.Provider value={value}>
      {children}
    </LivePollingContext.Provider>
  );
}

export function useLivePolling(): LivePollingContextValue {
  const ctx = useContext(LivePollingContext);
  if (!ctx) {
    throw new Error("useLivePolling must be used within LivePollingProvider");
  }
  return ctx;
}
