"use client";
import { useState } from "react";
import { Icon } from "./icons";
import { apiUrl } from "@/lib/api";
import { displayId } from "@/lib/format";
import type { IntegracaoComStatus } from "@/lib/types";

export function ConfirmDeleteModal({
  data,
  onClose,
  onDeleted,
}: {
  data: IntegracaoComStatus;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const submit = async () => {
    setErro(null);
    setDeleting(true);
    try {
      const res = await fetch(apiUrl(`/api/integracoes/${data.id}`), { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        setErro(json.erro ?? "Falha ao remover integração.");
        return;
      }
      onDeleted();
    } catch {
      setErro("Erro de rede ao remover integração.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        animation: "fadeIn 0.18s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 460,
          maxWidth: "100%",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
          animation: "slideUp 0.25s ease",
        }}
      >
        <div style={{ height: 3, background: "var(--failed)" }} />

        <div style={{ padding: "28px 28px 8px", textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--failed-soft)",
              color: "var(--failed)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 14,
            }}
          >
            <Icon.Trash width={26} height={26} />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
            Desvincular monitoramento?
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.55 }}>
            Você está prestes a remover esta integração do painel.<br />
            <strong style={{ color: "var(--text)" }}>Esta ação não pode ser desfeita.</strong>
          </div>
        </div>

        <div
          style={{
            margin: "20px 28px 0",
            padding: "14px 16px",
            background: "var(--surface-2)",
            borderRadius: 10,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
            {data.cliente}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{data.nome}</div>
          <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }} className="mono">
            {displayId(data.id)}
          </div>
        </div>

        <div
          style={{
            margin: "16px 28px 0",
            padding: "12px 14px",
            background: "var(--failed-soft)",
            borderLeft: "3px solid var(--failed)",
            borderRadius: 6,
            fontSize: 12,
            color: "var(--text)",
            lineHeight: 1.5,
          }}
        >
          Todo o <strong>histórico de execuções</strong> e <strong>alertas</strong> dessa integração também serão excluídos permanentemente.
        </div>

        {erro && (
          <div style={{ margin: "12px 28px 0", fontSize: 12, color: "var(--failed)", fontWeight: 600, textAlign: "center" }}>
            {erro}
          </div>
        )}

        <div
          style={{
            padding: "22px 28px 24px",
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            disabled={deleting}
            style={{
              padding: "10px 18px",
              borderRadius: 9,
              background: "var(--surface-2)",
              color: "var(--text)",
              fontSize: 13,
              fontWeight: 600,
              opacity: deleting ? 0.5 : 1,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={deleting}
            style={{
              padding: "10px 18px",
              borderRadius: 9,
              background: "var(--failed)",
              color: "white",
              fontSize: 13,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              opacity: deleting ? 0.7 : 1,
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <Icon.Trash width={14} height={14} />
            {deleting ? "Removendo…" : "Sim, desvincular"}
          </button>
        </div>
      </div>
    </div>
  );
}
