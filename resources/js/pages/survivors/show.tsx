import { Head, Link, router, setLayoutProps } from "@inertiajs/react";
import {
    Calendar,
    FileText,
    IdCard,
    Pencil,
    Printer,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    UserRound,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatters";

import { ProfileTab } from "@/components/partials/survivors/profile-tab";
import { CasesTab } from "@/components/partials/survivors/cases-tab";

import { index as survivors, show as survivorsShow } from "@/routes/survivors";

import type { Survivor, SurvivorShowProps } from "@/types";

// ---------- Helpers ----------

const easeOut = [0.16, 1, 0.3, 1] as const;

function displayName(s: Survivor): string {
    if (s.anonymous) return "Anonymous survivor";
    return s.full_name || s.unique_code;
}

// ---------- Status badges ----------

function AnonymousBadge({ anonymous }: { anonymous: boolean }) {
    if (!anonymous) return null;
    return (
        <Badge className="rounded-full border-none bg-violet-600 px-3 py-1 font-semibold text-white hover:bg-violet-600/90">
            <ShieldAlert className="mr-1.5 h-3.5 w-3.5" />
            Anonymous
        </Badge>
    );
}

function PwdBadge({ isPwd }: { isPwd: boolean }) {
    if (!isPwd) return null;
    return (
        <Badge className="rounded-full border-none bg-sky-600 px-3 py-1 font-semibold text-white hover:bg-sky-600/90">
            PWD
        </Badge>
    );
}

function ConsentBadge({ consent }: { consent: boolean }) {
    return consent ? (
        <Badge className="rounded-full border-none bg-emerald-600 px-3 py-1 font-semibold text-white hover:bg-emerald-600/90">
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
            Consent Given
        </Badge>
    ) : (
        <Badge className="rounded-full border-none bg-rose-600 px-3 py-1 font-semibold text-white hover:bg-rose-600/90">
            No Consent
        </Badge>
    );
}

// ---------- Tabs ----------

type Tab = "profile" | "cases";

// ---------- Page ----------

export default function SurvivorShow({ survivor, can }: SurvivorShowProps) {
    setLayoutProps({
        breadcrumbs: [
            { title: "Survivors", href: survivors() },
            {
                title: displayName(survivor),
                href: survivorsShow(survivor.id),
            },
        ],
    });

    const [tab, setTab] = useState<Tab>("profile");
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // ---------- Actions ----------

    const confirmDelete = useCallback(() => {
        setDeleting(true);
        router.delete(`/survivors/${survivor.id}`, {
            onFinish: () => {
                setDeleting(false);
                setDeleteOpen(false);
            },
        });
    }, [survivor.id]);

    const printRecord = useCallback(() => {
        window.open(`/survivors/${survivor.id}/print`, "_blank");
    }, [survivor.id]);

    const printCard = useCallback(() => {
        window.open(`/survivors/${survivor.id}/card`, "_blank");
    }, [survivor.id]);

    const refresh = useCallback(() => {
        setRefreshing(true);
        router.reload({
            only: ["survivor", "can"],
            onSuccess: () => toast.success("Survivor data refreshed."),
            onError: () => toast.error("Failed to refresh survivor."),
            onFinish: () => setRefreshing(false),
        });
    }, []);

    // ---------- Derived data ----------

    const locationParts = useMemo<string[]>(
        () =>
            [
                survivor.village?.name,
                survivor.ward?.name,
                survivor.sub_county?.name,
                survivor.county?.name,
            ].filter((v): v is string => Boolean(v)),
        [survivor],
    );

    const ageDisplay = useMemo(
        () =>
            survivor.age
                ? `${survivor.age} yrs`
                : (survivor.age_range?.name ?? "—"),
        [survivor.age, survivor.age_range],
    );

    // ---------- Stats ----------

    const statCards: StatCardData[] = [
        {
            id: "cases",
            label: "GBV Cases",
            value: survivor.gbv_cases_count ?? 0,
            icon: FileText,
            accent: true,
        },
        {
            id: "age",
            label: "Age",
            value: ageDisplay,
            hint: survivor.dob
                ? `DOB ${formatDate(survivor.dob)}`
                : "Date of birth not set",
            icon: Calendar,
        },
        {
            id: "consent",
            label: "Consent",
            value: survivor.consent_given ? "Given" : "Not given",
            hint: survivor.consent_given_at
                ? formatDate(survivor.consent_given_at)
                : undefined,
            icon: ShieldCheck,
            tone: survivor.consent_given ? "success" : "warning",
        },
        {
            id: "registered",
            label: "Registered",
            value: survivor.created_at ? formatDate(survivor.created_at) : "—",
            hint: survivor.created_by?.name
                ? `by ${survivor.created_by.name}`
                : undefined,
            icon: UserRound,
        },
    ];

    // ---------- Tab metadata ----------

    const tabs: {
        id: Tab;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        badge?: number;
    }[] = [
        { id: "profile", label: "Profile", icon: UserRound },
        {
            id: "cases",
            label: "GBV Cases",
            icon: FileText,
            badge: survivor.gbv_cases_count ?? 0,
        },
    ];

    // ---------- Render ----------

    return (
        <>
            <Head title={`${survivor.unique_code} — Survivor Profile`} />

            <div className="mx-auto w-full max-w-5xl space-y-4 p-4 md:p-6">
                <PageHeader
                    title={displayName(survivor)}
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-primary/20">
                            <UserRound className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <>
                            <span>
                                Code:{" "}
                                <span className="font-medium text-foreground">
                                    {survivor.unique_code}
                                </span>
                            </span>
                            <span className="mx-2">•</span>
                            <span>{survivor.gender_option?.name ?? "—"}</span>
                            <span className="mx-2">•</span>
                            <span>{ageDisplay}</span>
                            {locationParts.length > 0 && (
                                <>
                                    <span className="mx-2">•</span>
                                    <span>{locationParts[0]}</span>
                                </>
                            )}
                        </>
                    }
                    statuses={
                        <>
                            <AnonymousBadge anonymous={survivor.anonymous} />
                            <PwdBadge isPwd={survivor.is_pwd} />
                            <ConsentBadge consent={survivor.consent_given} />
                            {survivor.created_at && (
                                <Badge
                                    variant="outline"
                                    className="rounded-full border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                >
                                    <Calendar className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                                    {formatDate(survivor.created_at)}
                                </Badge>
                            )}
                        </>
                    }
                    backHref={survivors.url()}
                    onRefresh={refresh}
                    isRefreshing={refreshing}
                    actions={
                        <>
                            {can.print !== false && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={printRecord}
                                        title="Print survivor profile"
                                    >
                                        <Printer className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={printCard}
                                        title="Print service card"
                                    >
                                        <IdCard className="h-4 w-4" />
                                    </Button>
                                </>
                            )}
                            {can.update !== false && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link
                                        href={`/survivors/${survivor.id}/edit`}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Link>
                                </Button>
                            )}
                            {can.delete !== false && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteOpen(true)}
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
                    <div className="flex w-full flex-wrap items-center border-b px-3 pt-1">
                        {tabs.map((t) => {
                            const Icon = t.icon;
                            const active = tab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => setTab(t.id)}
                                    className={cn(
                                        "relative flex items-center gap-1.5 rounded-sm px-3 py-3 text-sm font-medium outline-none transition-colors focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary",
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
                                            layoutId="survivor-tab-underline"
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
                        {tab === "profile" && (
                            <ProfileTab
                                survivor={survivor}
                                ageDisplay={ageDisplay}
                                locationParts={locationParts}
                            />
                        )}
                        {tab === "cases" && (
                            <CasesTab
                                survivorId={survivor.id}
                                casesCount={survivor.gbv_cases_count ?? 0}
                                cases={survivor.gbv_cases}
                                emptyAction={
                                    <Button variant="outline" size="sm" asChild>
                                        <a
                                            href={`/gbv-cases?survivor_id=${survivor.id}`}
                                        >
                                            Open case register
                                        </a>
                                    </Button>
                                }
                            />
                        )}
                    </div>
                </motion.div>
            </div>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete survivor?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove{" "}
                            <span className="font-medium text-foreground">
                                {displayName(survivor)}
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

SurvivorShow.layout = {
    breadcrumbs: [{ title: "Survivors", href: survivors.url() }],
};
