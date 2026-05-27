import { getDb } from "./db";
import { estaAtrasada } from "./status";
import type { Execucao, Integracao } from "./types";

/**
 * Inicia o job de monitoramento (uma vez). Chamado pelo instrumentation hook
 * apenas no runtime Node. Guard global evita duplicar em hot-reload.
 */
export function startMonitor() {
  const g = globalThis as unknown as { __hubMonitor?: NodeJS.Timeout };
  if (g.__hubMonitor) return;

  const run = () => {
    try {
      const n = checkSemRetorno();
      if (n > 0) console.log(`[monitor] ${n} alerta(s) sem_retorno gerado(s)`);
    } catch (err) {
      console.error("[monitor] erro:", err);
    }
  };

  run(); // primeira passada no boot
  g.__hubMonitor = setInterval(run, 60_000);
  console.log("[monitor] job iniciado (intervalo 60s)");
}

/**
 * Varre integrações ativas e gera alertas `sem_retorno` para as que passaram
 * da janela esperada (cron + tolerância) sem reportar. Evita duplicar: só cria
 * se não houver alerta sem_retorno não-visualizado para a integração.
 */
export function checkSemRetorno(now: Date = new Date()): number {
  const db = getDb();
  const integracoes = db.prepare("SELECT * FROM integracoes WHERE ativo = 1").all() as Integracao[];

  const execStmt = db.prepare(
    "SELECT * FROM execucoes WHERE integracao_id = ? ORDER BY finalizado_em DESC LIMIT 50"
  );
  const alertaAbertoStmt = db.prepare(
    "SELECT COUNT(*) AS n FROM alertas WHERE integracao_id = ? AND tipo = 'sem_retorno' AND visualizado = 0"
  );
  const insAlerta = db.prepare(
    "INSERT INTO alertas (integracao_id, tipo, mensagem) VALUES (?, 'sem_retorno', ?)"
  );

  let criados = 0;
  for (const integ of integracoes) {
    const execs = execStmt.all(integ.id) as Execucao[];
    if (!estaAtrasada(integ, execs, now)) continue;

    const aberto = alertaAbertoStmt.get(integ.id) as { n: number };
    if (aberto.n > 0) continue;

    insAlerta.run(
      integ.id,
      `${integ.cliente} — execução esperada não recebida (janela ${integ.cron_esperado} + ${integ.tolerancia_minutos} min de tolerância)`
    );
    criados++;
  }
  return criados;
}
