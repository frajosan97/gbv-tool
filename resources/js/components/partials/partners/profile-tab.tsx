import {
    Building2,
    CalendarDays,
    CheckCircle2,
    Globe,
    Mail,
    MapPin,
    Phone,
    ShieldCheck,
    User as UserIcon,
    XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ProfileSection } from "@/components/ui/profile-section";
import { DetailRow } from "@/components/ui/detail-row";
import { formatDate } from "@/lib/formatters";

import type { Partner } from "@/types";

interface Props {
    partner: Partner;
    locationParts: string[];
}

function StatusBadge({ status }: { status: string | null }) {
    const key = (status ?? "unknown").toLowerCase();
    const styles: Record<string, string> = {
        approved: "bg-emerald-600 text-white",
        pending: "bg-amber-500 text-white",
        rejected: "bg-rose-600 text-white",
        suspended: "bg-slate-600 text-white",
        unknown: "bg-slate-500 text-white",
    };
    return (
        <Badge
            className={`rounded-full border-none px-2 py-0.5 text-xs font-semibold capitalize ${styles[key] ?? styles.unknown}`}
        >
            {status ?? "Unknown"}
        </Badge>
    );
}

export function ProfileTab({ partner, locationParts }: Props) {
    const locationLabel =
        locationParts.length > 0 ? locationParts.join(", ") : "—";

    return (
        <div className="grid gap-5 md:grid-cols-2">
            {/* ---------- LEFT ---------- */}
            <div className="space-y-5">
                <ProfileSection title="Organization Information">
                    <DetailRow icon={Building2} label="Name">
                        <span className="font-medium">
                            {partner.organization_name}
                        </span>
                    </DetailRow>

                    <DetailRow icon={Building2} label="Organization Type">
                        {partner.organization_type?.name ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={Building2} label="Registration No.">
                        {partner.registration_number ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={CalendarDays} label="Year Established">
                        {partner.year_established ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={Globe} label="Website">
                        {partner.website ? (
                            <a
                                href={partner.website}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline dark:text-blue-400"
                            >
                                {partner.website}
                            </a>
                        ) : (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>
                </ProfileSection>

                <ProfileSection title="Contact Information">
                    <DetailRow icon={UserIcon} label="Contact Person">
                        {partner.contact_person ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={Mail} label="Email">
                        {partner.email ? (
                            <a
                                href={`mailto:${partner.email}`}
                                className="text-blue-600 hover:underline dark:text-blue-400"
                            >
                                {partner.email}
                            </a>
                        ) : (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={Phone} label="Phone">
                        {partner.phone ? (
                            <span className="text-emerald-600 dark:text-emerald-400">
                                {partner.phone}
                            </span>
                        ) : (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={Phone} label="Alternate Phone">
                        {partner.alternate_phone ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>
                </ProfileSection>
            </div>

            {/* ---------- RIGHT ---------- */}
            <div className="space-y-5">
                <ProfileSection title="Location">
                    <DetailRow icon={MapPin} label="County">
                        {partner.county?.name ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={MapPin} label="Sub-county">
                        {partner.sub_county?.name ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={MapPin} label="Ward">
                        {partner.ward?.name ?? (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={MapPin} label="Village">
                        {partner.village?.name ?? (
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

                <ProfileSection title="Verification">
                    <DetailRow icon={ShieldCheck} label="Status">
                        <StatusBadge status={partner.status} />
                    </DetailRow>

                    <DetailRow icon={CheckCircle2} label="Verified">
                        {partner.is_verified ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Yes
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                                <XCircle className="h-3.5 w-3.5" />
                                No
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={CalendarDays} label="Verified At">
                        {partner.verified_at ? (
                            formatDate(partner.verified_at)
                        ) : (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>

                    <DetailRow icon={CalendarDays} label="Created At">
                        {partner.created_at ? (
                            formatDate(partner.created_at)
                        ) : (
                            <span className="italic text-muted-foreground">
                                N/A
                            </span>
                        )}
                    </DetailRow>
                </ProfileSection>

                {partner.services_offered &&
                    partner.services_offered.length > 0 && (
                        <ProfileSection title="Services Offered">
                            <div className="col-span-full flex flex-wrap gap-2 pt-1">
                                {partner.services_offered.map((service, i) => (
                                    <Badge
                                        key={i}
                                        variant="secondary"
                                        className="rounded-full"
                                    >
                                        {service}
                                    </Badge>
                                ))}
                            </div>
                        </ProfileSection>
                    )}

                {partner.description && (
                    <ProfileSection title="Description">
                        <div className="col-span-full">
                            <p className="text-sm leading-relaxed text-foreground">
                                {partner.description}
                            </p>
                        </div>
                    </ProfileSection>
                )}
            </div>
        </div>
    );
}
