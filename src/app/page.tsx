"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Topbar } from "./components/Topbar";
import { StatCard } from "./components/StatCard";
import { IntegrationCard } from "./components/IntegrationCard";
import { AlertToast } from "./components/AlertToast";
import { DetailDrawer } from "./components/DetailDrawer";
import { NovaIntegracaoModal } from "./components/NovaIntegracaoModal";
import { ConfirmDeleteModal } from "./components/ConfirmDeleteModal";
import { Icon } from "./components/icons";
import { apiUrl } from "@/lib/api";
import { displayId } from "@/lib/format";
import type { AlertaComCliente, IntegracaoComStatus, StatusCalculado } from "@/lib/types";

type Counts = { total: number; healthy: number; failed: number; delayed: number };
const EMPTY: Counts = { total: 0, healthy: 0, failed: 0, delayed: 0 };
type FilterId = "todas" | StatusCalculado;

export default function Page() {
  const [theme, setTheme] = useState("light");
  const [integracoes, setIntegracoes] = useState<IntegracaoComStatus[]>([]);
  const [counts, setCounts] = useState<Counts>(EMPTY);
  const [alertas, setAlertas] = useState<AlertaComCliente[]>([]);
  const [filter, setFilter] = useState<FilterId>("todas");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<IntegracaoComStatus | null>(null);
  const [alertExpanded, setAlertExpanded] = useState(false);
  const [showNova, setShowNova] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<IntegracaoComStatus | null>(null);
  const [running, setRunning] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [atualizadoEm, setAtualizadoEm] = useState("—");

  // tema
  useEffect(() => {
    const t = localStorage.getItem("hub-theme") || "light";
    setTheme(t);
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("hub-theme", theme);
  }, [theme]);

  const fetchData = useCallback(async () => {
    try {
      const [ri, ra] = await Promise.all([
        fetch(apiUrl("/api/integracoes")),
        fetch(apiUrl("/api/alertas")),
      ]);
      const ji = await ri.json();
      const ja = await ra.json();
      setIntegracoes(ji.integracoes ?? []);
      setCounts(ji.counts ?? EMPTY);
      setAlertas(ja.alertas ?? []);
      setAtualizadoEm(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
      setLoaded(true);
    } catch {
      /* mantém estado anterior */
    }
  }, []);

  // primeira carga + polling a cada 15s
  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 15_000);
    return () => clearInterval(id);
  }, [fetchData]);

  // mantém o drawer selecionado em sincronia com dados novos
  useEffect(() => {
    if (!selected) return;
    const fresh = integracoes.find((i) => i.id === selected.id);
    if (fresh && fresh !== selected) setSelected(fresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [integracoes]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return integracoes.filter((i) => {
      if (filter !== "todas" && i.status !== filter) return false;
      if (q) {
        const hay = `${i.cliente} ${i.nome} ${i.tipo ?? ""} ${displayId(i.id)}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [integracoes, filter, query]);

  const filters: { id: FilterId; label: string; count: number }[] = [
    { id: "todas", label: "Todas", count: counts.total },
    { id: "healthy", label: "Saudáveis", count: counts.healthy },
    { id: "failed", label: "Falhas", count: counts.failed },
    { id: "delayed", label: "Atrasadas", count: counts.delayed },
  ];

  const dismiss = async (id: number) => {
    setAlertas((prev) => prev.filter((a) => a.id !== id)); // otimista
    await fetch(apiUrl(`/api/alertas/${id}`), { method: "PATCH" }).catch(() => {});
    fetchData();
  };
  const dismissAll = async () => {
    const ids = alertas.map((a) => a.id);
    setAlertas([]);
    await Promise.all(ids.map((id) => fetch(apiUrl(`/api/alertas/${id}`), { method: "PATCH" }).catch(() => {})));
    fetchData();
  };

  const runNow = async (d: IntegracaoComStatus) => {
    setRunning(true);
    try {
      const res = await fetch(apiUrl(`/api/integracoes/${d.id}/disparar`), { method: "POST" });
      const json = await res.json().catch(() => ({}));
      await fetchData();
      if (res.ok) {
        return { ok: true, mensagem: "Disparo enviado ao worker. Aguardando reporte de conclusão." };
      }
      return {
        ok: false,
        mensagem: json.erro ?? `Falha ao disparar (HTTP ${res.status})`,
      };
    } catch {
      return { ok: false, mensagem: "Erro de rede ao disparar o webhook." };
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 80 }}>
      <Topbar
        query={query}
        setQuery={setQuery}
        alertCount={alertas.length}
        onBell={() => setAlertExpanded(true)}
        theme={theme}
        toggleTheme={() => setTheme(theme === "light" ? "dark" : "light")}
        atualizadoEm={atualizadoEm}
      />

      <main style={{ maxWidth: 1440, margin: "0 auto", padding: "28px 32px" }}>
        {/* OVERVIEW */}
        <section style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: -0.4 }}>Visão geral</h1>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-muted)" }}>
                Status consolidado de todos os pipelines de integração ativos
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-muted)" }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--healthy)",
                    boxShadow: "0 0 0 4px var(--healthy-soft)",
                  }}
                />
                Ao vivo
              </div>
              <button
                onClick={() => setShowNova(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "9px 14px",
                  borderRadius: 9,
                  background: "var(--accent)",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <Icon.Plus width={15} height={15} /> Nova integração
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            <StatCard label="Total de integrações" value={counts.total} secondary="ativas" icon={<Icon.Database />} />
            <StatCard
              label="Saudáveis"
              value={counts.healthy}
              icon={<Icon.Check />}
              tone="healthy"
              fraction={counts.total ? counts.healthy / counts.total : 0}
            />
            <StatCard
              label="Com falha"
              value={counts.failed}
              icon={<Icon.AlertTriangle />}
              tone="failed"
              fraction={counts.total ? counts.failed / counts.total : 0}
            />
            <StatCard
              label="Atrasadas"
              value={counts.delayed}
              icon={<Icon.Clock />}
              tone="delayed"
              fraction={counts.total ? counts.delayed / counts.total : 0}
            />
          </div>
        </section>

        {/* FILTERS */}
        <section style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <div
              style={{
                display: "inline-flex",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: 4,
                gap: 2,
              }}
            >
              {filters.map((f) => {
                const active = filter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 7,
                      background: active ? "var(--surface-2)" : "transparent",
                      color: active ? "var(--text)" : "var(--text-muted)",
                      fontSize: 13,
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "all 0.15s ease",
                    }}
                  >
                    {f.label}
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "1px 7px",
                        borderRadius: 99,
                        background: active ? "var(--accent-soft)" : "var(--surface-2)",
                        color: active ? "var(--accent)" : "var(--text-faint)",
                      }}
                    >
                      {f.count}
                    </span>
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
              <span style={{ fontWeight: 600, color: "var(--text)" }}>{filtered.length}</span> integraç
              {filtered.length === 1 ? "ão" : "ões"} encontrad{filtered.length === 1 ? "a" : "as"}
            </div>
          </div>
        </section>

        {/* GRID */}
        <section>
          {filtered.length === 0 ? (
            <div
              style={{
                background: "var(--surface)",
                border: "1px dashed var(--border-strong)",
                borderRadius: 14,
                padding: "60px 20px",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                {loaded ? "Nenhuma integração encontrada" : "Carregando…"}
              </div>
              {loaded && <div style={{ fontSize: 12, marginTop: 6 }}>Tente ajustar os filtros ou a busca</div>}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
              {filtered.map((i) => (
                <IntegrationCard key={i.id} data={i} onOpen={setSelected} onDelete={setConfirmDelete} />
              ))}
            </div>
          )}
        </section>
      </main>

      <AlertToast
        alertas={alertas}
        onDismiss={dismiss}
        onDismissAll={dismissAll}
        expanded={alertExpanded}
        setExpanded={setAlertExpanded}
      />

      <DetailDrawer
        data={selected}
        onClose={() => setSelected(null)}
        onRunNow={runNow}
        onUpdated={fetchData}
        running={running}
      />

      {showNova && (
        <NovaIntegracaoModal onClose={() => setShowNova(false)} onCreated={fetchData} />
      )}

      {confirmDelete && (
        <ConfirmDeleteModal
          data={confirmDelete}
          onClose={() => setConfirmDelete(null)}
          onDeleted={() => {
            if (selected?.id === confirmDelete.id) setSelected(null);
            setConfirmDelete(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
