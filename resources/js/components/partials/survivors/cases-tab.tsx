import { Eye, FileText, FolderClosed, ShieldAlert } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { formatDate } from "@/lib/formatters";
import { buildLocalPaginator } from "@/lib/local-paginator";

import type { Column, DataTableFilters } from "@/types";

export interface SurvivorCase {
    id: number;
    case_number: string | null;
    incident_number?: string | null;
    incident_type?: string | null;
    incident_date?: string | null;
    status: string | null;
    status_slug?: string | null;
    status_color?: string | null;
    priority?: string | null;
    is_sensitive?: boolean;
    created_at: string | null;
    updated_at?: string | null;
}

interface CasesTabFilters {
    search: string;
    sort: string;
    dir: "asc" | "desc";
    per_page: number;
    [key: string]: string | number | boolean | undefined;
}

const DEFAULT_FILTERS: CasesTabFilters = {
    search: "",
    sort: "created_at",
    dir: "desc",
    per_page: 10,
};

const ALLOWED_SORTS: Record<
    string,
    (a: SurvivorCase, b: SurvivorCase) => number
> = {
    case_number: (a, b) =>
        (a.case_number ?? "").localeCompare(b.case_number ?? ""),
    incident_type: (a, b) =>
        (a.incident_type ?? "").localeCompare(b.incident_type ?? ""),
    status: (a, b) => (a.status ?? "").localeCompare(b.status ?? ""),
    priority: (a, b) => (a.priority ?? "").localeCompare(b.priority ?? ""),
    incident_date: (a, b) =>
        (a.incident_date ?? "").localeCompare(b.incident_date ?? ""),
    created_at: (a, b) =>
        (a.created_at ?? "").localeCompare(b.created_at ?? ""),
};

const STATUS_COLOR_CLASSES: Record<string, string> = {
    danger: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300",
    warning:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
    success:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300",
    info: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/40 dark:text-sky-300",
    primary: "border-primary/30 bg-primary/10 text-primary",
    neutral:
        "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
};

function statusLabel(s: unknown): string {
    if (typeof s === "string") return s;
    if (s && typeof s === "object" && "name" in s) {
        return String((s as { name: unknown }).name ?? "—");
    }
    return "—";
}

const PRIORITY_CLASSES: Record<string, string> = {
    critical: "border-rose-300 text-rose-700",
    high: "border-orange-300 text-orange-700",
    medium: "border-amber-300 text-amber-700",
    low: "border-slate-300 text-slate-600",
};

interface Props {
    survivorId: number;
    casesCount: number;
    cases?: SurvivorCase[];
    emptyAction?: React.ReactNode;
    onViewCase?: (c: SurvivorCase) => void;
}

export function CasesTab({
    survivorId,
    casesCount,
    cases,
    emptyAction,
    onViewCase,
}: Props) {
    const rows = cases ?? [];

    const [filters, setFilters] = useState<CasesTabFilters>(DEFAULT_FILTERS);
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        const term = filters.search.trim().toLowerCase();
        let result = rows;

        if (term !== "") {
            result = result.filter((c) => {
                const haystack = [
                    c.case_number ?? "",
                    c.incident_number ?? "",
                    c.incident_type ?? "",
                    statusLabel(c.status),
                    c.priority ?? "",
                ]
                    .join(" ")
                    .toLowerCase();
                return haystack.includes(term);
            });
        }

        const comparator =
            ALLOWED_SORTS[filters.sort] ?? ALLOWED_SORTS.created_at;
        const sorted = [...result].sort(comparator);
        return filters.dir === "desc" ? sorted.reverse() : sorted;
    }, [rows, filters.search, filters.sort, filters.dir]);

    const lastPage = Math.max(
        1,
        Math.ceil(filtered.length / Math.max(1, filters.per_page)),
    );
    useEffect(() => {
        if (page > lastPage) setPage(lastPage);
    }, [page, lastPage]);

    const paginator = useMemo(
        () => buildLocalPaginator(filtered, page, filters.per_page),
        [filtered, page, filters.per_page],
    );

    const handleFilterChange = useCallback(
        (patch: Partial<DataTableFilters> & Record<string, unknown>) => {
            const narrowed = patch as Partial<CasesTabFilters>;
            if (
                narrowed.search !== undefined ||
                narrowed.sort !== undefined ||
                narrowed.dir !== undefined
            ) {
                setPage(1);
            }
            setFilters((prev) => ({ ...prev, ...narrowed }));
        },
        [],
    );

    const handleView = useCallback(
        (c: SurvivorCase) => {
            if (onViewCase) {
                onViewCase(c);
            } else {
                window.location.href = `/gbv-cases/${c.id}`;
            }
        },
        [onViewCase],
    );

    const columns: Column<SurvivorCase>[] = [
        {
            key: "case_number",
            label: "Case No.",
            icon: FileText,
            sortable: true,
            headerClassName: "w-[18%]",
            cell: (c) => (
                <button
                    type="button"
                    onClick={() => handleView(c)}
                    className="font-mono text-xs font-medium text-primary hover:underline"
                    title={c.case_number ?? `#${c.id}`}
                >
                    {c.case_number ?? `#${c.id}`}
                </button>
            ),
        },
        {
            key: "incident_type",
            label: "Incident Type",
            sortable: true,
            headerClassName: "w-[22%]",
            cell: (c) =>
                c.incident_type ? (
                    <span className="line-clamp-1 text-sm">
                        {c.incident_type}
                    </span>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            headerClassName: "w-[16%]",
            cell: (c) => {
                const label = statusLabel(c.status);
                const colorClass =
                    STATUS_COLOR_CLASSES[c.status_color ?? ""] ??
                    STATUS_COLOR_CLASSES.neutral;
                return (
                    <Badge
                        variant="outline"
                        className={`capitalize ${colorClass}`}
                    >
                        {label}
                    </Badge>
                );
            },
        },
        {
            key: "priority",
            label: "Priority",
            sortable: true,
            headerClassName: "w-[12%]",
            cell: (c) => {
                if (!c.priority) {
                    return <span className="text-muted-foreground">—</span>;
                }
                const cls =
                    PRIORITY_CLASSES[c.priority.toLowerCase()] ??
                    "border-slate-300 text-slate-700";
                return (
                    <Badge variant="outline" className={`capitalize ${cls}`}>
                        {c.priority}
                    </Badge>
                );
            },
        },
        {
            key: "incident_date",
            label: "Incident",
            sortable: true,
            headerClassName: "w-[12%]",
            cell: (c) => (
                <span className="text-xs text-muted-foreground">
                    {c.incident_date ? formatDate(c.incident_date) : "—"}
                </span>
            ),
        },
        {
            key: "created_at",
            label: "Opened",
            sortable: true,
            headerClassName: "w-[12%]",
            cell: (c) => (
                <span className="text-xs text-muted-foreground">
                    {c.created_at ? formatDate(c.created_at) : "—"}
                </span>
            ),
        },
        {
            key: "actions",
            label: "Actions",
            headerClassName: "w-[8%] text-right",
            className: "text-right",
            cell: (c) => (
                <div className="flex items-center justify-end gap-1">
                    {c.is_sensitive && (
                        <ShieldAlert
                            className="h-3.5 w-3.5 text-rose-500"
                            aria-label="Sensitive case"
                        />
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => handleView(c)}
                        title="View case"
                    >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="sr-only">View</span>
                    </Button>
                </div>
            ),
        },
    ];

    const resolvedEmptyAction =
        emptyAction ??
        (rows.length === 0 && casesCount > 0 ? (
            <Button variant="outline" size="sm" asChild>
                <a href={`/gbv-cases?survivor_id=${survivorId}`}>
                    Open case register
                </a>
            </Button>
        ) : undefined);

    return (
        <DataTable<SurvivorCase, CasesTabFilters>
            paginator={paginator}
            filters={filters}
            columns={columns}
            routeName="survivors.show"
            rowKey={(c) => c.id}
            searchPlaceholder="Search cases by number, type, status, priority…"
            emptyIcon={FolderClosed}
            emptyTitle="No cases linked"
            emptyDescription={
                casesCount > 0
                    ? `The survivor has ${casesCount} case${casesCount === 1 ? "" : "s"} recorded, but case-level data isn't loaded here.`
                    : "This survivor has no GBV cases yet."
            }
            emptyAction={resolvedEmptyAction}
            defaultSort="created_at"
            defaultDir="desc"
            showFilters
            onChange={handleFilterChange}
            onPageChange={setPage}
        />
    );
}
