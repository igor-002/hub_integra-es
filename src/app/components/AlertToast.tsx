"use client";
import { Icon } from "./icons";
import { fmtAgoSql } from "@/lib/format";
import type { AlertaComCliente } from "@/lib/types";

export function AlertToast({
  alertas,
  onDismiss,
  onDismissAll,
  expanded,
  setExpanded,
}: {
  alertas: AlertaComCliente[];
  onDismiss: (id: number) => void;
  onDismissAll: () => void;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
}) {
  if (alertas.length === 0) return null;
  const top = alertas[0];

  return (
    <div style={{ position: "fixed", right: 24, bottom: 24, width: 360, zIndex: 100 }}>
      {expanded ? (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            boxShadow: "var(--shadow-lg)",
            overflow: "hidden",
            animation: "slideUp 0.3s ease",
          }}
        >
          <div
            style={{
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  background: "var(--failed-soft)",
                  color: "var(--failed)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon.Bell width={13} height={13} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Alertas ativos</div>
              <div
                style={{
                  background: "var(--failed)",
                  color: "white",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "1px 7px",
                  borderRadius: 99,
                }}
              >
                {alertas.length}
              </div>
            </div>
            <button
              onClick={() => setExpanded(false)}
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                color: "var(--text-muted)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon.X width={14} height={14} />
            </button>
          </div>
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {alertas.map((a) => (
              <div
                key={a.id}
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: a.tipo === "falha_execucao" ? "var(--failed)" : "var(--delayed)",
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{a.cliente}</div>
                    <div
                      style={{ fontSize: 11, color: "var(--text-faint)", whiteSpace: "nowrap" }}
                      className="mono"
                    >
                      {fmtAgoSql(a.criado_em)}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>{a.mensagem}</div>
                </div>
                <button
                  onClick={() => onDismiss(a.id)}
                  style={{ color: "var(--text-faint)", padding: 2 }}
                  title="Marcar como visto"
                >
                  <Icon.Check width={14} height={14} />
                </button>
              </div>
            ))}
          </div>
          <div style={{ padding: 12, display: "flex", gap: 8 }}>
            <button
              onClick={() => setExpanded(false)}
              style={{
                flex: 1,
                padding: "9px 12px",
                borderRadius: 8,
                background: "var(--accent)",
                color: "white",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Fechar
            </button>
            <button
              onClick={onDismissAll}
              style={{
                padding: "9px 12px",
                borderRadius: 8,
                background: "var(--surface-2)",
                color: "var(--text-muted)",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Marcar todos
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          style={{
            width: "100%",
            textAlign: "left",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "12px 14px",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            animation: "slideUp 0.3s ease",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--failed-soft)",
              color: "var(--failed)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <Icon.Bell width={16} height={16} />
            <span
              style={{
                position: "absolute",
                top: -3,
                right: -3,
                width: 16,
                height: 16,
                borderRadius: "50%",
                background: "var(--failed)",
                color: "white",
                fontSize: 10,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid var(--surface)",
              }}
            >
              {alertas.length}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
              {alertas.length} alerta{alertas.length > 1 ? "s" : ""} não visualizado
              {alertas.length > 1 ? "s" : ""}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {top.cliente} · {top.mensagem}
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
