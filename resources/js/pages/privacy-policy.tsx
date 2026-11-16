import { Head } from "@inertiajs/react";
import {
    CheckCircle,
    EyeOff,
    ShieldCheck,
    FileText,
    BarChart3,
    Share2,
    Lock,
    Archive,
    UserCheck,
    AlertCircle,
    Mail,
    Building2,
    RefreshCw,
    Users,
    Database,
    FileSearch,
    UserCog,
    type LucideIcon,
} from "lucide-react";
import GuestLayout from "@/layouts/guest-layout";
import { useLanguage } from "@/hooks/use-language";
import type { TranslationKey } from "@/lib/translations";

// ============ TYPES ============
interface FeatureItem {
    icon: LucideIcon;
    labelKey: TranslationKey;
}

interface ListColumn {
    headingKey: TranslationKey;
    itemKeys: TranslationKey[];
}

type SectionType =
    | "text"
    | "cards"
    | "list"
    | "split"
    | "alert"
    | "flow"
    | "consent";

interface PrivacySection {
    id: string;
    titleKey: TranslationKey;
    icon: LucideIcon;
    type: SectionType;
    contentKey?: TranslationKey;
    itemKeys?: FeatureItem[];
    listKeys?: TranslationKey[];
    columns?: ListColumn[];
}

// ============ STATIC CONFIG (not translatable) ============
const PRIVACY_SECTIONS: PrivacySection[] = [
    {
        id: "introduction",
        titleKey: "privacyIntroTitle",
        icon: FileText,
        type: "text",
        contentKey: "privacyIntroBody",
    },
    {
        id: "purpose",
        titleKey: "privacyPurposeTitle",
        icon: ShieldCheck,
        type: "cards",
        contentKey: "privacyPurposeIntro",
        itemKeys: [
            { icon: Lock, labelKey: "privacyPurposeItem1" },
            { icon: EyeOff, labelKey: "privacyPurposeItem2" },
            { icon: ShieldCheck, labelKey: "privacyPurposeItem3" },
        ],
    },
    {
        id: "data-collected",
        titleKey: "privacyDataCollectedTitle",
        icon: Database,
        type: "split",
        contentKey: "privacyDataCollectedIntro",
        columns: [
            {
                headingKey: "privacyDataPersonalHeading",
                itemKeys: ["privacyDataPersonal1", "privacyDataPersonal2"],
            },
            {
                headingKey: "privacyDataCaseHeading",
                itemKeys: [
                    "privacyDataCase1",
                    "privacyDataCase2",
                    "privacyDataCase3",
                ],
            },
            {
                headingKey: "privacyDataUserHeading",
                itemKeys: ["privacyDataUser1", "privacyDataUser2"],
            },
        ],
    },
    {
        id: "purpose-collection",
        titleKey: "privacyCollectionTitle",
        icon: BarChart3,
        type: "cards",
        contentKey: "privacyCollectionIntro",
        itemKeys: [
            { icon: FileText, labelKey: "privacyCollection1" },
            { icon: Share2, labelKey: "privacyCollection2" },
            { icon: BarChart3, labelKey: "privacyCollection3" },
            { icon: Building2, labelKey: "privacyCollection4" },
        ],
    },
    {
        id: "data-processing",
        titleKey: "privacyProcessingTitle",
        icon: RefreshCw,
        type: "cards",
        itemKeys: [
            { icon: CheckCircle, labelKey: "privacyProcessing1" },
            { icon: CheckCircle, labelKey: "privacyProcessing2" },
            { icon: CheckCircle, labelKey: "privacyProcessing3" },
        ],
    },
    {
        id: "data-sharing",
        titleKey: "privacySharingTitle",
        icon: Share2,
        type: "split",
        contentKey: "privacySharingIntro",
        columns: [
            {
                headingKey: "privacySharingInternalHeading",
                itemKeys: ["privacySharingInternal1"],
            },
            {
                headingKey: "privacySharingExternalHeading",
                itemKeys: [
                    "privacySharingExternal1",
                    "privacySharingExternal2",
                    "privacySharingExternal3",
                ],
            },
        ],
    },
    {
        id: "data-security",
        titleKey: "privacySecurityTitle",
        icon: Lock,
        type: "cards",
        contentKey: "privacySecurityIntro",
        itemKeys: [
            { icon: Lock, labelKey: "privacySecurity1" },
            { icon: UserCog, labelKey: "privacySecurity2" },
            { icon: FileSearch, labelKey: "privacySecurity3" },
            { icon: Archive, labelKey: "privacySecurity4" },
        ],
    },
    {
        id: "data-retention",
        titleKey: "privacyRetentionTitle",
        icon: Archive,
        type: "list",
        contentKey: "privacyRetentionIntro",
        listKeys: [
            "privacyRetention1",
            "privacyRetention2",
            "privacyRetention3",
        ],
    },
    {
        id: "user-rights",
        titleKey: "privacyRightsTitle",
        icon: UserCheck,
        type: "cards",
        contentKey: "privacyRightsIntro",
        itemKeys: [
            { icon: EyeOff, labelKey: "privacyRights1" },
            { icon: RefreshCw, labelKey: "privacyRights2" },
            { icon: Archive, labelKey: "privacyRights3" },
        ],
    },
    {
        id: "confidentiality",
        titleKey: "privacyConfidentialityTitle",
        icon: ShieldCheck,
        type: "alert",
        contentKey: "privacyConfidentialityText",
    },
    {
        id: "data-breach",
        titleKey: "privacyBreachTitle",
        icon: AlertCircle,
        type: "flow",
        contentKey: "privacyBreachIntro",
        itemKeys: [
            { icon: Users, labelKey: "privacyBreach1" },
            { icon: Lock, labelKey: "privacyBreach2" },
            { icon: Mail, labelKey: "privacyBreach3" },
            { icon: CheckCircle, labelKey: "privacyBreach4" },
        ],
    },
    {
        id: "compliance",
        titleKey: "privacyComplianceTitle",
        icon: ShieldCheck,
        type: "list",
        contentKey: "privacyComplianceIntro",
        listKeys: ["privacyCompliance1", "privacyCompliance2"],
    },
    {
        id: "policy-updates",
        titleKey: "privacyUpdatesTitle",
        icon: RefreshCw,
        type: "text",
        contentKey: "privacyUpdatesText",
    },
    {
        id: "contact",
        titleKey: "privacyContactTitle",
        icon: Mail,
        type: "cards",
        itemKeys: [
            { icon: Building2, labelKey: "privacyContactOrg" },
            { icon: Mail, labelKey: "privacyContactDept" },
        ],
    },
    {
        id: "consent",
        titleKey: "privacyConsentTitle",
        icon: CheckCircle,
        type: "consent",
        contentKey: "privacyConsentText",
    },
];

// ============ SECTION RENDERER ============
function SectionCard({ section }: { section: PrivacySection }) {
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

                {/* Cards grid */}
                {section.type === "cards" && section.itemKeys && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {section.itemKeys.map((item, i) => {
                            const ItemIcon = item.icon;
                            return (
                                <div
                                    key={i}
                                    className="flex flex-col items-center justify-center rounded-lg bg-secondary/50 p-4 text-center"
                                >
                                    <ItemIcon
                                        size={24}
                                        className="text-primary mb-2"
                                    />
                                    <p className="text-sm font-semibold text-foreground">
                                        {t(item.labelKey)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* List */}
                {section.type === "list" && section.listKeys && (
                    <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground">
                        {section.listKeys.map((key) => (
                            <li key={key}>{t(key)}</li>
                        ))}
                    </ul>
                )}

                {/* Split columns */}
                {section.type === "split" && section.columns && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {section.columns.map((col, i) => (
                            <div key={i}>
                                <h3 className="mb-2 text-base font-bold text-primary">
                                    {t(col.headingKey)}
                                </h3>
                                <div className="rounded-lg bg-secondary/50 p-4">
                                    {col.itemKeys.length === 1 ? (
                                        <p className="text-sm text-muted-foreground mb-0">
                                            {t(col.itemKeys[0])}
                                        </p>
                                    ) : (
                                        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                                            {col.itemKeys.map((key) => (
                                                <li key={key}>{t(key)}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Alert */}
                {section.type === "alert" && section.contentKey && (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <span className="font-semibold">
                            {t(section.contentKey)}
                        </span>
                    </div>
                )}

                {/* Flow (numbered steps) */}
                {section.type === "flow" && section.itemKeys && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {section.itemKeys.map((item, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center text-center"
                            >
                                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                                    {i + 1}
                                </div>
                                <p className="text-xs font-semibold text-muted-foreground">
                                    {t(item.labelKey)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Consent card */}
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
export default function PrivacyPolicy() {
    const { t } = useLanguage();

    return (
        <GuestLayout>
            <Head title={t("privacyPageTitle")} />

            <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8 lg:px-12">
                {/* Hero Header */}
                <div className="mb-8 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between gap-4 bg-primary p-6 text-primary-foreground">
                        <div>
                            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                                {t("privacyPageTitle")}
                            </h1>
                            <p className="mt-2 text-sm text-primary-foreground/80">
                                {t("privacySubtitle")}
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
                            {t("privacyIntroAlert")}
                        </span>
                    </div>
                </div>

                {/* Sections */}
                <div className="space-y-4">
                    {PRIVACY_SECTIONS.map((section) => (
                        <SectionCard key={section.id} section={section} />
                    ))}
                </div>

                {/* Footer Note */}
                <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                    <ShieldCheck size={12} />
                    <span>
                        {t("privacySubtitle")} — {t("copyright")}
                    </span>
                </div>
            </div>
        </GuestLayout>
    );
}
