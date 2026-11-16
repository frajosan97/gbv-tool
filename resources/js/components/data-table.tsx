import { useCallback, useEffect, useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import type { DataTableFilters, DataTableProps } from "@/types";
import { EmptyState } from "./ui/empty-state";

const easeOut = [0.16, 1, 0.3, 1] as const;

// ---------- helpers ----------

function decodeLabel(label: string): string {
    return label
        .replace(/&laquo;/g, "«")
        .replace(/&raquo;/g, "»")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
}

function compactParams(
    obj: Record<string, unknown>,
): Record<string, string | number | boolean> {
    const out: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (value === undefined || value === null || value === "") continue;
        out[key] = value as string | number | boolean;
    }
    return out;
}

function buildPageRange(current: number, last: number): (number | "…")[] {
    if (last <= 1) return [1];
    const delta = 1;
    const start = Math.max(2, current - delta);
    const end = Math.min(last - 1, current + delta);
    const range: (number | "…")[] = [1];

    if (start > 2) range.push("…");
    for (let i = start; i <= end; i++) range.push(i);
    if (end < last - 1) range.push("…");
    range.push(last);
    return range;
}

// ---------- component ----------

export function DataTable<T, F extends DataTableFilters = DataTableFilters>({
    paginator,
    filters,
    columns,
    routeName,
    routeParams = {},
    rowKey,
    searchPlaceholder = "Search…",
    toolbar,
    actions,
    emptyIcon = Search,
    emptyTitle = "No results found",
    emptyDescription = "Try adjusting your filters.",
    emptyAction,
    pageSizeOptions = [10, 25, 50, 100],
    extraParams = {},
    showFilters = true,
    defaultSort = "order_number",
    defaultDir = "asc",
    // ---------- Client-side mode (new) ----------
    onChange,
    onPageChange,
}: DataTableProps<T, F>) {
    const [search, setSearch] = useState<string>(filters.search);
    const [processing, setProcessing] = useState(false);

    // Sync local search box with parent state
    useEffect(() => {
        setSearch(filters.search);
    }, [filters.search]);

    const stableRouteParams = useMemo(() => routeParams, [routeParams]);
    const stableExtraParams = useMemo(() => extraParams, [extraParams]);

    // ---------- Filter changes ----------
    const applyFilters = useCallback(
        (
            overrides: Partial<DataTableFilters> & Record<string, unknown> = {},
        ) => {
            // Client-side mode: forward the patch, no network request.
            if (onChange) {
                onChange(overrides);
                return;
            }

            const payload = compactParams({
                ...filters,
                ...stableExtraParams,
                ...overrides,
                search,
            });

            router.get(route(routeName, stableRouteParams), payload, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onStart: () => setProcessing(true),
                onFinish: () => setProcessing(false),
            });
        },
        [
            filters,
            search,
            routeName,
            stableRouteParams,
            stableExtraParams,
            onChange,
        ],
    );

    // Debounced search
    useEffect(() => {
        if (search === filters.search) return;
        const t = setTimeout(() => applyFilters({ search }), 300);
        return () => clearTimeout(t);
    }, [search, filters.search, applyFilters]);

    const toggleSort = useCallback(
        (column: string) => {
            if (filters.sort === column) {
                applyFilters({
                    dir: filters.dir === "asc" ? "desc" : "asc",
                });
            } else {
                applyFilters({ sort: column, dir: "asc" });
            }
        },
        [filters.sort, filters.dir, applyFilters],
    );

    const hasFilters = useMemo(
        () =>
            filters.search !== "" ||
            filters.sort !== defaultSort ||
            filters.dir !== defaultDir,
        [filters.search, filters.sort, filters.dir, defaultSort, defaultDir],
    );

    const isEmpty = !processing && paginator.data.length === 0;
    const perPage = Number(filters.per_page) || pageSizeOptions[0];

    const pageLinks = useMemo(
        () => buildPageRange(paginator.current_page, paginator.last_page),
        [paginator.current_page, paginator.last_page],
    );

    const paginationLinks = useMemo(() => {
        const links = paginator.links;
        const find = (needle: string) =>
            links.find((l) =>
                decodeLabel(l.label).toLowerCase().includes(needle),
            );
        return {
            first: links[0]?.url ?? null,
            last: links[links.length - 1]?.url ?? null,
            prev: find("previous")?.url ?? null,
            next: find("next")?.url ?? null,
        };
    }, [paginator.links]);

    // ---------- Navigation ----------
    const goToUrl = useCallback((url: string | null) => {
        if (!url) return;
        router.get(url, {}, { preserveScroll: true });
    }, []);

    const goToPage = useCallback(
        (page: number | "…") => {
            if (page === "…") return;

            // Client-side mode: forward the page number.
            if (onPageChange) {
                onPageChange(page);
                return;
            }

            if (page === paginator.current_page) return;
            const link = paginator.links.find(
                (l) => decodeLabel(l.label) === String(page),
            );
            if (link?.url) goToUrl(link.url);
        },
        [onPageChange, paginator.current_page, paginator.links, goToUrl],
    );

    // ---------- Clear filters ----------
    const clearFilters = useCallback(() => {
        setSearch("");

        // Client-side mode: reset via parent.
        if (onChange) {
            onChange({
                search: "",
                sort: defaultSort,
                dir: defaultDir,
                per_page: perPage,
            });
            if (onPageChange) onPageChange(1);
            return;
        }

        router.get(
            route(routeName, stableRouteParams),
            compactParams({ ...stableExtraParams }),
            { preserveScroll: true, replace: true },
        );
    }, [
        onChange,
        onPageChange,
        defaultSort,
        defaultDir,
        perPage,
        routeName,
        stableRouteParams,
        stableExtraParams,
    ]);

    // ---------- Per-page change ----------
    const handlePerPageChange = useCallback(
        (v: string) => {
            applyFilters({ per_page: Number(v) });
            if (onPageChange) onPageChange(1);
        },
        [applyFilters, onPageChange],
    );

    return (
        <div className="space-y-5">
            {/* ---------- Unified toolbar ---------- */}
            {showFilters && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3 shadow-sm">
                    <div className="relative w-full sm:w-72">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9 border-border bg-muted/50 pl-9 focus-visible:bg-background"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                aria-label="Clear search"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {toolbar}

                    <AnimatePresence>
                        {hasFilters && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearFilters}
                                    className="h-9 text-muted-foreground"
                                >
                                    <X className="mr-1.5 h-3.5 w-3.5" />
                                    Clear
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            {/* ---------- Table ---------- */}
            <div className="relative w-full min-w-0 overflow-hidden rounded-xl border bg-card shadow-sm">
                {processing && (
                    <div className="absolute inset-x-0 top-0 z-10 h-0.5 overflow-hidden bg-muted">
                        <motion.div
                            className="h-full w-1/3 bg-primary"
                            animate={{ x: ["-100%", "300%"] }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        />
                    </div>
                )}

                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow className="border-b bg-muted/50 hover:bg-muted/50">
                            {columns.map((col) => {
                                const Icon = col.icon;
                                const isSorted = filters.sort === col.key;
                                const ariaSort = isSorted
                                    ? filters.dir === "asc"
                                        ? "ascending"
                                        : "descending"
                                    : "none";

                                return (
                                    <TableHead
                                        key={col.key}
                                        className={col.headerClassName}
                                        aria-sort={
                                            col.sortable ? ariaSort : undefined
                                        }
                                    >
                                        {col.sortable ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleSort(col.key)
                                                }
                                                className="group inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
                                            >
                                                {Icon && (
                                                    <Icon
                                                        className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-foreground"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                {col.label}
                                                <span
                                                    className={cn(
                                                        "inline-flex transition-opacity",
                                                        isSorted
                                                            ? "opacity-100"
                                                            : "opacity-0 group-hover:opacity-50",
                                                    )}
                                                    aria-hidden="true"
                                                >
                                                    {!isSorted && (
                                                        <ArrowUpDown className="h-3 w-3" />
                                                    )}
                                                    {isSorted &&
                                                        filters.dir ===
                                                            "asc" && (
                                                            <ArrowUp className="h-3 w-3 text-primary" />
                                                        )}
                                                    {isSorted &&
                                                        filters.dir ===
                                                            "desc" && (
                                                            <ArrowDown className="h-3 w-3 text-primary" />
                                                        )}
                                                </span>
                                            </button>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                                {Icon && (
                                                    <Icon
                                                        className="h-3.5 w-3.5"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                {col.label}
                                            </span>
                                        )}
                                    </TableHead>
                                );
                            })}

                            {actions && (
                                <TableHead className="w-[15%] text-right">
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>

                    <TableBody
                        className={cn(
                            "transition-opacity",
                            processing && "pointer-events-none opacity-60",
                        )}
                    >
                        <AnimatePresence mode="popLayout">
                            {isEmpty && (
                                <TableRow>
                                    <TableCell
                                        colSpan={
                                            columns.length + (actions ? 1 : 0)
                                        }
                                        className="p-0"
                                    >
                                        <EmptyState
                                            icon={emptyIcon}
                                            title={emptyTitle}
                                            description={emptyDescription}
                                            action={emptyAction}
                                        />
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isEmpty &&
                                paginator.data.map((row, idx) => (
                                    <motion.tr
                                        key={rowKey(row)}
                                        layout
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{
                                            duration: 0.25,
                                            delay: Math.min(idx * 0.015, 0.3),
                                            ease: easeOut,
                                        }}
                                        className="group h-16 border-b transition-colors hover:bg-muted/50"
                                    >
                                        {columns.map((col) => (
                                            <TableCell
                                                key={col.key}
                                                className={col.className}
                                            >
                                                {col.cell(row)}
                                            </TableCell>
                                        ))}
                                        {actions && (
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-0.5 opacity-60 transition-opacity group-hover:opacity-100">
                                                    {actions(row)}
                                                </div>
                                            </TableCell>
                                        )}
                                    </motion.tr>
                                ))}
                        </AnimatePresence>
                    </TableBody>
                </Table>

                {/* ---------- Footer ---------- */}
                <div className="flex flex-col gap-3 border-t bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {showFilters && (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs">
                                        Rows per page
                                    </span>
                                    <Select
                                        value={String(perPage)}
                                        onValueChange={handlePerPageChange}
                                    >
                                        <SelectTrigger className="h-8 w-[72px] border-border bg-background text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pageSizeOptions.map((n) => (
                                                <SelectItem
                                                    key={n}
                                                    value={String(n)}
                                                    className="text-xs"
                                                >
                                                    {n}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <span className="hidden text-xs text-muted-foreground sm:inline">
                                    •
                                </span>
                            </>
                        )}
                        <span className="text-xs">
                            Showing{" "}
                            <span className="font-semibold text-foreground">
                                {paginator.from ?? 0}
                            </span>{" "}
                            to{" "}
                            <span className="font-semibold text-foreground">
                                {paginator.to ?? 0}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-foreground">
                                {paginator.total}
                            </span>{" "}
                            results
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={paginator.current_page === 1}
                            onClick={() =>
                                onPageChange
                                    ? onPageChange(1)
                                    : goToUrl(paginationLinks.first)
                            }
                            aria-label="First page"
                        >
                            <ChevronsLeft className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={paginator.current_page === 1}
                            onClick={() =>
                                onPageChange
                                    ? onPageChange(paginator.current_page - 1)
                                    : goToUrl(paginationLinks.prev)
                            }
                            aria-label="Previous page"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </Button>

                        {pageLinks.map((page, i) =>
                            page === "…" ? (
                                <span
                                    key={`ellipsis-${i}`}
                                    className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground"
                                >
                                    …
                                </span>
                            ) : (
                                <motion.button
                                    key={page}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => goToPage(page)}
                                    className={cn(
                                        "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs font-medium transition-colors",
                                        page === paginator.current_page
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-foreground hover:bg-muted",
                                    )}
                                    aria-current={
                                        page === paginator.current_page
                                            ? "page"
                                            : undefined
                                    }
                                >
                                    {page}
                                </motion.button>
                            ),
                        )}

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={
                                paginator.current_page === paginator.last_page
                            }
                            onClick={() =>
                                onPageChange
                                    ? onPageChange(paginator.current_page + 1)
                                    : goToUrl(paginationLinks.next)
                            }
                            aria-label="Next page"
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={
                                paginator.current_page === paginator.last_page
                            }
                            onClick={() =>
                                onPageChange
                                    ? onPageChange(paginator.last_page)
                                    : goToUrl(paginationLinks.last)
                            }
                            aria-label="Last page"
                        >
                            <ChevronsRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
