"use client";
import { useState } from "react";
import { Icon } from "./icons";
import { apiUrl } from "@/lib/api";
import { displayId } from "@/lib/format";
import type { Integracao } from "@/lib/types";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 13,
  color: "var(--text)",
  fontFamily: "inherit",
  outline: "none",
};
const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-muted)",
  letterSpacing: 0.3,
  textTransform: "uppercase",
  marginBottom: 6,
  display: "block",
};

const CRON_PRESETS = [
  { label: "5 min", v: "*/5 * * * *" },
  { label: "15 min", v: "*/15 * * * *" },
  { label: "30 min", v: "*/30 * * * *" },
  { label: "1 h", v: "0 * * * *" },
  { label: "Diário 6h", v: "0 6 * * *" },
];

export function NovaIntegracaoModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    cliente: "",
    nome: "",
    tipo: "",
    descricao: "",
    cron_esperado: "*/15 * * * *",
    tolerancia_minutos: 5,
    ativo: true,
    webhook_disparo: "",
  });
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [criada, setCriada] = useState<Integracao | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setErro(null);
    if (!form.cliente.trim() || !form.nome.trim() || !form.cron_esperado.trim()) {
      setErro("Preencha cliente, nome e cron esperado.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(apiUrl("/api/integracoes"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tipo: form.tipo.trim() || null,
          descricao: form.descricao.trim() || null,
          webhook_disparo: form.webhook_disparo.trim() || null,
          ativo: form.ativo ? 1 : 0,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErro(json.erro ?? "Falha ao criar integração.");
        return;
      }
      setCriada(json.integracao as Integracao);
      onCreated(); // atualiza o painel — já entra no monitor (ativo=1)
    } catch {
      setErro("Erro de rede ao criar integração.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        zIndex: 300,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "60px 20px",
        animation: "fadeIn 0.2s ease",
        overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 520,
          maxWidth: "100%",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          boxShadow: "var(--shadow-lg)",
          animation: "slideUp 0.3s ease",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {criada ? "Integração criada" : "Nova integração"}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "var(--surface-2)",
              color: "var(--text-muted)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon.X width={15} height={15} />
          </button>
        </div>

        {criada ? (
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                padding: "14px 16px",
                background: "var(--healthy-soft)",
                borderLeft: "3px solid var(--healthy)",
                borderRadius: 8,
                fontSize: 13,
                color: "var(--text)",
                lineHeight: 1.5,
              }}
            >
              <strong>{criada.cliente}</strong> cadastrada e já sendo monitorada.
            </div>
            <div
              style={{
                background: "var(--surface-2)",
                borderRadius: 10,
                padding: 16,
                fontSize: 13,
                color: "var(--text-muted)",
                lineHeight: 1.6,
              }}
            >
              ID da integração:{" "}
              <span className="mono" style={{ color: "var(--accent)", fontWeight: 700 }}>
                {criada.id}
              </span>{" "}
              <span className="mono" style={{ color: "var(--text-faint)" }}>
                ({displayId(criada.id)})
              </span>
              <br />
              Use o <strong>id {criada.id}</strong> no campo <code className="mono">integracao_id</code> ao
              reportar execuções em <code className="mono">/integracoes/api/report</code>.
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <a
                href={apiUrl("/doc")}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  background: "var(--surface-2)",
                  color: "var(--text)",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Ver documentação
              </a>
              <button
                onClick={onClose}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  background: "var(--accent)",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Concluir
              </button>
            </div>
          </div>
        ) : (
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Cliente *</label>
                <input
                  style={inputStyle}
                  value={form.cliente}
                  onChange={(e) => set("cliente", e.target.value)}
                  placeholder="Supermercado Figura"
                />
              </div>
              <div>
                <label style={labelStyle}>Tipo / ERP</label>
                <input
                  style={inputStyle}
                  value={form.tipo}
                  onChange={(e) => set("tipo", e.target.value)}
                  placeholder="ERP Senior"
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Nome da integração *</label>
              <input
                style={inputStyle}
                value={form.nome}
                onChange={(e) => set("nome", e.target.value)}
                placeholder="Sincronização de Pedidos"
              />
            </div>

            <div>
              <label style={labelStyle}>Descrição</label>
              <textarea
                style={{ ...inputStyle, minHeight: 64, resize: "vertical" }}
                value={form.descricao}
                onChange={(e) => set("descricao", e.target.value)}
                placeholder="O que essa integração faz…"
              />
            </div>

            <div>
              <label style={labelStyle}>Cron esperado *</label>
              <input
                style={{ ...inputStyle, fontFamily: "var(--font-jetbrains), monospace" }}
                value={form.cron_esperado}
                onChange={(e) => set("cron_esperado", e.target.value)}
                placeholder="*/15 * * * *"
              />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                {CRON_PRESETS.map((p) => (
                  <button
                    key={p.v}
                    onClick={() => set("cron_esperado", p.v)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 600,
                      background: form.cron_esperado === p.v ? "var(--accent-soft)" : "var(--surface-2)",
                      color: form.cron_esperado === p.v ? "var(--accent)" : "var(--text-muted)",
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "end" }}>
              <div>
                <label style={labelStyle}>Tolerância (min)</label>
                <input
                  type="number"
                  min={0}
                  style={inputStyle}
                  value={form.tolerancia_minutos}
                  onChange={(e) => set("tolerancia_minutos", Number(e.target.value) || 0)}
                />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text)", paddingBottom: 10 }}>
                <input type="checkbox" checked={form.ativo} onChange={(e) => set("ativo", e.target.checked)} />
                Ativa (monitorar)
              </label>
            </div>

            <div>
              <label style={labelStyle}>Webhook de disparo (opcional)</label>
              <input
                style={{ ...inputStyle, fontFamily: "var(--font-jetbrains), monospace" }}
                value={form.webhook_disparo}
                onChange={(e) => set("webhook_disparo", e.target.value)}
                placeholder="https://seu-worker.exemplo.com/run"
              />
              <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 6, lineHeight: 1.5 }}>
                URL que o botão <strong>Executar agora</strong> vai chamar via POST. Sem isso, o botão fica
                desabilitado.
              </div>
            </div>

            {erro && (
              <div style={{ fontSize: 12, color: "var(--failed)", fontWeight: 600 }}>{erro}</div>
            )}

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
              <button
                onClick={onClose}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  background: "var(--surface-2)",
                  color: "var(--text-muted)",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Cancelar
              </button>
              <button
                onClick={submit}
                disabled={saving}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  background: "var(--accent)",
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Salvando…" : "Criar integração"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
