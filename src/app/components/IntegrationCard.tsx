"use client";
import { useState } from "react";
import { Icon } from "./icons";
import { Sparkline } from "./Sparkline";
import { StatusBadge } from "./StatusBadge";
import { STATUSES } from "@/lib/status-meta";
import { displayId, fmtNumber, fmtRelativeFuture, fmtRelativePast, fmtTime } from "@/lib/format";
import type { IntegracaoComStatus } from "@/lib/types";

export function IntegrationCard({
  data,
  onOpen,
  onDelete,
}: {
  data: IntegracaoComStatus;
  onOpen: (d: IntegracaoComStatus) => void;
  onDelete: (d: IntegracaoComStatus) => void;
}) {
  const s = STATUSES[data.status];
  const [hovered, setHovered] = useState(false);
  const [trashHover, setTrashHover] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(data)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(data);
        }
      }}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        textAlign: "left",
        padding: 0,
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)",
        cursor: "pointer",
        transition: "transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        setHovered(true);
        e.currentTarget.style.boxShadow = "var(--shadow-lg)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.borderColor = "var(--border-strong)";
      }}
      onMouseLeave={(e) => {
        setHovered(false);
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <div style={{ height: 3, background: s.color }} />
      <div style={{ padding: "18px 18px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--text)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginBottom: 6,
              }}
            >
              {data.cliente}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--text-faint)" }}>
                {displayId(data.id)}
              </span>
              {data.tipo && (
                <span
                  style={{
                    padding: "2px 8px",
                    background: "var(--accent-soft)",
                    color: "var(--accent)",
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: 4,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  {data.tipo}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <StatusBadge status={data.status} />
            <button
              aria-label="Remover integração"
              title="Remover integração"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(data);
              }}
              onMouseEnter={() => setTrashHover(true)}
              onMouseLeave={() => setTrashHover(false)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 7,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: trashHover ? "var(--failed-soft)" : "transparent",
                color: trashHover ? "var(--failed)" : "var(--text-faint)",
                opacity: hovered || trashHover ? 1 : 0,
                transition: "opacity 0.18s ease, background 0.18s ease, color 0.18s ease",
                cursor: "pointer",
              }}
            >
              <Icon.Trash width={14} height={14} />
            </button>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>{data.nome}</div>
      </div>

      <div style={{ padding: "0 18px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "var(--text-faint)",
              letterSpacing: 0.8,
              textTransform: "uppercase",
            }}
          >
            Últimas 12 execuções
          </div>
          <Sparkline data={data.history} color={s.color} />
        </div>
      </div>

      <div style={{ margin: "0 18px 14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "12px 14px" }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "var(--text-faint)",
              letterSpacing: 0.8,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Última execução
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
            {fmtRelativePast(data.ultimaMins)}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }} className="mono">
            {fmtTime(data.ultimaExec)} · {fmtNumber(data.registros)} reg.
          </div>
        </div>
        <div style={{ background: "var(--surface-2)", borderRadius: 10, padding: "12px 14px" }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "var(--text-faint)",
              letterSpacing: 0.8,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Próxima execução
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color:
                data.status === "failed"
                  ? "var(--text-faint)"
                  : data.status === "delayed"
                    ? "var(--delayed)"
                    : "var(--text)",
            }}
          >
            {data.proxExec == null ? "Suspensa" : fmtRelativeFuture(data.proxMins)}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }} className="mono">
            {fmtTime(data.proxExec)}
          </div>
        </div>
      </div>

      {data.erro && (
        <div
          style={{
            margin: "0 18px 16px",
            padding: "10px 12px",
            background: s.soft,
            borderLeft: `3px solid ${s.color}`,
            borderRadius: 6,
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
          }}
        >
          <Icon.AlertTriangle width={14} height={14} style={{ color: s.color, flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12, color: "var(--text)", lineHeight: 1.4 }}>{data.erro}</div>
        </div>
      )}
    </div>
  );
}
