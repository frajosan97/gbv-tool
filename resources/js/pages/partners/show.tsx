import { Head, router, setLayoutProps } from "@inertiajs/react";
import {
    Building2,
    CheckCircle2,
    FileText,
    Pencil,
    Printer,
    ShieldCheck,
    ShieldOff,
    Trash2,
    UserRound,
    Users,
    XCircle,
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

import {
    index as partnersIndex,
    show as partnersShow,
} from "@/routes/partners";

import type { Partner } from "@/types";
import { ProfileTab } from "@/components/partials/partners/profile-tab";
import { UsersTab } from "@/components/partials/partners/users-tab";
import { SurvivorsTab } from "@/components/partials/partners/survivors-tab";
import { CasesTab } from "@/components/partials/partners/cases-tab";

// ---------- Helpers ----------

const easeOut = [0.16, 1, 0.3, 1] as const;

const STATUS_STYLES: Record<string, string> = {
    approved: "bg-emerald-600 text-white hover:bg-emerald-600/90",
    pending: "bg-amber-500 text-white hover:bg-amber-500/90",
    rejected: "bg-rose-600 text-white hover:bg-rose-600/90",
    suspended: "bg-slate-600 text-white hover:bg-slate-600/90",
    unknown: "bg-slate-500 text-white hover:bg-slate-500/90",
};

function StatusBadge({ status }: { status: string | null }) {
    const key = status?.toLowerCase() || "unknown";
    return (
        <Badge
            className={cn(
                "rounded-full border-none px-3 py-1 font-semibold capitalize",
                STATUS_STYLES[key] ?? STATUS_STYLES.unknown,
            )}
        >
            {status ?? "Unknown"}
        </Badge>
    );
}

function VerifiedBadge({ verified }: { verified: boolean }) {
    return verified ? (
        <Badge className="rounded-full border-none bg-emerald-600 px-3 py-1 font-semibold text-white hover:bg-emerald-600/90">
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            Verified
        </Badge>
    ) : (
        <Badge className="rounded-full border-none bg-slate-500 px-3 py-1 font-semibold text-white hover:bg-slate-500/90">
            <XCircle className="mr-1.5 h-3.5 w-3.5" />
            Not verified
        </Badge>
    );
}

// ---------- Tabs ----------

type Tab = "profile" | "users" | "survivors" | "cases";

type VerifyAction = "verify" | "reject";

// ---------- Page ----------

interface PartnerShowProps {
    partner: Partner;
    can?: {
        update?: boolean;
        delete?: boolean;
        verify?: boolean;
        print?: boolean;
    };
}

export default function PartnerShow({ partner, can }: PartnerShowProps) {
    setLayoutProps({
        breadcrumbs: [
            { title: "Partners", href: partnersIndex() },
            {
                title: partner.organization_name,
                href: partnersShow(partner.id),
            },
        ],
    });

    const [tab, setTab] = useState<Tab>("profile");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [verifyTarget, setVerifyTarget] = useState<VerifyAction | null>(null);
    const [verifying, setVerifying] = useState(false);

    // ---------- Actions ----------

    const handleDelete = useCallback(() => {
        setDeleting(true);
        router.delete(`/partners/${partner.id}`, {
            onFinish: () => {
                setDeleting(false);
                setConfirmOpen(false);
            },
        });
    }, [partner.id]);

    const confirmVerify = useCallback(() => {
        if (!verifyTarget) return;
        setVerifying(true);
        router.post(
            `/partners/${partner.id}/verify`,
            { action: verifyTarget },
            {
                preserveScroll: true,
                onFinish: () => {
                    setVerifying(false);
                    setVerifyTarget(null);
                },
            },
        );
    }, [partner.id, verifyTarget]);

    const handlePrint = useCallback(() => {
        window.open(`/partners/${partner.id}/print`, "_blank");
    }, [partner.id]);

    const refresh = useCallback(() => {
        setRefreshing(true);
        router.reload({
            only: ["partner"],
            onSuccess: () => toast.success("Partner data refreshed."),
            onError: () => toast.error("Failed to refresh partner."),
            onFinish: () => setRefreshing(false),
        });
    }, []);

    // ---------- Derived data ----------

    const locationParts = useMemo<string[]>(
        () =>
            [
                partner.village?.name,
                partner.ward?.name,
                partner.sub_county?.name,
                partner.county?.name,
            ].filter((v): v is string => Boolean(v)),
        [partner],
    );

    // ---------- Stats ----------

    const stats: StatCardData[] = [
        {
            id: "users",
            label: "Users",
            value: partner.users_count,
            icon: Users,
            accent: true,
        },
        {
            id: "survivors",
            label: "Survivors",
            value: partner.survivors_count,
            icon: ShieldCheck,
            tone: "success",
        },
        {
            id: "gbv-cases",
            label: "GBV Cases",
            value: partner.gbv_cases_count,
            icon: FileText,
            tone: "danger",
        },
        {
            id: "active-cases",
            label: "Active Cases",
            value: partner.active_cases_count ?? 0,
            icon: FileText,
            tone: "warning",
        },
    ];

    // ---------- Tab metadata ----------

    const tabs: {
        id: Tab;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        badge?: number;
    }[] = [
        { id: "profile", label: "Profile", icon: Building2 },
        {
            id: "users",
            label: "Users",
            icon: Users,
            badge: partner.users_count ?? 0,
        },
        {
            id: "survivors",
            label: "Survivors",
            icon: UserRound,
            badge: partner.survivors_count ?? 0,
        },
        {
            id: "cases",
            label: "Cases",
            icon: FileText,
            badge: partner.gbv_cases_count ?? 0,
        },
    ];

    // ---------- Render ----------

    return (
        <>
            <Head title={`${partner.organization_name} — Partner Profile`} />

            <div className="mx-auto w-full max-w-5xl space-y-4 p-4 md:p-6">
                <PageHeader
                    title={partner.organization_name}
                    icon={
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground ring-1 ring-primary/20">
                            <Building2 className="h-6 w-6" />
                        </div>
                    }
                    meta={
                        <>
                            {partner.organization_type && (
                                <>
                                    <span>
                                        {partner.organization_type.name}
                                    </span>
                                    <span className="mx-2">•</span>
                                </>
                            )}
                            {partner.registration_number && (
                                <>
                                    <span>
                                        Reg:{" "}
                                        <span className="font-medium text-foreground">
                                            {partner.registration_number}
                                        </span>
                                    </span>
                                    <span className="mx-2">•</span>
                                </>
                            )}
                            <span>{partner.users_count ?? 0} users</span>
                            <span className="mx-2">•</span>
                            <span>
                                {partner.survivors_count ?? 0} survivors
                            </span>
                        </>
                    }
                    statuses={
                        <>
                            <StatusBadge status={partner.status} />
                            <VerifiedBadge verified={partner.is_verified} />
                        </>
                    }
                    backHref={partnersIndex.url()}
                    onRefresh={refresh}
                    isRefreshing={refreshing}
                    actions={
                        <>
                            {can?.verify !== false && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setVerifyTarget("verify")
                                        }
                                        disabled={
                                            verifying || partner.is_verified
                                        }
                                        className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 dark:hover:bg-emerald-900/20"
                                    >
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                        {verifying && verifyTarget === "verify"
                                            ? "Verifying…"
                                            : "Verify"}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setVerifyTarget("reject")
                                        }
                                        disabled={
                                            verifying ||
                                            partner.status === "rejected"
                                        }
                                        className="text-amber-600 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-40 dark:hover:bg-amber-900/20"
                                    >
                                        <ShieldOff className="mr-2 h-4 w-4" />
                                        {verifying && verifyTarget === "reject"
                                            ? "Rejecting…"
                                            : "Reject"}
                                    </Button>
                                </>
                            )}
                            {can?.print !== false && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrint}
                                >
                                    <Printer className="h-4 w-4" />
                                </Button>
                            )}
                            {can?.update !== false && (
                                <Button variant="outline" size="sm" asChild>
                                    <a href={`/partners/${partner.id}/edit`}>
                                        <Pencil className="h-4 w-4" />
                                    </a>
                                </Button>
                            )}
                            {can?.delete !== false && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setConfirmOpen(true)}
                                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-900/20"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </>
                    }
                />

                <StatsCards data={stats} cols={4} />

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
                                            layoutId="partner-tab-underline"
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
                                partner={partner}
                                locationParts={locationParts}
                            />
                        )}
                        {tab === "users" && (
                            <UsersTab
                                users={partner.users ?? []}
                                emptyAction={
                                    <Button variant="outline" size="sm" asChild>
                                        <a
                                            href={`/users?partner_id=${partner.id}`}
                                        >
                                            View all users
                                        </a>
                                    </Button>
                                }
                            />
                        )}
                        {tab === "survivors" && (
                            <SurvivorsTab
                                survivors={partner.survivors ?? []}
                                emptyAction={
                                    <Button variant="outline" size="sm" asChild>
                                        <a
                                            href={`/survivors?partner_id=${partner.id}`}
                                        >
                                            View all survivors
                                        </a>
                                    </Button>
                                }
                            />
                        )}
                        {tab === "cases" && (
                            <CasesTab
                                cases={partner.gbv_cases ?? []}
                                emptyAction={
                                    <Button variant="outline" size="sm" asChild>
                                        <a
                                            href={`/gbv-cases?partner_id=${partner.id}`}
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

            {/* ---------- Verify / Reject dialog ---------- */}
            <AlertDialog
                open={verifyTarget !== null}
                onOpenChange={(open) =>
                    !verifying && !open && setVerifyTarget(null)
                }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {verifyTarget === "verify"
                                ? "Verify partner?"
                                : "Reject partner?"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {verifyTarget === "verify" ? (
                                <>
                                    This will mark{" "}
                                    <span className="font-medium text-foreground">
                                        {partner.organization_name}
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
                                        {partner.organization_name}
                                    </span>{" "}
                                    as rejected and remove any verification.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={verifying}
                            onClick={() => setVerifyTarget(null)}
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
                                verifyTarget === "verify"
                                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                                    : "bg-amber-600 text-white hover:bg-amber-700"
                            }
                        >
                            {verifying
                                ? "Working…"
                                : verifyTarget === "verify"
                                  ? "Verify"
                                  : "Reject"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ---------- Delete dialog ---------- */}
            <AlertDialog
                open={confirmOpen}
                onOpenChange={(open) => !deleting && setConfirmOpen(open)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete partner?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove{" "}
                            <span className="font-medium text-foreground">
                                {partner.organization_name}
                            </span>
                            . This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={deleting}
                            onClick={() => setConfirmOpen(false)}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={deleting}
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
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

PartnerShow.layout = {
    breadcrumbs: [{ title: "Partners", href: partnersIndex.url() }],
};
