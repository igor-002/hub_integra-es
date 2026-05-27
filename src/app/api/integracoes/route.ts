import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { listComStatus } from "@/lib/queries";

export const dynamic = "force-dynamic";

// GET /api/integracoes — lista todas com status calculado + contagens
export async function GET() {
  const { integracoes, counts } = listComStatus();
  return NextResponse.json({ integracoes, counts });
}

// POST /api/integracoes — cadastra nova integração
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }

  const nome = String(body.nome ?? "").trim();
  const cliente = String(body.cliente ?? "").trim();
  const cronEsperado = String(body.cron_esperado ?? "").trim();
  if (!nome || !cliente || !cronEsperado) {
    return NextResponse.json(
      { erro: "Campos obrigatórios: nome, cliente, cron_esperado" },
      { status: 400 }
    );
  }

  const tipo = body.tipo ? String(body.tipo) : null;
  const descricao = body.descricao ? String(body.descricao) : null;
  const tolerancia = Number(body.tolerancia_minutos ?? 5) || 5;
  const ativo = body.ativo === undefined ? 1 : body.ativo ? 1 : 0;

  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO integracoes (nome, cliente, tipo, descricao, cron_esperado, tolerancia_minutos, ativo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(nome, cliente, tipo, descricao, cronEsperado, tolerancia, ativo);

  const integracao = db
    .prepare("SELECT * FROM integracoes WHERE id = ?")
    .get(result.lastInsertRowid);
  return NextResponse.json({ ok: true, integracao }, { status: 201 });
}
