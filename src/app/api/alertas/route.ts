import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import type { AlertaComCliente } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/alertas — alertas não visualizados (mais recentes primeiro)
export async function GET() {
  const alertas = getDb()
    .prepare(
      `SELECT a.*, i.cliente AS cliente, i.nome AS nome
         FROM alertas a
         JOIN integracoes i ON i.id = a.integracao_id
        WHERE a.visualizado = 0
        ORDER BY a.criado_em DESC, a.id DESC`
    )
    .all() as AlertaComCliente[];

  return NextResponse.json({ alertas });
}
