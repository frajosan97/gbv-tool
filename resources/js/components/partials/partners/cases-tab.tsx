import { FileText, FolderClosed } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table";
import { formatDate } from "@/lib/formatters";
import { buildLocalPaginator } from "@/lib/local-paginator";

import type { Column, DataTableFilters, Partner } from "@/types";

type PartnerCase = NonNullable<Partner["gbv_cases"]>[number];

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
    (a: PartnerCase, b: PartnerCase) => number
> = {
    case_number: (a, b) =>
        (a.case_number ?? "").localeCompare(b.case_number ?? ""),
    status: (a, b) => (a.status ?? "").localeCompare(b.status ?? ""),
    created_at: (a, b) =>
        (a.created_at ?? "").localeCompare(b.created_at ?? ""),
};

interface Props {
    cases: PartnerCase[];
    emptyAction?: React.ReactNode;
}

export function CasesTab({ cases, emptyAction }: Props) {
    const [filters, setFilters] = useState<CasesTabFilters>(DEFAULT_FILTERS);
    const [page, setPage] = useState(1);

    // ---- Client-side filter + sort ----
    const filtered = useMemo(() => {
        const term = filters.search.trim().toLowerCase();
        let rows = cases;

        if (term !== "") {
            rows = rows.filter(
                (c) =>
                    (c.case_number ?? "").toLowerCase().includes(term) ||
                    (c.status ?? "").toLowerCase().includes(term),
            );
        }

        const comparator =
            ALLOWED_SORTS[filters.sort] ?? ALLOWED_SORTS.created_at;
        const sorted = [...rows].sort(comparator);
        return filters.dir === "desc" ? sorted.reverse() : sorted;
    }, [cases, filters.search, filters.sort, filters.dir]);

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

    // ---- Columns ----
    const columns: Column<PartnerCase>[] = [
        {
            key: "case_number",
            label: "Case No.",
            icon: FileText,
            sortable: true,
            headerClassName: "w-[40%]",
            cell: (c) => (
                <span className="font-mono text-xs">
                    {c.case_number ?? `#${c.id}`}
                </span>
            ),
        },
        {
            key: "status",
            label: "Status",
            sortable: true,
            headerClassName: "w-[30%]",
            cell: (c) => (
                <Badge variant="outline" className="capitalize">
                    {c.status ?? "—"}
                </Badge>
            ),
        },
        {
            key: "created_at",
            label: "Opened",
            sortable: true,
            headerClassName: "w-[30%] text-right",
            className: "text-right",
            cell: (c) => (
                <span className="text-muted-foreground">
                    {c.created_at ? formatDate(c.created_at) : "—"}
                </span>
            ),
        },
    ];

    return (
        <DataTable<PartnerCase, CasesTabFilters>
            paginator={paginator}
            filters={filters}
            columns={columns}
            routeName="partners.show" // unused — client-side mode
            rowKey={(c) => c.id}
            searchPlaceholder="Search cases…"
            emptyIcon={FolderClosed}
            emptyTitle="No cases yet"
            emptyDescription="This partner has not opened any GBV cases."
            emptyAction={emptyAction}
            defaultSort="created_at"
            defaultDir="desc"
            showFilters
            onChange={handleFilterChange}
            onPageChange={setPage}
        />
    );
}
