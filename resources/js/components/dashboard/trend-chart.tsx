// resources/js/components/dashboard/trend-chart.tsx
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

const easeOut = [0.16, 1, 0.3, 1] as const;

export type TrendPoint = {
    month: string;
    survivors: number;
    cases: number;
};

export type TrendChartProps = {
    data: TrendPoint[];
    className?: string;
};

const SERIES = [
    { key: "survivors" as const, label: "Survivors", color: "#10b981" },
    { key: "cases" as const, label: "Cases", color: "#6366f1" },
];

export function TrendChart({ data, className }: TrendChartProps) {
    const [hovered, setHovered] = useState<number | null>(null);

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                No data yet.
            </div>
        );
    }

    const W = 720;
    const H = 260;
    const P = { top: 24, right: 24, bottom: 32, left: 40 };
    const innerW = W - P.left - P.right;
    const innerH = H - P.top - P.bottom;

    const maxVal = Math.max(
        1,
        ...data.map((d) => Math.max(d.survivors, d.cases)),
    );
    const yTicks = 4;
    const tickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
        Math.round((maxVal / yTicks) * i),
    );

    const x = (i: number) =>
        P.left +
        (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
    const y = (v: number) => P.top + innerH - (v / maxVal) * innerH;

    const linePath = (key: "survivors" | "cases") =>
        data
            .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d[key])}`)
            .join(" ");

    const areaPath = (key: "survivors" | "cases") => {
        const top = data
            .map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d[key])}`)
            .join(" ");
        return `${top} L ${x(data.length - 1)} ${P.top + innerH} L ${x(0)} ${P.top + innerH} Z`;
    };

    return (
        <div className={cn("w-full", className)}>
            <div className="relative">
                <svg
                    viewBox={`0 0 ${W} ${H}`}
                    className="h-64 w-full"
                    role="img"
                    aria-label="Activity trend over the last 12 months"
                    onMouseLeave={() => setHovered(null)}
                >
                    <defs>
                        {SERIES.map((s) => (
                            <linearGradient
                                key={s.key}
                                id={`grad-${s.key}`}
                                x1="0"
                                x2="0"
                                y1="0"
                                y2="1"
                            >
                                <stop
                                    offset="0%"
                                    stopColor={s.color}
                                    stopOpacity="0.25"
                                />
                                <stop
                                    offset="100%"
                                    stopColor={s.color}
                                    stopOpacity="0"
                                />
                            </linearGradient>
                        ))}
                    </defs>

                    {/* Grid + Y labels */}
                    {tickValues.map((v, i) => (
                        <g key={v}>
                            <line
                                x1={P.left}
                                x2={W - P.right}
                                y1={y(v)}
                                y2={y(v)}
                                className="stroke-border"
                                strokeDasharray="4 4"
                                strokeWidth={1}
                            />
                            <text
                                x={P.left - 8}
                                y={y(v) + 3}
                                textAnchor="end"
                                className="fill-muted-foreground text-[10px]"
                            >
                                {v}
                            </text>
                        </g>
                    ))}

                    {/* Areas */}
                    {SERIES.map((s) => (
                        <motion.path
                            key={`area-${s.key}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, ease: easeOut }}
                            d={areaPath(s.key)}
                            fill={`url(#grad-${s.key})`}
                        />
                    ))}

                    {/* Lines */}
                    {SERIES.map((s) => (
                        <motion.path
                            key={`line-${s.key}`}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.1, ease: easeOut }}
                            d={linePath(s.key)}
                            fill="none"
                            stroke={s.color}
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ))}

                    {/* Points + hover zones */}
                    {data.map((d, i) => (
                        <g key={i}>
                            <rect
                                x={
                                    x(i) -
                                    innerW / (2 * Math.max(1, data.length - 1))
                                }
                                y={P.top}
                                width={innerW / Math.max(1, data.length - 1)}
                                height={innerH}
                                fill="transparent"
                                onMouseEnter={() => setHovered(i)}
                            />
                            {SERIES.map((s) => (
                                <circle
                                    key={s.key}
                                    cx={x(i)}
                                    cy={y(d[s.key])}
                                    r={hovered === i ? 5 : 3.5}
                                    fill={s.color}
                                    stroke="var(--color-card)"
                                    strokeWidth={2}
                                    className="pointer-events-none transition-all duration-150"
                                />
                            ))}
                        </g>
                    ))}

                    {/* Month labels */}
                    {data.map((d, i) =>
                        i % 2 === 0 ? (
                            <text
                                key={d.month}
                                x={x(i)}
                                y={H - 10}
                                textAnchor="middle"
                                className="fill-muted-foreground text-[10px]"
                            >
                                {d.month}
                            </text>
                        ) : null,
                    )}
                </svg>

                {/* Tooltip */}
                {hovered !== null && (
                    <div
                        className="pointer-events-none absolute top-0 z-10 min-w-[140px] -translate-x-1/2 rounded-lg border bg-popover p-2.5 text-xs shadow-lg"
                        style={{
                            left: `${(x(hovered) / W) * 100}%`,
                        }}
                    >
                        <div className="mb-1.5 font-semibold text-popover-foreground">
                            {data[hovered].month}
                        </div>
                        {SERIES.map((s) => (
                            <div
                                key={s.key}
                                className="flex items-center justify-between gap-3 py-0.5"
                            >
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                    <span
                                        className="inline-block h-2 w-2 rounded-full"
                                        style={{ backgroundColor: s.color }}
                                    />
                                    {s.label}
                                </span>
                                <span className="font-medium tabular-nums text-popover-foreground">
                                    {data[hovered][s.key]}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap items-center gap-5 text-xs">
                {SERIES.map((s) => (
                    <span
                        key={s.key}
                        className="flex items-center gap-1.5 text-muted-foreground"
                    >
                        <span
                            className="inline-block h-2 w-4 rounded-sm"
                            style={{ backgroundColor: s.color }}
                        />
                        {s.label}
                    </span>
                ))}
            </div>
        </div>
    );
}
