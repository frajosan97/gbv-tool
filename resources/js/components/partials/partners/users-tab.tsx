import { Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { DataTable } from "@/components/data-table";
import { formatDate } from "@/lib/formatters";
import { buildLocalPaginator } from "@/lib/local-paginator";

import type { Column, DataTableFilters, PartnerUser } from "@/types";

interface UsersTabFilters {
    search: string;
    sort: string;
    dir: "asc" | "desc";
    per_page: number;
    [key: string]: string | number | boolean | undefined;
}

const DEFAULT_FILTERS: UsersTabFilters = {
    search: "",
    sort: "name",
    dir: "asc",
    per_page: 10,
};

const ALLOWED_SORTS: Record<
    string,
    (a: PartnerUser, b: PartnerUser) => number
> = {
    name: (a, b) => a.name.localeCompare(b.name),
    email: (a, b) => (a.email ?? "").localeCompare(b.email ?? ""),
    created_at: (a, b) =>
        (a.created_at ?? "").localeCompare(b.created_at ?? ""),
};

interface Props {
    users: PartnerUser[];
    emptyAction?: React.ReactNode;
}

export function UsersTab({ users, emptyAction }: Props) {
    const [filters, setFilters] = useState<UsersTabFilters>(DEFAULT_FILTERS);
    const [page, setPage] = useState(1);

    // ---- Client-side filter + sort ----
    const filtered = useMemo(() => {
        const term = filters.search.trim().toLowerCase();
        let rows = users;

        if (term !== "") {
            rows = rows.filter(
                (u) =>
                    u.name.toLowerCase().includes(term) ||
                    (u.email ?? "").toLowerCase().includes(term) ||
                    (u.phone ?? "").toLowerCase().includes(term),
            );
        }

        const comparator = ALLOWED_SORTS[filters.sort] ?? ALLOWED_SORTS.name;
        const sorted = [...rows].sort(comparator);
        return filters.dir === "desc" ? sorted.reverse() : sorted;
    }, [users, filters.search, filters.sort, filters.dir]);

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
            const narrowed = patch as Partial<UsersTabFilters>;

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
    const columns: Column<PartnerUser>[] = [
        {
            key: "name",
            label: "Name",
            icon: Users,
            sortable: true,
            headerClassName: "w-[35%]",
            cell: (u) => (
                <span className="font-medium text-foreground">{u.name}</span>
            ),
        },
        {
            key: "email",
            label: "Email",
            sortable: true,
            headerClassName: "w-[30%]",
            cell: (u) => (
                <span className="text-muted-foreground">{u.email ?? "—"}</span>
            ),
        },
        {
            key: "phone",
            label: "Phone",
            headerClassName: "w-[20%]",
            cell: (u) => (
                <span className="text-muted-foreground">{u.phone ?? "—"}</span>
            ),
        },
        {
            key: "created_at",
            label: "Joined",
            sortable: true,
            headerClassName: "w-[15%] text-right",
            className: "text-right",
            cell: (u) => (
                <span className="text-muted-foreground">
                    {u.created_at ? formatDate(u.created_at) : "—"}
                </span>
            ),
        },
    ];

    return (
        <DataTable<PartnerUser, UsersTabFilters>
            paginator={paginator}
            filters={filters}
            columns={columns}
            routeName="partners.show" // unused — client-side mode
            rowKey={(u) => u.id}
            searchPlaceholder="Search users…"
            emptyIcon={Users}
            emptyTitle="No users attached"
            emptyDescription="This partner has no users yet."
            emptyAction={emptyAction}
            defaultSort="name"
            defaultDir="asc"
            showFilters
            onChange={handleFilterChange}
            onPageChange={setPage}
        />
    );
}
