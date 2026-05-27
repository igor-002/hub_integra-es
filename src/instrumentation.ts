// Next.js chama register() uma vez no boot do servidor.
// O import node-only fica DENTRO do guard positivo NEXT_RUNTIME === "nodejs"
// para o Next excluí-lo da compilação edge (better-sqlite3 usa 'fs').

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startMonitor } = await import("./lib/monitor");
    startMonitor();
  }
}
