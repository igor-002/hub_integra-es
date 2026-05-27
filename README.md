# Hub Integrações

Painel de monitoramento de integrações automatizadas de clientes. Cada integração reporta suas execuções via HTTP; o painel calcula o status (saudável / falha / atrasada), mantém histórico e dispara alertas quando uma integração deixa de reportar dentro da janela esperada.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **SQLite** via `better-sqlite3`
- `cron-parser` para a janela de execução esperada
- Tema claro/escuro (CSS variables, persistido em `localStorage`)

## Rodando localmente

```bash
npm install
npm run dev      # http://localhost:3002/integracoes
```

Build de produção:

```bash
npm run build
npm run start    # porta 3002
```

> O app roda sob o subpath **`/integracoes`** (`basePath`/`assetPrefix` em `next.config.ts`). A raiz `/` retorna 404 por design — acesse `/integracoes`.

O banco SQLite é criado automaticamente em `data/hub.db` no primeiro start, já populado com 3 integrações de exemplo (1 saudável, 1 com falha, 1 atrasada).

## Banco de dados

Três tabelas (DDL e seed em `src/lib/db.ts`):

- **integracoes** — `nome`, `cliente`, `tipo`, `descricao`, `cron_esperado`, `tolerancia_minutos`, `ativo`, `criado_em`
- **execucoes** — `integracao_id`, `iniciado_em`, `finalizado_em`, `status` (`sucesso`/`erro`/`manual`), `registros_processados`, `mensagem_erro`, `disparado_por` (`cron`/`manual`)
- **alertas** — `integracao_id`, `tipo` (`falha_execucao`/`sem_retorno`), `mensagem`, `criado_em`, `visualizado`

## API

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/report` | Integração reporta o fim de uma execução |
| `GET` | `/api/integracoes` | Lista todas com status calculado + contagens |
| `POST` | `/api/integracoes` | Cadastra nova integração |
| `GET` | `/api/integracoes/[id]/execucoes` | Histórico de execuções |
| `GET` | `/api/alertas` | Alertas não visualizados |
| `PATCH` | `/api/alertas/[id]` | Marca alerta como visualizado |

Documentação completa do contrato de report em **`/integracoes/doc`**.

### Como o status é calculado

- **Falha** — última execução reportada teve `status = erro`
- **Atrasada** — passou da janela `cron_esperado` + `tolerancia_minutos` sem reporte → gera alerta `sem_retorno`
- **Saudável** — reportou dentro da janela com sucesso

Um job (`src/instrumentation.ts` → `src/lib/monitor.ts`) roda a cada 60s gerando os alertas `sem_retorno`.

## Deploy

- **PM2** na porta **3002**: `pm2 start ecosystem.config.js` (após `npm run build`)
- **nginx**: faz proxy de `/integracoes` para `127.0.0.1:3002` sem reescrever o prefixo — snippet em `deploy/nginx.conf`

Integrações externas reportam em `https://SEU_DOMINIO/integracoes/api/report`.
