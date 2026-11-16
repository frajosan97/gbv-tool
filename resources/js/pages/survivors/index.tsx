import { Head, Link, router } from "@inertiajs/react";
import {
    Eye,
    FileSpreadsheet,
    FileText,
    IdCard,
    MapPin,
    Pencil,
    Plus,
    ShieldAlert,
    Trash2,
    UserRound,
    Users,
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

import {
    index as survivors,
    create as createSurvivor,
} from "@/routes/survivors";

import type {
    Column,
    Lookup,
    Survivor,
    SurvivorFilters,
    SurvivorsIndexProps,
} from "@/types";

// ---------- Constants ----------

const PWD_OPTIONS = [
    { value: "1", label: "PWD" },
    { value: "0", label: "Non-PWD" },
];

const ANON_OPTIONS = [
    { value: "1", label: "Anonymous" },
    { value: "0", label: "Identified" },
];

const CONSENT_OPTIONS = [
    { value: "1", label: "Consent given" },
    { value: "0", label: "No consent" },
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

function displayName(s: Survivor): string {
    if (s.anonymous) return "Anonymous survivor";
    return s.full_name || s.unique_code;
}

// ---------- Subcomponents ----------

function AnonBadge({ anonymous }: { anonymous: boolean }) {
    return anonymous ? (
        <Badge
            variant="outline"
            className="border-0 bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300"
        >
            <ShieldAlert className="mr-1 h-3 w-3" />
            Anonymous
        </Badge>
    ) : null;
}

function PwdBadge({ isPwd }: { isPwd: boolean }) {
    return isPwd ? (
        <Badge
            variant="outline"
            className="border-0 bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300"
        >
            PWD
        </Badge>
    ) : null;
}

// ---------- Page ----------

export default function SurvivorsIndex({
    survivors: survivorsPaginator,
    filters,
    lookups,
    can,
}: SurvivorsIndexProps) {
    const {
        county_id,
        gender_option_id,
        age_range_id,
        is_pwd,
        anonymous,
        consent_given,
    } = filters;

    const [deleteTarget, setDeleteTarget] = useState<Survivor | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const applyExtra = useCallback(
        (patch: Partial<SurvivorFilters>) => {
            router.get(
                survivors.url(),
                compactParams({ ...filters, ...patch }),
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        },
        [filters],
    );

    // ---------- Delete ----------

    const requestDelete = useCallback((s: Survivor) => setDeleteTarget(s), []);

    const confirmDelete = useCallback(() => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(`/survivors/${deleteTarget.id}`, {
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
                        county_id: filters.county_id,
                        gender_option_id: filters.gender_option_id,
                        age_range_id: filters.age_range_id,
                        is_pwd: filters.is_pwd,
                        anonymous: filters.anonymous,
                        consent_given: filters.consent_given,
                    }),
                ).map(([k, v]) => [k, String(v)]),
            ).toString(),
        [filters],
    );

    const downloadExcel = useCallback(() => {
        const qs = exportQuery();
        window.location.href = `/survivors/export/excel${qs ? `?${qs}` : ""}`;
    }, [exportQuery]);

    const downloadPdf = useCallback(() => {
        const qs = exportQuery();
        window.open(
            `/survivors/export/pdf${qs ? `?${qs}` : ""}`,
            "_blank",
            "noopener,noreferrer",
        );
    }, [exportQuery]);

    // ---------- Service card ----------

    const printCard = useCallback((survivor: Survivor) => {
        window.open(`/survivors/${survivor.id}/card`, "_blank");
    }, []);

    // ---------- Columns ----------

    const columns = useMemo<Column<Survivor>[]>(
        () => [
            {
                key: "full_name",
                label: "Survivor",
                icon: UserRound,
                sortable: true,
                headerClassName: "w-[32%]",
                cell: (s) => (
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                            <Link
                                href={`/survivors/${s.id}`}
                                className="truncate font-medium hover:underline"
                            >
                                {displayName(s)}
                            </Link>
                            <AnonBadge anonymous={s.anonymous} />
                            <PwdBadge isPwd={s.is_pwd} />
                        </div>
                        <span className="truncate text-xs text-muted-foreground">
                            {s.unique_code}
                        </span>
                    </div>
                ),
            },
            {
                key: "gender_option_id",
                label: "Gender",
                headerClassName: "w-[12%]",
                cell: (s) => s.gender_option?.name ?? "—",
            },
            {
                key: "age",
                label: "Age",
                sortable: true,
                headerClassName: "w-[10%]",
                cell: (s) => {
                    if (s.age) return `${s.age}`;
                    if (s.age_range?.name) return s.age_range.name;
                    return "—";
                },
            },
            {
                key: "county_id",
                label: "Location",
                headerClassName: "w-[18%]",
                cell: (s) => (
                    <span className="inline-flex items-center gap-1 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {s.county?.name ?? "—"}
                        {s.sub_county?.name && (
                            <span className="text-muted-foreground">
                                / {s.sub_county.name}
                            </span>
                        )}
                    </span>
                ),
            },
            {
                key: "gbv_cases_count",
                label: "Cases",
                headerClassName: "w-[10%] text-center",
                className: "text-center",
                cell: (s) => s.gbv_cases_count ?? 0,
            },
            {
                key: "consent_given",
                label: "Consent",
                headerClassName: "w-[10%] text-center",
                className: "text-center",
                cell: (s) =>
                    s.consent_given ? (
                        <Badge
                            variant="outline"
                            className="border-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                        >
                            Given
                        </Badge>
                    ) : (
                        <Badge
                            variant="outline"
                            className="border-0 bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300"
                        >
                            None
                        </Badge>
                    ),
            },
        ],
        [],
    );

    // ---------- Toolbar ----------

    const countyOptions = useMemo(
        () =>
            lookups.counties.map((t: Lookup) => ({
                value: String(t.id),
                label: t.name,
            })),
        [lookups.counties],
    );
    const genderOptions = useMemo(
        () =>
            lookups.genderOptions.map((t: Lookup) => ({
                value: String(t.id),
                label: t.name,
            })),
        [lookups.genderOptions],
    );
    const ageRangeOptions = useMemo(
        () =>
            lookups.ageRanges.map((t: Lookup) => ({
                value: String(t.id),
                label: t.name,
            })),
        [lookups.ageRanges],
    );

    const extraFilters = useMemo(
        () => [
            {
                key: "county_id" as const,
                placeholder: "County",
                value: county_id,
                options: countyOptions,
                width: "w-[160px]",
            },
            {
                key: "gender_option_id" as const,
                placeholder: "Gender",
                value: gender_option_id,
                options: genderOptions,
                width: "w-[140px]",
            },
            {
                key: "age_range_id" as const,
                placeholder: "Age range",
                value: age_range_id,
                options: ageRangeOptions,
                width: "w-[140px]",
            },
            {
                key: "is_pwd" as const,
                placeholder: "PWD",
                value: is_pwd,
                options: PWD_OPTIONS,
                width: "w-[120px]",
            },
            {
                key: "anonymous" as const,
                placeholder: "Privacy",
                value: anonymous,
                options: ANON_OPTIONS,
                width: "w-[140px]",
            },
            {
                key: "consent_given" as const,
                placeholder: "Consent",
                value: consent_given,
                options: CONSENT_OPTIONS,
                width: "w-[150px]",
            },
        ],
        [
            county_id,
            gender_option_id,
            age_range_id,
            is_pwd,
            anonymous,
            consent_given,
            countyOptions,
            genderOptions,
            ageRangeOptions,
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

    const rowKey = useCallback((s: Survivor) => s.id, []);

    const rowActions = useCallback(
        (s: Survivor) => {
            const busy = deleting && deleteTarget?.id === s.id;
            const canManage = can.create;

            return (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        title="View"
                        aria-label={`View ${displayName(s)}`}
                    >
                        <Link href={`/survivors/${s.id}`}>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        title="Print service card"
                        aria-label={`Print service card for ${displayName(s)}`}
                        onClick={() => printCard(s)}
                    >
                        <IdCard className="h-4 w-4" />
                    </Button>

                    {canManage && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                title="Edit"
                                aria-label={`Edit ${displayName(s)}`}
                            >
                                <Link href={`/survivors/${s.id}/edit`}>
                                    <Pencil className="h-4 w-4" />
                                </Link>
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                title="Delete"
                                aria-label={`Delete ${displayName(s)}`}
                                disabled={busy}
                                onClick={() => requestDelete(s)}
                                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-30 dark:hover:bg-rose-900/20"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </>
                    )}
                </>
            );
        },
        [deleting, deleteTarget, requestDelete, can.create, printCard],
    );

    return (
        <>
            <Head title="Survivors" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Survivors"
                    icon={
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Users className="h-5 w-5" />
                        </div>
                    }
                    meta={
                        <span>
                            {survivorsPaginator.total}{" "}
                            {survivorsPaginator.total === 1
                                ? "survivor"
                                : "survivors"}{" "}
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
                                        disabled={
                                            survivorsPaginator.total === 0
                                        }
                                    >
                                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                                        Excel
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={downloadPdf}
                                        title="Download as PDF"
                                        disabled={
                                            survivorsPaginator.total === 0
                                        }
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        PDF
                                    </Button>
                                </>
                            )}
                            {can.create && (
                                <Button size="sm" asChild>
                                    <Link href={createSurvivor()}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        New survivor
                                    </Link>
                                </Button>
                            )}
                        </>
                    }
                />

                <DataTable<Survivor, SurvivorFilters>
                    paginator={survivorsPaginator}
                    filters={filters}
                    columns={columns}
                    routeName="survivors.index"
                    rowKey={rowKey}
                    searchPlaceholder="Search code, name, phone, ID…"
                    toolbar={toolbar}
                    actions={rowActions}
                    emptyIcon={Users}
                    emptyTitle="No survivors found"
                    emptyDescription="Try adjusting filters or register a new survivor."
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
                        <AlertDialogTitle>Delete survivor?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove{" "}
                            <span className="font-medium text-foreground">
                                {deleteTarget ? displayName(deleteTarget) : ""}
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

SurvivorsIndex.layout = {
    breadcrumbs: [{ title: "Survivors", href: survivors() }],
};
