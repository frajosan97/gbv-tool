// resources/js/types/gbv-cases.ts

import type { Lookup, Paginator } from "@/types";

// ---------------------------------------------------------------------------
// Lookup refs
// ---------------------------------------------------------------------------

export interface GbvCaseLookupRef {
    id: number;
    name: string;
}

export interface GbvCasePartnerRef {
    id: number;
    name: string;
}

export interface GbvCaseColoredLookupRef extends GbvCaseLookupRef {
    color?: string | null;
}

// ---------------------------------------------------------------------------
// Note types & notes
// ---------------------------------------------------------------------------

export interface NoteType {
    id: number;
    slug: string;
    name: string;
    icon: string | null;
    color: string | null;
    description: string | null;
    is_private_by_default: boolean;
    is_active: boolean;
    sort_order: number;
}

export interface CaseNoteAttachment {
    path: string;
    name: string;
    size: number;
    mime: string;
}

export interface CaseNote {
    id: number;
    content: string;
    author: string | null;
    created_by: number;
    note_type_id: number | null;
    note_type: NoteType | null;
    is_private: boolean;
    is_important: boolean;
    attachments: CaseNoteAttachment[] | null;
    metadata: Record<string, unknown> | null;
    created_at: string | null;
    updated_at: string | null;
}

// ---------------------------------------------------------------------------
// GBV Case
// ---------------------------------------------------------------------------

export interface GbvCase {
    id: number;
    case_number: string;
    incident_number: string | null;
    incident_type: GbvCaseLookupRef | null;
    incident_type_other: string | null;
    incident_date: string | null;
    incident_time: string | null;
    incident_location: string | null;
    description: string;
    reported_to_police: boolean;
    police_station: string | null;
    ob_number: string | null;
    medical_attention: boolean;
    health_facility: string | null;
    is_sensitive: boolean;
    consent_obtained: boolean;
    consent_details: string | null;

    status: GbvCaseLookupRef | null;
    priority: GbvCaseLookupRef | null;
    confidentiality: GbvCaseLookupRef | null;
    conclusion_type: GbvCaseLookupRef | null;
    conclusion_notes: string | null;
    concluded_at: string | null;

    partner: GbvCasePartnerRef | null;
    survivor: {
        id: number;
        unique_code: string;
        full_name: string | null;
    } | null;
    primary_officer: GbvCaseLookupRef | null;
    created_by: GbvCaseLookupRef | null;
    concluded_by: GbvCaseLookupRef | null;

    county: GbvCaseLookupRef | null;
    sub_county: GbvCaseLookupRef | null;
    ward: GbvCaseLookupRef | null;
    village: GbvCaseLookupRef | null;

    files_count?: number;
    referrals_count?: number;
    perpetrators_count?: number;
    notes_count?: number;

    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
}

// ---------------------------------------------------------------------------
// Tab relation models
// ---------------------------------------------------------------------------

export interface CaseFile {
    id: number;
    file_number: string;
    title: string;
    description: string | null;
    file_name: string;
    file_size: number | null;
    mime_type: string | null;
    file_type: string | null;
    referral_id: number | null;
    url: string | null;
    uploaded_by: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface Perpetrator {
    id: number;
    name: string | null;
    name_known: boolean;
    gender_option: GbvCaseLookupRef | null;
    age_range: GbvCaseLookupRef | null;
    relationship_option: GbvCaseLookupRef | null;
    relationship_details: string | null;
    physical_description: Record<string, unknown> | null;
    identifying_features: Record<string, unknown> | null;
    is_repeat_offender: boolean;
    previous_incidents_count: number;
    additional_info: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export type ReferralStatusValue =
    | "pending"
    | "accepted"
    | "declined"
    | "completed"
    | "cancelled";

export interface Referral {
    id: number;
    referral_number: string;
    referral_type: GbvCaseLookupRef | null;
    urgency: GbvCaseColoredLookupRef | null;
    from_partner: GbvCasePartnerRef | null;
    to_partner: GbvCasePartnerRef | null;
    case_file: { id: number; title: string } | null;
    reason: string | null;
    services_requested: string[] | null;
    status: ReferralStatusValue;
    accepted_at: string | null;
    completed_at: string | null;
    feedback: string | null;
    created_by: GbvCaseLookupRef | null;
    files?: CaseFile[];
    created_at: string | null;
    updated_at: string | null;
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

export type TimelineEventType =
    | "case"
    | "file"
    | "perpetrator"
    | "referral"
    | "note"
    | "status";

export interface TimelineEvent {
    id: string;
    type: TimelineEventType;
    title: string;
    description?: string;
    actor?: string | null;
    timestamp: string;
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface GbvCaseFilters {
    search: string;
    incident_type_id: string;
    case_status_id: string;
    priority_level_id: string;
    confidentiality_level_id: string;
    county_id: string;
    sub_county_id: string;
    ward_id: string;
    partner_id: string;
    survivor_id: string;
    is_sensitive: string;
    reported_to_police: string;
    medical_attention: string;
    from: string;
    to: string;
    per_page: number;
    sort: string;
    dir: "asc" | "desc";
    [key: string]: string | number | boolean | undefined;
}

// ---------------------------------------------------------------------------
// Lookup bags
// ---------------------------------------------------------------------------

export interface SurvivorOption {
    id: number;
    name: string;
    label: string;
}

export interface GbvCasesLookups {
    incidentTypes: Lookup[];
    caseStatuses: Lookup[];
    priorityLevels: Lookup[];
    confidentialityLevels: Lookup[];
    counties: Lookup[];
    conclusionTypes?: Lookup[];
    noteTypes?: Lookup[];
    survivors: SurvivorOption[];
}

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

export type GbvCaseTabId =
    | "overview"
    | "files"
    | "perpetrators"
    | "referrals"
    | "notes"
    | "timeline";

export interface GbvCaseTabItem {
    id: GbvCaseTabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
}

// ---------------------------------------------------------------------------
// Page props
// ---------------------------------------------------------------------------

export interface GbvCasesIndexProps {
    cases: Paginator<GbvCase>;
    filters: GbvCaseFilters;
    lookups: GbvCasesLookups;
    can: {
        create: boolean;
        export: boolean;
    };
}

export interface GbvCaseShowProps {
    case: GbvCase & {
        files: CaseFile[];
        perpetrators: Perpetrator[];
        referrals: Referral[];
        notes: CaseNote[];
        timeline: TimelineEvent[];
    };
    lookups: {
        fileTypes: Lookup[];
    };
    can: {
        update: boolean;
        delete: boolean;
        restore: boolean;
        print: boolean;
        conclude: boolean;
        export: boolean;

        // Notes
        createNote: boolean;
        viewPrivateNotes: boolean;
    };
}

export interface GbvCasesCreateProps {
    lookups: GbvCasesLookups;
    can: { create: boolean };
}

export interface GbvCasesEditProps {
    case: GbvCase;
    lookups: GbvCasesLookups;
    can: {
        update: boolean;
        delete: boolean;
        print: boolean;
        conclude: boolean;
    };
}

// ---------------------------------------------------------------------------
// Form data
// ---------------------------------------------------------------------------

export interface GbvCaseFormData {
    survivor_id: number | "";
    partner_id: number | "";
    county_id: number | "";
    sub_county_id: number | "";
    ward_id: number | "";
    village_id: number | "";
    primary_officer_id: number | "";
    case_number: string;
    incident_number: string;
    incident_type_id: number | "";
    incident_type_other: string;
    incident_date: string;
    incident_time: string;
    incident_location: string;
    description: string;
    reported_to_police: boolean;
    police_station: string;
    ob_number: string;
    medical_attention: boolean;
    health_facility: string;
    case_status_id: number | "";
    priority_level_id: number | "";
    confidentiality_level_id: number | "";
    is_sensitive: boolean;
    consent_obtained: boolean;
    consent_details: string;
}

export interface PerpetratorFormData {
    name: string;
    name_known: boolean;
    gender_option_id: string;
    age_range_id: string;
    relationship_option_id: string;
    relationship_details: string;
    physical_description_text: string;
    identifying_features_text: string;
    is_repeat_offender: boolean;
    previous_incidents_count: string;
    additional_info: string;
}

export interface ReferralFormData {
    to_partner_id: string;
    referral_type_id: string;
    urgency_option_id: string;
    case_file_id: string;
    reason: string;
    services_requested: string[];
    feedback: string;
    status: ReferralStatusValue;
}

export interface CaseFileFormData {
    file: File | null;
    title: string;
    description: string;
    file_type_id: string;
}

export interface NoteFormData {
    content: string;
    note_type_id: string;
    is_private: boolean;
    is_important: boolean;
}

// ---------------------------------------------------------------------------
// Referral index page
// ---------------------------------------------------------------------------

export interface ReferralIndexFilters {
    search: string;
    status: string;
    urgency: string;
    sort: string;
    dir: "asc" | "desc";
    per_page: number;
    [key: string]: string | number | boolean | undefined;
}

export interface ReferralCaseRef {
    id: number;
    case_number: string;
    incident_number: string | null;
}

export interface ReferralListItem {
    id: number;
    referral_number: string;
    status: ReferralStatusValue;
    reason: string | null;
    services_requested: string[] | null;
    feedback: string | null;
    accepted_at: string | null;
    completed_at: string | null;

    referral_type: GbvCaseLookupRef | null;
    urgency: GbvCaseColoredLookupRef | null;

    from_partner: GbvCasePartnerRef | null;
    to_partner: GbvCasePartnerRef | null;
    gbv_case: ReferralCaseRef | null;
    created_by: GbvCaseLookupRef | null;

    updates_count?: number;

    created_at: string | null;
    updated_at: string | null;
}

export interface ReferralsIndexProps {
    referrals: Paginator<ReferralListItem>;
    filters: ReferralIndexFilters;
    counts: {
        pending: number;
        accepted: number;
        completed: number;
    };
    can: {
        update: boolean;
    };
}