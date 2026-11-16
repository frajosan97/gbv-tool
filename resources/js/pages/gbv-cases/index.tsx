import { Head, Link, router } from "@inertiajs/react";
import {
    Eye,
    FileSpreadsheet,
    FileText,
    MapPin,
    Pencil,
    Plus,
    ShieldAlert,
    Trash2,
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

import { index as cases, create as createCase } from "@/routes/gbv-cases";

import type {
    Column,
    GbvCase,
    GbvCaseFilters,
    GbvCasesIndexProps,
    Lookup,
} from "@/types";

// ---------- Constants ----------

const SENSITIVE_OPTIONS = [
    { value: "1", label: "Sensitive" },
    { value: "0", label: "Standard" },
];

const POLICE_OPTIONS = [
    { value: "1", label: "Reported to police" },
    { value: "0", label: "Not reported" },
];

const MEDICAL_OPTIONS = [
    { value: "1", label: "Medical attention" },
    { value: "0", label: "No medical attention" },
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

function formatDate(v: string | null | undefined): string {
    if (!v) return "—";
    try {
        return new Date(v).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return v;
    }
}

// ---------- Subcomponents ----------

function SensitiveBadge({ sensitive }: { sensitive: boolean }) {
    if (!sensitive) return null;
    return (
        <Badge
            variant="outline"
            className="border-0 bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
        >
            <ShieldAlert className="mr-1 h-3 w-3" />
            Sensitive
        </Badge>
    );
}

// ---------- Page ----------

export default function GbvCasesIndex({
    cases: casesPaginator,
    filters,
    lookups,
    can,
}: GbvCasesIndexProps) {
    const [deleteTarget, setDeleteTarget] = useState<GbvCase | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const applyExtra = useCallback(
        (patch: Partial<GbvCaseFilters>) => {
            router.get(cases.url(), compactParams({ ...filters, ...patch }), {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        },
        [filters],
    );

    // ---------- Delete ----------

    const requestDelete = useCallback((c: GbvCase) => setDeleteTarget(c), []);

    const confirmDelete = useCallback(() => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(`/gbv-cases/${deleteTarget.id}`, {
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

    // ---------- Refresh ----------

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        router.reload({ onFinish: () => setIsRefreshing(false) });
    }, []);

    // ---------- Exports ----------

    const exportQuery = useCallback(
        () =>
            new URLSearchParams(
                Object.entries(
                    compactParams({
                        search: filters.search,
                        sort: filters.sort,
                        dir: filters.dir,
                        incident_type_id: filters.incident_type_id,
                        case_status_id: filters.case_status_id,
                        priority_level_id: filters.priority_level_id,
                        confidentiality_level_id:
                            filters.confidentiality_level_id,
                        county_id: filters.county_id,
                        partner_id: filters.partner_id,
                        survivor_id: filters.survivor_id,
                        is_sensitive: filters.is_sensitive,
                        reported_to_police: filters.reported_to_police,
                        medical_attention: filters.medical_attention,
                        from: filters.from,
                        to: filters.to,
                    }),
                ).map(([k, v]) => [k, String(v)]),
            ).toString(),
        [filters],
    );

    const downloadExcel = useCallback(() => {
        const qs = exportQuery();
        window.location.href = `/gbv-cases/export/excel${qs ? `?${qs}` : ""}`;
    }, [exportQuery]);

    const downloadPdf = useCallback(() => {
        const qs = exportQuery();
        window.open(
            `/gbv-cases/export/pdf${qs ? `?${qs}` : ""}`,
            "_blank",
            "noopener,noreferrer",
        );
    }, [exportQuery]);

    // ---------- Columns ----------

    const columns = useMemo<Column<GbvCase>[]>(
        () => [
            {
                key: "case_number",
                label: "Case",
                icon: FileText,
                sortable: true,
                headerClassName: "w-[28%]",
                cell: (c) => (
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/gbv-cases/${c.id}`}
                                className="truncate font-medium hover:underline"
                            >
                                {c.case_number}
                            </Link>
                            <SensitiveBadge sensitive={c.is_sensitive} />
                        </div>
                        <span className="truncate text-xs text-muted-foreground">
                            {c.incident_number ?? "—"}
                            {c.survivor?.full_name
                                ? ` · ${c.survivor.full_name}`
                                : c.survivor?.unique_code
                                  ? ` · ${c.survivor.unique_code}`
                                  : ""}
                        </span>
                    </div>
                ),
            },
            {
                key: "incident_type",
                label: "Incident",
                headerClassName: "w-[18%]",
                cell: (c) =>
                    c.incident_type?.name ?? c.incident_type_other ?? "—",
            },
            {
                key: "incident_date",
                label: "Date",
                sortable: true,
                headerClassName: "w-[14%]",
                cell: (c) => (
                    <div className="flex flex-col gap-0.5">
                        <span>{formatDate(c.incident_date)}</span>
                        {c.incident_time && (
                            <span className="text-xs text-muted-foreground">
                                {c.incident_time}
                            </span>
                        )}
                    </div>
                ),
            },
            {
                key: "county_id",
                label: "Location",
                headerClassName: "w-[18%]",
                cell: (c) => (
                    <span className="inline-flex items-center gap-1 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {c.county?.name ?? "—"}
                        {c.sub_county?.name && (
                            <span className="text-muted-foreground">
                                / {c.sub_county.name}
                            </span>
                        )}
                    </span>
                ),
            },
            {
                key: "case_status_id",
                label: "Status",
                headerClassName: "w-[15%] text-center",
                className: "text-center",
                cell: (c) =>
                    c.status?.name ? (
                        <Badge variant="outline">{c.status.name}</Badge>
                    ) : (
                        "—"
                    ),
            },
            {
                key: "priority_level_id",
                label: "Priority",
                headerClassName: "w-[10%] text-center",
                className: "text-center",
                cell: (c) =>
                    c.priority?.name ? (
                        <Badge
                            variant="outline"
                            className="border-0 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                        >
                            {c.priority.name}
                        </Badge>
                    ) : (
                        "—"
                    ),
            },
        ],
        [],
    );

    // ---------- Toolbar ----------

    const incidentTypeOptions = useMemo(
        () =>
            lookups.incidentTypes.map((t: Lookup) => ({
                value: String(t.id),
                label: t.name,
            })),
        [lookups.incidentTypes],
    );
    const statusOptions = useMemo(
        () =>
            lookups.caseStatuses.map((t: Lookup) => ({
                value: String(t.id),
                label: t.name,
            })),
        [lookups.caseStatuses],
    );
    const priorityOptions = useMemo(
        () =>
            lookups.priorityLevels.map((t: Lookup) => ({
                value: String(t.id),
                label: t.name,
            })),
        [lookups.priorityLevels],
    );
    const countyOptions = useMemo(
        () =>
            lookups.counties.map((t: Lookup) => ({
                value: String(t.id),
                label: t.name,
            })),
        [lookups.counties],
    );

    const extraFilters = useMemo(
        () => [
            {
                key: "incident_type_id" as const,
                placeholder: "Incident",
                value: filters.incident_type_id,
                options: incidentTypeOptions,
                width: "w-[180px]",
            },
            {
                key: "case_status_id" as const,
                placeholder: "Status",
                value: filters.case_status_id,
                options: statusOptions,
                width: "w-[160px]",
            },
            {
                key: "priority_level_id" as const,
                placeholder: "Priority",
                value: filters.priority_level_id,
                options: priorityOptions,
                width: "w-[140px]",
            },
            {
                key: "county_id" as const,
                placeholder: "County",
                value: filters.county_id,
                options: countyOptions,
                width: "w-[150px]",
            },
            {
                key: "is_sensitive" as const,
                placeholder: "Sensitivity",
                value: filters.is_sensitive,
                options: SENSITIVE_OPTIONS,
                width: "w-[150px]",
            },
            {
                key: "reported_to_police" as const,
                placeholder: "Police",
                value: filters.reported_to_police,
                options: POLICE_OPTIONS,
                width: "w-[160px]",
            },
            {
                key: "medical_attention" as const,
                placeholder: "Medical",
                value: filters.medical_attention,
                options: MEDICAL_OPTIONS,
                width: "w-[170px]",
            },
        ],
        [
            filters,
            incidentTypeOptions,
            statusOptions,
            priorityOptions,
            countyOptions,
        ],
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

    const rowKey = useCallback((c: GbvCase) => c.id, []);

    const rowActions = useCallback(
        (c: GbvCase) => {
            const busy = deleting && deleteTarget?.id === c.id;
            const canManage = can.create;

            return (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        title="View"
                        aria-label={`View ${c.case_number}`}
                    >
                        <Link href={`/gbv-cases/${c.id}`}>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>

                    {canManage && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                title="Edit"
                                aria-label={`Edit ${c.case_number}`}
                            >
                                <Link href={`/gbv-cases/${c.id}/edit`}>
                                    <Pencil className="h-4 w-4" />
                                </Link>
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                title="Delete"
                                aria-label={`Delete ${c.case_number}`}
                                disabled={busy}
                                onClick={() => requestDelete(c)}
                                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-30 dark:hover:bg-rose-900/20"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </>
            );
        },
        [deleting, deleteTarget, requestDelete, can.create],
    );

    return (
        <>
            <Head title="GBV Cases" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="GBV Cases"
                    icon={
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <FileText className="h-5 w-5" />
                        </div>
                    }
                    meta={
                        <span>
                            {casesPaginator.total}{" "}
                            {casesPaginator.total === 1 ? "case" : "cases"}{" "}
                            registered
                        </span>
                    }
                    onRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                    actions={
                        <>
                            {can.export && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={downloadExcel}
                                        title="Download as Excel"
                                        disabled={casesPaginator.total === 0}
                                    >
                                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                                        Excel
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={downloadPdf}
                                        title="Download as PDF"
                                        disabled={casesPaginator.total === 0}
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        PDF
                                    </Button>
                                </>
                            )}
                            {can.create && (
                                <Button size="sm" asChild>
                                    <Link href={createCase()}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        New case
                                    </Link>
                                </Button>
                            )}
                        </>
                    }
                />

                <DataTable<GbvCase, GbvCaseFilters>
                    paginator={casesPaginator}
                    filters={filters}
                    columns={columns}
                    routeName="gbv-cases.index"
                    rowKey={rowKey}
                    searchPlaceholder="Search case #, incident #, description…"
                    toolbar={toolbar}
                    actions={rowActions}
                    emptyIcon={FileText}
                    emptyTitle="No GBV cases found"
                    emptyDescription="Try adjusting filters or register a new case."
                    defaultSort="created_at"
                    defaultDir="desc"
                />
            </div>

            <AlertDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open) cancelDelete();
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete GBV case?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove case{" "}
                            <span className="font-medium text-foreground">
                                {deleteTarget?.case_number ?? ""}
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

GbvCasesIndex.layout = {
    breadcrumbs: [{ title: "GBV Cases", href: cases.url() }],
};
