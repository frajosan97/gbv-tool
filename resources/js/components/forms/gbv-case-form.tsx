import { Link, useForm } from "@inertiajs/react";
import {
    Check,
    ChevronRight,
    FileText,
    Info,
    Lock,
    MapPin,
    Save,
    ShieldAlert,
    ShieldCheck,
    X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

import CustomReactSelect from "@/components/custom-react-select";

import { cn } from "@/lib/utils";

import {
    subCountiesOf,
    wardsOf,
    villagesOf,
    useAppData,
} from "@/hooks/use-app-data";

import type { GbvCase, GbvCaseFormData, GbvCasesLookups } from "@/types";

// ---------- Props ----------

export interface GbvCaseFormProps {
    case?: GbvCase;
    lookups: GbvCasesLookups;
    mode: "create" | "edit";
    submitUrl: string;
    cancelUrl: string;
}

// ---------- Constants ----------

type TabKey = "incident" | "location" | "response" | "workflow" | "privacy";

const TABS: {
    key: TabKey;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
}[] = [
    {
        key: "incident",
        label: "Incident",
        description: "What happened and when",
        icon: FileText,
    },
    {
        key: "location",
        label: "Location",
        description: "Where the incident occurred",
        icon: MapPin,
    },
    {
        key: "response",
        label: "Response",
        description: "Police & medical response",
        icon: ShieldAlert,
    },
    {
        key: "workflow",
        label: "Workflow",
        description: "Status, priority, confidentiality",
        icon: Check,
    },
    {
        key: "privacy",
        label: "Privacy",
        description: "Sensitivity & consent",
        icon: ShieldCheck,
    },
];

// ---------- Helpers ----------

function defaultsFrom(c?: GbvCase): GbvCaseFormData {
    return {
        survivor_id: c?.survivor?.id ?? "",
        partner_id: c?.partner?.id ?? "",
        county_id: c?.county?.id ?? "",
        sub_county_id: c?.sub_county?.id ?? "",
        ward_id: c?.ward?.id ?? "",
        village_id: c?.village?.id ?? "",
        primary_officer_id: c?.primary_officer?.id ?? "",
        case_number: c?.case_number ?? "",
        incident_number: c?.incident_number ?? "",
        incident_type_id: c?.incident_type?.id ?? "",
        incident_type_other: c?.incident_type_other ?? "",
        incident_date: c?.incident_date ?? "",
        incident_time: c?.incident_time ?? "",
        incident_location: c?.incident_location ?? "",
        description: c?.description ?? "",
        reported_to_police: c?.reported_to_police ?? false,
        police_station: c?.police_station ?? "",
        ob_number: c?.ob_number ?? "",
        medical_attention: c?.medical_attention ?? false,
        health_facility: c?.health_facility ?? "",
        case_status_id: c?.status?.id ?? "",
        priority_level_id: c?.priority?.id ?? "",
        confidentiality_level_id: c?.confidentiality?.id ?? "",
        is_sensitive: c?.is_sensitive ?? false,
        consent_obtained: c?.consent_obtained ?? false,
        consent_details: c?.consent_details ?? "",
    };
}

// ---------- Subcomponents ----------

function SectionHeader({
    icon: Icon,
    title,
    description,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description?: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                    {title}
                </h3>
                {description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

function Field({
    label,
    htmlFor,
    error,
    required,
    className,
    children,
    hint,
    optional,
}: {
    label: string;
    htmlFor?: string;
    error?: string;
    required?: boolean;
    className?: string;
    children: React.ReactNode;
    hint?: React.ReactNode;
    optional?: boolean;
}) {
    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <div className="flex items-baseline justify-between gap-2">
                <Label
                    htmlFor={htmlFor}
                    className="text-xs font-medium text-foreground"
                >
                    {label}
                    {required && (
                        <span
                            aria-hidden
                            className="ml-1 inline-block h-1 w-1 rounded-full bg-rose-500 align-middle"
                        />
                    )}
                </Label>
                {optional && (
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Optional
                    </span>
                )}
            </div>
            <div
                className={cn(
                    "[&_[data-slot=input]]:h-10",
                    error &&
                        "[&_[data-slot=input]]:border-rose-400 [&_[data-slot=input]]:focus-visible:ring-rose-300",
                )}
            >
                {children}
            </div>
            {hint && !error && (
                <p className="text-xs text-muted-foreground">{hint}</p>
            )}
            {error && (
                <p
                    role="alert"
                    className="flex items-center gap-1 text-xs font-medium text-rose-600"
                >
                    <Info className="h-3 w-3" />
                    {error}
                </p>
            )}
        </div>
    );
}

function LabelSelect({
    value,
    onChange,
    options,
    placeholder,
    id,
    invalid,
    disabled,
    emptyText = "No options available",
}: {
    value: number | string;
    onChange: (v: number | "") => void;
    options: { id: number; name: string }[];
    placeholder: string;
    id?: string;
    invalid?: boolean;
    disabled?: boolean;
    emptyText?: string;
}) {
    return (
        <Select
            value={value === "" ? "" : String(value)}
            onValueChange={(v) => onChange(v === "" ? "" : Number(v))}
            disabled={disabled}
        >
            <SelectTrigger
                id={id}
                aria-invalid={invalid || undefined}
                className={cn("h-10", invalid && "border-rose-400")}
            >
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                        {emptyText}
                    </div>
                ) : (
                    options.map((o) => (
                        <SelectItem key={o.id} value={String(o.id)}>
                            {o.name}
                        </SelectItem>
                    ))
                )}
            </SelectContent>
        </Select>
    );
}

function FormCard({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <Card className={cn("shadow-sm", className)}>
            <CardContent className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
                {children}
            </CardContent>
        </Card>
    );
}

function TabNav({
    active,
    onSelect,
    errorMap,
}: {
    active: TabKey;
    onSelect: (t: TabKey) => void;
    errorMap: Record<TabKey, boolean>;
}) {
    return (
        <nav
            aria-label="Form sections"
            className="flex gap-1 overflow-x-auto rounded-xl border bg-card p-1 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:p-2"
        >
            {TABS.map((t, i) => {
                const isActive = active === t.key;
                const hasError = errorMap[t.key];
                const Icon = t.icon;

                return (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => onSelect(t.key)}
                        aria-current={isActive ? "step" : undefined}
                        className={cn(
                            "group relative flex min-w-fit items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors lg:w-full",
                            isActive
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                    >
                        <span
                            className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                                isActive
                                    ? "border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground"
                                    : hasError
                                      ? "border-rose-300 bg-rose-50 text-rose-600 dark:bg-rose-900/20"
                                      : "border-muted bg-background text-muted-foreground group-hover:border-foreground/20",
                            )}
                        >
                            {hasError ? (
                                <Info className="h-3.5 w-3.5" />
                            ) : isActive ? (
                                <Check className="h-3.5 w-3.5" />
                            ) : (
                                i + 1
                            )}
                        </span>

                        <span className="hidden min-w-0 flex-col lg:flex">
                            <span className="truncate text-xs font-semibold">
                                {t.label}
                            </span>
                            <span
                                className={cn(
                                    "truncate text-[11px]",
                                    isActive
                                        ? "text-primary-foreground/70"
                                        : "text-muted-foreground/80",
                                )}
                            >
                                {t.description}
                            </span>
                        </span>

                        <span className="text-xs font-medium lg:hidden">
                            {t.label}
                        </span>

                        {!isActive && (
                            <ChevronRight className="ml-auto hidden h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 lg:block" />
                        )}
                        <Icon className="ml-auto h-4 w-4 shrink-0 opacity-60 lg:hidden" />
                    </button>
                );
            })}
        </nav>
    );
}

// ---------- Component ----------

export function GbvCaseForm({
    case: gbvCase,
    lookups,
    mode,
    submitUrl,
    cancelUrl,
}: GbvCaseFormProps) {
    const form = useForm<GbvCaseFormData>(defaultsFrom(gbvCase));
    const { data, setData, post, put, processing, errors, reset } = form;

    const { counties, subCounties, wards, villages } = useAppData();

    const isEdit = mode === "edit";
    const [tab, setTab] = useState<TabKey>("incident");

    // ---- Cascading location ----
    const subCountyOptions = useMemo(
        () => subCountiesOf(subCounties, Number(data.county_id) || null),
        [subCounties, data.county_id],
    );
    const wardOptions = useMemo(
        () => wardsOf(wards, Number(data.sub_county_id) || null),
        [wards, data.sub_county_id],
    );
    const villageOptions = useMemo(
        () => villagesOf(villages, Number(data.ward_id) || null),
        [villages, data.ward_id],
    );

    const onCountyChange = useCallback(
        (v: number | "") =>
            setData((prev) => ({
                ...prev,
                county_id: v,
                sub_county_id: "",
                ward_id: "",
                village_id: "",
            })),
        [setData],
    );
    const onSubCountyChange = useCallback(
        (v: number | "") =>
            setData((prev) => ({
                ...prev,
                sub_county_id: v,
                ward_id: "",
                village_id: "",
            })),
        [setData],
    );
    const onWardChange = useCallback(
        (v: number | "") =>
            setData((prev) => ({
                ...prev,
                ward_id: v,
                village_id: "",
            })),
        [setData],
    );

    // ---- Error → tab mapping ----
    const errorMap = useMemo<Record<TabKey, boolean>>(() => {
        const keys = (obj: Record<string, unknown>) => Object.keys(obj);
        const has = (fields: string[]) =>
            fields.some((f) =>
                keys(errors as Record<string, unknown>).includes(f),
            );

        return {
            incident: has([
                "survivor_id",
                "incident_type_id",
                "incident_type_other",
                "incident_date",
                "incident_time",
                "description",
            ]),
            location: has([
                "county_id",
                "sub_county_id",
                "ward_id",
                "village_id",
                "incident_location",
            ]),
            response: has([
                "reported_to_police",
                "police_station",
                "ob_number",
                "medical_attention",
                "health_facility",
            ]),
            workflow: has([
                "case_status_id",
                "priority_level_id",
                "confidentiality_level_id",
                "primary_officer_id",
            ]),
            privacy: has([
                "is_sensitive",
                "consent_obtained",
                "consent_details",
            ]),
        };
    }, [errors]);

    const submittedOnce = useRef(false);
    useEffect(() => {
        if (!submittedOnce.current || processing) return;
        const firstErrorTab = TABS.find((t) => errorMap[t.key]);
        if (firstErrorTab) setTab(firstErrorTab.key);
    }, [errorMap, processing]);

    const submit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            submittedOnce.current = true;

            if (isEdit && gbvCase) {
                put(submitUrl, { preserveScroll: true });
            } else {
                post(submitUrl, { preserveScroll: true });
            }
        },
        [isEdit, gbvCase, put, post, submitUrl],
    );

    const cancel = useCallback(() => {
        reset();
        window.location.href = cancelUrl;
    }, [reset, cancelUrl]);

    // ---------- Typed setters ----------
    const setStr =
        <
            K extends
                | "case_number"
                | "incident_number"
                | "incident_type_other"
                | "incident_date"
                | "incident_time"
                | "incident_location"
                | "description"
                | "police_station"
                | "ob_number"
                | "health_facility"
                | "consent_details",
        >(
            key: K,
        ) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setData(key as never, e.target.value as never);

    const setNum =
        <
            K extends
                | "survivor_id"
                | "incident_type_id"
                | "primary_officer_id"
                | "case_status_id"
                | "priority_level_id"
                | "confidentiality_level_id",
        >(
            key: K,
        ) =>
        (v: number | "") =>
            setData(key as never, v as never);

    const incidentTypeOptions = useMemo(
        () =>
            lookups.incidentTypes.map((t) => ({
                id: t.id,
                name: t.name,
            })),
        [lookups.incidentTypes],
    );
    const statusOptions = useMemo(
        () => lookups.caseStatuses.map((t) => ({ id: t.id, name: t.name })),
        [lookups.caseStatuses],
    );
    const priorityOptions = useMemo(
        () => lookups.priorityLevels.map((t) => ({ id: t.id, name: t.name })),
        [lookups.priorityLevels],
    );
    const confidentialityOptions = useMemo(
        () =>
            lookups.confidentialityLevels.map((t) => ({
                id: t.id,
                name: t.name,
            })),
        [lookups.confidentialityLevels],
    );

    // ---- Survivor options (CustomReactSelect shape) ----
    const survivorSelectOptions = useMemo(
        () =>
            (lookups.survivors ?? []).map((s) => ({
                value: String(s.id),
                label: s.label,
            })),
        [lookups.survivors],
    );

    return (
        <form
            onSubmit={submit}
            className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]"
        >
            <aside className="lg:sticky lg:top-4 lg:self-start">
                <TabNav active={tab} onSelect={setTab} errorMap={errorMap} />
                <div className="mt-4 hidden rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground lg:block">
                    <p className="flex items-start gap-1.5">
                        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>
                            Sensitive cases restrict visibility to the primary
                            officer and partner.
                        </span>
                    </p>
                </div>
            </aside>

            <div className="flex min-w-0 flex-col gap-4">
                {/* INCIDENT */}
                {tab === "incident" && (
                    <FormCard>
                        <div className="col-span-full">
                            <SectionHeader
                                icon={FileText}
                                title="Incident details"
                                description="Capture what happened, when, and who is involved"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <Field
                                label="Survivor"
                                htmlFor="survivor_id"
                                error={errors.survivor_id}
                                required
                                hint={
                                    survivorSelectOptions.length === 0
                                        ? "No survivors found. Register one first, then come back."
                                        : "Search by name or code"
                                }
                            >
                                <CustomReactSelect
                                    id="survivor_id"
                                    value={
                                        data.survivor_id === ""
                                            ? ""
                                            : String(data.survivor_id)
                                    }
                                    onChange={(v) =>
                                        setData(
                                            "survivor_id",
                                            v === "" ? "" : Number(v),
                                        )
                                    }
                                    options={survivorSelectOptions}
                                    placeholder={
                                        survivorSelectOptions.length
                                            ? "Select survivor"
                                            : "No survivors visible to you"
                                    }
                                    isDisabled={
                                        processing ||
                                        isEdit ||
                                        survivorSelectOptions.length === 0
                                    }
                                    isClearable={false}
                                />
                                {survivorSelectOptions.length === 0 && (
                                    <Link
                                        href="/survivors/create"
                                        className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                                    >
                                        Register a survivor →
                                    </Link>
                                )}
                            </Field>
                        </div>

                        <Field
                            label="Incident type"
                            htmlFor="incident_type_id"
                            error={errors.incident_type_id}
                            required
                        >
                            <LabelSelect
                                id="incident_type_id"
                                value={data.incident_type_id}
                                onChange={setNum("incident_type_id")}
                                options={incidentTypeOptions}
                                placeholder="Select incident type"
                                invalid={!!errors.incident_type_id}
                            />
                        </Field>

                        <Field
                            label="Other incident type"
                            htmlFor="incident_type_other"
                            error={errors.incident_type_other}
                            optional
                        >
                            <Input
                                id="incident_type_other"
                                value={data.incident_type_other}
                                onChange={setStr("incident_type_other")}
                                disabled={processing}
                                aria-invalid={!!errors.incident_type_other}
                                placeholder="If not listed above"
                            />
                        </Field>

                        <Field
                            label="Incident date"
                            htmlFor="incident_date"
                            error={errors.incident_date}
                            required
                        >
                            <Input
                                id="incident_date"
                                type="date"
                                value={data.incident_date}
                                onChange={setStr("incident_date")}
                                disabled={processing}
                                aria-invalid={!!errors.incident_date}
                            />
                        </Field>

                        <Field
                            label="Incident time"
                            htmlFor="incident_time"
                            error={errors.incident_time}
                            optional
                        >
                            <Input
                                id="incident_time"
                                type="time"
                                value={data.incident_time}
                                onChange={setStr("incident_time")}
                                disabled={processing}
                                aria-invalid={!!errors.incident_time}
                            />
                        </Field>

                        <Field
                            label="Description"
                            htmlFor="description"
                            error={errors.description}
                            required
                            className="col-span-full"
                        >
                            <Textarea
                                id="description"
                                rows={5}
                                value={data.description}
                                onChange={setStr("description")}
                                disabled={processing}
                                aria-invalid={!!errors.description}
                                placeholder="Narrative of what happened…"
                            />
                        </Field>
                    </FormCard>
                )}

                {/* LOCATION */}
                {tab === "location" && (
                    <FormCard>
                        <div className="col-span-full">
                            <SectionHeader
                                icon={MapPin}
                                title="Incident location"
                                description="Where the incident occurred"
                            />
                        </div>

                        <Field
                            label="County"
                            htmlFor="county_id"
                            error={errors.county_id}
                        >
                            <LabelSelect
                                id="county_id"
                                value={data.county_id}
                                onChange={onCountyChange}
                                options={counties}
                                placeholder="Select county"
                                invalid={!!errors.county_id}
                            />
                        </Field>

                        <Field
                            label="Sub-county"
                            htmlFor="sub_county_id"
                            error={errors.sub_county_id}
                        >
                            <LabelSelect
                                id="sub_county_id"
                                value={data.sub_county_id}
                                onChange={onSubCountyChange}
                                options={subCountyOptions}
                                placeholder={
                                    data.county_id
                                        ? "Select sub-county"
                                        : "Select a county first"
                                }
                                disabled={
                                    processing ||
                                    !data.county_id ||
                                    subCountyOptions.length === 0
                                }
                                invalid={!!errors.sub_county_id}
                            />
                        </Field>

                        <Field
                            label="Ward"
                            htmlFor="ward_id"
                            error={errors.ward_id}
                        >
                            <LabelSelect
                                id="ward_id"
                                value={data.ward_id}
                                onChange={onWardChange}
                                options={wardOptions}
                                placeholder={
                                    data.sub_county_id
                                        ? "Select ward"
                                        : "Select a sub-county first"
                                }
                                disabled={
                                    processing ||
                                    !data.sub_county_id ||
                                    wardOptions.length === 0
                                }
                                invalid={!!errors.ward_id}
                            />
                        </Field>

                        <Field
                            label="Village"
                            htmlFor="village_id"
                            error={errors.village_id}
                        >
                            <LabelSelect
                                id="village_id"
                                value={data.village_id}
                                onChange={(v) =>
                                    setData("village_id", v as never)
                                }
                                options={villageOptions}
                                placeholder={
                                    data.ward_id
                                        ? "Select village"
                                        : "Select a ward first"
                                }
                                disabled={
                                    processing ||
                                    !data.ward_id ||
                                    villageOptions.length === 0
                                }
                                invalid={!!errors.village_id}
                            />
                        </Field>

                        <Field
                            label="Location description"
                            htmlFor="incident_location"
                            error={errors.incident_location}
                            className="sm:col-span-2"
                            optional
                        >
                            <Input
                                id="incident_location"
                                value={data.incident_location}
                                onChange={setStr("incident_location")}
                                disabled={processing}
                                aria-invalid={!!errors.incident_location}
                                placeholder="e.g. near the market"
                            />
                        </Field>
                    </FormCard>
                )}

                {/* RESPONSE */}
                {tab === "response" && (
                    <FormCard>
                        <div className="col-span-full">
                            <SectionHeader
                                icon={ShieldAlert}
                                title="Police & medical response"
                                description="Track external interventions for this case"
                            />
                        </div>

                        <div className="col-span-full">
                            <label
                                htmlFor="reported_to_police"
                                className={cn(
                                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                                    data.reported_to_police
                                        ? "border-sky-300 bg-sky-50 dark:border-sky-900/50 dark:bg-sky-900/20"
                                        : "border-border hover:bg-muted/50",
                                )}
                            >
                                <Checkbox
                                    id="reported_to_police"
                                    checked={data.reported_to_police}
                                    onCheckedChange={(c) =>
                                        setData(
                                            "reported_to_police",
                                            Boolean(c),
                                        )
                                    }
                                    disabled={processing}
                                    className="mt-0.5"
                                />
                                <div className="text-sm">
                                    <p className="font-medium text-foreground">
                                        Reported to police
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Survivor has filed or is filing a report
                                    </p>
                                </div>
                            </label>
                        </div>

                        {data.reported_to_police && (
                            <>
                                <Field
                                    label="Police station"
                                    htmlFor="police_station"
                                    error={errors.police_station}
                                    required
                                >
                                    <Input
                                        id="police_station"
                                        value={data.police_station}
                                        onChange={setStr("police_station")}
                                        disabled={processing}
                                        aria-invalid={!!errors.police_station}
                                    />
                                </Field>
                                <Field
                                    label="OB number"
                                    htmlFor="ob_number"
                                    error={errors.ob_number}
                                    optional
                                >
                                    <Input
                                        id="ob_number"
                                        value={data.ob_number}
                                        onChange={setStr("ob_number")}
                                        disabled={processing}
                                        aria-invalid={!!errors.ob_number}
                                    />
                                </Field>
                            </>
                        )}

                        <div className="col-span-full">
                            <label
                                htmlFor="medical_attention"
                                className={cn(
                                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                                    data.medical_attention
                                        ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20"
                                        : "border-border hover:bg-muted/50",
                                )}
                            >
                                <Checkbox
                                    id="medical_attention"
                                    checked={data.medical_attention}
                                    onCheckedChange={(c) =>
                                        setData("medical_attention", Boolean(c))
                                    }
                                    disabled={processing}
                                    className="mt-0.5"
                                />
                                <div className="text-sm">
                                    <p className="font-medium text-foreground">
                                        Medical attention sought
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Survivor has received or is receiving
                                        care
                                    </p>
                                </div>
                            </label>
                        </div>

                        {data.medical_attention && (
                            <Field
                                label="Health facility"
                                htmlFor="health_facility"
                                error={errors.health_facility}
                                required
                                className="sm:col-span-2"
                            >
                                <Input
                                    id="health_facility"
                                    value={data.health_facility}
                                    onChange={setStr("health_facility")}
                                    disabled={processing}
                                    aria-invalid={!!errors.health_facility}
                                />
                            </Field>
                        )}
                    </FormCard>
                )}

                {/* WORKFLOW */}
                {tab === "workflow" && (
                    <FormCard>
                        <div className="col-span-full">
                            <SectionHeader
                                icon={Check}
                                title="Case workflow"
                                description="Set the case status, priority, and confidentiality level"
                            />
                        </div>

                        <Field
                            label="Status"
                            htmlFor="case_status_id"
                            error={errors.case_status_id}
                            required
                        >
                            <LabelSelect
                                id="case_status_id"
                                value={data.case_status_id}
                                onChange={setNum("case_status_id")}
                                options={statusOptions}
                                placeholder="Select status"
                                invalid={!!errors.case_status_id}
                            />
                        </Field>

                        <Field
                            label="Priority"
                            htmlFor="priority_level_id"
                            error={errors.priority_level_id}
                            required
                        >
                            <LabelSelect
                                id="priority_level_id"
                                value={data.priority_level_id}
                                onChange={setNum("priority_level_id")}
                                options={priorityOptions}
                                placeholder="Select priority"
                                invalid={!!errors.priority_level_id}
                            />
                        </Field>

                        <Field
                            label="Confidentiality"
                            htmlFor="confidentiality_level_id"
                            error={errors.confidentiality_level_id}
                            required
                        >
                            <LabelSelect
                                id="confidentiality_level_id"
                                value={data.confidentiality_level_id}
                                onChange={setNum("confidentiality_level_id")}
                                options={confidentialityOptions}
                                placeholder="Select level"
                                invalid={!!errors.confidentiality_level_id}
                            />
                        </Field>

                        <Field
                            label="Primary officer"
                            htmlFor="primary_officer_id"
                            error={errors.primary_officer_id}
                            hint="Defaults to you if left empty"
                            optional
                        >
                            <Input
                                id="primary_officer_id"
                                type="number"
                                value={data.primary_officer_id}
                                onChange={(e) =>
                                    setData(
                                        "primary_officer_id",
                                        e.target.value
                                            ? Number(e.target.value)
                                            : "",
                                    )
                                }
                                disabled={processing}
                                aria-invalid={!!errors.primary_officer_id}
                            />
                        </Field>
                    </FormCard>
                )}

                {/* PRIVACY */}
                {tab === "privacy" && (
                    <FormCard>
                        <div className="col-span-full">
                            <SectionHeader
                                icon={ShieldCheck}
                                title="Privacy & consent"
                                description="Sensitivity flags and consent tracking"
                            />
                        </div>

                        <div className="col-span-full grid gap-3 sm:grid-cols-2">
                            <label
                                htmlFor="is_sensitive"
                                className={cn(
                                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                                    data.is_sensitive
                                        ? "border-rose-300 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-900/20"
                                        : "border-border hover:bg-muted/50",
                                )}
                            >
                                <Checkbox
                                    id="is_sensitive"
                                    checked={data.is_sensitive}
                                    onCheckedChange={(c) =>
                                        setData("is_sensitive", Boolean(c))
                                    }
                                    disabled={processing}
                                    className="mt-0.5"
                                />
                                <div className="text-sm">
                                    <p className="font-medium text-foreground">
                                        Sensitive case
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Restricts visibility to partner and
                                        primary officer only
                                    </p>
                                </div>
                            </label>

                            <label
                                htmlFor="consent_obtained"
                                className={cn(
                                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                                    data.consent_obtained
                                        ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20"
                                        : "border-border hover:bg-muted/50",
                                )}
                            >
                                <Checkbox
                                    id="consent_obtained"
                                    checked={data.consent_obtained}
                                    onCheckedChange={(c) =>
                                        setData("consent_obtained", Boolean(c))
                                    }
                                    disabled={processing}
                                    className="mt-0.5"
                                />
                                <div className="text-sm">
                                    <p className="font-medium text-foreground">
                                        Consent obtained
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Survivor agreed to sharing and follow-up
                                    </p>
                                </div>
                            </label>
                        </div>

                        {data.consent_obtained && (
                            <Field
                                label="Consent details"
                                htmlFor="consent_details"
                                error={errors.consent_details}
                                required
                                className="col-span-full"
                            >
                                <Textarea
                                    id="consent_details"
                                    rows={3}
                                    value={data.consent_details}
                                    onChange={setStr("consent_details")}
                                    disabled={processing}
                                    aria-invalid={!!errors.consent_details}
                                    placeholder="What the survivor agreed to, and when…"
                                />
                            </Field>
                        )}
                    </FormCard>
                )}

                {/* FOOTER */}
                <div className="sticky bottom-0 z-10 -mx-4 mt-2 flex items-center justify-between gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
                    <p className="hidden text-xs text-muted-foreground sm:block">
                        Section{" "}
                        <span className="font-medium text-foreground">
                            {TABS.findIndex((t) => t.key === tab) + 1}
                        </span>{" "}
                        of {TABS.length}
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={cancel}
                            disabled={processing}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={processing}
                            className="min-w-[150px]"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {processing
                                ? "Saving…"
                                : isEdit
                                  ? "Update case"
                                  : "Register case"}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
