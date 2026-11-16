// resources/js/types/dashboard.ts
export type Slice = { name: string; value: number; color?: string | null };
export type TrendPoint = { month: string; survivors: number; cases: number };

export type RecentCase = {
    id: number;
    case_number: string;
    survivor_name: string;
    incident_type: string | null;
    status: string | null;
    status_color: string | null;
    created_at: string | null;
};

export type Option = { value: string; label: string };

export type CountyOption = Option & {
    sub_counties: (Option & {
        wards: (Option & { villages: Option[] })[];
    })[];
};

export type PeriodOption = "7d" | "30d" | "90d" | "all";

export type DashboardFiltersState = {
    period: PeriodOption;
    partner_id: string;
    county_id: string;
    sub_county_id: string;
    ward_id: string;
    village_id: string;
    gender_id: string;
    age_range_id: string;
    disability_type_id: string;
    incident_type_id: string;
    date_from: string;
    date_to: string;
};

export const emptyFilters: DashboardFiltersState = {
    period: "all",
    partner_id: "",
    county_id: "",
    sub_county_id: "",
    ward_id: "",
    village_id: "",
    gender_id: "",
    age_range_id: "",
    disability_type_id: "",
    incident_type_id: "",
    date_from: "",
    date_to: "",
};