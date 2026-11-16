// pages/dashboard/system-admin.tsx
import { Head, Link, router } from "@inertiajs/react";
import {
    Users,
    Scale,
    Share2,
    Building2,
    ShieldCheck,
    AlertCircle,
    Gauge,
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

type Summary = Record<string, number>;
type System = Record<string, number>;

type Props = {
    summary: Summary;
    system: System;
    monthlyTrend: TrendPoint[];
    survivorsByGender: Slice[];
    survivorsByAge: Slice[];
    topIncidentTypes: Slice[];
    casesByStatus: Slice[];
    partnersByType: Slice[];
    topPartners: Slice[];
    recentCases: RecentCase[];

    filters: DashboardFiltersState;
    counties: CountyOption[];
    genders: Option[];
    ageRanges: Option[];
    disabilityTypes: Option[];
    incidentTypes: Option[];
    partners: Option[];
};

export default function SystemAdminDashboard(props: Props) {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        router.reload({ onFinish: () => setIsRefreshing(false) });
    }, []);

    const headline: StatCardData[] = [
        {
            id: "users",
            label: "Users",
            value: props.system.users_total,
            hint: `${props.system.users_active} active · ${props.system.users_new_30d} new (30d)`,
            icon: Users,
            accent: true,
        },
        {
            id: "partners",
            label: "Partners",
            value: props.system.partners_total,
            hint: `${props.system.partners_verified} verified · ${props.system.partners_pending} pending`,
            icon: Building2,
        },
        {
            id: "survivors",
            label: "Total Survivors",
            value: props.summary.survivors_total,
            hint: `${props.summary.survivors_new_30d} new (30d) · ${props.summary.survivors_anonymous} anonymous`,
            icon: ShieldCheck,
            tone: "success",
        },
        {
            id: "cases",
            label: "GBV Cases",
            value: props.summary.cases_total,
            hint: `${props.summary.cases_open} open · ${props.summary.cases_concluded} concluded`,
            icon: Scale,
            tone: "warning",
        },
    ];

    const secondary: StatCardData[] = [
        {
            id: "referrals",
            label: "Referrals",
            value: props.summary.referrals_total,
            hint: `${props.summary.referrals_open} open · ${props.summary.referrals_completed} completed`,
            icon: Share2,
        },
        {
            id: "referrals-pending",
            label: "Pending Referrals",
            value: props.summary.referrals_pending,
            icon: AlertCircle,
            tone: "warning",
        },
        {
            id: "files",
            label: "Case Files",
            value: props.summary.files_total,
            hint: `${props.summary.files_pending_review} require review`,
            icon: ShieldCheck,
        },
        {
            id: "sensitive",
            label: "Sensitive Cases",
            value: props.summary.cases_sensitive,
            icon: AlertCircle,
            tone: "danger",
        },
    ];

    return (
        <>
            <Head title="System Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Gauge className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold leading-tight">
                                System Dashboard
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {props.system.users_total} users ·{" "}
                                {props.system.partners_total} partners
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
                    </div>
                </div>

                <DashboardFilters
                    filters={props.filters}
                    counties={props.counties}
                    genders={props.genders}
                    ageRanges={props.ageRanges}
                    disabilityTypes={props.disabilityTypes}
                    incidentTypes={props.incidentTypes}
                    partners={props.partners}
                />

                <StatsCards data={headline} cols={4} />
                <StatsCards data={secondary} cols={4} />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <Panel
                        title="Survivors by Gender"
                        description="Across filtered data."
                        delay={0.2}
                    >
                        <DonutChart
                            data={props.survivorsByGender}
                            centerLabel="Survivors"
                        />
                    </Panel>
                    <Panel
                        title="Survivors by Age Range"
                        description="Across filtered data."
                        delay={0.25}
                    >
                        <DonutChart
                            data={props.survivorsByAge}
                            centerLabel="Survivors"
                        />
                    </Panel>
                    <Panel
                        title="Partners by Type"
                        description="Organization category breakdown."
                        delay={0.3}
                    >
                        <DonutChart
                            data={props.partnersByType}
                            centerLabel="Partners"
                        />
                    </Panel>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Panel
                        title="Top Incident Types"
                        description="Most common in filtered data."
                        delay={0.35}
                    >
                        <BarChart data={props.topIncidentTypes} />
                    </Panel>
                    <Panel
                        title="Most Active Partners"
                        description="By case volume."
                        delay={0.4}
                    >
                        <BarChart data={props.topPartners} />
                    </Panel>
                </div>

                <Panel
                    title="Recent Cases"
                    description="Latest 5 in filtered data."
                    delay={0.45}
                >
                    <RecentCasesTable rows={props.recentCases} />
                </Panel>
            </div>
        </>
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

SystemAdminDashboard.layout = {
    breadcrumbs: [{ title: "System Dashboard", href: "/dashboard" }],
};
