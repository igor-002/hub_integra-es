import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { Integracao } from "@/lib/types";

export const dynamic = "force-dynamic";

/**
 * Endpoint que as integrações chamam ao terminar uma execução.
 * Body: { integracao_id, status, registros_processados?, mensagem_erro?,
 *         disparado_por?, iniciado_em?, finalizado_em? }
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }

  const integracaoId = Number(body.integracao_id);
  const status = String(body.status ?? "");
  if (!integracaoId || !["sucesso", "erro", "manual"].includes(status)) {
    return NextResponse.json(
      { erro: "Campos obrigatórios: integracao_id e status (sucesso|erro|manual)" },
      { status: 400 }
    );
  }

  const db = getDb();
  const integ = db.prepare("SELECT * FROM integracoes WHERE id = ?").get(integracaoId) as
    | Integracao
    | undefined;
  if (!integ) {
    return NextResponse.json({ erro: "Integração não encontrada" }, { status: 404 });
  }

  const iniciado = body.iniciado_em ? String(body.iniciado_em) : null;
  const finalizado = body.finalizado_em ? String(body.finalizado_em) : null;
  const registros = Number(body.registros_processados ?? 0) || 0;
  const mensagemErro = body.mensagem_erro ? String(body.mensagem_erro) : null;
  const disparadoPor = ["cron", "manual"].includes(String(body.disparado_por))
    ? String(body.disparado_por)
    : "cron";

  const result = db
    .prepare(
      `INSERT INTO execucoes
        (integracao_id, iniciado_em, finalizado_em, status, registros_processados, mensagem_erro, disparado_por)
       VALUES (?, COALESCE(?, datetime('now')), COALESCE(?, datetime('now')), ?, ?, ?, ?)`
    )
    .run(integracaoId, iniciado, finalizado, status, registros, mensagemErro, disparadoPor);

  if (status === "erro") {
    // gera alerta de falha
    db.prepare(
      "INSERT INTO alertas (integracao_id, tipo, mensagem) VALUES (?, 'falha_execucao', ?)"
    ).run(integracaoId, mensagemErro ?? `${integ.cliente} — falha na execução`);
  } else {
    // reporte ok: resolve alertas sem_retorno pendentes desta integração
    db.prepare(
      "UPDATE alertas SET visualizado = 1 WHERE integracao_id = ? AND tipo = 'sem_retorno' AND visualizado = 0"
    ).run(integracaoId);
  }

  const execucao = db.prepare("SELECT * FROM execucoes WHERE id = ?").get(result.lastInsertRowid);
  return NextResponse.json({ ok: true, execucao }, { status: 201 });
}
