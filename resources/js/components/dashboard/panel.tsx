// resources/js/components/dashboard/panel.tsx
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const easeOut = [0.16, 1, 0.3, 1] as const;

export type PanelProps = {
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
    accent?: boolean;
    delay?: number;
};

export function Panel({
    title,
    description,
    action,
    children,
    className,
    accent,
    delay = 0,
}: PanelProps) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay, ease: easeOut }}
            className={cn(
                "group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md",
                accent && "border-primary/30",
                className,
            )}
        >
            {accent && (
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent"
                />
            )}

            <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
                <div className="min-w-0">
                    <h3 className="text-sm font-semibold tracking-tight">
                        {title}
                    </h3>
                    {description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                {action}
            </div>

            <div className="p-5">{children}</div>
        </motion.section>
    );
}
