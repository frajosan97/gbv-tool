import { Head, Link, router } from "@inertiajs/react";
import {
    Building2,
    CheckCircle2,
    Eye,
    FileSpreadsheet,
    FileText,
    FolderOpen,
    ShieldCheck,
    ShieldOff,
    Trash2,
    Users,
    XCircle,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";

import { index as partners } from "@/routes/partners";

import type {
    Column,
    Partner,
    PartnerFilters,
    PartnersIndexProps,
} from "@/types";

// ---------- Constants ----------

const ROUTE = "partners.index";

const STATUS_STYLES: Record<string, string> = {
    approved:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    pending:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    rejected:
        "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
    suspended:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    unknown:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

const STATUS_OPTIONS = [
    { value: "approved", label: "Approved" },
    { value: "pending", label: "Pending" },
    { value: "rejected", label: "Rejected" },
    { value: "suspended", label: "Suspended" },
];

const VERIFIED_OPTIONS = [
    { value: "1", label: "Verified" },
    { value: "0", label: "Unverified" },
];

// ---------- Helpers ----------

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

// ---------- Subcomponents ----------

function StatusBadge({ status }: { status: string | null }) {
    const key = status?.toLowerCase() || "unknown";
    return (
        <Badge
            variant="outline"
            className={`capitalize border-0 ${STATUS_STYLES[key] ?? STATUS_STYLES.unknown}`}
        >
            {status ?? "Unknown"}
        </Badge>
    );
}

// ---------- Verify/Reject dialog target ----------

type VerifyTarget = {
    partner: Partner;
    action: "verify" | "reject";
};

// ---------- Page ----------

export default function PartnersIndex({
    partners: partnersPaginator,
    filters,
    organizationTypes,
}: PartnersIndexProps) {
    const { status, organization_type_id, verified } = filters;

    const [deleteTarget, setDeleteTarget] = useState<Partner | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [verifyTarget, setVerifyTarget] = useState<VerifyTarget | null>(null);
    const [verifying, setVerifying] = useState(false);

    const [isRefreshing, setIsRefreshing] = useState(false);

    // ---------- Empty state ----------

    const isEmpty = partnersPaginator.total === 0;

    const applyExtra = useCallback(
        (patch: Partial<PartnerFilters>) => {
            router.get(ROUTE, compactParams({ ...filters, ...patch }), {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [filters],
    );

    // ---------- Delete ----------

    const requestDelete = useCallback((p: Partner) => {
        setDeleteTarget(p);
    }, []);

    const confirmDelete = useCallback(() => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(`/partners/${deleteTarget.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    }, [deleteTarget]);

    const cancelDelete = useCallback(() => {
        if (deleting) return;
        setDeleteTarget(null);
    }, [deleting]);

    // ---------- Verify / Reject ----------

    const requestVerify = useCallback(
        (p: Partner, action: "verify" | "reject") => {
            setVerifyTarget({ partner: p, action });
        },
        [],
    );

    const confirmVerify = useCallback(() => {
        if (!verifyTarget) return;
        setVerifying(true);
        router.post(
            `/partners/${verifyTarget.partner.id}/verify`,
            { action: verifyTarget.action },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => {
                    setVerifying(false);
                    setVerifyTarget(null);
                },
            },
        );
    }, [verifyTarget]);

    const cancelVerify = useCallback(() => {
        if (verifying) return;
        setVerifyTarget(null);
    }, [verifying]);

    // ---------- Refresh ----------

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        router.reload({
            onFinish: () => setIsRefreshing(false),
        });
    }, []);

    // ---------- Export ----------

    const exportQuery = useCallback(
        () =>
            new URLSearchParams(
                Object.entries(
                    compactParams({
                        search: filters.search,
                        sort: filters.sort,
                        dir: filters.dir,
                        status: filters.status,
                        organization_type_id: filters.organization_type_id,
                        verified: filters.verified,
                    }),
                ).map(([k, v]) => [k, String(v)]),
            ).toString(),
        [filters],
    );

    // Excel → download in the current tab. Guarded so an empty list
    // can't trigger a pointless export even if the button is somehow
    // reachable.
    const downloadExcel = useCallback(() => {
        if (isEmpty) return;
        const qs = exportQuery();
        window.location.href = `/partners/export/excel${qs ? `?${qs}` : ""}`;
    }, [exportQuery, isEmpty]);

    // PDF → open inline in a new tab. Same guard.
    const openPdf = useCallback(() => {
        if (isEmpty) return;
        const qs = exportQuery();
        window.open(
            `/partners/export/pdf${qs ? `?${qs}` : ""}`,
            "_blank",
            "noopener,noreferrer",
        );
    }, [exportQuery, isEmpty]);

    // ---------- Columns ----------

    const columns = useMemo<Column<Partner>[]>(
        () => [
            {
                key: "organization_name",
                label: "Organization",
                icon: Building2,
                sortable: true,
                headerClassName: "w-[34%]",
                cell: (p) => (
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/partners/${p.id}`}
                                className="truncate font-medium hover:underline"
                            >
                                {p.organization_name}
                            </Link>
                            {p.is_verified ? (
                                <CheckCircle2
                                    className="h-4 w-4 shrink-0 text-emerald-600"
                                    aria-label="Verified"
                                />
                            ) : (
                                <XCircle
                                    className="h-4 w-4 shrink-0 text-muted-foreground"
                                    aria-label="Not verified"
                                />
                            )}
                        </div>
                        <span className="truncate text-xs text-muted-foreground">
                            {p.organization_type?.name ?? "—"}
                        </span>
                    </div>
                ),
            },
            {
                key: "status",
                label: "Status",
                sortable: true,
                headerClassName: "w-[10%]",
                cell: (p) => <StatusBadge status={p.status} />,
            },
            {
                key: "users_count",
                label: "Users",
                headerClassName: "w-[10%] text-center",
                className: "text-center",
                cell: (p) => (
                    <span className="inline-flex items-center gap-1 text-sm">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        {p.users_count}
                    </span>
                ),
            },
            {
                key: "survivors_count",
                label: "Survivors",
                headerClassName: "w-[12%] text-center",
                className: "text-center",
                cell: (p) => p.survivors_count,
            },
            {
                key: "gbv_cases_count",
                label: "Cases",
                headerClassName: "w-[10%] text-center",
                className: "text-center",
                cell: (p) => (
                    <span className="inline-flex items-center gap-1 text-sm">
                        <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
                        {p.gbv_cases_count}
                    </span>
                ),
            },
        ],
        [],
    );

    // ---------- Toolbar ----------

    const orgTypeOptions = useMemo(
        () =>
            organizationTypes.map((t) => ({
                value: String(t.id),
                label: t.name,
            })),
        [organizationTypes],
    );

    const extraFilters = useMemo(
        () => [
            {
                key: "status" as const,
                placeholder: "Status",
                value: status,
                options: STATUS_OPTIONS,
                width: "w-[140px]",
            },
            {
                key: "organization_type_id" as const,
                placeholder: "Organization type",
                value: organization_type_id,
                options: orgTypeOptions,
                width: "w-[180px]",
            },
            {
                key: "verified" as const,
                placeholder: "Verification",
                value: verified,
                options: VERIFIED_OPTIONS,
                width: "w-[150px]",
            },
        ],
        [status, organization_type_id, verified, orgTypeOptions],
    );

    const toolbar = useMemo(
        () => (
            <>
                {extraFilters.map((f) => (
                    <Select
                        key={f.key}
                        value={f.value || "all"}
                        onValueChange={(v) =>
                            applyExtra({ [f.key]: v === "all" ? "" : v })
                        }
                    >
                        <SelectTrigger className={`h-9 ${f.width}`}>
                            <SelectValue placeholder={f.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                All {f.placeholder.toLowerCase()}
                            </SelectItem>
                            {f.options.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                    {o.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ))}
            </>
        ),
        [extraFilters, applyExtra],
    );

    // ---------- Row actions ----------

    const rowKey = useCallback((p: Partner) => p.id, []);

    const rowActions = useCallback(
        (p: Partner) => {
            const busy =
                (verifying && verifyTarget?.partner.id === p.id) ||
                (deleting && deleteTarget?.id === p.id);

            return (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        title="View"
                        aria-label={`View ${p.organization_name}`}
                    >
                        <Link href={`/partners/${p.id}`}>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        title="Verify partner"
                        aria-label={`Verify ${p.organization_name}`}
                        disabled={busy || p.is_verified}
                        onClick={() => requestVerify(p, "verify")}
                        className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-30 dark:hover:bg-emerald-900/20"
                    >
                        <ShieldCheck className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        title="Reject partner"
                        aria-label={`Reject ${p.organization_name}`}
                        disabled={busy || p.status === "rejected"}
                        onClick={() => requestVerify(p, "reject")}
                        className="text-amber-600 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-30 dark:hover:bg-amber-900/20"
                    >
                        <ShieldOff className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        aria-label={`Delete ${p.organization_name}`}
                        disabled={busy}
                        onClick={() => requestDelete(p)}
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-30 dark:hover:bg-rose-900/20"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </>
            );
        },
        [
            verifying,
            verifyTarget,
            deleting,
            deleteTarget,
            requestVerify,
            requestDelete,
        ],
    );

    // ---------- Render ----------

    return (
        <>
            <Head title="Partners" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Partners"
                    icon={
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Building2 className="h-5 w-5" />
                        </div>
                    }
                    meta={
                        <span>
                            {partnersPaginator.total}{" "}
                            {partnersPaginator.total === 1
                                ? "partner"
                                : "partners"}{" "}
                            in the system
                        </span>
                    }
                    onRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                    actions={
                        <>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={downloadExcel}
                                disabled={isEmpty}
                                title={
                                    isEmpty
                                        ? "No records to export"
                                        : "Download as Excel"
                                }
                            >
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Excel
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={openPdf}
                                disabled={isEmpty}
                                title={
                                    isEmpty
                                        ? "No records to export"
                                        : "Open PDF in new tab"
                                }
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                PDF
                            </Button>
                        </>
                    }
                />

                <DataTable<Partner, PartnerFilters>
                    paginator={partnersPaginator}
                    filters={filters}
                    columns={columns}
                    routeName={ROUTE}
                    rowKey={rowKey}
                    searchPlaceholder="Search name, reg. no, contact, email…"
                    toolbar={toolbar}
                    actions={rowActions}
                    emptyIcon={Building2}
                    emptyTitle="No partners found"
                    emptyDescription="Try adjusting your filters or add a new partner."
                    defaultSort="organization_name"
                    defaultDir="asc"
                />
            </div>

            {/* ---------- Verify / Reject confirmation ---------- */}
            <AlertDialog
                open={verifyTarget !== null}
                onOpenChange={(open) => {
                    if (!open) cancelVerify();
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {verifyTarget?.action === "verify"
                                ? "Verify partner?"
                                : "Reject partner?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {verifyTarget?.action === "verify" ? (
                                <>
                                    This will mark{" "}
                                    <span className="font-medium text-foreground">
                                        {
                                            verifyTarget?.partner
                                                .organization_name
                                        }
                                    </span>{" "}
                                    as verified and set their status to{" "}
                                    <span className="font-medium text-foreground">
                                        Approved
                                    </span>
                                    .
                                </>
                            ) : (
                                <>
                                    This will mark{" "}
                                    <span className="font-medium text-foreground">
                                        {
                                            verifyTarget?.partner
                                                .organization_name
                                        }
                                    </span>{" "}
                                    as rejected and remove any verification.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={verifying}
                            onClick={cancelVerify}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={verifying}
                            onClick={(e) => {
                                e.preventDefault();
                                confirmVerify();
                            }}
                            className={
                                verifyTarget?.action === "verify"
                                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                    : "bg-amber-600 text-white hover:bg-amber-700"
                            }
                        >
                            {verifying
                                ? "Working…"
                                : verifyTarget?.action === "verify"
                                  ? "Verify"
                                  : "Reject"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ---------- Delete confirmation ---------- */}
            <AlertDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open) cancelDelete();
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete partner?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove{" "}
                            <span className="font-medium text-foreground">
                                {deleteTarget?.organization_name}
                            </span>
                            . This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={deleting}
                            onClick={cancelDelete}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={deleting}
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? "Deleting…" : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

PartnersIndex.layout = {
    breadcrumbs: [
        {
            title: "Partners",
            href: partners(),
        },
    ],
};
