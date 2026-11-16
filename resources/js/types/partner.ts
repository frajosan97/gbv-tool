import type { DataTableFilters, Paginator } from "@/types";

// ------------------------------------------------------------------
//  Shared lookups
// ------------------------------------------------------------------

/** Minimal shape for any lookup relation returned by the API. */
export interface Ref {
    id: number;
    name: string;
}

/** Alias used across the app for consistency with survivor types. */
export type Lookup = Ref;

// ------------------------------------------------------------------
//  Status
// ------------------------------------------------------------------

/**
 * Mirrors the `partners.status` enum in the migration:
 *   enum('pending', 'approved', 'rejected', 'suspended')
 */
export type PartnerStatus =
    | "pending"
    | "approved"
    | "rejected"
    | "suspended";

// ------------------------------------------------------------------
//  Related collections (hydrated when the backend eager-loads them)
// ------------------------------------------------------------------

export interface PartnerUser {
    id: number;
    name: string;
    email: string | null;
    phone?: string | null;
    created_at: string | null;
}

export interface PartnerSurvivor {
    id: number;
    unique_code: string;
    full_name: string | null;
    anonymous: boolean;
    status?: string | null;
    created_at: string | null;
}

export interface PartnerCase {
    id: number;
    case_number: string | null;
    status: string | null;
    created_at: string | null;
}

// ------------------------------------------------------------------
//  Partner (response shape)
// ------------------------------------------------------------------

export interface Partner {
    id: number;
    organization_name: string;
    registration_number: string | null;
    year_established: number | null;
    contact_person: string | null;
    email: string | null;
    phone: string | null;
    alternate_phone?: string | null;

    status: PartnerStatus | null;
    verified_at: string | null;
    is_verified: boolean;

    // Relations (present when loaded via `whenLoaded`)
    organization_type?: Ref | null;
    county?: Ref | null;
    sub_county?: Ref | null;
    ward?: Ref | null;
    village?: Ref | null;

    // Extra detail fields (present only on `show`)
    website?: string | null;
    description?: string | null;
    services_offered?: string[] | null;
    address?: string | null;
    city?: string | null;
    postal_code?: string | null;

    // Aggregates
    users_count: number;
    survivors_count: number;
    gbv_cases_count: number;
    active_cases_count?: number;

    // Hydrated collections (present only on `show` when loaded)
    users?: PartnerUser[];
    survivors?: PartnerSurvivor[];
    gbv_cases?: PartnerCase[];

    created_at: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
}

// ------------------------------------------------------------------
//  Filters
// ------------------------------------------------------------------

/**
 * `DataTableFilters` supplies the index signature the shared
 * `DataTable` component requires. Every concrete field below narrows
 * one of those keys to its exact type.
 */
export interface PartnerFilters extends DataTableFilters {
    search: string;
    sort: string;
    dir: "asc" | "desc";
    per_page: number;
    status: string;
    organization_type_id: string;
    county_id: string;
    verified: string;
}

// ------------------------------------------------------------------
//  Page props
// ------------------------------------------------------------------

export interface PartnersIndexProps {
    partners: Paginator<Partner>;
    filters: PartnerFilters;
    organizationTypes: Ref[];
    counties?: Ref[];
    can: {
        create: boolean;
        export: boolean;
    };
}

export interface PartnersCreateProps {
    can: {
        create: boolean;
    };
}

export interface PartnersEditProps {
    partner: Partner;
    can: {
        update: boolean;
        delete: boolean;
        verify: boolean;
    };
}

export interface PartnerShowProps {
    partner: Partner;
    can?: {
        update?: boolean;
        delete?: boolean;
        verify?: boolean;
        print?: boolean;
    };
}