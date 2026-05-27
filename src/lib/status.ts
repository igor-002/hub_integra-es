import parser from "cron-parser";
import type { Execucao, Integracao, IntegracaoComStatus, StatusCalculado } from "./types";

// SQLite (datetime('now')) grava em UTC no formato 'YYYY-MM-DD HH:MM:SS'.
// O construtor Date do JS trata esse formato como horário local — normalizamos para UTC.
export function parseSqlDate(s: string | null): Date | null {
  if (!s) return null;
  // Já em ISO (com T) → confia; senão converte 'espaço' para 'T' e marca UTC.
  const iso = s.includes("T") ? s : s.replace(" ", "T") + "Z";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

export function cronPrev(expr: string, from: Date = new Date()): Date | null {
  try {
    return parser.parseExpression(expr, { currentDate: from }).prev().toDate();
  } catch {
    return null;
  }
}

export function cronNext(expr: string, from: Date = new Date()): Date | null {
  try {
    return parser.parseExpression(expr, { currentDate: from }).next().toDate();
  } catch {
    return null;
  }
}

/**
 * Determina se a integração está atrasada (sem_retorno): a ocorrência cron
 * anterior já passou da janela + tolerância e nenhuma execução foi finalizada
 * depois dela.
 */
export function estaAtrasada(integ: Integracao, execs: Execucao[], now: Date = new Date()): boolean {
  if (!integ.ativo) return false;
  const prev = cronPrev(integ.cron_esperado, now);
  if (!prev) return false;
  const limite = prev.getTime() + integ.tolerancia_minutos * 60_000;
  if (now.getTime() <= limite) return false;
  const houveDepois = execs.some((e) => {
    const f = parseSqlDate(e.finalizado_em);
    return f !== null && f.getTime() >= prev.getTime();
  });
  return !houveDepois;
}

function diffMinutos(a: Date, b: Date): number {
  return Math.round((a.getTime() - b.getTime()) / 60_000);
}

/**
 * Enriquece uma integração com status calculado, última/próxima execução,
 * histórico (sparkline) e mensagem de erro. `execs` deve vir ordenada por
 * finalizado_em DESC.
 */
export function enrich(integ: Integracao, execs: Execucao[], now: Date = new Date()): IntegracaoComStatus {
  const finalizadas = execs.filter((e) => e.finalizado_em);
  const ultima = finalizadas[0] ?? null;
  const next = integ.ativo ? cronNext(integ.cron_esperado, now) : null;

  let status: StatusCalculado = "healthy";
  let erro: string | null = null;

  if (ultima && ultima.status === "erro") {
    status = "failed";
    erro = ultima.mensagem_erro ?? "Falha na última execução";
  } else if (estaAtrasada(integ, execs, now)) {
    status = "delayed";
    erro = "Execução esperada não recebida dentro da janela";
  }

  const ultimaDate = parseSqlDate(ultima?.finalizado_em ?? null);
  const ultimaMins = ultimaDate ? Math.max(0, diffMinutos(now, ultimaDate)) : null;
  const proxMins = next ? diffMinutos(next, now) : null;

  // sparkline: 12 execuções mais recentes em ordem cronológica (antiga -> nova)
  const history = execs
    .slice(0, 12)
    .reverse()
    .map((e) => (e.status === "sucesso" ? 1 : e.status === "erro" ? 0 : 0.5));

  return {
    ...integ,
    status,
    ultimaExec: ultima?.finalizado_em ?? null,
    ultimaMins,
    registros: ultima?.registros_processados ?? 0,
    proxExec: next ? next.toISOString() : null,
    proxMins,
    erro,
    history,
  };
}
