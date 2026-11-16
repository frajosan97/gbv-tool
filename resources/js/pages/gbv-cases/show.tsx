import { Head, Link, router, setLayoutProps } from "@inertiajs/react";
import { motion } from "framer-motion";
import {
    Calendar,
    Clock,
    FileText,
    FolderClosed,
    MapPin,
    Pencil,
    Printer,
    Send,
    ShieldAlert,
    ShieldCheck,
    StickyNote,
    Trash2,
    UserRound,
    Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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
import { PageHeader } from "@/components/page-header";
import { StatsCards, type StatCardData } from "@/components/stats-cards";

import { CaseOverviewTab } from "@/components/partials/gbv-cases/overview-tab";
import { CaseFilesTab } from "@/components/partials/gbv-cases/files-tab";
import { CasePerpetratorsTab } from "@/components/partials/gbv-cases/perpetrators-tab";
import { CaseReferralsTab } from "@/components/partials/gbv-cases/referrals-tab";
import { CaseNotesTab } from "@/components/partials/gbv-cases/notes-tab";
import { CaseTimelineTab } from "@/components/partials/gbv-cases/timeline-tab";

import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";

import { index as cases } from "@/routes/gbv-cases";

import type { GbvCaseShowProps } from "@/types";

// ---------- Helpers ----------

const easeOut = [0.16, 1, 0.3, 1] as const;

function locationParts(c: GbvCaseShowProps["case"]): string[] {
    return [
        c.village?.name,
        c.ward?.name,
        c.sub_county?.name,
        c.county?.name,
    ].filter((v): v is string => Boolean(v));
}

// ---------- Badges ----------

function SensitiveBadge({ sensitive }: { sensitive: boolean }) {
    if (!sensitive) return null;
    return (
        <Badge className="rounded-full border-none bg-rose-600 px-3 py-1 font-semibold text-white hover:bg-rose-600/90">
            <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
            Sensitive
        </Badge>
    );
}

function PoliceBadge({ reported }: { reported: boolean }) {
    if (!reported) return null;
    return (
        <Badge className="rounded-full border-none bg-sky-600 px-3 py-1 font-semibold text-white hover:bg-sky-600/90">
            Police reported
        </Badge>
    );
}

function ConsentBadge({ consent }: { consent: boolean }) {
    return consent ? (
        <Badge className="rounded-full border-none bg-emerald-600 px-3 py-1 font-semibold text-white hover:bg-emerald-600/90">
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
            Consent given
        </Badge>
    ) : (
        <Badge className="rounded-full border-none bg-rose-600 px-3 py-1 font-semibold text-white hover:bg-rose-600/90">
            No consent
        </Badge>
    );
}

// ---------- Tabs ----------

type Tab =
    | "overview"
    | "files"
    | "perpetrators"
    | "referrals"
    | "notes"
    | "timeline";

const TAB_ICONS = {
    overview: FileText,
    files: FolderClosed,
    perpetrators: Users,
    referrals: Send,
    notes: StickyNote,
    timeline: Clock,
} as const;

const REFRESH_ONLY = [
    "case",
    "can",
    "files",
    "perpetrators",
    "referrals",
    "notes",
    "timeline",
] as const;

// ---------- Page ----------

export default function GbvCaseShow({ case: gbvCase, can }: GbvCaseShowProps) {
    useEffect(() => {
        setLayoutProps({
            breadcrumbs: [
                { title: "GBV Cases", href: cases.url() },
                {
                    title: gbvCase.case_number,
                    href: `/gbv-cases/${gbvCase.id}`,
                },
            ],
        });
    }, [gbvCase.case_number, gbvCase.id]);

    const [tab, setTab] = useState<Tab>("overview");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // ---------- Actions ----------

    const confirmDelete = useCallback(() => {
        setDeleting(true);
        router.delete(`/gbv-cases/${gbvCase.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteOpen(false);
            },
        });
    }, [gbvCase.id]);

    const printRecord = useCallback(() => {
        window.open(`/gbv-cases/${gbvCase.id}/print`, "_blank");
    }, [gbvCase.id]);

    const refresh = useCallback(() => {
        if (refreshing) return;
        setRefreshing(true);
        router.reload({
            only: [...REFRESH_ONLY],
            onSuccess: () => toast.success("Case data refreshed."),
            onError: () => toast.error("Failed to refresh case."),
            onFinish: () => setRefreshing(false),
        });
    }, [refreshing]);

    const openDelete = useCallback(() => setDeleteOpen(true), []);

    // ---------- Derived ----------

    const locations = useMemo(() => locationParts(gbvCase), [gbvCase]);

    const statCards = useMemo<StatCardData[]>(
        () => [
            {
                id: "priority",
                label: "Priority",
                value: gbvCase.priority?.name ?? "—",
                icon: ShieldAlert,
                accent: true,
            },
            {
                id: "status",
                label: "Status",
                value: gbvCase.status?.name ?? "—",
                icon: FileText,
            },
            {
                id: "date",
                label: "Incident date",
                value: gbvCase.incident_date
                    ? formatDate(gbvCase.incident_date)
                    : "—",
                hint: gbvCase.incident_time
                    ? `at ${gbvCase.incident_time}`
                    : undefined,
                icon: Calendar,
            },
            {
                id: "officer",
                label: "Primary officer",
                value: gbvCase.primary_officer?.name ?? "—",
                hint: gbvCase.created_by?.name
                    ? `created by ${gbvCase.created_by.name}`
                    : undefined,
                icon: UserRound,
            },
        ],
        [gbvCase],
    );

    const tabs = useMemo(
        () =>
            [
                { id: "overview" as const, label: "Overview" },
                {
                    id: "files" as const,
                    label: "Case Files",
                    badge: gbvCase.files_count ?? 0,
                },
                {
                    id: "perpetrators" as const,
                    label: "Perpetrators",
                    badge: gbvCase.perpetrators_count ?? 0,
                },
                {
                    id: "referrals" as const,
                    label: "Referrals",
                    badge: gbvCase.referrals_count ?? 0,
                },
                {
                    id: "notes" as const,
                    label: "Notes",
                    badge: gbvCase.notes_count ?? 0,
                },
                { id: "timeline" as const, label: "Timeline" },
            ] satisfies {
                id: Tab;
                label: string;
                badge?: number;
            }[],
        [
            gbvCase.files_count,
            gbvCase.perpetrators_count,
            gbvCase.referrals_count,
            gbvCase.notes_count,
        ],
    );

    // ---------- Render ----------

    return (
        <>
            <Head title={`${gbvCase.case_number} — GBV Case`} />

            <div className="mx-auto w-full max-w-5xl space-y-4 p-4 md:p-6">
                <PageHeader
                    title={gbvCase.case_number}
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-primary/20">
                            <FileText className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <>
                            <span>
                                Incident:{" "}
                                <span className="font-medium text-foreground">
                                    {gbvCase.incident_number ?? "—"}
                                </span>
                            </span>
                            {gbvCase.survivor && (
                                <>
                                    <span className="mx-2">•</span>
                                    <Link
                                        href={`/survivors/${gbvCase.survivor.id}`}
                                        className="hover:underline"
                                    >
                                        {gbvCase.survivor.full_name ??
                                            gbvCase.survivor.unique_code}
                                    </Link>
                                </>
                            )}
                            {locations.length > 0 && (
                                <>
                                    <span className="mx-2">•</span>
                                    <span className="inline-flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {locations[0]}
                                    </span>
                                </>
                            )}
                        </>
                    }
                    statuses={
                        <>
                            <SensitiveBadge sensitive={gbvCase.is_sensitive} />
                            <PoliceBadge
                                reported={gbvCase.reported_to_police}
                            />
                            <ConsentBadge consent={gbvCase.consent_obtained} />
                            {gbvCase.created_at && (
                                <Badge
                                    variant="outline"
                                    className="rounded-full border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                >
                                    <Calendar className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                                    {formatDate(gbvCase.created_at)}
                                </Badge>
                            )}
                        </>
                    }
                    backHref={cases.url()}
                    onRefresh={refresh}
                    isRefreshing={refreshing}
                    actions={
                        <>
                            {can.print && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={printRecord}
                                >
                                    <Printer className="h-4 w-4" />
                                </Button>
                            )}
                            {can.update && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link
                                        href={`/gbv-cases/${gbvCase.id}/edit`}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Link>
                                </Button>
                            )}
                            {can.delete && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={openDelete}
                                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-900/20"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </>
                    }
                />

                <StatsCards data={statCards} cols={4} />

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.25, ease: easeOut }}
                    className="overflow-hidden rounded-xl border bg-card shadow-sm"
                >
                    <div className="flex w-full items-center overflow-x-auto border-b px-3 pt-1">
                        {tabs.map((t) => {
                            const Icon = TAB_ICONS[t.id];
                            const active = tab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setTab(t.id)}
                                    className={cn(
                                        "relative flex shrink-0 items-center gap-1.5 rounded-sm px-3 py-3 text-sm font-medium outline-none transition-colors focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary",
                                        active
                                            ? "text-foreground"
                                            : "text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    <Icon className="h-3.5 w-3.5" />
                                    {t.label}
                                    {t.badge !== undefined && t.badge > 0 && (
                                        <span className="ml-0.5 rounded-full bg-muted px-1.5 text-[10px] font-semibold text-muted-foreground">
                                            {t.badge}
                                        </span>
                                    )}
                                    {active && (
                                        <motion.div
                                            layoutId="gbv-case-tab-underline"
                                            className="absolute inset-x-0 bottom-0 h-0.5 rounded-t-full bg-primary"
                                            transition={{
                                                type: "spring",
                                                stiffness: 380,
                                                damping: 30,
                                            }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-5">
                        {tab === "overview" && (
                            <CaseOverviewTab case={gbvCase} />
                        )}
                        {tab === "files" && (
                            <CaseFilesTab
                                caseId={gbvCase.id}
                                files={gbvCase.files ?? []}
                                referrals={gbvCase.referrals ?? []}
                                can={can}
                            />
                        )}
                        {tab === "perpetrators" && (
                            <CasePerpetratorsTab
                                caseId={gbvCase.id}
                                perpetrators={gbvCase.perpetrators ?? []}
                                can={can}
                            />
                        )}
                        {tab === "referrals" && (
                            <CaseReferralsTab
                                caseId={gbvCase.id}
                                referrals={gbvCase.referrals ?? []}
                                can={can}
                            />
                        )}
                        {tab === "notes" && (
                            <CaseNotesTab
                                caseId={gbvCase.id}
                                notes={gbvCase.notes ?? []}
                                can={can}
                            />
                        )}
                        {tab === "timeline" && (
                            <CaseTimelineTab
                                caseId={gbvCase.id}
                                events={gbvCase.timeline ?? []}
                            />
                        )}
                    </div>
                </motion.div>
            </div>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete GBV case?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove case{" "}
                            <span className="font-medium text-foreground">
                                {gbvCase.case_number}
                            </span>
                            . This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleting}>
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

GbvCaseShow.layout = {
    breadcrumbs: [{ title: "GBV Cases", href: cases.url() }],
};
