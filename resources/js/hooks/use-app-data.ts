// resources/js/hooks/use-app-data.ts
import { usePage } from "@inertiajs/react";

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string | null;
    partner_id?: number | null;
    county_id?: number | null;
    sub_county_id?: number | null;
    ward_id?: number | null;
    village_id?: number | null;
    is_active?: boolean;
    [key: string]: unknown;
}

/* ------------------------------------------------------------------ */
/* Flash                                                               */
/* ------------------------------------------------------------------ */

export interface FlashMessages {
    success: string | null;
    error: string | null;
}

/* ------------------------------------------------------------------ */
/* Location lookups                                                    */
/* ------------------------------------------------------------------ */

export interface County {
    id: number;
    code: string;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface SubCounty {
    id: number;
    county_id: number;
    code: string;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface Ward {
    id: number;
    sub_county_id: number;
    code: string;
    name: string;
    created_at?: string;
    updated_at?: string;
}

export interface Village {
    id: number;
    ward_id: number;
    code: string;
    name: string;
    created_at?: string;
    updated_at?: string;
}

/* ------------------------------------------------------------------ */
/* Common lookup shape                                                 */
/* ------------------------------------------------------------------ */

export interface LookupOption {
    id: number;
    slug: string;
    name: string;
    icon?: string | null;
    color?: string | null;
    description?: string | null;
    is_active: boolean;
    sort_order: number;
    created_at?: string;
    updated_at?: string;
}

export interface IncidentType extends LookupOption {
    category: string;
}

export interface DisabilityType extends LookupOption {
    category: string;
}

export interface AgeRange extends LookupOption {
    min_age: number | null;
    max_age: number | null;
}

export interface IdType extends LookupOption {
    requires_number: boolean;
}

export interface CaseStatusOption extends LookupOption {
    is_concluded: boolean;
}

export interface FileType extends LookupOption {
    is_evidence: boolean;
    requires_review: boolean;
}

export interface NoteType extends LookupOption {
    is_private_by_default: boolean;
}

export type PriorityLevel = LookupOption;
export type ConfidentialityLevel = LookupOption;
export type GenderOption = LookupOption;
export type RelationshipOption = LookupOption;
export type ConclusionType = LookupOption;
export type ReferralType = LookupOption;
export type UrgencyOption = LookupOption;
export type TimelineEventType = LookupOption;

/* ------------------------------------------------------------------ */
/* Partners / organizations                                            */
/* ------------------------------------------------------------------ */

export interface PartnerSummary {
    id: number;
    organization_name: string;
    contact_person: string | null;
    email: string | null;
    phone: string | null;
}

export interface OrganizationType {
    id: number;
    name: string;
}

/* ------------------------------------------------------------------ */
/* Context payload (matches ContextService::all())                     */
/* ------------------------------------------------------------------ */

export interface AppContext {
    // Locations
    counties: County[];
    subCounties: SubCounty[];
    wards: Ward[];
    villages: Village[];

    // Partners / organizations
    partners: PartnerSummary[];
    organizationTypes: OrganizationType[];

    // Incident / case
    incidentTypes: IncidentType[];
    incidentTypesGrouped: Record<string, IncidentType[]>;
    priorityLevels: PriorityLevel[];
    confidentialityLevels: ConfidentialityLevel[];
    caseStatuses: CaseStatusOption[];
    conclusionTypes: ConclusionType[];
    referralTypes: ReferralType[];
    urgencyOptions: UrgencyOption[];
    timelineEventTypes: TimelineEventType[];

    // Person / demographic
    idTypes: IdType[];
    disabilityTypes: DisabilityType[];
    ageRanges: AgeRange[];
    genderOptions: GenderOption[];
    relationshipOptions: RelationshipOption[];

    // Files / notes
    fileTypes: FileType[];
    noteTypes: NoteType[];
}

/* ------------------------------------------------------------------ */
/* Page props                                                          */
/* ------------------------------------------------------------------ */

export interface PageProps {
    name: string;
    auth: {
        user: AuthUser | null;
    };
    sidebarOpen: boolean;
    context: AppContext;
    flash: FlashMessages;
    [key: string]: unknown;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

export function useAppData() {
    const { props } = usePage<PageProps>();

    const context = props.context;

    return {
        // Raw context (if you ever need to pass it around)
        context,

        // Locations
        counties: context.counties,
        subCounties: context.subCounties,
        wards: context.wards,
        villages: context.villages,

        // Partners / organizations
        partners: context.partners,
        organizationTypes: context.organizationTypes,

        // Incident / case
        incidentTypes: context.incidentTypes,
        incidentTypesGrouped: context.incidentTypesGrouped,
        priorityLevels: context.priorityLevels,
        confidentialityLevels: context.confidentialityLevels,
        caseStatuses: context.caseStatuses,
        conclusionTypes: context.conclusionTypes,
        referralTypes: context.referralTypes,
        urgencyOptions: context.urgencyOptions,
        timelineEventTypes: context.timelineEventTypes,

        // Person / demographic
        idTypes: context.idTypes,
        disabilityTypes: context.disabilityTypes,
        ageRanges: context.ageRanges,
        genderOptions: context.genderOptions,
        relationshipOptions: context.relationshipOptions,

        // Files / notes
        fileTypes: context.fileTypes,
        noteTypes: context.noteTypes,

        // Auth / UI
        user: props.auth.user,
        flash: props.flash,
        sidebarOpen: props.sidebarOpen,
        appName: props.name,
        props,
    };
}

/* ------------------------------------------------------------------ */
/* Convenience helpers                                                 */
/* ------------------------------------------------------------------ */

/** Find a lookup by slug. */
export function findBySlug<T extends { slug: string }>(
    list: T[],
    slug: string | null | undefined,
): T | undefined {
    if (!slug) return undefined;
    return list.find((item) => item.slug === slug);
}

/** Filter sub-counties by a county. */
export function subCountiesOf(
    subCounties: SubCounty[],
    countyId: number | null | undefined,
): SubCounty[] {
    if (!countyId) return [];
    return subCounties.filter((s) => s.county_id === countyId);
}

/** Filter wards by a sub-county. */
export function wardsOf(
    wards: Ward[],
    subCountyId: number | null | undefined,
): Ward[] {
    if (!subCountyId) return [];
    return wards.filter((w) => w.sub_county_id === subCountyId);
}

/** Filter villages by a ward. */
export function villagesOf(
    villages: Village[],
    wardId: number | null | undefined,
): Village[] {
    if (!wardId) return [];
    return villages.filter((v) => v.ward_id === wardId);
}

/** Find an organization type by id. */
export function organizationTypeOf(
    types: OrganizationType[],
    id: number | null | undefined,
): OrganizationType | undefined {
    if (!id) return undefined;
    return types.find((t) => t.id === id);
}

export default useAppData;