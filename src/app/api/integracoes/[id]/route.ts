import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

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
