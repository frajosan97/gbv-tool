// ------------------------------------------------------------------
//  Survivor types
// ------------------------------------------------------------------

// Re-use the existing Paginator from its own module.
import type { Paginator } from "./paginator";

// Re-use the existing Lookup type from its own module.
import type { Lookup } from "./partner";

// ------------------------------------------------------------------
//  Survivor (response shape)
// ------------------------------------------------------------------

export interface Survivor {
    id: number;
    unique_code: string;
    full_name: string | null;
    phone: string | null;
    alternate_phone: string | null;
    gender_option?: Lookup | null;
    dob: string | null;
    age: number | null;
    age_range?: Lookup | null;
    is_pwd: boolean;
    disability_type?: Lookup | null;
    pwd_registration_number: string | null;
    id_number: string | null;
    id_type?: Lookup | null;
    county?: Lookup | null;
    sub_county?: Lookup | null;
    ward?: Lookup | null;
    village?: Lookup | null;
    landmark: string | null;
    location_coordinates: { lat?: number; lng?: number } | null;
    anonymous: boolean;
    consent_given: boolean;
    consent_given_at: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_relationship?: Lookup | null;
    partner?: { id: number; organization_name: string } | null;
    created_by?: { id: number; name: string } | null;

    // ---------- Aggregates ----------
    gbv_cases_count?: number;

    // ---------- Hydrated collections (present on `show` when loaded) ----------
    gbv_cases?: Array<{
        id: number;
        case_number: string | null;
        status: string | null;
        created_at: string | null;
    }>;

    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
}
// ------------------------------------------------------------------
//  Survivor form data
// ------------------------------------------------------------------

/**
 * Nested "bag" fields are `any` on purpose: typing them as
 * `Record<string, FormDataConvertible>` makes Inertia's
 * `FormDataType<T>` constraint recurse infinitely inside
 * `useForm<SurvivorFormData>()`. The server still validates them as
 * nullable arrays, so runtime safety is unchanged.
 */
export interface SurvivorFormData {
    partner_id: number | "";
    unique_code: string;
    full_name: string;
    phone: string; // optional — children may not have their own phone
    alternate_phone: string;
    gender_option_id: number | ""; // required
    dob: string; // required
    age: number | ""; // read-only in UI, submitted to backend
    age_range_id: number | ""; // read-only in UI, submitted to backend
    is_pwd: boolean;
    disability_type_id: number | "";
    pwd_registration_number: string;
    id_number: string; // only submitted when selected document type requires it
    id_type_id: number | "";
    county_id: number | "";
    sub_county_id: number | "";
    ward_id: number | "";
    village_id: number | ""; // FK when selected from the list
    village_name: string; // transient free-text input; resolved server-side
    landmark: string;
    location_coordinates: any;
    anonymous: boolean;
    consent_given: boolean;
    consent_details: any;
    emergency_contact_name: string; // required (guardian)
    emergency_contact_phone: string; // required (guardian)
    emergency_contact_relationship_id: number | "";
    metadata: any;
}

// ------------------------------------------------------------------
//  Filters
// ------------------------------------------------------------------

export type SurvivorFilters = {
    search: string;
    county_id: string;
    sub_county_id: string;
    ward_id: string;
    village_id: string;
    gender_option_id: string;
    age_range_id: string;
    is_pwd: string;
    anonymous: string;
    consent_given: string;
    partner_id: string;
    sort: string;
    dir: "asc" | "desc";
    per_page: number;
};

// ------------------------------------------------------------------
//  Page props
// ------------------------------------------------------------------

/**
 * Index page only needs counties + genders + age ranges to render the
 * toolbar dropdowns. All other lookups (sub-counties, wards, villages,
 * id types, disability types, relationship options) come from
 * `useAppData()` globally and are not shipped per-page.
 */
export interface SurvivorsIndexProps {
    survivors: Paginator<Survivor>;
    filters: SurvivorFilters;
    lookups: {
        counties: Lookup[];
        genderOptions: Lookup[];
        ageRanges: Lookup[];
    };
    can: {
        create: boolean;
        export: boolean;
    };
}

/**
 * Create page ships only the `can.create` flag — every lookup is
 * resolved from `useAppData()` inside the form.
 */
export interface SurvivorsCreateProps {
    can: {
        create: boolean;
    };
}

/**
 * Edit page ships the survivor + per-record `can` flags — every lookup
 * is resolved from `useAppData()` inside the form.
 */
export interface SurvivorsEditProps {
    survivor: Survivor;
    can: {
        update: boolean;
        delete: boolean;
        print: boolean;
    };
}

/**
 * Show page ships the survivor + all relevant per-record and page-level
 * `can` flags so the UI can gate Print / Edit / Delete / Export.
 */
export interface SurvivorShowProps {
    survivor: Survivor;
    can: {
        update: boolean;
        delete: boolean;
        restore: boolean;
        print: boolean;
        export: boolean;
    };
}