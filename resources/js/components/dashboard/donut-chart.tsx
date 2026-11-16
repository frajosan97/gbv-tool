// resources/js/components/dashboard/donut-chart.tsx
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

const easeOut = [0.16, 1, 0.3, 1] as const;

const PALETTE = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#3b82f6",
    "#ec4899",
    "#8b5cf6",
    "#14b8a6",
    "#f97316",
    "#06b6d4",
];

export type DonutSlice = {
    name: string;
    value: number;
    color?: string | null;
};

export type DonutChartProps = {
    data: DonutSlice[];
    size?: number;
    thickness?: number;
    centerLabel?: string;
    className?: string;
};

export function DonutChart({
    data,
    size = 180,
    thickness = 26,
    centerLabel,
    className,
}: DonutChartProps) {
    const [hovered, setHovered] = useState<number | null>(null);

    const total = data.reduce((s, d) => s + d.value, 0);

    if (total === 0) {
        return (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                No data yet.
            </div>
        );
    }

    const R = (size - thickness) / 2;
    const C = 2 * Math.PI * R;
    const cx = size / 2;
    const cy = size / 2;

    // Pre-compute cumulative offsets so both maps stay in sync
    let offset = 0;
    const arcs = data.map((slice, i) => {
        const fraction = slice.value / total;
        const dash = fraction * C;
        const color = slice.color ?? PALETTE[i % PALETTE.length];
        const startOffset = offset;
        offset += dash;
        return { slice, i, dash, color, startOffset };
    });

    return (
        <div
            className={cn(
                "flex flex-col items-center gap-5 sm:flex-row sm:items-center",
                className,
            )}
        >
            <div className="relative shrink-0">
                <svg width={size} height={size} className="overflow-visible">
                    <g transform={`translate(${cx} ${cy}) rotate(-90)`}>
                        {arcs.map(({ slice, i, dash, color, startOffset }) => {
                            const isHovered = hovered === i;
                            const isDimmed = hovered !== null && hovered !== i;
                            const strokeWidth = thickness + (isHovered ? 6 : 0);

                            return (
                                <motion.circle
                                    // ✅ prefixed + indexed → unique even if names repeat
                                    key={`arc-${slice.name}-${i}`}
                                    r={R}
                                    fill="transparent"
                                    stroke={color}
                                    strokeLinecap="round"
                                    initial={{
                                        strokeWidth: 0,
                                        strokeDasharray: `0 ${C}`,
                                        opacity: 0,
                                    }}
                                    animate={{
                                        strokeWidth,
                                        strokeDasharray: `${Math.max(0.5, dash - 2)} ${C}`,
                                        strokeDashoffset: -startOffset,
                                        opacity: isDimmed ? 0.35 : 1,
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        delay: i * 0.05,
                                        ease: easeOut,
                                    }}
                                    onMouseEnter={() => setHovered(i)}
                                    onMouseLeave={() => setHovered(null)}
                                    className="cursor-pointer transition-all duration-200"
                                    style={{
                                        filter: isHovered
                                            ? `drop-shadow(0 0 6px ${color}80)`
                                            : "none",
                                    }}
                                />
                            );
                        })}
                    </g>

                    {/* Center total */}
                    <text
                        x={cx}
                        y={cy - 4}
                        textAnchor="middle"
                        className="fill-foreground text-2xl font-semibold tabular-nums"
                    >
                        {total}
                    </text>
                    <text
                        x={cx}
                        y={cy + 16}
                        textAnchor="middle"
                        className="fill-muted-foreground text-[10px] font-medium uppercase tracking-wider"
                    >
                        {centerLabel ?? "Total"}
                    </text>
                </svg>
            </div>

            <ul className="flex-1 space-y-1.5 text-xs">
                {arcs.map(({ slice, i, color }) => {
                    const pct = ((slice.value / total) * 100).toFixed(0);
                    const isHovered = hovered === i;
                    const isDimmed = hovered !== null && hovered !== i;

                    return (
                        <li
                            // ✅ different prefix from arcs → cannot collide with them
                            key={`legend-${slice.name}-${i}`}
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}
                            className={cn(
                                "flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 transition-all duration-150",
                                isHovered && "bg-muted/60",
                                isDimmed && "opacity-50",
                            )}
                        >
                            <span
                                className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm transition-transform"
                                style={{
                                    backgroundColor: color,
                                    transform: isHovered
                                        ? "scale(1.25)"
                                        : undefined,
                                }}
                            />
                            <span className="flex-1 truncate text-muted-foreground">
                                {slice.name}
                            </span>
                            <span className="tabular-nums font-medium">
                                {slice.value}
                            </span>
                            <span className="w-8 text-right tabular-nums text-muted-foreground">
                                {pct}%
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
