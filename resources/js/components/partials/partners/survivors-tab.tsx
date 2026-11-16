import { UserRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { formatDate } from "@/lib/formatters";
import { buildLocalPaginator } from "@/lib/local-paginator";

import type { Column, DataTableFilters, Partner } from "@/types";

type PartnerSurvivor = NonNullable<Partner["survivors"]>[number];

interface SurvivorsTabFilters {
    search: string;
    sort: string;
    dir: "asc" | "desc";
    per_page: number;
    [key: string]: string | number | boolean | undefined;
}

const DEFAULT_FILTERS: SurvivorsTabFilters = {
    search: "",
    sort: "created_at",
    dir: "desc",
    per_page: 10,
};

const ALLOWED_SORTS: Record<
    string,
    (a: PartnerSurvivor, b: PartnerSurvivor) => number
> = {
    full_name: (a, b) => {
        const an = a.anonymous ? "anonymous survivor" : (a.full_name ?? "");
        const bn = b.anonymous ? "anonymous survivor" : (b.full_name ?? "");
        return an.localeCompare(bn);
    },
    unique_code: (a, b) => a.unique_code.localeCompare(b.unique_code),
    status: (a, b) => (a.status ?? "").localeCompare(b.status ?? ""),
    created_at: (a, b) =>
        (a.created_at ?? "").localeCompare(b.created_at ?? ""),
};

interface Props {
    survivors: PartnerSurvivor[];
    emptyAction?: React.ReactNode;
}

export function SurvivorsTab({ survivors, emptyAction }: Props) {
    const [filters, setFilters] =
        useState<SurvivorsTabFilters>(DEFAULT_FILTERS);
    const [page, setPage] = useState(1);

    // ---- Client-side filter + sort ----
    const filtered = useMemo(() => {
        const term = filters.search.trim().toLowerCase();
        let rows = survivors;

        if (term !== "") {
            rows = rows.filter((s) => {
                const display = s.anonymous
                    ? "anonymous survivor"
                    : (s.full_name ?? "").toLowerCase();
                return (
                    display.includes(term) ||
                    s.unique_code.toLowerCase().includes(term) ||
                    (s.status ?? "").toLowerCase().includes(term)
                );
            });
        }

        const comparator =
            ALLOWED_SORTS[filters.sort] ?? ALLOWED_SORTS.created_at;
        const sorted = [...rows].sort(comparator);
        return filters.dir === "desc" ? sorted.reverse() : sorted;
    }, [survivors, filters.search, filters.sort, filters.dir]);

    // ---- Clamp page when results shrink ----
    const lastPage = Math.max(
        1,
        Math.ceil(filtered.length / Math.max(1, filters.per_page)),
    );
    useEffect(() => {
        if (page > lastPage) setPage(lastPage);
    }, [page, lastPage]);

    // ---- Client-side paginator ----
    const paginator = useMemo(
        () => buildLocalPaginator(filtered, page, filters.per_page),
        [filtered, page, filters.per_page],
    );

    // ---- Filter change handler ----
    const handleFilterChange = useCallback(
        (patch: Partial<DataTableFilters> & Record<string, unknown>) => {
            const narrowed = patch as Partial<SurvivorsTabFilters>;

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

    // ---- Columns ----
    const columns: Column<PartnerSurvivor>[] = [
        {
            key: "full_name",
            label: "Survivor",
            icon: UserRound,
            sortable: true,
            headerClassName: "w-[40%]",
            cell: (s) => {
                const displayName = s.anonymous
                    ? "Anonymous survivor"
                    : (s.full_name ?? s.unique_code);
                return (
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <span className="truncate font-medium">
                                {displayName}
                            </span>
                            {s.anonymous && (
                                <Badge
                                    variant="outline"
                                    className="border-0 bg-violet-100 text-[10px] text-violet-800 dark:bg-violet-900/30 dark:text-violet-300"
                                >
                                    Anon
                                </Badge>
                            )}
                        </div>
                        <span className="truncate font-mono text-xs text-muted-foreground">
                            {s.unique_code}
                        </span>
                    </div>
                );
            },
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            headerClassName: "w-[20%]",
            cell: (s) => (
                <Badge variant="outline" className="capitalize">
                    {s.status ?? "—"}
                </Badge>
            ),
        },
        {
            key: "created_at",
            label: "Registered",
            sortable: true,
            headerClassName: "w-[25%] text-right",
            className: "text-right",
            cell: (s) => (
                <span className="text-muted-foreground">
                    {s.created_at ? formatDate(s.created_at) : "—"}
                </span>
            ),
        },
        {
            key: "unique_code",
            label: "Code",
            sortable: true,
            headerClassName: "hidden w-[15%]",
            className: "hidden",
            cell: (s) => (
                <span className="font-mono text-xs text-muted-foreground">
                    {s.unique_code}
                </span>
            ),
        },
    ];

    return (
        <DataTable<PartnerSurvivor, SurvivorsTabFilters>
            paginator={paginator}
            filters={filters}
            columns={columns}
            routeName="partners.show" // unused — client-side mode
            rowKey={(s) => s.id}
            searchPlaceholder="Search survivors…"
            emptyIcon={UserRound}
            emptyTitle="No survivors registered"
            emptyDescription="This partner has no registered survivors yet."
            emptyAction={emptyAction}
            defaultSort="created_at"
            defaultDir="desc"
            showFilters
            onChange={handleFilterChange}
            onPageChange={setPage}
        />
    );
}
