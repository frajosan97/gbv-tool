import {
    AlertTriangle,
    Building2,
    Calendar,
    CalendarCheck2,
    ClipboardList,
    Clock,
    FileText,
    Flag,
    Gavel,
    HeartPulse,
    Lock,
    MapPin,
    Phone,
    ShieldAlert,
    ShieldCheck,
    Stethoscope,
    UserRound,
    Users,
    XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { ProfileSection } from "@/components/ui/profile-section";
import { DetailRow } from "@/components/ui/detail-row";
import { formatDate } from "@/lib/formatters";

import type { GbvCase } from "@/types";

interface Props {
    case: GbvCase;
}

// ---------- Helpers ----------

function statusStyles(name: string | undefined | null): string {
    const key = (name ?? "").toLowerCase();
    if (
        key.includes("closed") ||
        key.includes("resolved") ||
        key.includes("concluded")
    )
        return "bg-slate-600 text-white hover:bg-slate-600/90";
    if (
        key.includes("active") ||
        key.includes("open") ||
        key.includes("progress")
    )
        return "bg-sky-600 text-white hover:bg-sky-600/90";
    if (key.includes("pending") || key.includes("awaiting"))
        return "bg-amber-500 text-white hover:bg-amber-500/90";
    if (
        key.includes("escalat") ||
        key.includes("urgent") ||
        key.includes("critical")
    )
        return "bg-rose-600 text-white hover:bg-rose-600/90";
    return "bg-slate-500 text-white hover:bg-slate-500/90";
}

function priorityStyles(name: string | undefined | null): string {
    const key = (name ?? "").toLowerCase();
    if (key.includes("critical") || key.includes("high"))
        return "bg-rose-600 text-white hover:bg-rose-600/90";
    if (key.includes("medium") || key.includes("moderate"))
        return "bg-amber-500 text-white hover:bg-amber-500/90";
    if (key.includes("low"))
        return "bg-emerald-600 text-white hover:bg-emerald-600/90";
    return "bg-slate-500 text-white hover:bg-slate-500/90";
}

function YesNo({
    value,
    yes = "Yes",
    no = "No",
}: {
    value: boolean;
    yes?: string;
    no?: string;
}) {
    return value ? (
        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            {yes}
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 text-muted-foreground">
            <XCircle className="h-3.5 w-3.5" />
            {no}
        </span>
    );
}

function NA() {
    return <span className="italic text-muted-foreground">N/A</span>;
}

// ---------- Component ----------

export function CaseOverviewTab({ case: c }: Props) {
    const locations = [
        c.village?.name,
        c.ward?.name,
        c.sub_county?.name,
        c.county?.name,
    ]
        .filter(Boolean)
        .join(", ");

    const incidentWhen = c.incident_date
        ? `${formatDate(c.incident_date)}${c.incident_time ? ` at ${c.incident_time}` : ""}`
        : "—";

    return (
        <div className="space-y-5">
            {/* ============ Narrative ============ */}
            <ProfileSection title="Incident Narrative">
                <div className="col-span-full">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                        {c.description || "No narrative recorded."}
                    </p>
                </div>
            </ProfileSection>

            {/* ============ Two-column detail grid ============ */}
            <div className="grid gap-5 md:grid-cols-2">
                {/* ---------- LEFT ---------- */}
                <div className="space-y-5">
                    <ProfileSection title="Incident Details">
                        <DetailRow icon={ShieldAlert} label="Incident Type">
                            {c.incident_type?.name ?? c.incident_type_other ?? (
                                <NA />
                            )}
                        </DetailRow>

                        <DetailRow icon={Calendar} label="Incident Date">
                            {c.incident_date ? incidentWhen : <NA />}
                        </DetailRow>

                        <DetailRow icon={MapPin} label="Location">
                            {c.incident_location ?? (locations || <NA />)}
                        </DetailRow>

                        <DetailRow icon={MapPin} label="Administrative Area">
                            {locations || <NA />}
                        </DetailRow>

                        <DetailRow icon={ClipboardList} label="Incident No.">
                            <span className="font-mono text-xs">
                                {c.incident_number ?? "—"}
                            </span>
                        </DetailRow>
                    </ProfileSection>

                    <ProfileSection title="Classification">
                        <DetailRow icon={Flag} label="Status">
                            {c.status?.name ? (
                                <Badge
                                    className={`rounded-full border-none px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles(c.status.name)}`}
                                >
                                    {c.status.name}
                                </Badge>
                            ) : (
                                <NA />
                            )}
                        </DetailRow>

                        <DetailRow icon={AlertTriangle} label="Priority">
                            {c.priority?.name ? (
                                <Badge
                                    className={`rounded-full border-none px-2.5 py-0.5 text-xs font-semibold capitalize ${priorityStyles(c.priority.name)}`}
                                >
                                    {c.priority.name}
                                </Badge>
                            ) : (
                                <NA />
                            )}
                        </DetailRow>

                        <DetailRow icon={Lock} label="Confidentiality">
                            {c.confidentiality?.name ?? <NA />}
                        </DetailRow>

                        <DetailRow icon={ShieldAlert} label="Sensitive">
                            <YesNo
                                value={c.is_sensitive}
                                yes="Marked sensitive"
                                no="Standard"
                            />
                        </DetailRow>
                    </ProfileSection>

                    <ProfileSection title="People Involved">
                        <DetailRow icon={UserRound} label="Survivor">
                            {c.survivor ? (
                                <span>
                                    <span className="font-medium">
                                        {c.survivor.full_name ?? "Anonymous"}
                                    </span>
                                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                                        {c.survivor.unique_code}
                                    </span>
                                </span>
                            ) : (
                                <NA />
                            )}
                        </DetailRow>

                        <DetailRow icon={Users} label="Primary Officer">
                            {c.primary_officer?.name ?? <NA />}
                        </DetailRow>

                        <DetailRow icon={Building2} label="Partner">
                            {c.partner?.name ?? <NA />}
                        </DetailRow>

                        <DetailRow icon={UserRound} label="Registered By">
                            {c.created_by?.name ?? <NA />}
                        </DetailRow>
                    </ProfileSection>
                </div>

                {/* ---------- RIGHT ---------- */}
                <div className="space-y-5">
                    <ProfileSection title="Police & Medical">
                        <DetailRow
                            icon={ShieldCheck}
                            label="Reported to Police"
                        >
                            <YesNo
                                value={c.reported_to_police}
                                yes="Reported"
                                no="Not reported"
                            />
                        </DetailRow>

                        <DetailRow icon={Building2} label="Police Station">
                            {c.police_station ?? <NA />}
                        </DetailRow>

                        <DetailRow icon={FileText} label="OB Number">
                            <span className="font-mono text-xs">
                                {c.ob_number ?? "—"}
                            </span>
                        </DetailRow>

                        <DetailRow icon={HeartPulse} label="Medical Attention">
                            <YesNo
                                value={c.medical_attention}
                                yes="Received"
                                no="None"
                            />
                        </DetailRow>

                        <DetailRow icon={Stethoscope} label="Health Facility">
                            {c.health_facility ?? <NA />}
                        </DetailRow>
                    </ProfileSection>

                    <ProfileSection title="Consent">
                        <DetailRow icon={ShieldCheck} label="Consent Obtained">
                            <YesNo
                                value={c.consent_obtained}
                                yes="Given"
                                no="Not given"
                            />
                        </DetailRow>

                        {c.consent_details && (
                            <DetailRow
                                icon={ClipboardList}
                                label="Consent Notes"
                            >
                                <span className="text-sm leading-relaxed">
                                    {c.consent_details}
                                </span>
                            </DetailRow>
                        )}
                    </ProfileSection>

                    <ProfileSection title="Resolution">
                        <DetailRow icon={Gavel} label="Conclusion">
                            {c.conclusion_type?.name ?? <NA />}
                        </DetailRow>

                        <DetailRow icon={CalendarCheck2} label="Concluded At">
                            {c.concluded_at ? (
                                formatDate(c.concluded_at)
                            ) : (
                                <NA />
                            )}
                        </DetailRow>

                        <DetailRow icon={UserRound} label="Concluded By">
                            {c.concluded_by?.name ?? <NA />}
                        </DetailRow>

                        {c.conclusion_notes && (
                            <DetailRow
                                icon={ClipboardList}
                                label="Conclusion Notes"
                            >
                                <span className="text-sm leading-relaxed">
                                    {c.conclusion_notes}
                                </span>
                            </DetailRow>
                        )}
                    </ProfileSection>

                    <ProfileSection title="Record">
                        <DetailRow icon={Calendar} label="Opened">
                            {c.created_at ? formatDate(c.created_at) : <NA />}
                        </DetailRow>

                        <DetailRow icon={Clock} label="Last Updated">
                            {c.updated_at ? formatDate(c.updated_at) : <NA />}
                        </DetailRow>

                        <DetailRow icon={FileText} label="Case Number">
                            <span className="font-mono text-xs">
                                {c.case_number}
                            </span>
                        </DetailRow>
                    </ProfileSection>
                </div>
            </div>
        </div>
    );
}
