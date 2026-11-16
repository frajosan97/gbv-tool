import { Head, Link } from "@inertiajs/react";
import {
    Shield,
    Heart,
    Users,
    Building2,
    Activity,
    Lock,
    BookOpen,
    ArrowRight,
    HeartPulse,
} from "lucide-react";
import GuestLayout from "@/layouts/guest-layout";
import { useLanguage } from "@/hooks/use-language";
import type { TranslationKey } from "@/lib/translations";

// ============ SHARED CLASSES ============
const CARD_BASE =
    "rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md";

// ============ STATIC CONFIG (non-translatable) ============
const COUNTY_STATS: { labelKey: TranslationKey; value: string }[] = [
    { labelKey: "population", value: "1.2M" },
    { labelKey: "area", value: "30,496 km²" },
    { labelKey: "wards", value: "40" },
    { labelKey: "facilities", value: "147" },
];

const DASHBOARD_STATS: {
    labelKey: TranslationKey;
    value: string;
    trend: string;
    trendUp: boolean;
    icon: typeof Heart;
    color: string;
    bg: string;
}[] = [
    {
        labelKey: "activeCases",
        value: "247",
        trend: "+12%",
        trendUp: true,
        icon: Heart,
        color: "text-blue-500 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
        labelKey: "survivorsHelped",
        value: "1,847",
        trend: "+23%",
        trendUp: true,
        icon: Users,
        color: "text-primary",
        bg: "bg-primary/5 dark:bg-primary/10",
    },
    {
        labelKey: "partnerAgencies",
        value: "43",
        trend: "+5",
        trendUp: true,
        icon: Building2,
        color: "text-purple-500 dark:text-purple-400",
        bg: "bg-purple-50 dark:bg-purple-500/10",
    },
    {
        labelKey: "responseTime",
        value: "4.2m",
        trend: "-18%",
        trendUp: false,
        icon: Activity,
        color: "text-amber-500 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-500/10",
    },
];

const MONTHLY_TARGET: { labelKey: TranslationKey; percent: number } = {
    labelKey: "monthlyTarget",
    percent: 78,
};

// ============ COMPONENT ============
export default function Welcome() {
    const { t } = useLanguage();

    const scrollToSection = (id: string): void => {
        const element = document.getElementById(id);
        if (!element) return;
        const headerOffset = 100;
        const offsetPosition =
            element.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    };

    return (
        <GuestLayout>
            <Head title="Kitui County GBV Information System" />

            {/* ============ HERO ============ */}
            <section className="relative overflow-hidden bg-background pt-16 pb-24 lg:pt-24 lg:pb-32 transition-colors">
                {/* Topographic pattern */}
                <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]">
                    <svg
                        width="100%"
                        height="100%"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <pattern
                                id="topo"
                                x="0"
                                y="0"
                                width="400"
                                height="400"
                                patternUnits="userSpaceOnUse"
                            >
                                {[0, 250, 300].map((offset, i) => (
                                    <path
                                        key={i}
                                        d={`M${-50 + i * 50} ${offset} Q 100 ${offset - 100}, 200 ${offset} T ${450 + i * 50} ${offset}`}
                                        fill="none"
                                        stroke="currentColor"
                                        className="text-foreground"
                                        strokeWidth="1.5"
                                    />
                                ))}
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#topo)" />
                    </svg>
                </div>

                {/* Brand blobs */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
                    <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-brand-red/5 dark:bg-brand-red/10 blur-[120px]" />
                    <div className="absolute top-40 -left-40 h-[500px] w-[500px] rounded-full bg-brand-green/5 dark:bg-brand-green/10 blur-[100px]" />
                </div>

                <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
                    <div className="grid items-center gap-16 lg:grid-cols-12">
                        {/* Left copy */}
                        <div className="lg:col-span-7">
                            <div className="mb-6 flex flex-wrap items-center gap-3">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold tracking-wide text-primary-foreground shadow-sm">
                                    <Shield size={14} /> {t("kituiCounty")}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive px-3.5 py-1.5 text-xs font-bold tracking-wide text-destructive-foreground shadow-sm">
                                    <HeartPulse size={14} /> {t("emergency247")}
                                </span>
                            </div>

                            <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight text-foreground lg:text-[4rem]">
                                {t("heroTitle1")} <br />
                                <span className="bg-gradient-to-r from-primary to-brand-amber bg-clip-text text-transparent">
                                    {t("heroTitle2")}
                                </span>
                            </h1>

                            <p className="mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
                                {t("heroDesc")}
                            </p>

                            <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                {COUNTY_STATS.map((stat) => (
                                    <div
                                        key={stat.labelKey}
                                        className={CARD_BASE}
                                    >
                                        <p className="text-2xl font-extrabold text-foreground">
                                            {stat.value}
                                        </p>
                                        <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                            {t(stat.labelKey)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <Link
                                    href="/get-help"
                                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl"
                                >
                                    <Heart size={18} className="fill-current" />
                                    {t("getHelpNow")}
                                </Link>
                                <button
                                    onClick={() =>
                                        scrollToSection("resources-banner")
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg border-2 border-primary bg-card px-8 py-3.5 text-sm font-bold text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent"
                                >
                                    <BookOpen size={18} /> {t("learnMore")}
                                </button>
                            </div>
                        </div>

                        {/* Right dashboard card */}
                        <div className="lg:col-span-5 relative">
                            <div className="absolute -inset-2 rounded-[2rem] bg-gradient-to-tr from-primary/5 to-brand-amber/5 blur-xl" />

                            <div className="relative rounded-2xl border border-border bg-card shadow-[0_8px_40px_rgb(0,0,0,0.06)] dark:shadow-black/40 overflow-hidden">
                                <div className="flex items-center gap-4 border-b border-border bg-secondary/50 p-6">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-inner">
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">
                                            {t("liveDashboard")}
                                        </h3>
                                        <p className="text-xs font-medium text-muted-foreground">
                                            {t("realTimeStats")}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        {DASHBOARD_STATS.map((stat, i) => {
                                            const Icon = stat.icon;
                                            return (
                                                <div
                                                    key={i}
                                                    className={CARD_BASE}
                                                >
                                                    <div className="mb-2 flex items-center gap-2">
                                                        <div
                                                            className={`rounded-md p-1.5 ${stat.bg} ${stat.color}`}
                                                        >
                                                            <Icon size={14} />
                                                        </div>
                                                        <span className="text-xs font-semibold text-muted-foreground">
                                                            {t(stat.labelKey)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-end justify-between">
                                                        <span className="text-2xl font-extrabold text-foreground">
                                                            {stat.value}
                                                        </span>
                                                        <span
                                                            className={`flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
                                                                stat.trendUp
                                                                    ? "bg-primary/5 text-primary"
                                                                    : "bg-destructive/5 text-destructive"
                                                            }`}
                                                        >
                                                            {stat.trendUp
                                                                ? "+"
                                                                : ""}
                                                            {stat.trend}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="mb-6">
                                        <div className="mb-2 flex justify-between text-xs font-bold">
                                            <span className="text-muted-foreground">
                                                {t(MONTHLY_TARGET.labelKey)}
                                            </span>
                                            <span className="text-foreground">
                                                {MONTHLY_TARGET.percent}%
                                            </span>
                                        </div>
                                        <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
                                            <div
                                                className="h-full rounded-full bg-primary relative"
                                                style={{
                                                    width: `${MONTHLY_TARGET.percent}%`,
                                                }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 w-full animate-pulse" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-border pt-5">
                                        <span className="text-xs font-medium text-muted-foreground">
                                            {t("updatedAgo")}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm">
                                            <Lock size={10} /> {t("secure")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ GREEN BANNER ============ */}
            <section
                id="resources-banner"
                className="relative overflow-hidden bg-primary py-10 transition-colors"
            >
                <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%">
                        <pattern
                            id="dots"
                            x="0"
                            y="0"
                            width="20"
                            height="20"
                            patternUnits="userSpaceOnUse"
                        >
                            <circle cx="2" cy="2" r="1.5" fill="white" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#dots)" />
                    </svg>
                </div>

                <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
                    <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold text-primary-foreground tracking-tight">
                                {t("rightsTitle")}
                            </h2>
                            <p className="mt-2 text-sm font-medium text-primary-foreground/80">
                                {t("rightsDesc")}
                            </p>
                        </div>
                        <Link
                            href="/resources"
                            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-card px-6 py-3 text-sm font-bold text-foreground shadow-lg transition hover:-translate-y-0.5 hover:bg-secondary"
                        >
                            <BookOpen size={18} /> {t("viewResources")}
                            <ArrowRight size={16} className="ml-1" />
                        </Link>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
