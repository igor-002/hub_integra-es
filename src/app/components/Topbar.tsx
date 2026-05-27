"use client";
import Link from "next/link";
import { Icon } from "./icons";

export function Topbar({
  query,
  setQuery,
  alertCount,
  onBell,
  theme,
  toggleTheme,
  atualizadoEm,
}: {
  query: string;
  setQuery: (v: string) => void;
  alertCount: number;
  onBell: () => void;
  theme: string;
  toggleTheme: () => void;
  atualizadoEm: string;
}) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ color: "var(--accent)" }}>
            <Icon.Logo width={34} height={34} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: -0.3 }}>Hub Integrações</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
              Monitor de pipelines · atualizado {atualizadoEm}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              background: "var(--surface-2)",
              borderRadius: 9,
              padding: "0 12px",
              width: 280,
            }}
          >
            <Icon.Search width={14} height={14} style={{ color: "var(--text-faint)" }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar cliente, ERP ou ID…"
              style={{
                flex: 1,
                background: "transparent",
                border: "none",
                outline: "none",
                padding: "10px 8px",
                fontSize: 13,
                color: "var(--text)",
                fontFamily: "inherit",
              }}
            />
          </div>

          <Link
            href="/doc"
            style={{
              height: 38,
              padding: "0 14px",
              borderRadius: 9,
              background: "var(--surface-2)",
              color: "var(--text-muted)",
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
            title="Documentação da API"
          >
            <Icon.Book width={15} height={15} /> Doc
          </Link>

          <button
            onClick={onBell}
            style={{
              width: 38,
              height: 38,
              borderRadius: 9,
              background: "var(--surface-2)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
            title="Alertas"
          >
            <Icon.Bell width={16} height={16} style={{ color: "var(--text-muted)" }} />
            {alertCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--failed)",
                  border: "2px solid var(--surface)",
                }}
              />
            )}
          </button>

          <button
            onClick={toggleTheme}
            style={{
              width: 38,
              height: 38,
              borderRadius: 9,
              background: "var(--surface-2)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
              transition: "transform 0.3s ease",
            }}
            title={theme === "light" ? "Tema escuro" : "Tema claro"}
          >
            {theme === "light" ? <Icon.Moon width={16} height={16} /> : <Icon.Sun width={16} height={16} />}
          </button>
        </div>
      </div>
    </header>
  );
}
