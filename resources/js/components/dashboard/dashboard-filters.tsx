// resources/js/components/dashboard/dashboard-filters.tsx
import { router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { Filter, X, SlidersHorizontal, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type {
    CountyOption,
    DashboardFiltersState,
    Option,
} from "@/types/dashboard";

const ALL = "__all__";
const toSel = (v: string) => (v === "" ? ALL : v);
const fromSel = (v: string) => (v === ALL ? "" : v);

type Props = {
    filters: DashboardFiltersState;
    counties: CountyOption[];
    genders: Option[];
    ageRanges: Option[];
    disabilityTypes: Option[];
    incidentTypes: Option[];
    partners: Option[];
};

const PARTIAL_PROPS = [
    "summary",
    "system",
    "monthlyTrend",
    "survivorsByGender",
    "survivorsByAge",
    "topIncidentTypes",
    "casesByStatus",
    "partnersByType",
    "topPartners",
    "recentCases",
    "filters",
] as const;

export function DashboardFilters({
    filters,
    counties,
    genders,
    ageRanges,
    disabilityTypes,
    incidentTypes,
    partners,
}: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);

    const selectedCounty = useMemo(
        () => counties.find((c) => c.value === filters.county_id),
        [counties, filters.county_id],
    );
    const selectedSubCounty = useMemo(
        () =>
            selectedCounty?.sub_counties.find(
                (s) => s.value === filters.sub_county_id,
            ),
        [selectedCounty, filters.sub_county_id],
    );
    const selectedWard = useMemo(
        () => selectedSubCounty?.wards.find((w) => w.value === filters.ward_id),
        [selectedSubCounty, filters.ward_id],
    );

    // Count of "advanced" filters currently set (excludes inline ones)
    const advancedActiveCount = useMemo(() => {
        const extra: (keyof DashboardFiltersState)[] = [
            "ward_id",
            "village_id",
            "gender_id",
            "age_range_id",
            "disability_type_id",
            "incident_type_id",
            "partner_id",
        ];
        return extra.filter((k) => filters[k] && filters[k] !== "").length;
    }, [filters]);

    const hasAny =
        filters.period !== "all" ||
        Object.entries(filters).some(([k, v]) => k !== "period" && v !== "");

    const update = (patch: Partial<DashboardFiltersState>) => {
        const next = { ...filters, ...patch };
        const params = Object.fromEntries(
            Object.entries(next).filter(([, v]) => v !== "" && v !== "all"),
        );
        router.get("/dashboard", params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: [...PARTIAL_PROPS],
        });
    };

    const setCounty = (v: string) =>
        update({
            county_id: v,
            sub_county_id: "",
            ward_id: "",
            village_id: "",
        });
    const setSubCounty = (v: string) =>
        update({ sub_county_id: v, ward_id: "", village_id: "" });
    const setWard = (v: string) => update({ ward_id: v, village_id: "" });

    const clearAll = () =>
        router.get(
            "/dashboard",
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: [...PARTIAL_PROPS],
            },
        );

    return (
        <div className="flex flex-col gap-2 rounded-lg border bg-card p-2">
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 px-1 text-sm font-medium text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filters</span>
                </div>

                {/* Inline: Period */}
                <div className="w-[120px]">
                    <Select
                        value={filters.period}
                        onValueChange={(v) =>
                            update({
                                period: v as DashboardFiltersState["period"],
                            })
                        }
                    >
                        <SelectTrigger className="h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All time</SelectItem>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Inline: County */}
                <div className="w-[150px]">
                    <Select
                        value={toSel(filters.county_id)}
                        onValueChange={(v) => setCounty(fromSel(v))}
                    >
                        <SelectTrigger className="h-8">
                            <SelectValue placeholder="All counties" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>All counties</SelectItem>
                            {counties.map((c) => (
                                <SelectItem key={c.value} value={c.value}>
                                    {c.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Inline: Sub County (cascades from County) */}
                <div className="w-[150px]">
                    <Select
                        value={toSel(filters.sub_county_id)}
                        onValueChange={(v) => setSubCounty(fromSel(v))}
                        disabled={!selectedCounty}
                    >
                        <SelectTrigger className="h-8">
                            <SelectValue placeholder="All sub counties" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL}>
                                All sub counties
                            </SelectItem>
                            {selectedCounty?.sub_counties.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                    {s.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Inline: From */}
                <div className="flex items-center gap-1">
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                        From
                    </span>
                    <input
                        type="date"
                        value={filters.date_from}
                        onChange={(e) => update({ date_from: e.target.value })}
                        className="h-8 w-[130px] rounded-md border border-input bg-background px-2 text-sm"
                    />
                </div>

                {/* Inline: To */}
                <div className="flex items-center gap-1">
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                        To
                    </span>
                    <input
                        type="date"
                        value={filters.date_to}
                        onChange={(e) => update({ date_to: e.target.value })}
                        className="h-8 w-[130px] rounded-md border border-input bg-background px-2 text-sm"
                    />
                </div>

                {/* More filters dialog trigger */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5"
                        >
                            <SlidersHorizontal className="h-3.5 w-3.5" />
                            More filters
                            {advancedActiveCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="ml-0.5 h-5 min-w-5 rounded-full px-1.5 text-[10px]"
                                >
                                    {advancedActiveCount}
                                </Badge>
                            )}
                            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                        </Button>
                    </DialogTrigger>

                    <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Filter dashboard</DialogTitle>
                            <DialogDescription>
                                Narrow the data by location, demographics,
                                incident details, or date range.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <Field label="Ward">
                                <Select
                                    value={toSel(filters.ward_id)}
                                    onValueChange={(v) => setWard(fromSel(v))}
                                    disabled={!selectedSubCounty}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All wards" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL}>
                                            All wards
                                        </SelectItem>
                                        {selectedSubCounty?.wards.map((w) => (
                                            <SelectItem
                                                key={w.value}
                                                value={w.value}
                                            >
                                                {w.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field label="Village">
                                <Select
                                    value={toSel(filters.village_id)}
                                    onValueChange={(v) =>
                                        update({ village_id: fromSel(v) })
                                    }
                                    disabled={!selectedWard}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All villages" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL}>
                                            All villages
                                        </SelectItem>
                                        {selectedWard?.villages.map((v) => (
                                            <SelectItem
                                                key={v.value}
                                                value={v.value}
                                            >
                                                {v.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field label="Gender">
                                <SimpleSelect
                                    value={filters.gender_id}
                                    placeholder="All genders"
                                    options={genders}
                                    onChange={(v) => update({ gender_id: v })}
                                />
                            </Field>

                            <Field label="Age Range">
                                <SimpleSelect
                                    value={filters.age_range_id}
                                    placeholder="All ages"
                                    options={ageRanges}
                                    onChange={(v) =>
                                        update({ age_range_id: v })
                                    }
                                />
                            </Field>

                            <Field label="Disability">
                                <SimpleSelect
                                    value={filters.disability_type_id}
                                    placeholder="Any"
                                    options={disabilityTypes}
                                    onChange={(v) =>
                                        update({ disability_type_id: v })
                                    }
                                />
                            </Field>

                            <Field label="Incident Type">
                                <SimpleSelect
                                    value={filters.incident_type_id}
                                    placeholder="All types"
                                    options={incidentTypes}
                                    onChange={(v) =>
                                        update({ incident_type_id: v })
                                    }
                                />
                            </Field>

                            <Field label="Partner">
                                <SimpleSelect
                                    value={filters.partner_id}
                                    placeholder="All partners"
                                    options={partners}
                                    onChange={(v) => update({ partner_id: v })}
                                />
                            </Field>
                        </div>

                        <DialogFooter className="gap-2 sm:justify-between">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    clearAll();
                                    setDialogOpen(false);
                                }}
                                disabled={!hasAny}
                            >
                                <X className="mr-1 h-3.5 w-3.5" />
                                Clear all
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setDialogOpen(false)}
                            >
                                Done
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {hasAny && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAll}
                        className="h-8 px-2 text-xs"
                    >
                        <X className="mr-1 h-3 w-3" /> Clear
                    </Button>
                )}
            </div>
        </div>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            {children}
        </div>
    );
}

function SimpleSelect({
    value,
    placeholder,
    options,
    onChange,
}: {
    value: string;
    placeholder: string;
    options: Option[];
    onChange: (v: string) => void;
}) {
    return (
        <Select
            value={toSel(value)}
            onValueChange={(v) => onChange(fromSel(v))}
        >
            <SelectTrigger>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={ALL}>{placeholder}</SelectItem>
                {options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                        {o.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
