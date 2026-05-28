"use client";
import { useEffect, useState } from "react";
import { Icon } from "./icons";
import { StatusBadge, StatusDot } from "./StatusBadge";
import { STATUSES } from "@/lib/status-meta";
import { apiUrl } from "@/lib/api";
import { displayId, fmtAgoSql, fmtNumber, fmtRelativeFuture, fmtRelativePast, fmtTime } from "@/lib/format";
import type { Execucao, IntegracaoComStatus, StatusCalculado } from "@/lib/types";

export type RunResult = { ok: boolean; mensagem: string };

function KV({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{value}</div>
      {sub && (
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }} className="mono">
          {sub}
        </div>
      )}
    </div>
  );
}

export function DetailDrawer({
  data,
  onClose,
  onRunNow,
  onUpdated,
  running,
}: {
  data: IntegracaoComStatus | null;
  onClose: () => void;
  onRunNow: (d: IntegracaoComStatus) => Promise<RunResult>;
  onUpdated: () => void;
  running: boolean;
}) {
  const [execs, setExecs] = useState<Execucao[]>([]);
  const [feedback, setFeedback] = useState<RunResult | null>(null);
  const [editingWebhook, setEditingWebhook] = useState(false);
  const [webhookDraft, setWebhookDraft] = useState("");
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [webhookErro, setWebhookErro] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    let active = true;
    setExecs([]);
    setFeedback(null);
    setEditingWebhook(false);
    setWebhookDraft(data.webhook_disparo ?? "");
    setWebhookErro(null);
    fetch(apiUrl(`/api/integracoes/${data.id}/execucoes?limit=6`))
      .then((r) => r.json())
      .then((j) => {
        if (active) setExecs(j.execucoes ?? []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [data]);

  if (!data) return null;
  const s = STATUSES[data.status];
  const temWebhook = !!data.webhook_disparo;

  const handleRunNow = async () => {
    setFeedback(null);
    const r = await onRunNow(data);
    setFeedback(r);
  };

  const salvarWebhook = async () => {
    setWebhookErro(null);
    setSavingWebhook(true);
    try {
      const res = await fetch(apiUrl(`/api/integracoes/${data.id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhook_disparo: webhookDraft.trim() || null }),
      });
      const json = await res.json();
      if (!res.ok) {
        setWebhookErro(json.erro ?? "Falha ao salvar webhook");
        return;
      }
      setEditingWebhook(false);
      onUpdated();
    } catch {
      setWebhookErro("Erro de rede ao salvar webhook");
    } finally {
      setSavingWebhook(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 200,
        display: "flex",
        justifyContent: "flex-end",
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 480,
          maxWidth: "100%",
          background: "var(--bg)",
          borderLeft: "1px solid var(--border)",
          overflowY: "auto",
          animation: "slideInRight 0.3s ease",
        }}
      >
        <div
          style={{
            padding: "24px 28px",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--text-faint)" }}>
                {displayId(data.id)}
              </span>
              <StatusBadge status={data.status} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{data.cliente}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
              {data.nome}
              {data.tipo ? ` · ${data.tipo}` : ""}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--surface-2)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)",
            }}
          >
            <Icon.X width={16} height={16} />
          </button>
        </div>

        <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleRunNow}
              disabled={running || !temWebhook}
              title={temWebhook ? "Disparar execução manual via webhook" : "Configure o webhook de disparo abaixo"}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 8,
                background: temWebhook ? "var(--accent)" : "var(--surface-2)",
                color: temWebhook ? "white" : "var(--text-faint)",
                fontSize: 13,
                fontWeight: 600,
                opacity: running ? 0.6 : 1,
                cursor: temWebhook ? "pointer" : "not-allowed",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Icon.Play width={13} height={13} /> {running ? "Disparando…" : "Executar agora"}
            </button>
          </div>

          {feedback && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: feedback.ok ? "var(--healthy-soft)" : "var(--failed-soft)",
                borderLeft: `3px solid ${feedback.ok ? "var(--healthy)" : "var(--failed)"}`,
                fontSize: 12.5,
                color: "var(--text)",
                lineHeight: 1.5,
              }}
            >
              {feedback.mensagem}
            </div>
          )}

          {data.descricao && (
            <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{data.descricao}</div>
          )}

          {data.erro && (
            <div
              style={{
                padding: "14px 16px",
                background: s.soft,
                borderLeft: `3px solid ${s.color}`,
                borderRadius: 8,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: s.color,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Diagnóstico
              </div>
              <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{data.erro}</div>
            </div>
          )}

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-muted)",
                letterSpacing: 0.8,
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              Resumo de execução
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <KV label="Última execução" value={fmtTime(data.ultimaExec)} sub={fmtRelativePast(data.ultimaMins)} />
              <KV
                label="Registros processados"
                value={fmtNumber(data.registros)}
                sub={data.status === "failed" ? "0 nesta janela" : "na última janela"}
              />
              <KV
                label="Próxima execução"
                value={fmtTime(data.proxExec)}
                sub={data.proxExec == null ? "Suspensa" : fmtRelativeFuture(data.proxMins)}
              />
              <KV label="Frequência" value={data.cron_esperado} sub={`tolerância ${data.tolerancia_minutos} min`} />
            </div>
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                }}
              >
                Webhook de disparo
              </div>
              {!editingWebhook && (
                <button
                  onClick={() => {
                    setWebhookDraft(data.webhook_disparo ?? "");
                    setWebhookErro(null);
                    setEditingWebhook(true);
                  }}
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--accent)",
                    padding: "4px 8px",
                    borderRadius: 6,
                    background: "var(--accent-soft)",
                  }}
                >
                  {temWebhook ? "Editar" : "Configurar"}
                </button>
              )}
            </div>

            {!editingWebhook ? (
              temWebhook ? (
                <div
                  className="mono"
                  style={{
                    fontSize: 12,
                    color: "var(--text)",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "8px 10px",
                    wordBreak: "break-all",
                  }}
                >
                  {data.webhook_disparo}
                </div>
              ) : (
                <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Nenhum webhook configurado. Sem ele, o botão <strong>Executar agora</strong> fica desabilitado —
                  o Hub não tem para onde mandar o disparo.
                </div>
              )
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input
                  value={webhookDraft}
                  onChange={(e) => setWebhookDraft(e.target.value)}
                  placeholder="https://seu-worker.exemplo.com/run"
                  className="mono"
                  style={{
                    width: "100%",
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: 12.5,
                    color: "var(--text)",
                    outline: "none",
                  }}
                />
                {webhookErro && (
                  <div style={{ fontSize: 12, color: "var(--failed)", fontWeight: 600 }}>{webhookErro}</div>
                )}
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => {
                      setEditingWebhook(false);
                      setWebhookErro(null);
                    }}
                    disabled={savingWebhook}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 7,
                      background: "var(--surface-2)",
                      color: "var(--text-muted)",
                      fontSize: 12.5,
                      fontWeight: 600,
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={salvarWebhook}
                    disabled={savingWebhook}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 7,
                      background: "var(--accent)",
                      color: "white",
                      fontSize: 12.5,
                      fontWeight: 600,
                      opacity: savingWebhook ? 0.6 : 1,
                    }}
                  >
                    {savingWebhook ? "Salvando…" : "Salvar"}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--text-muted)",
                letterSpacing: 0.8,
                textTransform: "uppercase",
                marginBottom: 14,
              }}
            >
              Histórico recente
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {execs.length === 0 && (
                <div style={{ fontSize: 12, color: "var(--text-faint)" }}>Sem execuções registradas.</div>
              )}
              {execs.map((e) => {
                const st: StatusCalculado =
                  e.status === "erro" ? "failed" : e.status === "manual" ? "delayed" : "healthy";
                return (
                  <div
                    key={e.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: "var(--surface-2)",
                    }}
                  >
                    <StatusDot status={st} />
                    <div className="mono" style={{ fontSize: 12, color: "var(--text)" }}>
                      {fmtTime(e.finalizado_em)}
                    </div>
                    <div style={{ flex: 1, fontSize: 12, color: "var(--text-muted)" }}>
                      {e.status === "erro"
                        ? e.mensagem_erro ?? "Falha na execução"
                        : e.status === "manual"
                          ? "Disparo manual"
                          : `${fmtNumber(e.registros_processados)} registros sincronizados`}
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--text-faint)", whiteSpace: "nowrap" }}>
                      {fmtAgoSql(e.finalizado_em)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
