"use client";

export function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 80,
    h = 22,
    pad = 2;
  if (!data || data.length < 2) {
    return <svg width={w} height={h} style={{ display: "block" }} />;
  }
  const step = (w - pad * 2) / (data.length - 1);
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      {data.map((v, i) => {
        const x = pad + i * step;
        const barH = 4 + v * (h - 8);
        return (
          <rect
            key={i}
            x={x - 2.5}
            y={h - barH - 1}
            width={4}
            height={barH}
            rx={1}
            fill={v === 0 ? "var(--failed)" : v === 0.5 ? "var(--delayed)" : color}
            opacity={v === 1 ? 0.55 + (i / data.length) * 0.45 : 1}
          />
        );
      })}
    </svg>
  );
}
