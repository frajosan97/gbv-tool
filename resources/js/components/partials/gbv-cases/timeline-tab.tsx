import {
    Calendar,
    FileText,
    Send,
    ShieldCheck,
    StickyNote,
    UserRound,
    UserX,
} from "lucide-react";
import { useMemo } from "react";

import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatters";

export interface TimelineEvent {
    id: string;
    type: "case" | "file" | "perpetrator" | "referral" | "note" | "status";
    title: string;
    description?: string;
    actor?: string;
    timestamp: string;
}

interface Props {
    caseId: number;
    events: TimelineEvent[];
}

const EVENT_ICONS: Record<
    TimelineEvent["type"],
    React.ComponentType<{ className?: string }>
> = {
    case: FileText,
    file: FileText,
    perpetrator: UserX,
    referral: Send,
    note: StickyNote,
    status: ShieldCheck,
};

const EVENT_COLORS: Record<TimelineEvent["type"], string> = {
    case: "bg-primary text-primary-foreground",
    file: "bg-sky-600 text-white",
    perpetrator: "bg-rose-600 text-white",
    referral: "bg-violet-600 text-white",
    note: "bg-amber-500 text-white",
    status: "bg-emerald-600 text-white",
};

export function CaseTimelineTab({ events }: Props) {
    const sorted = useMemo(
        () =>
            [...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
        [events],
    );

    if (sorted.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground/40" />
                <p className="mt-3 text-sm font-medium">No activity yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                    Case activity will appear here as actions are taken.
                </p>
            </div>
        );
    }

    return (
        <ol className="relative space-y-6 border-l border-border pl-6">
            {sorted.map((event) => {
                const Icon = EVENT_ICONS[event.type];
                return (
                    <li key={event.id} className="relative">
                        <span
                            className={cn(
                                "absolute -left-[calc(1.5rem+0.75rem)] flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background",
                                EVENT_COLORS[event.type],
                            )}
                        >
                            <Icon className="h-3 w-3" />
                        </span>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h4 className="text-sm font-semibold">
                                {event.title}
                            </h4>
                            <time className="text-xs text-muted-foreground">
                                {formatDate(event.timestamp)}
                            </time>
                        </div>
                        {event.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {event.description}
                            </p>
                        )}
                        {event.actor && (
                            <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <UserRound className="h-3 w-3" />
                                {event.actor}
                            </p>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}
