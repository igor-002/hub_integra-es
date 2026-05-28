import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { Integracao } from "@/lib/types";

export const dynamic = "force-dynamic";

// PATCH /api/integracoes/[id] — atualiza campos editáveis (parcial)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const integracaoId = Number(id);
  if (!integracaoId) {
    return NextResponse.json({ erro: "id inválido" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }

  const db = getDb();
  const atual = db.prepare("SELECT * FROM integracoes WHERE id = ?").get(integracaoId) as
    | Integracao
    | undefined;
  if (!atual) {
    return NextResponse.json({ erro: "Integração não encontrada" }, { status: 404 });
  }

  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (body.nome !== undefined) {
    const v = String(body.nome).trim();
    if (!v) return NextResponse.json({ erro: "nome não pode ser vazio" }, { status: 400 });
    updates.push("nome = ?");
    values.push(v);
  }
  if (body.cliente !== undefined) {
    const v = String(body.cliente).trim();
    if (!v) return NextResponse.json({ erro: "cliente não pode ser vazio" }, { status: 400 });
    updates.push("cliente = ?");
    values.push(v);
  }
  if (body.tipo !== undefined) {
    updates.push("tipo = ?");
    values.push(body.tipo ? String(body.tipo) : null);
  }
  if (body.descricao !== undefined) {
    updates.push("descricao = ?");
    values.push(body.descricao ? String(body.descricao) : null);
  }
  if (body.cron_esperado !== undefined) {
    const v = String(body.cron_esperado).trim();
    if (!v) return NextResponse.json({ erro: "cron_esperado não pode ser vazio" }, { status: 400 });
    updates.push("cron_esperado = ?");
    values.push(v);
  }
  if (body.tolerancia_minutos !== undefined) {
    updates.push("tolerancia_minutos = ?");
    values.push(Number(body.tolerancia_minutos) || 0);
  }
  if (body.ativo !== undefined) {
    updates.push("ativo = ?");
    values.push(body.ativo ? 1 : 0);
  }
  if (body.webhook_disparo !== undefined) {
    const raw = body.webhook_disparo ? String(body.webhook_disparo).trim() : "";
    if (raw && !/^https?:\/\//i.test(raw)) {
      return NextResponse.json(
        { erro: "webhook_disparo deve começar com http:// ou https://" },
        { status: 400 }
      );
    }
    updates.push("webhook_disparo = ?");
    values.push(raw || null);
  }

  if (updates.length === 0) {
    return NextResponse.json({ erro: "Nada para atualizar" }, { status: 400 });
  }

  values.push(integracaoId);
  db.prepare(`UPDATE integracoes SET ${updates.join(", ")} WHERE id = ?`).run(...values);

  const integracao = db.prepare("SELECT * FROM integracoes WHERE id = ?").get(integracaoId);
  return NextResponse.json({ ok: true, integracao });
}

// DELETE /api/integracoes/[id] — remove a integração e seu histórico
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const integracaoId = Number(id);
  if (!integracaoId) {
    return NextResponse.json({ erro: "id inválido" }, { status: 400 });
  }

  const db = getDb();
  const integ = db.prepare("SELECT id, cliente, nome FROM integracoes WHERE id = ?").get(integracaoId);
  if (!integ) {
    return NextResponse.json({ erro: "Integração não encontrada" }, { status: 404 });
  }

  const tx = db.transaction((targetId: number) => {
    db.prepare("DELETE FROM alertas WHERE integracao_id = ?").run(targetId);
    db.prepare("DELETE FROM execucoes WHERE integracao_id = ?").run(targetId);
    db.prepare("DELETE FROM integracoes WHERE id = ?").run(targetId);
  });
  tx(integracaoId);

  return NextResponse.json({ ok: true, removida: integ });
}
