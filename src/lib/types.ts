// Tipos do domínio Hub Integrações

export type StatusCalculado = "healthy" | "failed" | "delayed";
export type StatusExecucao = "sucesso" | "erro" | "manual";
export type DisparadoPor = "cron" | "manual";
export type TipoAlerta = "falha_execucao" | "sem_retorno";

export interface Integracao {
  id: number;
  nome: string;
  cliente: string;
  tipo: string | null;
  descricao: string | null;
  cron_esperado: string;
  tolerancia_minutos: number;
  ativo: number; // 0 | 1
  criado_em: string;
}

export interface Execucao {
  id: number;
  integracao_id: number;
  iniciado_em: string | null;
  finalizado_em: string | null;
  status: StatusExecucao;
  registros_processados: number;
  mensagem_erro: string | null;
  disparado_por: DisparadoPor | null;
}

export interface Alerta {
  id: number;
  integracao_id: number;
  tipo: TipoAlerta;
  mensagem: string;
  criado_em: string;
  visualizado: number; // 0 | 1
}

// Integração enriquecida com status calculado para a API/UI
export interface IntegracaoComStatus extends Integracao {
  status: StatusCalculado;
  ultimaExec: string | null;
  ultimaMins: number | null;
  registros: number;
  proxExec: string | null;
  proxMins: number | null;
  erro: string | null;
  // sparkline: 1 = sucesso, 0 = erro, 0.5 = manual/atrasada
  history: number[];
}

export interface AlertaComCliente extends Alerta {
  cliente: string;
  nome: string;
}
