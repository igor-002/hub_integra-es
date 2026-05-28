import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { Integracao } from "@/lib/types";

export const dynamic = "force-dynamic";

const DISPATCH_TIMEOUT_MS = 8_000;

/**
 * POST /api/integracoes/[id]/disparar
 *
 * Dispara a execução manual da integração via webhook configurado em
 * `webhook_disparo`. Fire-and-forget: aguarda apenas o aceite inicial do worker
 * (timeout curto) e responde 202. Quem reporta o resultado real continua sendo
 * o próprio worker via POST /api/report quando terminar.
 *
 * Registra uma linha em `execucoes` com status='manual' como auditoria de que
 * o disparo foi solicitado pelo Hub.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const integracaoId = Number(id);
  if (!integracaoId) {
    return NextResponse.json({ erro: "id inválido" }, { status: 400 });
  }

  const db = getDb();
  const integ = db.prepare("SELECT * FROM integracoes WHERE id = ?").get(integracaoId) as
    | Integracao
    | undefined;
  if (!integ) {
    return NextResponse.json({ erro: "Integração não encontrada" }, { status: 404 });
  }
  if (!integ.webhook_disparo) {
    return NextResponse.json(
      { erro: "Esta integração não tem webhook_disparo configurado." },
      { status: 422 }
    );
  }

  const disparadoEm = new Date().toISOString();
  const payload = {
    integracao_id: integ.id,
    cliente: integ.cliente,
    nome: integ.nome,
    disparado_em: disparadoEm,
    origem: "hub-manual",
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DISPATCH_TIMEOUT_MS);
  let httpStatus = 0;
  let erroDispatch: string | null = null;
  try {
    const resp = await fetch(integ.webhook_disparo, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    httpStatus = resp.status;
    if (!resp.ok) {
      const texto = (await resp.text().catch(() => "")).slice(0, 200);
      erroDispatch = `Webhook respondeu ${resp.status}${texto ? `: ${texto}` : ""}`;
    }
  } catch (e) {
    erroDispatch =
      e instanceof Error
        ? e.name === "AbortError"
          ? `Timeout (${DISPATCH_TIMEOUT_MS}ms) ao chamar webhook`
          : e.message
        : "Falha ao chamar webhook";
  } finally {
    clearTimeout(timeout);
  }

  if (erroDispatch) {
    // Registra como erro pra ficar visível no histórico e disparar alerta
    db.prepare(
      `INSERT INTO execucoes
        (integracao_id, iniciado_em, finalizado_em, status, registros_processados, mensagem_erro, disparado_por)
       VALUES (?, datetime('now'), datetime('now'), 'erro', 0, ?, 'manual')`
    ).run(integracaoId, `Disparo manual falhou — ${erroDispatch}`);
    db.prepare(
      "INSERT INTO alertas (integracao_id, tipo, mensagem) VALUES (?, 'falha_execucao', ?)"
    ).run(integracaoId, `Disparo manual falhou: ${erroDispatch}`);
    return NextResponse.json(
      { erro: erroDispatch, http_status: httpStatus || null },
      { status: 502 }
    );
  }

  // Linha de auditoria do disparo (o worker reportará o resultado depois).
  db.prepare(
    `INSERT INTO execucoes
      (integracao_id, iniciado_em, finalizado_em, status, registros_processados, mensagem_erro, disparado_por)
     VALUES (?, datetime('now'), datetime('now'), 'manual', 0, NULL, 'manual')`
  ).run(integracaoId);

  return NextResponse.json(
    { ok: true, disparado_em: disparadoEm, http_status: httpStatus },
    { status: 202 }
  );
}
