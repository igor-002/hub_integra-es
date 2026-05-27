import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

// Singleton: evita abrir múltiplas conexões em dev/hot-reload
const globalForDb = globalThis as unknown as { __hubDb?: Database.Database };

function createDb(): Database.Database {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const db = new Database(path.join(dataDir, "hub.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  migrate(db);
  seed(db);
  return db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS integracoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cliente TEXT NOT NULL,
      tipo TEXT,
      descricao TEXT,
      cron_esperado TEXT NOT NULL,
      tolerancia_minutos INTEGER NOT NULL DEFAULT 5,
      ativo INTEGER NOT NULL DEFAULT 1,
      criado_em TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS execucoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      integracao_id INTEGER NOT NULL REFERENCES integracoes(id),
      iniciado_em TEXT,
      finalizado_em TEXT,
      status TEXT NOT NULL,
      registros_processados INTEGER DEFAULT 0,
      mensagem_erro TEXT,
      disparado_por TEXT
    );

    CREATE TABLE IF NOT EXISTS alertas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      integracao_id INTEGER NOT NULL REFERENCES integracoes(id),
      tipo TEXT NOT NULL,
      mensagem TEXT NOT NULL,
      criado_em TEXT NOT NULL DEFAULT (datetime('now')),
      visualizado INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_exec_integ ON execucoes(integracao_id, finalizado_em);
    CREATE INDEX IF NOT EXISTS idx_alerta_integ ON alertas(integracao_id, visualizado);
  `);
}

// Popula 3 integrações de exemplo só na primeira inicialização (tabela vazia)
function seed(db: Database.Database) {
  const count = db.prepare("SELECT COUNT(*) AS n FROM integracoes").get() as { n: number };
  if (count.n > 0) return;

  const insInteg = db.prepare(`
    INSERT INTO integracoes (nome, cliente, tipo, descricao, cron_esperado, tolerancia_minutos, ativo)
    VALUES (@nome, @cliente, @tipo, @descricao, @cron_esperado, @tolerancia_minutos, 1)
  `);
  const insExec = db.prepare(`
    INSERT INTO execucoes (integracao_id, iniciado_em, finalizado_em, status, registros_processados, mensagem_erro, disparado_por)
    VALUES (@integracao_id, datetime('now', @ini), datetime('now', @fim), @status, @reg, @erro, 'cron')
  `);
  const insAlerta = db.prepare(`
    INSERT INTO alertas (integracao_id, tipo, mensagem, criado_em, visualizado)
    VALUES (@integracao_id, @tipo, @mensagem, datetime('now', @quando), 0)
  `);

  const tx = db.transaction(() => {
    // 1) Saudável — sincroniza a cada 15 min, última execução há 2 min com sucesso
    const ok = insInteg.run({
      nome: "Sincronização de Pedidos",
      cliente: "Supermercado Figura",
      tipo: "ERP Senior",
      descricao: "Importa pedidos do ERP e envia para o hub a cada 15 minutos.",
      cron_esperado: "*/15 * * * *",
      tolerancia_minutos: 5,
    }).lastInsertRowid as number;
    for (let i = 10; i >= 1; i--) {
      insExec.run({
        integracao_id: ok,
        ini: `-${i * 15 + 2} minutes`,
        fim: `-${i * 15} minutes`,
        status: "sucesso",
        reg: 2400 + Math.floor(Math.random() * 800),
        erro: null,
      });
    }
    insExec.run({ integracao_id: ok, ini: "-3 minutes", fim: "-2 minutes", status: "sucesso", reg: 2847, erro: null });

    // 2) Com falha — última execução com erro há 5 min
    const fail = insInteg.run({
      nome: "Importação de Notas",
      cliente: "Maravilha Comércio",
      tipo: "Omie",
      descricao: "Consome notas fiscais do endpoint /pedidos do Omie.",
      cron_esperado: "*/30 * * * *",
      tolerancia_minutos: 10,
    }).lastInsertRowid as number;
    for (let i = 6; i >= 2; i--) {
      insExec.run({
        integracao_id: fail,
        ini: `-${i * 30 + 1} minutes`,
        fim: `-${i * 30} minutes`,
        status: "sucesso",
        reg: 800 + Math.floor(Math.random() * 600),
        erro: null,
      });
    }
    insExec.run({
      integracao_id: fail,
      ini: "-6 minutes",
      fim: "-5 minutes",
      status: "erro",
      reg: 0,
      erro: "Timeout ao conectar com endpoint de pedidos",
    });
    insAlerta.run({
      integracao_id: fail,
      tipo: "falha_execucao",
      mensagem: "Timeout no endpoint /pedidos",
      quando: "-5 minutes",
    });

    // 3) Atrasada — esperava rodar a cada 10 min, última execução há 40 min (sem retorno)
    const late = insInteg.run({
      nome: "Atualização de Estoque",
      cliente: "Atacadão Luz",
      tipo: "Bling",
      descricao: "Sincroniza saldo de estoque do Bling a cada 10 minutos.",
      cron_esperado: "*/10 * * * *",
      tolerancia_minutos: 3,
    }).lastInsertRowid as number;
    for (let i = 8; i >= 4; i--) {
      insExec.run({
        integracao_id: late,
        ini: `-${i * 10 + 1} minutes`,
        fim: `-${i * 10} minutes`,
        status: "sucesso",
        reg: 200 + Math.floor(Math.random() * 300),
        erro: null,
      });
    }
    insExec.run({ integracao_id: late, ini: "-41 minutes", fim: "-40 minutes", status: "sucesso", reg: 312, erro: null });
    insAlerta.run({
      integracao_id: late,
      tipo: "sem_retorno",
      mensagem: "Execução esperada não recebida (passou janela + tolerância)",
      quando: "-4 minutes",
    });
  });

  tx();
}

export function getDb(): Database.Database {
  if (!globalForDb.__hubDb) {
    globalForDb.__hubDb = createDb();
  }
  return globalForDb.__hubDb;
}
