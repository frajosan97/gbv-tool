import { DynamicIcon } from "@/components/dynamic-icon";

type LookupColor =
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "danger";

interface LookupLike {
    name: string;
    icon?: string | null;
    color?: string | null;
}

interface LookupBadgeProps {
    lookup: LookupLike;
    size?: "sm" | "md" | "lg";
    withIcon?: boolean;
    className?: string;
}

const colorClasses: Record<LookupColor, string> = {
    primary: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary text-secondary-foreground border-border",
    success: "bg-primary/10 text-primary border-primary/20",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    warning: "bg-brand-amber/10 text-brand-amber border-brand-amber/20",
    danger: "bg-destructive/10 text-destructive border-destructive/20",
};

const sizeClasses = {
    sm: { pad: "px-2 py-0.5 text-[10px]", icon: 10 },
    md: { pad: "px-2.5 py-1 text-xs", icon: 12 },
    lg: { pad: "px-3 py-1.5 text-sm", icon: 14 },
};

export function LookupBadge({
    lookup,
    size = "md",
    withIcon = true,
    className = "",
}: LookupBadgeProps) {
    const palette =
        colorClasses[(lookup.color as LookupColor) ?? "secondary"] ??
        colorClasses.secondary;
    const sz = sizeClasses[size];

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-md border font-bold tracking-wide ${palette} ${sz.pad} ${className}`}
        >
            {withIcon && lookup.icon && (
                <DynamicIcon name={lookup.icon} size={sz.icon} />
            )}
            {lookup.name}
        </span>
    );
}
