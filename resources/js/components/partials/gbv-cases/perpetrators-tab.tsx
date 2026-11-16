import { router } from "@inertiajs/react";
import { Pencil, Plus, Trash2, UserX, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AddPerpetratorDialog } from "@/components/modals/perpetrator-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table";
import { formatDate } from "@/lib/formatters";
import { buildLocalPaginator } from "@/lib/local-paginator";

import type {
    Column,
    DataTableFilters,
    GbvCaseShowProps,
    Perpetrator,
} from "@/types";

interface Props {
    caseId: number;
    perpetrators: Perpetrator[];
    can: GbvCaseShowProps["can"];
}

interface PerpetratorsTabFilters {
    search: string;
    sort: string;
    dir: "asc" | "desc";
    per_page: number;
    [key: string]: string | number | boolean | undefined;
}

const DEFAULT_FILTERS: PerpetratorsTabFilters = {
    search: "",
    sort: "created_at",
    dir: "desc",
    per_page: 10,
};

function displayName(p: Perpetrator): string {
    if (p.name && p.name.trim()) return p.name;
    if (p.name_known === false) return "Unknown perpetrator";
    return "Unnamed perpetrator";
}

function relationshipLabel(p: Perpetrator): string {
    if (p.relationship_option?.name) return p.relationship_option.name;
    if (p.relationship_details) return p.relationship_details;
    return "—";
}

export function CasePerpetratorsTab({ caseId, perpetrators, can }: Props) {
    const [filters, setFilters] =
        useState<PerpetratorsTabFilters>(DEFAULT_FILTERS);
    const [page, setPage] = useState(1);

    // ---- Delete state ----
    const [pendingDelete, setPendingDelete] = useState<Perpetrator | null>(
        null,
    );
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const isDeleting = deletingId !== null;

    // ---- Filter + sort ----
    const filtered = useMemo(() => {
        const term = filters.search.trim().toLowerCase();
        let result = perpetrators;

        if (term) {
            result = result.filter(
                (p) =>
                    (p.name ?? "").toLowerCase().includes(term) ||
                    (p.relationship_option?.name ?? "")
                        .toLowerCase()
                        .includes(term) ||
                    (p.relationship_details ?? "")
                        .toLowerCase()
                        .includes(term) ||
                    (p.age_range?.name ?? "").toLowerCase().includes(term) ||
                    (p.gender_option?.name ?? "")
                        .toLowerCase()
                        .includes(term) ||
                    (p.additional_info ?? "").toLowerCase().includes(term),
            );
        }

        const key = filters.sort as keyof Perpetrator;
        const sorted = [...result].sort((a, b) => {
            const av = a[key];
            const bv = b[key];
            if (typeof av === "number" && typeof bv === "number")
                return av - bv;
            return String(av ?? "").localeCompare(String(bv ?? ""));
        });
        return filters.dir === "desc" ? sorted.reverse() : sorted;
    }, [perpetrators, filters.search, filters.sort, filters.dir]);

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
            const narrowed = patch as Partial<PerpetratorsTabFilters>;
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

    // ---- Delete flow ----
    const requestDelete = useCallback((p: Perpetrator) => {
        setPendingDelete(p);
    }, []);

    const confirmDelete = useCallback(() => {
        const p = pendingDelete;
        if (!p) return;

        setDeletingId(p.id);
        router.delete(
            route("gbv-cases.perpetrators.destroy", {
                gbvCase: caseId,
                perpetrator: p.id,
            }),
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success(`"${displayName(p)}" removed`);
                    setPendingDelete(null);
                },
                onError: () => {
                    toast.error(
                        "Could not delete perpetrator. Please try again.",
                    );
                },
                onFinish: () => setDeletingId(null),
            },
        );
    }, [pendingDelete, caseId]);

    // ---- Columns ----
    const columns: Column<Perpetrator>[] = [
        {
            key: "name",
            label: "Name",
            icon: Users,
            sortable: true,
            headerClassName: "w-[28%]",
            cell: (p) => (
                <div className="min-w-0">
                    <p className="truncate font-medium">{displayName(p)}</p>
                    {p.additional_info ? (
                        <p className="truncate text-xs text-muted-foreground">
                            {p.additional_info}
                        </p>
                    ) : null}
                </div>
            ),
        },
        {
            key: "relationship_option",
            label: "Relationship",
            headerClassName: "w-[18%]",
            cell: (p) => (
                <span className="truncate">{relationshipLabel(p)}</span>
            ),
        },
        {
            key: "gender_option",
            label: "Gender",
            headerClassName: "w-[10%]",
            cell: (p) => p.gender_option?.name ?? "—",
        },
        {
            key: "age_range",
            label: "Age range",
            headerClassName: "w-[12%]",
            cell: (p) => p.age_range?.name ?? "—",
        },
        {
            key: "is_repeat_offender",
            label: "Repeat offender",
            headerClassName: "w-[14%]",
            cell: (p) =>
                p.is_repeat_offender ? (
                    <Badge className="rounded-full border-none bg-amber-600 px-2 py-0.5 text-xs font-semibold text-white hover:bg-amber-600/90">
                        Yes
                        {p.previous_incidents_count > 0
                            ? ` · ${p.previous_incidents_count}`
                            : ""}
                    </Badge>
                ) : (
                    <Badge
                        variant="outline"
                        className="rounded-full px-2 py-0.5 text-xs font-medium"
                    >
                        No
                    </Badge>
                ),
        },
        {
            key: "created_at",
            label: "Added",
            sortable: true,
            headerClassName: "w-[10%] text-right",
            className: "text-right",
            cell: (p) => (
                <span className="text-xs text-muted-foreground">
                    {p.created_at ? formatDate(p.created_at) : "—"}
                </span>
            ),
        },
        {
            key: "actions",
            label: "",
            headerClassName: "w-[8%] text-right",
            className: "text-right",
            cell: (p) => (
                <div className="flex items-center justify-end gap-1">
                    {can.update && (
                        <>
                            <AddPerpetratorDialog
                                caseId={caseId}
                                perpetrator={p}
                                trigger={
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        title="Edit"
                                        aria-label={`Edit ${displayName(p)}`}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                }
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-rose-600 hover:text-rose-700"
                                title="Delete"
                                aria-label={`Delete ${displayName(p)}`}
                                onClick={() => requestDelete(p)}
                                disabled={deletingId === p.id}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                    {perpetrators.length} perpetrator
                    {perpetrators.length === 1 ? "" : "s"}
                </p>
                {can.update && (
                    <AddPerpetratorDialog
                        caseId={caseId}
                        trigger={
                            <Button size="sm">
                                <Plus className="mr-1.5 h-4 w-4" />
                                Add perpetrator
                            </Button>
                        }
                    />
                )}
            </div>

            <DataTable<Perpetrator, PerpetratorsTabFilters>
                paginator={paginator}
                filters={filters}
                columns={columns}
                routeName="gbv-cases.show"
                rowKey={(p) => p.id}
                searchPlaceholder="Search by name, relationship, or gender…"
                emptyIcon={UserX}
                emptyTitle="No perpetrators recorded"
                emptyDescription="No perpetrator information has been recorded for this case."
                emptyAction={
                    can.update ? (
                        <AddPerpetratorDialog
                            caseId={caseId}
                            trigger={
                                <Button size="sm">
                                    <Plus className="mr-1.5 h-4 w-4" />
                                    Add first perpetrator
                                </Button>
                            }
                        />
                    ) : undefined
                }
                defaultSort="created_at"
                defaultDir="desc"
                showFilters
                onChange={handleFilterChange}
                onPageChange={setPage}
            />

            {/* ---- Inline delete confirmation ---- */}
            <Dialog
                open={pendingDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) setPendingDelete(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete perpetrator?</DialogTitle>
                        <DialogDescription>
                            {pendingDelete
                                ? `"${displayName(pendingDelete)}" will be permanently removed from this case. This cannot be undone.`
                                : ""}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setPendingDelete(null)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting…" : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
