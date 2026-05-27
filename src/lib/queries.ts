import { getDb } from "./db";
import { enrich } from "./status";
import type { Execucao, Integracao, IntegracaoComStatus, StatusCalculado } from "./types";

export function getExecucoes(integracaoId: number, limit = 50): Execucao[] {
  return getDb()
    .prepare("SELECT * FROM execucoes WHERE integracao_id = ? ORDER BY finalizado_em DESC, id DESC LIMIT ?")
    .all(integracaoId, limit) as Execucao[];
}

export interface ListaComStatus {
  integracoes: IntegracaoComStatus[];
  counts: { total: number; healthy: number; failed: number; delayed: number };
}

export function listComStatus(now: Date = new Date()): ListaComStatus {
  const db = getDb();
  const integs = db.prepare("SELECT * FROM integracoes ORDER BY id ASC").all() as Integracao[];
  const execStmt = db.prepare(
    "SELECT * FROM execucoes WHERE integracao_id = ? ORDER BY finalizado_em DESC, id DESC LIMIT 50"
  );

  const counts = { total: 0, healthy: 0, failed: 0, delayed: 0 };
  const integracoes = integs.map((i) => {
    const execs = execStmt.all(i.id) as Execucao[];
    const e = enrich(i, execs, now);
    counts.total++;
    counts[e.status as StatusCalculado]++;
    return e;
  });

  return { integracoes, counts };
}
