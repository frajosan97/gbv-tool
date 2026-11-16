import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Paginator } from "./paginator";

export interface DataTableFilters {
    search: string;
    sort: string;
    dir: "asc" | "desc";
    per_page?: number;
    [key: string]: string | number | boolean | undefined;
}

export interface Column<T> {
    key: string;
    label: string;
    icon?: LucideIcon;
    sortable?: boolean;
    headerClassName?: string;
    className?: string;
    cell: (row: T) => ReactNode;
}

export interface DataTableProps<
    T,
    F extends DataTableFilters = DataTableFilters,
> {
    paginator: Paginator<T>;
    filters: F;
    columns: Column<T>[];
    routeName: string;
    routeParams?: Record<string, string | number>;
    rowKey: (row: T) => string | number;
    searchPlaceholder?: string;
    toolbar?: ReactNode;
    actions?: (row: T) => ReactNode;
    emptyIcon?: LucideIcon;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyAction?: ReactNode;
    pageSizeOptions?: number[];
    extraParams?: Record<string, unknown>;
    showFilters?: boolean;
    defaultSort?: string;
    defaultDir?: "asc" | "desc";

    // Client-side mode
    onChange?: (patch: Partial<DataTableFilters> & Record<string, unknown>) => void;
    onPageChange?: (page: number) => void;
}