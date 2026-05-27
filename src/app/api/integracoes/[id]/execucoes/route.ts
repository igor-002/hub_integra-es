import { NextResponse } from "next/server";
import { getExecucoes } from "@/lib/queries";

export const dynamic = "force-dynamic";

// GET /api/integracoes/[id]/execucoes — histórico de execuções
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const integracaoId = Number(id);
  if (!integracaoId) {
    return NextResponse.json({ erro: "id inválido" }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 50) || 50, 500);

  const execucoes = getExecucoes(integracaoId, limit);
  return NextResponse.json({ execucoes });
}
