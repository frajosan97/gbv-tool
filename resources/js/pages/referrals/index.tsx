import { Head, Link, router } from "@inertiajs/react";
import {
    Building2,
    CheckCircle2,
    FileText,
    Inbox,
    MessageSquare,
    Pencil,
    Send,
    XCircle,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { useAppData } from "@/hooks/use-app-data";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";

import { index as referralsRoute } from "@/routes/referrals";

import type {
    Column,
    Referral,
    ReferralIndexFilters,
    ReferralListItem,
    ReferralStatusValue,
    ReferralsIndexProps,
} from "@/types";

/* ---------- constants ---------- */

const STATUS_FILTER_OPTIONS = [
    { value: "all", label: "All statuses" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "declined", label: "Declined" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

type Transition = {
    row: ReferralListItem;
    next: ReferralStatusValue;
    label: string;
    title: string;
    description: string;
    confirmLabel: string;
    confirmClass: string;
};

/* ---------- helpers ---------- */

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

function statusLabel(status: ReferralStatusValue | string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
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

/** Widens the slim inbox shape into the full Referral shape for the dialog */
function toDialogReferral(r: ReferralListItem): Referral {
    return {
        id: r.id,
        referral_number: r.referral_number,
        referral_type: r.referral_type,
        urgency: r.urgency,
        from_partner: r.from_partner,
        to_partner: r.to_partner,
        case_file: null,
        reason: r.reason,
        services_requested: r.services_requested,
        status: r.status,
        accepted_at: r.accepted_at,
        completed_at: r.completed_at,
        feedback: r.feedback,
        created_by: r.created_by,
        created_at: r.created_at,
        updated_at: r.updated_at,
    };
}

/* ---------- page ---------- */

export default function ReferralsIndex({
    referrals,
    filters,
    counts,
    can,
}: ReferralsIndexProps) {
    const { user } = useAppData();
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Status Transition state
    const [pendingTransition, setPendingTransition] =
        useState<Transition | null>(null);
    const [transitioning, setTransitioning] = useState(false);

    // Feedback view state
    const [feedbackTarget, setFeedbackTarget] =
        useState<ReferralListItem | null>(null);

    /* ---------- filters ---------- */

    const applyExtra = useCallback(
        (patch: Partial<ReferralIndexFilters>) => {
            router.get(
                referralsRoute.url(),
                compactParams({
                    search: filters.search,
                    sort: filters.sort,
                    dir: filters.dir,
                    per_page: filters.per_page,
                    status: filters.status,
                    urgency: filters.urgency,
                    ...patch,
                }),
                { preserveState: true, preserveScroll: true, replace: true },
            );
        },
        [filters],
    );

    /* ---------- refresh ---------- */

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        router.reload({ onFinish: () => setIsRefreshing(false) });
    }, []);

    /* ---------- transition flow ---------- */

    const requestTransition = useCallback(
        (row: ReferralListItem, next: ReferralStatusValue) => {
            if (!row.gbv_case) {
                toast.error("This referral has no case attached.");
                return;
            }

            const config: Record<
                "accepted" | "declined" | "completed",
                Omit<Transition, "row" | "next" | "label">
            > = {
                accepted: {
                    title: "Accept referral?",
                    description: `You are accepting referral "${row.referral_number}" for ${row.gbv_case.case_number}. The sender will see it as accepted.`,
                    confirmLabel: "Accept",
                    confirmClass:
                        "bg-emerald-600 text-white hover:bg-emerald-600/90",
                },
                declined: {
                    title: "Decline referral?",
                    description: `Declining "${row.referral_number}" tells ${row.from_partner?.name ?? "the sender"} that your organization cannot take this referral.`,
                    confirmLabel: "Decline",
                    confirmClass: "bg-rose-600 text-white hover:bg-rose-600/90",
                },
                completed: {
                    title: "Mark referral completed?",
                    description: `Marking "${row.referral_number}" as completed closes the loop — the survivor has been served. This is a terminal state.`,
                    confirmLabel: "Complete",
                    confirmClass:
                        "bg-emerald-600 text-white hover:bg-emerald-600/90",
                },
            };

            if (!(next in config)) {
                console.warn(
                    `requestTransition called with unsupported target: ${next}`,
                );
                return;
            }

            setPendingTransition({
                row,
                next,
                label: `Referral ${next}`,
                ...config[next as keyof typeof config],
            });
        },
        [],
    );

    const cancelTransition = useCallback(() => {
        if (transitioning) return;
        setPendingTransition(null);
    }, [transitioning]);

    const confirmTransition = useCallback(() => {
        const t = pendingTransition;
        if (!t || !t.row.gbv_case) return;

        setTransitioning(true);
        router.put(
            route("gbv-cases.referrals.update", {
                gbv_case: t.row.gbv_case.id,
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
    }, [pendingTransition]);

    /* ---------- columns ---------- */

    const columns = useMemo<Column<ReferralListItem>[]>(
        () => [
            {
                key: "gbv_case",
                label: "Case",
                icon: FileText,
                sortable: false,
                headerClassName: "w-[14%]",
                cell: (r) =>
                    r.gbv_case ? (
                        <div className="flex flex-col gap-0.5">
                            <Link
                                href={route("gbv-cases.show", {
                                    gbv_case: r.gbv_case.id,
                                })}
                                className="truncate font-medium hover:underline"
                            >
                                {r.gbv_case.case_number}
                            </Link>
                            {r.referral_number ? (
                                <span className="truncate text-xs text-muted-foreground">
                                    {r.referral_number}
                                </span>
                            ) : null}
                        </div>
                    ) : (
                        "—"
                    ),
            },
            {
                key: "from_partner",
                label: "From",
                icon: Building2,
                headerClassName: "w-[18%]",
                cell: (r) => (
                    <div className="flex flex-col gap-0.5">
                        <span className="truncate font-medium">
                            {r.from_partner?.name ?? "—"}
                        </span>
                        {r.created_by?.name ? (
                            <span className="truncate text-xs text-muted-foreground">
                                by {r.created_by.name}
                            </span>
                        ) : null}
                    </div>
                ),
            },
            {
                key: "referral_type",
                label: "Type",
                headerClassName: "w-[14%]",
                cell: (r) => (
                    <span className="truncate">
                        {r.referral_type?.name ?? "—"}
                    </span>
                ),
            },
            {
                key: "urgency",
                label: "Urgency",
                headerClassName: "w-[10%] text-center",
                className: "text-center",
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
                headerClassName: "w-[12%] text-center",
                className: "text-center",
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
                label: "Received",
                sortable: true,
                headerClassName: "w-[12%] text-right",
                className: "text-right",
                cell: (r) => (
                    <span className="text-xs text-muted-foreground">
                        {r.created_at ? formatDate(r.created_at) : "—"}
                    </span>
                ),
            },
        ],
        [],
    );

    /* ---------- toolbar ---------- */

    const toolbar = (
        <Select
            value={filters.status || "all"}
            onValueChange={(v) => applyExtra({ status: v === "all" ? "" : v })}
        >
            <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
                {STATUS_FILTER_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                        {o.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );

    /* ---------- row actions ---------- */

    const rowKey = useCallback((r: ReferralListItem) => r.id, []);

    const rowActions = useCallback(
        (r: ReferralListItem) => {
            const isReceiver =
                !!user?.partner_id &&
                !!r.to_partner &&
                Number(user.partner_id) === Number(r.to_partner.id);

            const canAct = can.update && isReceiver && r.gbv_case !== null;
            const isOpen = r.status === "pending" || r.status === "accepted";
            const isPending = r.status === "pending";
            const isAccepted = r.status === "accepted";

            return (
                <>
                    {/* View case */}
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        title="View case"
                        aria-label={`View case ${r.gbv_case?.case_number ?? ""}`}
                    >
                        <Link
                            href={route("gbv-cases.show", {
                                gbv_case: r.gbv_case?.id ?? 0,
                            })}
                        >
                            <FileText className="h-4 w-4" />
                        </Link>
                    </Button>

                    {/* View Feedback — only visible to the receiver if feedback exists */}
                    {r.feedback && isReceiver && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-sky-600 hover:bg-sky-50 hover:text-sky-700 dark:hover:bg-sky-900/20"
                            title="View Feedback"
                            aria-label={`View feedback for ${r.referral_number}`}
                            onClick={() => setFeedbackTarget(r)}
                        >
                            <MessageSquare className="h-4 w-4" />
                        </Button>
                    )}

                    {/* Accept / Decline — receiver only, pending only */}
                    {canAct && isPending && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/20"
                                title="Accept"
                                aria-label={`Accept ${r.referral_number}`}
                                onClick={() => requestTransition(r, "accepted")}
                            >
                                <CheckCircle2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-900/20"
                                title="Decline"
                                aria-label={`Decline ${r.referral_number}`}
                                onClick={() => requestTransition(r, "declined")}
                            >
                                <XCircle className="h-4 w-4" />
                            </Button>
                        </>
                    )}

                    {/* Complete — receiver only, accepted only */}
                    {canAct && isAccepted && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/20"
                            title="Mark completed"
                            aria-label={`Complete ${r.referral_number}`}
                            onClick={() => requestTransition(r, "completed")}
                        >
                            <CheckCircle2 className="h-4 w-4" />
                        </Button>
                    )}

                    {/* Edit — receiver only (inbox context), open only */}
                    {canAct && isOpen && (
                        <ReferralDialog
                            caseId={r.gbv_case!.id}
                            referral={toDialogReferral(r)}
                            trigger={
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Edit"
                                    aria-label={`Edit ${r.referral_number}`}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            }
                        />
                    )}
                </>
            );
        },
        [requestTransition, can.update, user?.partner_id],
    );

    /* ---------- render ---------- */

    return (
        <>
            <Head title="Referrals" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Referrals"
                    icon={
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Send className="h-5 w-5" />
                        </div>
                    }
                    meta={
                        <span>
                            {counts.pending} pending · {counts.accepted}{" "}
                            accepted · {counts.completed} completed
                        </span>
                    }
                    onRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                />

                <DataTable<ReferralListItem, ReferralIndexFilters>
                    paginator={referrals}
                    filters={filters}
                    columns={columns}
                    routeName="referrals.index"
                    rowKey={rowKey}
                    searchPlaceholder="Search case #, referral #, partner…"
                    toolbar={toolbar}
                    actions={rowActions}
                    emptyIcon={Inbox}
                    emptyTitle="No referrals"
                    emptyDescription="No referrals have been addressed to your organization yet."
                    defaultSort="created_at"
                    defaultDir="desc"
                />
            </div>

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
                            {pendingTransition?.title ?? ""}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingTransition?.description ?? ""}
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
                            className={pendingTransition?.confirmClass}
                        >
                            {transitioning
                                ? "Updating…"
                                : (pendingTransition?.confirmLabel ??
                                  "Confirm")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ---------- Feedback dialog ---------- */}
            <Dialog
                open={feedbackTarget !== null}
                onOpenChange={(open) => {
                    if (!open) setFeedbackTarget(null);
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Referral Feedback</DialogTitle>
                        <DialogDescription>
                            Feedback provided by{" "}
                            <strong>
                                {feedbackTarget?.to_partner?.name ??
                                    "the receiving partner"}
                            </strong>{" "}
                            for referral {feedbackTarget?.referral_number}.
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
        </>
    );
}

ReferralsIndex.layout = {
    breadcrumbs: [{ title: "Referrals", href: referralsRoute.url() }],
};
