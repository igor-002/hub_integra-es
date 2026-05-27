// Helpers de formatação (puros, seguros no client)

export function displayId(id: number): string {
  return `INT-${String(id).padStart(4, "0")}`;
}

export function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function fmtRelativePast(mins: number | null): string {
  if (mins == null) return "—";
  if (mins < 1) return "agora há pouco";
  if (mins < 60) return `há ${mins} min`;
  if (mins < 60 * 24) return `há ${Math.floor(mins / 60)} h`;
  return `há ${Math.floor(mins / (60 * 24))} d`;
}

export function fmtRelativeFuture(mins: number | null): string {
  if (mins == null) return "—";
  if (mins < 0) return `${-mins} min atrás`;
  if (mins < 1) return "iminente";
  if (mins < 60) return `em ${mins} min`;
  if (mins < 60 * 24) return `em ${Math.floor(mins / 60)} h`;
  return `em ${Math.floor(mins / (60 * 24))} d`;
}

export function fmtNumber(n: number): string {
  return n.toLocaleString("pt-BR");
}

// Tempo relativo a partir de data SQLite ('YYYY-MM-DD HH:MM:SS' em UTC) ou ISO
export function fmtAgoSql(s: string | null): string {
  if (!s) return "—";
  const iso = s.includes("T") ? s : s.replace(" ", "T") + "Z";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const mins = Math.max(0, Math.round((Date.now() - d.getTime()) / 60000));
  return fmtRelativePast(mins);
}
