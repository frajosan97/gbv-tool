import * as Lucide from "lucide-react";
import { Circle, type LucideProps } from "lucide-react";
import type { ComponentType } from "react";

interface DynamicIconProps extends Omit<LucideProps, "name"> {
    name?: string | null;
}

/**
 * Resolve a Lucide icon by its export name (e.g. "ShieldAlert", "HeartPulse").
 * Falls back to `Circle` when the name is missing or unknown.
 */
export function DynamicIcon({ name, ...props }: DynamicIconProps) {
    if (!name) return <Circle {...props} />;

    const Candidate = (Lucide as Record<string, unknown>)[name] as
        | ComponentType<LucideProps>
        | undefined;

    if (typeof Candidate !== "function") return <Circle {...props} />;

    return <Candidate {...props} />;
}
