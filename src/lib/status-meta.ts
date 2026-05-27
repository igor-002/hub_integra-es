import type { StatusCalculado } from "./types";

export const STATUSES: Record<
  StatusCalculado,
  { label: string; color: string; soft: string; short: string }
> = {
  healthy: { label: "Saudável", color: "var(--healthy)", soft: "var(--healthy-soft)", short: "OK" },
  failed: { label: "Falha", color: "var(--failed)", soft: "var(--failed-soft)", short: "ERR" },
  delayed: { label: "Atrasada", color: "var(--delayed)", soft: "var(--delayed-soft)", short: "LATE" },
};
