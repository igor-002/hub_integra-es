// basePath do app — o Next NÃO prefixa chamadas fetch() automaticamente,
// então prefixamos manualmente as rotas de API no client.
export const BASE_PATH = "/integracoes";

export function apiUrl(path: string): string {
  return `${BASE_PATH}${path.startsWith("/") ? "" : "/"}${path}`;
}
