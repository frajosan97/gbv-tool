import {
    Calendar,
    CalendarDays,
    CircleDot,
    Contact,
    FileBadge,
    FileText,
    GraduationCap,
    MapPin,
    Phone,
    ShieldAlert,
    ShieldCheck,
    User as UserIcon,
    UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ProfileSection } from "@/components/ui/profile-section";
import { DetailRow } from "@/components/ui/detail-row";

import type { Survivor } from "@/types";
import { formatDate } from "@/lib/formatters";

interface Props {
    survivor: Survivor;
    ageDisplay: string;
    locationParts: string[];
}

export function ProfileTab({ survivor, ageDisplay, locationParts }: Props) {
    // ---------- Derived ----------

    const displayName = survivor.anonymous
        ? "Anonymous survivor"
        : (survivor.full_name ?? "—");

    const documentLabel = survivor.anonymous
        ? "—"
        : survivor.id_type?.name
          ? `${survivor.id_type.name}${survivor.id_number ? ` · ${survivor.id_number}` : ""}`
          : "—";

    const locationLabel =
        locationParts.length > 0 ? locationParts.join(", ") : "—";

    // ---------- Render ----------

    return (
        <div className="grid gap-5 md:grid-cols-2">
            {/* ================= LEFT COLUMN ================= */}
            <div className="space-y-5">
                <ProfileSection title="Personal Information">
                    <DetailRow icon={UserIcon} label="Full Name">
                        <span className="font-medium">{displayName}</span>
                        {survivor.anonymous && (
                            <Badge className="ml-2 rounded-full border-none bg-violet-600 px-2 py-0.5 text-xs font-semibold text-white hover:bg-violet-600/90">
                                <ShieldAlert className="mr-1 h-3 w-3" />
                                Anonymous
                            </Badge>
                        )}
                    </DetailRow>

                    <DetailRow icon={Contact} label="Unique Code">
                        <span className="font-mono text-xs">
                            {survivor.unique_code}
                        </span>
                    </DetailRow>

                    <DetailRow icon={CircleDot} label="Gender">
                        {survivor.gender_option?.name ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={Calendar} label="Date of Birth">
                        {survivor.dob ? (
                            formatDate(survivor.dob)
                        ) : (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={UserRound} label="Age">
                        {ageDisplay}
                    </DetailRow>

                    <DetailRow icon={FileBadge} label="Document">
                        {documentLabel === "—" ? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        ) : (
                            documentLabel
                        )}
                    </DetailRow>
                </ProfileSection>

                <ProfileSection title="Contact Information">
                    <DetailRow icon={Phone} label="Primary Phone">
                        {survivor.anonymous ? (
                            <span className="italic text-muted-foreground">
                                Hidden
                            </span>
                        ) : survivor.phone ? (
                            <span className="text-emerald-600 dark:text-emerald-400">
                                {survivor.phone}
                            </span>
                        ) : (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={Phone} label="Alternate Phone">
                        {survivor.anonymous ? (
                            <span className="italic text-muted-foreground">
                                Hidden
                            </span>
                        ) : survivor.alternate_phone ? (
                            survivor.alternate_phone
                        ) : (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={UserRound} label="Emergency Contact">
                        {survivor.anonymous ? (
                            <span className="italic text-muted-foreground">
                                Hidden
                            </span>
                        ) : survivor.emergency_contact_name ? (
                            survivor.emergency_contact_name
                        ) : (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={Phone} label="Emergency Phone">
                        {survivor.anonymous ? (
                            <span className="italic text-muted-foreground">
                                Hidden
                            </span>
                        ) : survivor.emergency_contact_phone ? (
                            survivor.emergency_contact_phone
                        ) : (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={Contact} label="Relationship">
                        {survivor.emergency_contact_relationship?.name ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>
                </ProfileSection>
            </div>

            {/* ================= RIGHT COLUMN ================= */}
            <div className="space-y-5">
                <ProfileSection title="Location">
                    <DetailRow icon={MapPin} label="County">
                        {survivor.county?.name ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={MapPin} label="Sub-county">
                        {survivor.sub_county?.name ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={MapPin} label="Ward">
                        {survivor.ward?.name ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={MapPin} label="Village">
                        {survivor.village?.name ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={MapPin} label="Landmark">
                        {survivor.landmark ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={MapPin} label="Full Address">
                        {locationLabel === "—" ? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        ) : (
                            locationLabel
                        )}
                    </DetailRow>
                </ProfileSection>

                <ProfileSection title="Disability">
                    <DetailRow
                        icon={ShieldCheck}
                        label="Person with Disability"
                    >
                        {survivor.is_pwd ? (
                            <Badge className="rounded-full border-none bg-sky-600 px-2 py-0.5 text-xs font-semibold text-white hover:bg-sky-600/90">
                                Yes
                            </Badge>
                        ) : (
                            <span className="italic text-muted-foreground">
                                No
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={ShieldCheck} label="Disability Type">
                        {survivor.disability_type?.name ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={FileBadge} label="PWD Registration No.">
                        {survivor.pwd_registration_number ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>
                </ProfileSection>

                <ProfileSection title="Consent & Record">
                    <DetailRow icon={ShieldCheck} label="Consent">
                        {survivor.consent_given ? (
                            <Badge className="rounded-full border-none bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white hover:bg-emerald-600/90">
                                Given
                            </Badge>
                        ) : (
                            <Badge className="rounded-full border-none bg-rose-600 px-2 py-0.5 text-xs font-semibold text-white hover:bg-rose-600/90">
                                Not given
                            </Badge>
                        )}
                    </DetailRow>

                    <DetailRow icon={CalendarDays} label="Consent Date">
                        {survivor.consent_given_at ? (
                            formatDate(survivor.consent_given_at)
                        ) : (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={FileText} label="GBV Cases">
                        {survivor.gbv_cases_count ?? 0}
                    </DetailRow>

                    <DetailRow icon={UserRound} label="Registered By">
                        {survivor.created_by?.name ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={GraduationCap} label="Partner">
                        {survivor.partner?.organization_name ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={CalendarDays} label="Registered At">
                        {survivor.created_at ? (
                            formatDate(survivor.created_at)
                        ) : (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>
                </ProfileSection>
            </div>
        </div>
    );
}
