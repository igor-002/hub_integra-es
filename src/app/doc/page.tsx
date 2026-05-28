import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "../components/icons";

export const metadata: Metadata = {
  title: "Documentação · Hub Integrações",
  description: "O que sua integração precisa enviar para o painel Hub Integrações",
};

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  padding: 24,
};

function Code({ children }: { children: string }) {
  return (
    <pre
      className="mono"
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "14px 16px",
        fontSize: 12.5,
        lineHeight: 1.6,
        color: "var(--text)",
        overflowX: "auto",
        margin: 0,
        whiteSpace: "pre",
      }}
    >
      {children}
    </pre>
  );
}

function Inline({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="mono"
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: 5,
        padding: "1px 6px",
        fontSize: 12.5,
        color: "var(--accent)",
      }}
    >
      {children}
    </code>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px", letterSpacing: -0.3 }}>{children}</h2>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  color: "var(--text-muted)",
  padding: "8px 12px",
  borderBottom: "1px solid var(--border)",
};
const td: React.CSSProperties = {
  fontSize: 13,
  color: "var(--text)",
  padding: "10px 12px",
  borderBottom: "1px solid var(--border)",
  verticalAlign: "top",
};

export default function DocPage() {
  return (
    <div style={{ minHeight: "100vh", paddingBottom: 80 }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "14px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ color: "var(--accent)" }}>
              <Icon.Logo width={30} height={30} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: -0.3 }}>
              Hub Integrações · Documentação
            </div>
          </div>
          <Link
            href="/"
            style={{
              padding: "8px 14px",
              borderRadius: 9,
              background: "var(--surface-2)",
              color: "var(--text)",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ← Voltar ao painel
          </Link>
        </div>
      </header>

      <main
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "32px",
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 8px", letterSpacing: -0.6 }}>
            Como conectar sua integração
          </h1>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
            Toda integração monitorada precisa fazer duas coisas: estar <strong>cadastrada</strong> no painel e{" "}
            <strong>reportar cada execução</strong> via HTTP ao terminar. O painel calcula o status e dispara
            alertas automaticamente a partir desses reportes.
          </p>
        </div>

        {/* 1. cadastro */}
        <section style={card}>
          <H>1. Cadastrar a integração</H>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginTop: 0 }}>
            No painel, clique em <strong>“Nova integração”</strong> — ou use a API. Ao criar com{" "}
            <Inline>ativo = 1</Inline> ela <strong>já entra no monitoramento</strong> automaticamente. Guarde o{" "}
            <Inline>id</Inline> retornado: é ele que você envia em cada reporte.
          </p>
          <Code>{`POST /integracoes/api/integracoes
Content-Type: application/json

{
  "nome": "Sincronização de Pedidos",
  "cliente": "Supermercado Figura",
  "tipo": "ERP Senior",
  "descricao": "Importa pedidos a cada 15 min",
  "cron_esperado": "*/15 * * * *",
  "tolerancia_minutos": 5,
  "ativo": 1
}

→ 201 { "ok": true, "integracao": { "id": 4, ... } }`}</Code>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
            <thead>
              <tr>
                <th style={th}>Campo</th>
                <th style={th}>Obrigatório</th>
                <th style={th}>Descrição</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}><Inline>nome</Inline></td>
                <td style={td}>sim</td>
                <td style={td}>Nome da integração/pipeline.</td>
              </tr>
              <tr>
                <td style={td}><Inline>cliente</Inline></td>
                <td style={td}>sim</td>
                <td style={td}>Empresa/cliente dono da integração.</td>
              </tr>
              <tr>
                <td style={td}><Inline>cron_esperado</Inline></td>
                <td style={td}>sim</td>
                <td style={td}>Frequência esperada em cron 5 campos (ex: <Inline>*/15 * * * *</Inline>).</td>
              </tr>
              <tr>
                <td style={td}><Inline>tipo</Inline></td>
                <td style={td}>não</td>
                <td style={td}>ERP/origem (badge no card).</td>
              </tr>
              <tr>
                <td style={td}><Inline>descricao</Inline></td>
                <td style={td}>não</td>
                <td style={td}>Texto livre.</td>
              </tr>
              <tr>
                <td style={td}><Inline>tolerancia_minutos</Inline></td>
                <td style={td}>não</td>
                <td style={td}>Atraso aceito após a janela cron antes de marcar atrasada (default 5).</td>
              </tr>
              <tr>
                <td style={td}><Inline>ativo</Inline></td>
                <td style={td}>não</td>
                <td style={td}>1 = monitorada (default), 0 = pausada.</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* 2. reportar */}
        <section style={card}>
          <H>2. Reportar cada execução</H>
          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginTop: 0 }}>
            Ao terminar uma execução (com sucesso ou erro), sua integração faz um <Inline>POST</Inline> para o
            endpoint abaixo. <strong>É isso que mantém o status verde.</strong>
          </p>
          <Code>{`POST https://SEU_DOMINIO/integracoes/api/report
Content-Type: application/json

{
  "integracao_id": 4,
  "status": "sucesso",
  "registros_processados": 2847,
  "disparado_por": "cron"
}`}</Code>

          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
            <thead>
              <tr>
                <th style={th}>Campo</th>
                <th style={th}>Obrigatório</th>
                <th style={th}>Descrição</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}><Inline>integracao_id</Inline></td>
                <td style={td}>sim</td>
                <td style={td}>O <Inline>id</Inline> retornado no cadastro.</td>
              </tr>
              <tr>
                <td style={td}><Inline>status</Inline></td>
                <td style={td}>sim</td>
                <td style={td}>
                  <Inline>sucesso</Inline> · <Inline>erro</Inline> · <Inline>manual</Inline>
                </td>
              </tr>
              <tr>
                <td style={td}><Inline>registros_processados</Inline></td>
                <td style={td}>não</td>
                <td style={td}>Quantidade processada na execução (default 0).</td>
              </tr>
              <tr>
                <td style={td}><Inline>mensagem_erro</Inline></td>
                <td style={td}>não</td>
                <td style={td}>Texto do erro — mostrado no card e vira alerta quando <Inline>status=erro</Inline>.</td>
              </tr>
              <tr>
                <td style={td}><Inline>disparado_por</Inline></td>
                <td style={td}>não</td>
                <td style={td}><Inline>cron</Inline> (default) ou <Inline>manual</Inline>.</td>
              </tr>
              <tr>
                <td style={td}><Inline>iniciado_em</Inline> / <Inline>finalizado_em</Inline></td>
                <td style={td}>não</td>
                <td style={td}>Datas ISO 8601. Se omitidas, usa o horário do reporte.</td>
              </tr>
            </tbody>
          </table>

          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 0 }}>
            Reporte com <Inline>status=erro</Inline> → gera alerta <Inline>falha_execucao</Inline>. Reporte com
            sucesso → <strong>resolve automaticamente</strong> qualquer alerta <Inline>sem_retorno</Inline> pendente
            daquela integração.
          </p>
        </section>

        {/* exemplos */}
        <section style={card}>
          <H>Exemplos de reporte</H>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", margin: "4px 0 8px" }}>cURL</div>
          <Code>{`curl -X POST https://SEU_DOMINIO/integracoes/api/report \\
  -H "Content-Type: application/json" \\
  -d '{"integracao_id":4,"status":"sucesso","registros_processados":2847,"disparado_por":"cron"}'`}</Code>

          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", margin: "16px 0 8px" }}>
            Node.js (fetch)
          </div>
          <Code>{`await fetch("https://SEU_DOMINIO/integracoes/api/report", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    integracao_id: 4,
    status: "sucesso",
    registros_processados: 2847,
  }),
});`}</Code>

          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", margin: "16px 0 8px" }}>
            Python (requests)
          </div>
          <Code>{`import requests

requests.post(
    "https://SEU_DOMINIO/integracoes/api/report",
    json={
        "integracao_id": 4,
        "status": "sucesso",
        "registros_processados": 2847,
    },
)`}</Code>

          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", margin: "16px 0 8px" }}>
            Em caso de falha
          </div>
          <Code>{`curl -X POST https://SEU_DOMINIO/integracoes/api/report \\
  -H "Content-Type: application/json" \\
  -d '{"integracao_id":4,"status":"erro","mensagem_erro":"Timeout no endpoint /pedidos"}'`}</Code>
        </section>

        {/* status logic */}
        <section style={card}>
          <H>Como o status é calculado</H>
          <ul style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.8, margin: 0, paddingLeft: 20 }}>
            <li>
              <strong style={{ color: "var(--failed)" }}>Falha</strong> — a última execução reportada teve{" "}
              <Inline>status = erro</Inline>.
            </li>
            <li>
              <strong style={{ color: "var(--delayed)" }}>Atrasada</strong> — passou da janela do{" "}
              <Inline>cron_esperado</Inline> + <Inline>tolerancia_minutos</Inline> sem nenhum reporte. O painel gera
              um alerta <Inline>sem_retorno</Inline> (job roda a cada 60s).
            </li>
            <li>
              <strong style={{ color: "var(--healthy)" }}>Saudável</strong> — reportou dentro da janela e a última
              execução foi bem-sucedida.
            </li>
          </ul>
          <p style={{ fontSize: 13, color: "var(--text-faint)", lineHeight: 1.6, marginBottom: 0 }}>
            Ou seja: para ficar verde, basta reportar <Inline>sucesso</Inline> dentro da frequência cadastrada.
          </p>
        </section>

        {/* outras rotas */}
        <section style={card}>
          <H>Outras rotas da API</H>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Rota</th>
                <th style={th}>Descrição</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}><Inline>GET /integracoes/api/integracoes</Inline></td>
                <td style={td}>Lista todas com status calculado e contagens.</td>
              </tr>
              <tr>
                <td style={td}><Inline>GET /integracoes/api/integracoes/:id/execucoes</Inline></td>
                <td style={td}>Histórico de execuções (param <Inline>?limit=</Inline>).</td>
              </tr>
              <tr>
                <td style={td}><Inline>DELETE /integracoes/api/integracoes/:id</Inline></td>
                <td style={td}>
                  Remove a integração do painel. <strong>Destrutivo:</strong> apaga também todo o
                  histórico de execuções e os alertas dela.
                </td>
              </tr>
              <tr>
                <td style={td}><Inline>GET /integracoes/api/alertas</Inline></td>
                <td style={td}>Alertas não visualizados.</td>
              </tr>
              <tr>
                <td style={td}><Inline>PATCH /integracoes/api/alertas/:id</Inline></td>
                <td style={td}>Marca alerta como visualizado.</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
