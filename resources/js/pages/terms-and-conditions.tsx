import { Head } from "@inertiajs/react";
import {
    ShieldCheck,
    CheckCircle,
    AlertTriangle,
    Info,
    XCircle,
    Lock,
    ShieldAlert,
    Scale,
    Mail,
    Building2,
    type LucideIcon,
} from "lucide-react";
import GuestLayout from "@/layouts/guest-layout";
import { useLanguage } from "@/hooks/use-language";
import type { TranslationKey } from "@/lib/translations";

// ============ TYPES ============
interface FeatureItem {
    icon?: LucideIcon;
    labelKey: TranslationKey;
}

interface TermColumn {
    headingKey: TranslationKey;
    variant: "success" | "danger" | "neutral";
    itemKeys: TranslationKey[];
}

type TermSectionType =
    | "text"
    | "cards"
    | "list"
    | "split"
    | "alert"
    | "consent";

interface TermSection {
    id: string;
    titleKey: TranslationKey;
    icon: LucideIcon;
    type: TermSectionType;
    contentKey?: TranslationKey;
    itemKeys?: FeatureItem[];
    listKeys?: TranslationKey[];
    columns?: TermColumn[];
    alertVariant?: "info" | "warning" | "danger" | "secondary";
    alertContentKey?: TranslationKey;
}

// ============ STATIC CONFIG (not translatable) ============
const TERM_SECTIONS: TermSection[] = [
    {
        id: "introduction",
        titleKey: "termsIntroTitle",
        icon: ShieldCheck,
        type: "text",
        contentKey: "termsIntroBody",
    },
    {
        id: "definitions",
        titleKey: "termsDefTitle",
        icon: Info,
        type: "cards",
        itemKeys: [
            { icon: Info, labelKey: "termsDef1" },
            { icon: Info, labelKey: "termsDef2" },
            { icon: Info, labelKey: "termsDef3" },
            { icon: Info, labelKey: "termsDef4" },
        ],
    },
    {
        id: "eligibility",
        titleKey: "termsEligTitle",
        icon: CheckCircle,
        type: "list",
        contentKey: "termsEligIntro",
        listKeys: ["termsElig1", "termsElig2", "termsElig3"],
        alertVariant: "warning",
        alertContentKey: "termsEligAlert",
    },
    {
        id: "responsibilities",
        titleKey: "termsRespTitle",
        icon: ShieldCheck,
        type: "split",
        columns: [
            {
                headingKey: "termsRespShallHeading",
                variant: "success",
                itemKeys: [
                    "termsRespShall1",
                    "termsRespShall2",
                    "termsRespShall3",
                    "termsRespShall4",
                ],
            },
            {
                headingKey: "termsRespShantHeading",
                variant: "danger",
                itemKeys: [
                    "termsRespShant1",
                    "termsRespShant2",
                    "termsRespShant3",
                    "termsRespShant4",
                ],
            },
        ],
    },
    {
        id: "system-use",
        titleKey: "termsUseTitle",
        icon: Info,
        type: "list",
        contentKey: "termsUseIntro",
        listKeys: ["termsUse1", "termsUse2", "termsUse3"],
        alertVariant: "danger",
        alertContentKey: "termsUseAlert",
    },
    {
        id: "data-handling",
        titleKey: "termsDataTitle",
        icon: Lock,
        type: "list",
        contentKey: "termsDataIntro",
        listKeys: ["termsData1", "termsData2", "termsData3"],
    },
    {
        id: "access-control",
        titleKey: "termsAccessTitle",
        icon: ShieldAlert,
        type: "text",
        contentKey: "termsAccessBody",
    },
    {
        id: "security",
        titleKey: "termsSecurityTitle",
        icon: Lock,
        type: "split",
        columns: [
            {
                headingKey: "termsSecurityUsersHeading",
                variant: "neutral",
                itemKeys: [
                    "termsSecurityUsers1",
                    "termsSecurityUsers2",
                    "termsSecurityUsers3",
                ],
            },
            {
                headingKey: "termsSecurityAdminHeading",
                variant: "neutral",
                itemKeys: [
                    "termsSecurityAdmin1",
                    "termsSecurityAdmin2",
                    "termsSecurityAdmin3",
                ],
            },
        ],
    },
    {
        id: "availability",
        titleKey: "termsAvailTitle",
        icon: Info,
        type: "list",
        contentKey: "termsAvailIntro",
        listKeys: ["termsAvail1", "termsAvail2"],
        alertVariant: "secondary",
        alertContentKey: "termsAvailAlert",
    },
    {
        id: "liability",
        titleKey: "termsLiabilityTitle",
        icon: AlertTriangle,
        type: "list",
        contentKey: "termsLiabilityIntro",
        listKeys: ["termsLiability1", "termsLiability2", "termsLiability3"],
    },
    {
        id: "termination",
        titleKey: "termsTerminationTitle",
        icon: XCircle,
        type: "list",
        contentKey: "termsTerminationIntro",
        listKeys: [
            "termsTermination1",
            "termsTermination2",
            "termsTermination3",
        ],
    },
    {
        id: "ip",
        titleKey: "termsIpTitle",
        icon: Scale,
        type: "list",
        contentKey: "termsIpIntro",
        listKeys: ["termsIp1", "termsIp2", "termsIp3"],
    },
    {
        id: "compliance",
        titleKey: "termsComplianceTitle",
        icon: ShieldCheck,
        type: "list",
        contentKey: "termsComplianceIntro",
        listKeys: ["termsCompliance1", "termsCompliance2", "termsCompliance3"],
    },
    {
        id: "amendments",
        titleKey: "termsAmendmentsTitle",
        icon: Info,
        type: "text",
        contentKey: "termsAmendmentsBody",
    },
    {
        id: "governing-law",
        titleKey: "termsLawTitle",
        icon: Scale,
        type: "text",
        contentKey: "termsLawBody",
    },
    {
        id: "contact",
        titleKey: "termsContactTitle",
        icon: Mail,
        type: "cards",
        itemKeys: [
            { icon: Building2, labelKey: "termsContactOrg" },
            { icon: Mail, labelKey: "termsContactDept" },
        ],
    },
    {
        id: "acceptance",
        titleKey: "termsAcceptanceTitle",
        icon: CheckCircle,
        type: "consent",
        contentKey: "termsAcceptanceBody",
    },
];

// ============ ALERT ============
function AlertBox({
    variant,
    children,
}: {
    variant: "info" | "warning" | "danger" | "secondary";
    children: React.ReactNode;
}) {
    const styles: Record<string, string> = {
        info: "border-primary/30 bg-primary/5 text-primary",
        warning:
            "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400",
        danger: "border-destructive/30 bg-destructive/5 text-destructive",
        secondary: "border-border bg-secondary/50 text-muted-foreground",
    };
    const icons = {
        info: Info,
        warning: AlertTriangle,
        danger: AlertTriangle,
        secondary: Info,
    };
    const Icon = icons[variant];

    return (
        <div
            className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${styles[variant]}`}
        >
            <Icon size={16} className="mt-0.5 shrink-0" />
            <span className="font-semibold">{children}</span>
        </div>
    );
}

// ============ SECTION RENDERER ============
function SectionCard({ section }: { section: TermSection }) {
    const { t } = useLanguage();
    const Icon = section.icon;

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 border-b border-border px-6 py-4">
                <Icon size={22} className="text-primary shrink-0" />
                <h2 className="text-lg font-bold text-primary">
                    {t(section.titleKey)}
                </h2>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
                {section.contentKey && (
                    <p className="text-muted-foreground mb-4">
                        {t(section.contentKey)}
                    </p>
                )}

                {/* List + optional alert */}
                {section.type === "list" && section.listKeys && (
                    <>
                        <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                            {section.listKeys.map((key) => (
                                <li key={key}>{t(key)}</li>
                            ))}
                        </ul>
                        {section.alertVariant && section.alertContentKey && (
                            <div className="mt-4">
                                <AlertBox variant={section.alertVariant}>
                                    {t(section.alertContentKey)}
                                </AlertBox>
                            </div>
                        )}
                    </>
                )}

                {/* Cards */}
                {section.type === "cards" && section.itemKeys && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {section.itemKeys.map((item, i) => {
                            const ItemIcon = item.icon;
                            return (
                                <div
                                    key={i}
                                    className="rounded-lg bg-secondary/50 p-4"
                                >
                                    {ItemIcon && (
                                        <ItemIcon
                                            size={20}
                                            className="text-primary mb-2"
                                        />
                                    )}
                                    <p className="text-sm font-semibold text-foreground">
                                        {t(item.labelKey)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Split (shall / shall not) */}
                {section.type === "split" && section.columns && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {section.columns.map((col, i) => {
                            const headingClass =
                                col.variant === "success"
                                    ? "text-primary"
                                    : col.variant === "danger"
                                      ? "text-destructive"
                                      : "text-foreground";
                            return (
                                <div key={i}>
                                    <h3
                                        className={`mb-2 flex items-center gap-1.5 text-sm font-bold ${headingClass}`}
                                    >
                                        {col.variant === "success" && "✓ "}
                                        {col.variant === "danger" && "✗ "}
                                        {t(col.headingKey)}
                                    </h3>
                                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                        {col.itemKeys.map((key) => (
                                            <li key={key}>{t(key)}</li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Consent */}
                {section.type === "consent" && (
                    <div className="flex flex-col items-center justify-center rounded-lg bg-primary/5 p-6 text-center">
                        <CheckCircle size={32} className="text-primary mb-3" />
                        <h3 className="mb-2 text-lg font-bold text-foreground">
                            {t(section.titleKey)}
                        </h3>
                        {section.contentKey && (
                            <p className="text-sm font-semibold text-muted-foreground">
                                {t(section.contentKey)}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============ PAGE ============
export default function TermsAndConditions() {
    const { t } = useLanguage();

    return (
        <GuestLayout>
            <Head title={t("termsPageTitle")} />

            <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8 lg:px-12">
                {/* Hero Header */}
                <div className="mb-8 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between gap-4 bg-primary p-6 text-primary-foreground">
                        <div>
                            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                                {t("termsPageTitle")}
                            </h1>
                            <p className="mt-2 text-sm text-primary-foreground/80">
                                {t("termsSubtitle")}
                            </p>
                            <p className="text-xs text-primary-foreground/70">
                                {t("copyright")}
                            </p>
                        </div>
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/20">
                            <ShieldCheck
                                size={36}
                                className="text-primary-foreground"
                            />
                        </div>
                    </div>

                    {/* Intro Alert */}
                    <div className="flex items-start gap-2 border-t border-border bg-card px-6 py-4 text-sm">
                        <CheckCircle
                            size={18}
                            className="mt-0.5 shrink-0 text-primary"
                        />
                        <span className="font-semibold text-foreground">
                            {t("termsIntroAlert")}
                        </span>
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-4">
                    {TERM_SECTIONS.map((section) => (
                        <SectionCard key={section.id} section={section} />
                    ))}
                </div>

                {/* Footer Note */}
                <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck size={12} />
                    <span>
                        {t("termsSubtitle")} — {t("copyright")}
                    </span>
                </div>
            </div>
        </GuestLayout>
    );
}
