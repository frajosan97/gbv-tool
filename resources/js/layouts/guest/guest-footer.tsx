import { Link } from "@inertiajs/react";
import {
    Shield,
    Heart,
    Users,
    BookOpen,
    PhoneCall,
    Lock,
    Facebook,
    Twitter,
    Linkedin,
    Youtube,
    HeartPulse,
    UserCheck,
} from "lucide-react";
import AppLogo from "@/components/app-logo";
import { useLanguage } from "@/hooks/use-language";
import { translations } from "@/lib/translations";

type TranslationKey = keyof (typeof translations)["English"];

const LINK_MUTED = "transition hover:text-destructive";

export default function GuestFooter() {
    const { t } = useLanguage();

    const footerLinks: {
        titleKey: TranslationKey;
        icon: any;
        links: TranslationKey[];
    }[] = [
        {
            titleKey: "footerAboutTitle",
            icon: Shield,
            links: [
                "footerMission",
                "footerTeam",
                "footerReports",
                "footerMedia",
            ],
        },
        {
            titleKey: "footerSupportTitle",
            icon: Heart,
            links: [
                "footerHelpline",
                "footerShelter",
                "footerLegal",
                "footerCounseling",
            ],
        },
        {
            titleKey: "footerResourcesTitle",
            icon: BookOpen,
            links: [
                "footerEduMaterials",
                "footerResearch",
                "footerPolicy",
                "footerFaqs",
            ],
        },
        {
            titleKey: "footerInvolvedTitle",
            icon: Users,
            links: [
                "footerVolunteer",
                "footerDonate",
                "footerPartnerships",
                "footerEvents",
            ],
        },
    ];

    return (
        <footer
            id="contact-footer"
            className="relative bg-card pt-20 pb-0 overflow-hidden"
        >
            {/* Architectural pattern */}
            <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.02] dark:opacity-[0.03]">
                <svg
                    width="100%"
                    height="100%"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <pattern
                            id="architectural"
                            x="0"
                            y="0"
                            width="100"
                            height="100"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M0 100 L100 0 M-25 75 L75 -25 M25 125 L125 25"
                                stroke="currentColor"
                                className="text-foreground"
                                strokeWidth="1"
                            />
                            <rect
                                x="0"
                                y="0"
                                width="100"
                                height="100"
                                fill="none"
                                stroke="currentColor"
                                className="text-foreground"
                                strokeWidth="0.5"
                            />
                        </pattern>
                    </defs>
                    <rect
                        width="100%"
                        height="100%"
                        fill="url(#architectural)"
                    />
                </svg>
            </div>

            <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 mb-16">
                    {/* Brand column */}
                    <div className="lg:col-span-4">
                        <Link href="/" className="mb-5 inline-block">
                            <AppLogo className="h-14 w-auto" />
                        </Link>
                        <p className="mb-6 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
                            {t("footerDesc")}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-8">
                            <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary">
                                <Lock size={12} /> {t("securePortal")}
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary">
                                <Shield size={12} /> {t("confidential")}
                            </span>
                        </div>
                        <div className="flex gap-4 text-muted-foreground">
                            {[Facebook, Twitter, Linkedin, Youtube].map(
                                (Icon, i) => (
                                    <a
                                        key={i}
                                        href="#"
                                        className="rounded-full bg-secondary p-2 transition hover:bg-accent hover:text-destructive"
                                    >
                                        <Icon size={18} />
                                    </a>
                                ),
                            )}
                        </div>
                    </div>

                    {footerLinks.map((col) => {
                        const Icon = col.icon;
                        return (
                            <div key={col.titleKey} className="lg:col-span-2">
                                <h4 className="mb-5 flex items-center gap-2 text-sm font-extrabold text-foreground">
                                    <Icon
                                        size={16}
                                        className="text-muted-foreground"
                                    />
                                    {t(col.titleKey)}
                                </h4>
                                <ul className="space-y-3.5 text-[14px] font-medium text-muted-foreground">
                                    {col.links.map((linkKey) => (
                                        <li key={linkKey}>
                                            <Link
                                                href="#"
                                                className={LINK_MUTED}
                                            >
                                                {t(linkKey)}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {/* Emergency contacts strip */}
                <div className="mb-12 rounded-2xl border border-border bg-gradient-to-r from-accent/40 to-card px-6 py-6 shadow-sm">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                icon: PhoneCall,
                                color: "text-destructive",
                                ring: "ring-destructive/20",
                                value: "1195",
                                label: t("footerHelpline"),
                            },
                            {
                                icon: Shield,
                                color: "text-destructive",
                                ring: "ring-destructive/20",
                                value: "999",
                                label: t("police"),
                            },
                            {
                                icon: HeartPulse,
                                color: "text-brand-amber",
                                ring: "ring-brand-amber/20",
                                value: "020-2222-111",
                                label: t("hospital"),
                            },
                            {
                                icon: UserCheck,
                                color: "text-brand-purple",
                                ring: "ring-brand-purple/20",
                                value: "116",
                                label: t("childHelpline"),
                            },
                        ].map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={i}
                                    className="flex items-center gap-4 border-border sm:border-r sm:last:border-0 pr-4"
                                >
                                    <div
                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-card shadow-sm ring-1 ${item.ring}`}
                                    >
                                        <Icon
                                            className={item.color}
                                            size={22}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-lg font-extrabold text-foreground leading-tight">
                                            {item.value}
                                        </p>
                                        <p className="text-xs font-bold text-muted-foreground">
                                            {item.label}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Bottom copyright bar */}
            <div className="relative z-10 border-t border-border bg-destructive py-4">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row sm:px-8 lg:px-12">
                    <p className="text-[13px] font-semibold tracking-wide text-destructive-foreground/90">
                        © {new Date().getFullYear()} {t("copyright")}
                    </p>
                    <div className="flex items-center gap-6 text-[13px] font-semibold tracking-wide text-destructive-foreground/90">
                        <Link
                            href="/privacy-policy"
                            className="transition hover:text-destructive-foreground hover:underline"
                        >
                            {t("privacyPolicy")}
                        </Link>
                        <Link
                            href="/terms-and-conditions"
                            className="transition hover:text-destructive-foreground hover:underline"
                        >
                            {t("termsConditions")}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
