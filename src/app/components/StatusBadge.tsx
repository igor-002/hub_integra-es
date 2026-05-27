"use client";
import { STATUSES } from "@/lib/status-meta";
import type { StatusCalculado } from "@/lib/types";

export function StatusDot({ status, pulse }: { status: StatusCalculado; pulse?: boolean }) {
  const c = STATUSES[status].color;
  return (
    <span style={{ position: "relative", display: "inline-flex", width: 8, height: 8 }}>
      {pulse && (
        <span
          style={{
            position: "absolute",
            inset: -3,
            borderRadius: "50%",
            background: c,
            opacity: 0.25,
            animation: "pulseRing 1.8s ease-out infinite",
          }}
        />
      )}
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
    </span>
  );
}

export function StatusBadge({ status }: { status: StatusCalculado }) {
  const s = STATUSES[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px 4px 8px",
        background: s.soft,
        color: s.color,
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.3,
        textTransform: "uppercase",
      }}
    >
      <StatusDot status={status} pulse={status !== "healthy"} />
      {s.label}
    </span>
  );
}
