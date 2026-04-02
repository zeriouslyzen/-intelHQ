"use client";

import { useEffect, useState } from "react";

interface LiveNumberProps {
  value: number;
  /** e.g. 2 for 1.23, 4 for FX */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  /** Class when value goes up (e.g. text-emerald-600) */
  upClass?: string;
  /** Class when value goes down */
  downClass?: string;
  /** If true, apply up/down class based on value change */
  showDirection?: boolean;
}

export default function LiveNumber({
  value,
  decimals = 2,
  prefix = "",
  suffix = "",
  className = "",
  upClass = "text-emerald-600 dark:text-emerald-400",
  downClass = "text-red-600 dark:text-rose-400",
  showDirection = false,
}: LiveNumberProps) {
  const [prev, setPrev] = useState(value);
  const [flip, setFlip] = useState(false);
  const display =
    decimals <= 0
      ? Math.round(value).toFixed(0)
      : value.toFixed(decimals);
  const direction = showDirection ? (value > prev ? "up" : value < prev ? "down" : null) : null;

  useEffect(() => {
    if (value !== prev) {
      setFlip(true);
      setPrev(value);
      const t = setTimeout(() => setFlip(false), 320);
      return () => clearTimeout(t);
    }
  }, [value, prev]);

  return (
    <span
      className={
        `${className} font-mono tabular-nums transition-colors duration-200 ${
          flip ? "animate-live-flip" : ""
        } ${direction === "up" ? upClass : direction === "down" ? downClass : ""}`
      }
      key={display}
    >
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
