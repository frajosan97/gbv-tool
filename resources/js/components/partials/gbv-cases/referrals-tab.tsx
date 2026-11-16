import { router } from "@inertiajs/react";
import {
    Building2,
    CheckCircle2,
    MessageSquare,
    Pencil,
    Plus,
    Send,
    Trash2,
    XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ReferralDialog } from "@/components/modals/referral-dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAppData } from "@/hooks/use-app-data";
import { formatDate } from "@/lib/formatters";
import { buildLocalPaginator } from "@/lib/local-paginator";
import { cn } from "@/lib/utils";

import type {
    Column,
    DataTableFilters,
    GbvCaseShowProps,
    Referral,
    ReferralStatusValue,
} from "@/types";

interface Props {
    caseId: number;
    referrals: Referral[];
    can: GbvCaseShowProps["can"];
}

interface ReferralsTabFilters {
    search: string;
    sort: string;
    dir: "asc" | "desc";
    per_page: number;
    [key: string]: string | number | boolean | undefined;
}

const DEFAULT_FILTERS: ReferralsTabFilters = {
    search: "",
    sort: "created_at",
    dir: "desc",
    per_page: 10,
};

/* ---------- helpers ---------- */

function statusStyles(status: ReferralStatusValue | string | null): string {
    switch (status) {
        case "accepted":
        case "completed":
            return "border-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
        case "pending":
            return "border-0 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
        case "declined":
        case "cancelled":
            return "border-0 bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300";
        default:
            return "border-0 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
    }
}

function urgencyClasses(color?: string | null): string {
    switch (color) {
        case "danger":
            return "border-0 bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300";
        case "warning":
            return "border-0 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
        case "success":
            return "border-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
        case "primary":
            return "border-0 bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300";
        default:
            return "border-0 bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200";
    }
}

function statusLabel(status: ReferralStatusValue | string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function isClosed(status: ReferralStatusValue | string | null): boolean {
    return (
        status === "completed" ||
        status === "declined" ||
        status === "cancelled"
    );
}

/* ---------- component ---------- */

export function CaseReferralsTab({ caseId, referrals, can }: Props) {
    const { user } = useAppData();
    const [filters, setFilters] =
        useState<ReferralsTabFilters>(DEFAULT_FILTERS);
    const [page, setPage] = useState(1);

    const [pendingDelete, setPendingDelete] = useState<Referral | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const isDeleting = deletingId !== null;

    const [pendingTransition, setPendingTransition] = useState<{
        row: Referral;
        next: ReferralStatusValue;
        label: string;
    } | null>(null);
    const [transitioning, setTransitioning] = useState(false);

    // --- Feedback dialog state ---
    const [feedbackTarget, setFeedbackTarget] = useState<Referral | null>(null);

    /* ---------- filter + sort ---------- */

    const filtered = useMemo(() => {
        const term = filters.search.trim().toLowerCase();
        let result = referrals;
        if (term) {
            result = result.filter(
                (r) =>
                    (r.to_partner?.name ?? "").toLowerCase().includes(term) ||
                    (r.from_partner?.name ?? "").toLowerCase().includes(term) ||
                    (r.referral_type?.name ?? "")
                        .toLowerCase()
                        .includes(term) ||
                    (r.status ?? "").toLowerCase().includes(term) ||
                    (r.reason ?? "").toLowerCase().includes(term) ||
                    (r.referral_number ?? "").toLowerCase().includes(term),
            );
        }
        const sorted = [...result].sort((a, b) =>
            (a.created_at ?? "").localeCompare(b.created_at ?? ""),
        );
        return filters.dir === "desc" ? sorted.reverse() : sorted;
    }, [referrals, filters.search, filters.dir]);

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
            const narrowed = patch as Partial<ReferralsTabFilters>;
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

    /* ---------- receiver check ---------- */

    const isReceiverOf = useCallback(
        (r: Referral): boolean => {
            if (!user?.partner_id || !r.to_partner) return false;
            return Number(user.partner_id) === Number(r.to_partner.id);
        },
        [user?.partner_id],
    );

    /* ---------- transition flow ---------- */

    const requestTransition = useCallback(
        (row: Referral, next: ReferralStatusValue) => {
            const labels: Record<ReferralStatusValue, string> = {
                pending: "Referral reopened",
                accepted: "Referral accepted",
                declined: "Referral declined",
                completed: "Referral completed",
                cancelled: "Referral cancelled",
            };
            setPendingTransition({ row, next, label: labels[next] });
        },
        [],
    );

    const cancelTransition = useCallback(() => {
        if (transitioning) return;
        setPendingTransition(null);
    }, [transitioning]);

    const confirmTransition = useCallback(() => {
        const t = pendingTransition;
        if (!t) return;

        setTransitioning(true);
        router.put(
            route("gbv-cases.referrals.update", {
                gbvCase: caseId,
                referral: t.row.id,
            }),
            {
                to_partner_id: t.row.to_partner?.id ?? "",
                referral_type_id: t.row.referral_type?.id ?? "",
                urgency_option_id: t.row.urgency?.id ?? "",
                case_file_id: "",
                reason: t.row.reason ?? "",
                services_requested: t.row.services_requested ?? [],
                status: t.next,
                feedback: t.row.feedback ?? "",
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => toast.success(t.label),
                onError: () => toast.error("Could not update referral."),
                onFinish: () => {
                    setTransitioning(false);
                    setPendingTransition(null);
                },
            },
        );
    }, [pendingTransition, caseId]);

    /* ---------- delete flow ---------- */

    const requestDelete = useCallback((r: Referral) => setPendingDelete(r), []);

    const cancelDelete = useCallback(() => {
        if (isDeleting) return;
        setPendingDelete(null);
    }, [isDeleting]);

    const confirmDelete = useCallback(() => {
        const r = pendingDelete;
        if (!r) return;

        setDeletingId(r.id);
        router.delete(
            route("gbv-cases.referrals.destroy", {
                gbvCase: caseId,
                referral: r.id,
            }),
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success(`Referral "${r.referral_number}" deleted`);
                    setPendingDelete(null);
                },
                onError: () => toast.error("Could not delete referral."),
                onFinish: () => setDeletingId(null),
            },
        );
    }, [pendingDelete, caseId]);

    /* ---------- columns ---------- */

    const columns: Column<Referral>[] = [
        {
            key: "to_partner",
            label: "Partner",
            icon: Building2,
            sortable: true,
            // Removed fixed width -> auto
            cell: (r) => (
                <div className="min-w-0">
                    <p className="truncate font-medium">
                        {r.to_partner?.name ?? "—"}
                    </p>
                    {r.referral_number ? (
                        <p className="truncate text-xs text-muted-foreground">
                            {r.referral_number}
                        </p>
                    ) : null}
                </div>
            ),
        },
        {
            key: "referral_type",
            label: "Type",
            // Removed fixed width -> auto
            cell: (r) => r.referral_type?.name ?? "—",
        },
        {
            key: "urgency",
            label: "Urgency",
            className: "text-center",
            headerClassName: "text-center",
            cell: (r) =>
                r.urgency ? (
                    <Badge
                        variant="outline"
                        className={cn(
                            "capitalize",
                            urgencyClasses(r.urgency.color),
                        )}
                    >
                        {r.urgency.name}
                    </Badge>
                ) : (
                    "—"
                ),
        },
        {
            key: "status",
            label: "Status",
            className: "text-center",
            headerClassName: "text-center",
            cell: (r) => (
                <Badge
                    variant="outline"
                    className={cn("capitalize", statusStyles(r.status))}
                >
                    {statusLabel(r.status)}
                </Badge>
            ),
        },
        {
            key: "created_at",
            label: "Referred",
            sortable: true,
            className: "text-right whitespace-nowrap",
            headerClassName: "text-right",
            cell: (r) => (
                <span className="text-xs text-muted-foreground">
                    {r.created_at ? formatDate(r.created_at) : "—"}
                </span>
            ),
        },
        {
            key: "actions",
            label: "",
            className: "text-right w-[1%] whitespace-nowrap",
            headerClassName: "text-right",
            cell: (r) => {
                const receiver = isReceiverOf(r);
                const open = !isClosed(r.status);
                const isPending = r.status === "pending";
                const isAccepted = r.status === "accepted";

                return (
                    <div className="flex items-center justify-end gap-1">
                        {/* View Feedback — visible to anyone if feedback exists */}
                        {r.feedback && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-sky-600 hover:bg-sky-50 hover:text-sky-700"
                                title="View Feedback"
                                onClick={() => setFeedbackTarget(r)}
                            >
                                <MessageSquare className="h-3.5 w-3.5" />
                            </Button>
                        )}

                        {/* Accept / Decline — receiver, pending only */}
                        {can.update && receiver && isPending && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                    title="Accept"
                                    onClick={() =>
                                        requestTransition(r, "accepted")
                                    }
                                >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                                    title="Decline"
                                    onClick={() =>
                                        requestTransition(r, "declined")
                                    }
                                >
                                    <XCircle className="h-3.5 w-3.5" />
                                </Button>
                            </>
                        )}

                        {/* Complete — receiver, accepted only */}
                        {can.update && receiver && isAccepted && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                                title="Mark completed"
                                onClick={() =>
                                    requestTransition(r, "completed")
                                }
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                            </Button>
                        )}

                        {/* Edit — open referral, sender OR receiver */}
                        {can.update && open && (
                            <ReferralDialog
                                caseId={caseId}
                                referral={r}
                                trigger={
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        title="Edit"
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                }
                            />
                        )}

                        {/* Delete — creator only */}
                        {can.update &&
                            user?.id &&
                            r.created_by &&
                            Number(user.id) === Number(r.created_by.id) && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-rose-600 hover:text-rose-700"
                                    title="Delete"
                                    onClick={() => requestDelete(r)}
                                    disabled={deletingId === r.id}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            )}
                    </div>
                );
            },
        },
    ];

    /* ---------- render ---------- */

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                    {referrals.length} referral
                    {referrals.length === 1 ? "" : "s"}
                </p>
                {can.update && (
                    <ReferralDialog
                        caseId={caseId}
                        trigger={
                            <Button size="sm">
                                <Plus className="mr-1.5 h-4 w-4" />
                                New referral
                            </Button>
                        }
                    />
                )}
            </div>

            <DataTable<Referral, ReferralsTabFilters>
                paginator={paginator}
                filters={filters}
                columns={columns}
                routeName="gbv-cases.show"
                rowKey={(r) => r.id}
                searchPlaceholder="Search by partner, type, status, or reason…"
                emptyIcon={Send}
                emptyTitle="No referrals"
                emptyDescription="No referrals have been made for this case yet."
                emptyAction={
                    can.update ? (
                        <ReferralDialog
                            caseId={caseId}
                            trigger={
                                <Button size="sm">
                                    <Plus className="mr-1.5 h-4 w-4" />
                                    Create first referral
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

            {/* ---------- Feedback dialog ---------- */}
            <Dialog
                open={feedbackTarget !== null}
                onOpenChange={(open) => {
                    if (!open) setFeedbackTarget(null);
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Partner Feedback</DialogTitle>
                        <DialogDescription>
                            Feedback for referral{" "}
                            {feedbackTarget?.referral_number} to{" "}
                            {feedbackTarget?.to_partner?.name ?? "partner"}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-md border bg-muted/30 p-4 text-sm whitespace-pre-wrap">
                        {feedbackTarget?.feedback || "No feedback provided."}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setFeedbackTarget(null)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ---------- Transition confirmation ---------- */}
            <AlertDialog
                open={pendingTransition !== null}
                onOpenChange={(open) => {
                    if (!open) cancelTransition();
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Update referral status?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingTransition
                                ? `Referral "${pendingTransition.row.referral_number}" will be moved to ${pendingTransition.next}.`
                                : ""}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={transitioning}
                            onClick={cancelTransition}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={transitioning}
                            onClick={(e) => {
                                e.preventDefault();
                                confirmTransition();
                            }}
                        >
                            {transitioning ? "Updating…" : "Confirm"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ---------- Delete confirmation ---------- */}
            <AlertDialog
                open={pendingDelete !== null}
                onOpenChange={(open) => {
                    if (!open) cancelDelete();
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete referral?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingDelete
                                ? `Referral "${pendingDelete.referral_number}" will be permanently deleted. This cannot be undone.`
                                : ""}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={isDeleting}
                            onClick={cancelDelete}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isDeleting}
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
