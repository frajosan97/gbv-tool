// pages/dashboard/admin.tsx
import { Head, Link, router } from "@inertiajs/react";
import {
    Scale,
    Share2,
    ShieldCheck,
    AlertCircle,
    ClipboardList,
    RefreshCw,
} from "lucide-react";
import { useCallback, useState } from "react";

import { StatsCards, type StatCardData } from "@/components/stats-cards";
import { Panel } from "@/components/dashboard/panel";
import { BarChart } from "@/components/dashboard/bar-chart";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { DonutChart } from "@/components/dashboard/donut-chart";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { Button } from "@/components/ui/button";
import type {
    CountyOption,
    DashboardFiltersState,
    Option,
    RecentCase,
    Slice,
    TrendPoint,
} from "@/types/dashboard";

type PendingReferral = {
    id: number;
    referral_number: string;
    type: string | null;
    urgency: string | null;
    urgency_color: string | null;
    from_partner: string | null;
    to_partner: string | null;
    created_at: string | null;
};

type Props = {
    summary: Record<string, number>;
    monthlyTrend: TrendPoint[];
    survivorsByGender: Slice[];
    survivorsByAge: Slice[];
    topIncidentTypes: Slice[];
    casesByStatus: Slice[];
    recentCases: RecentCase[];

    usersByRole: Slice[];
    pendingReferrals: PendingReferral[];

    filters: DashboardFiltersState;
    counties: CountyOption[];
    genders: Option[];
    ageRanges: Option[];
    disabilityTypes: Option[];
    incidentTypes: Option[];
    partners: Option[];
};

export default function AdminDashboard(props: Props) {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        router.reload({ onFinish: () => setIsRefreshing(false) });
    }, []);

    const cards: StatCardData[] = [
        {
            id: "survivors",
            label: "Survivors",
            value: props.summary.survivors_total,
            hint: `${props.summary.survivors_new_30d} new (30d)`,
            icon: ShieldCheck,
            tone: "success",
        },
        {
            id: "cases",
            label: "Open Cases",
            value: props.summary.cases_open,
            hint: `${props.summary.cases_total} total`,
            icon: Scale,
            tone: "warning",
        },
        {
            id: "referrals",
            label: "Open Referrals",
            value: props.summary.referrals_open,
            hint: `${props.summary.referrals_pending} awaiting action`,
            icon: Share2,
        },
        {
            id: "files",
            label: "Files Requiring Review",
            value: props.summary.files_pending_review,
            hint: `${props.summary.files_total} total files`,
            icon: AlertCircle,
        },
    ];

    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="flex flex-1 flex-col gap-3 p-4 md:p-6">
                {/* ---- Compact title row (mirrors system-admin.tsx) ---- */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <ClipboardList className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold leading-tight">
                                Admin Dashboard
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {props.summary.survivors_total} survivors ·{" "}
                                {props.summary.cases_total} cases
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw
                                className={`mr-1 h-4 w-4 ${
                                    isRefreshing ? "animate-spin" : ""
                                }`}
                            />
                            Refresh
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/survivors">Survivors</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/gbv-cases">Cases</Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/referrals">Referrals</Link>
                        </Button>
                    </div>
                </div>

                {/* ---- Full filter bar (same component as system-admin) ---- */}
                <DashboardFilters
                    filters={props.filters}
                    counties={props.counties}
                    genders={props.genders}
                    ageRanges={props.ageRanges}
                    disabilityTypes={props.disabilityTypes}
                    incidentTypes={props.incidentTypes}
                    partners={props.partners}
                />

                <StatsCards data={cards} cols={4} />

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <Panel
                            title="12-Month Trend"
                            description="Survivors and cases created per month."
                            accent
                            delay={0.1}
                        >
                            <TrendChart data={props.monthlyTrend} />
                        </Panel>
                    </div>
                    <Panel
                        title="Cases by Status"
                        description="Distribution across case statuses."
                        delay={0.15}
                    >
                        <DonutChart
                            data={props.casesByStatus}
                            centerLabel="Cases"
                        />
                    </Panel>
                </div>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    <Panel title="Survivors by Gender" delay={0.2}>
                        <DonutChart
                            data={props.survivorsByGender}
                            centerLabel="Survivors"
                        />
                    </Panel>
                    <Panel title="Survivors by Age Range" delay={0.25}>
                        <DonutChart
                            data={props.survivorsByAge}
                            centerLabel="Survivors"
                        />
                    </Panel>
                    <Panel
                        title="Team Composition"
                        description="Staff by role."
                        delay={0.3}
                    >
                        {props.usersByRole.length > 0 ? (
                            <DonutChart
                                data={props.usersByRole}
                                centerLabel="Team"
                            />
                        ) : (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                No team members yet.
                            </p>
                        )}
                    </Panel>
                </div>

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    <Panel title="Top Incident Types" delay={0.35}>
                        <BarChart data={props.topIncidentTypes} />
                    </Panel>
                    <Panel
                        title="Pending Referrals"
                        description="Awaiting action from your team."
                        delay={0.4}
                    >
                        <PendingReferralsList rows={props.pendingReferrals} />
                    </Panel>
                </div>

                <Panel
                    title="Recent Cases"
                    description="Latest 5 cases within your partner."
                    delay={0.45}
                >
                    <RecentCasesTable rows={props.recentCases} />
                </Panel>
            </div>
        </>
    );
}

function PendingReferralsList({ rows }: { rows: PendingReferral[] }) {
    if (rows.length === 0) {
        return (
            <p className="py-6 text-center text-sm text-muted-foreground">
                Nothing pending. 🎉
            </p>
        );
    }
    return (
        <ul className="divide-y">
            {rows.map((r) => (
                <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 py-3"
                >
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                            {r.referral_number} · {r.type ?? "Referral"}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {r.from_partner} → {r.to_partner}
                        </p>
                    </div>
                    {r.urgency && (
                        <span
                            className="rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{
                                backgroundColor:
                                    (r.urgency_color ?? "#94a3b8") + "22",
                                color: r.urgency_color ?? undefined,
                            }}
                        >
                            {r.urgency}
                        </span>
                    )}
                </li>
            ))}
        </ul>
    );
}

function RecentCasesTable({ rows }: { rows: RecentCase[] }) {
    if (rows.length === 0) {
        return (
            <p className="py-6 text-center text-sm text-muted-foreground">
                No cases yet.
            </p>
        );
    }
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                    <tr className="border-b">
                        <th className="py-2 text-left font-medium">Case #</th>
                        <th className="py-2 text-left font-medium">Survivor</th>
                        <th className="py-2 text-left font-medium">Type</th>
                        <th className="py-2 text-left font-medium">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => (
                        <tr key={r.id} className="border-b last:border-0">
                            <td className="py-2 font-mono text-xs">
                                {r.case_number}
                            </td>
                            <td className="py-2">{r.survivor_name}</td>
                            <td className="py-2 text-muted-foreground">
                                {r.incident_type ?? "—"}
                            </td>
                            <td className="py-2">
                                <span
                                    className="rounded-full px-2 py-0.5 text-xs font-medium"
                                    style={{
                                        backgroundColor:
                                            (r.status_color ?? "#94a3b8") +
                                            "22",
                                        color: r.status_color ?? undefined,
                                    }}
                                >
                                    {r.status ?? "—"}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [{ title: "Admin Dashboard", href: "/dashboard" }],
};
