"use client";
import { cloneElement, type ReactElement } from "react";

type Tone = "healthy" | "failed" | "delayed" | "accent";

export function StatCard({
  label,
  value,
  secondary,
  icon,
  tone,
  fraction,
}: {
  label: string;
  value: number | string;
  secondary?: string;
  icon: ReactElement<{ width?: number; height?: number }>;
  tone?: Tone;
  fraction?: number;
}) {
  const color =
    tone === "healthy"
      ? "var(--healthy)"
      : tone === "failed"
        ? "var(--failed)"
        : tone === "delayed"
          ? "var(--delayed)"
          : "var(--accent)";
  const soft =
    tone === "healthy"
      ? "var(--healthy-soft)"
      : tone === "failed"
        ? "var(--failed-soft)"
        : tone === "delayed"
          ? "var(--delayed-soft)"
          : "var(--accent-soft)";

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 16,
        padding: "20px 22px",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        minHeight: 148,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: 1.2,
            color: "var(--text-muted)",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: soft,
            color: color,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {cloneElement(icon, { width: 16, height: 16 })}
        </div>
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <div style={{ fontSize: 40, fontWeight: 700, color: "var(--text)", lineHeight: 1, letterSpacing: -1 }}>
            {value}
          </div>
          {secondary && <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{secondary}</div>}
        </div>
      </div>
      {fraction != null && (
        <div>
          <div
            style={{
              height: 6,
              borderRadius: 99,
              background: "var(--surface-2)",
              overflow: "hidden",
              display: "flex",
            }}
          >
            <div style={{ width: `${fraction * 100}%`, background: color, transition: "width 0.6s ease" }} />
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: "var(--text-faint)" }}>
            {Math.round(fraction * 100)}% do total
          </div>
        </div>
      )}
    </div>
  );
}
