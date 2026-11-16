// resources/js/components/dashboard/bar-chart.tsx
import { motion } from "framer-motion";
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
];

export type Bar = {
    /** Preferred key */
    label?: string;
    /** Backend-friendly alias — used when `label` is absent */
    name?: string;
    value: number;
    color?: string | null;
};

export type BarChartProps = {
    data: Bar[];
    showValues?: boolean;
    compact?: boolean;
    className?: string;
};

export function BarChart({
    data,
    showValues = true,
    compact = false,
    className,
}: BarChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                No data yet.
            </div>
        );
    }

    const max = Math.max(1, ...data.map((d) => d.value));

    return (
        <div className={cn("space-y-2.5", className)}>
            {data.map((bar, i) => {
                const label = bar.label ?? bar.name ?? "—";
                const color = bar.color ?? PALETTE[i % PALETTE.length];
                const pct = (bar.value / max) * 100;

                return (
                    <motion.div
                        key={`${label}-${i}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                            duration: 0.35,
                            delay: i * 0.05,
                            ease: easeOut,
                        }}
                        className={cn(
                            "group/bar flex items-center gap-3",
                            compact ? "text-xs" : "text-sm",
                        )}
                    >
                        <div
                            className={cn(
                                "truncate text-right text-muted-foreground transition-colors group-hover/bar:text-foreground",
                                compact ? "w-24" : "w-32",
                            )}
                            title={label}
                        >
                            {label}
                        </div>

                        <div
                            className={cn(
                                "relative flex-1 overflow-hidden rounded-full bg-muted/60",
                                compact ? "h-5" : "h-7",
                            )}
                        >
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{
                                    duration: 0.6,
                                    delay: 0.15 + i * 0.05,
                                    ease: easeOut,
                                }}
                                className="relative h-full rounded-full transition-all duration-300"
                                style={{
                                    background: `linear-gradient(90deg, ${color}dd, ${color})`,
                                    boxShadow: `0 0 0 1px ${color}40 inset`,
                                }}
                            >
                                <div
                                    aria-hidden
                                    className="absolute inset-0 rounded-full bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity group-hover/bar:opacity-100"
                                />
                            </motion.div>
                        </div>

                        {showValues && (
                            <div
                                className={cn(
                                    "tabular-nums text-right font-medium transition-colors",
                                    compact ? "w-10 text-xs" : "w-12",
                                )}
                            >
                                {bar.value}
                            </div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
}
