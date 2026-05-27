import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// PATCH /api/alertas/[id] — marca alerta como visualizado
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const alertaId = Number(id);
  if (!alertaId) {
    return NextResponse.json({ erro: "id inválido" }, { status: 400 });
  }

  const result = getDb()
    .prepare("UPDATE alertas SET visualizado = 1 WHERE id = ?")
    .run(alertaId);

  if (result.changes === 0) {
    return NextResponse.json({ erro: "Alerta não encontrado" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
