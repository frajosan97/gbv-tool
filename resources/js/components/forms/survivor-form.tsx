import { useForm } from "@inertiajs/react";
import {
    BadgeCheck,
    Check,
    ChevronRight,
    FileBadge,
    Info,
    Lock,
    MapPin,
    Phone,
    Save,
    ShieldCheck,
    UserRound,
    X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
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

import { cn } from "@/lib/utils";

import {
    subCountiesOf,
    villagesOf,
    wardsOf,
    useAppData,
    type AgeRange,
    type IdType,
} from "@/hooks/use-app-data";

import type { Survivor, SurvivorFormData } from "@/types";

// ---------- Props ----------

export interface SurvivorFormProps {
    survivor?: Survivor;
    mode: "create" | "edit";
    submitUrl: string;
    cancelUrl: string;
}

// ---------- Constants ----------

type TabKey = "identity" | "location" | "emergency" | "consent";

const TABS: {
    key: TabKey;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
}[] = [
    {
        key: "identity",
        label: "Identity",
        description: "Personal & demographic details",
        icon: UserRound,
    },
    {
        key: "location",
        label: "Location",
        description: "Where the survivor resides",
        icon: MapPin,
    },
    {
        key: "emergency",
        label: "Emergency",
        description: "Guardian or next of kin",
        icon: Phone,
    },
    {
        key: "consent",
        label: "Consent",
        description: "Privacy & consent records",
        icon: ShieldCheck,
    },
];

// ---------- Helpers ----------

function defaultsFrom(survivor?: Survivor): SurvivorFormData {
    return {
        partner_id: survivor?.partner?.id ?? "",
        unique_code: survivor?.unique_code ?? "",
        full_name: survivor?.full_name ?? "",
        phone: survivor?.phone ?? "",
        alternate_phone: survivor?.alternate_phone ?? "",
        gender_option_id: survivor?.gender_option?.id ?? "",
        dob: survivor?.dob ?? "",
        age: survivor?.age ?? "",
        age_range_id: survivor?.age_range?.id ?? "",
        is_pwd: survivor?.is_pwd ?? false,
        disability_type_id: survivor?.disability_type?.id ?? "",
        pwd_registration_number: survivor?.pwd_registration_number ?? "",
        id_number: survivor?.id_number ?? "",
        id_type_id: survivor?.id_type?.id ?? "",
        county_id: survivor?.county?.id ?? "",
        sub_county_id: survivor?.sub_county?.id ?? "",
        ward_id: survivor?.ward?.id ?? "",
        village_id: survivor?.village?.id ?? "",
        // Free-text input only — cleared once a village_id is picked,
        // used transiently by the server to find-or-create a village.
        village_name: "",
        landmark: survivor?.landmark ?? "",
        location_coordinates: survivor?.location_coordinates ?? null,
        anonymous: survivor?.anonymous ?? false,
        consent_given: survivor?.consent_given ?? false,
        consent_details: null,
        emergency_contact_name: survivor?.emergency_contact_name ?? "",
        emergency_contact_phone: survivor?.emergency_contact_phone ?? "",
        emergency_contact_relationship_id:
            survivor?.emergency_contact_relationship?.id ?? "",
        metadata: null,
    };
}

function computeAgeAndRange(
    dob: string,
    ranges: AgeRange[],
): { age: number | ""; ageRangeId: number | "" } {
    if (!dob) return { age: "", ageRangeId: "" };
    const birth = new Date(dob);
    if (Number.isNaN(birth.getTime())) return { age: "", ageRangeId: "" };

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
    if (age < 0 || age > 120) return { age: "", ageRangeId: "" };

    const match = ranges.find((r) => {
        const min = r.min_age ?? 0;
        const max = r.max_age ?? Number.POSITIVE_INFINITY;
        return age >= min && age <= max;
    });

    return { age, ageRangeId: match?.id ?? "" };
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
    hint?: string;
    optional?: boolean;
}) {
    const errorId = error ? `${htmlFor}-error` : undefined;
    const hintId = hint && !error ? `${htmlFor}-hint` : undefined;

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
                <p id={hintId} className="text-xs text-muted-foreground">
                    {hint}
                </p>
            )}
            {error && (
                <p
                    id={errorId}
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

function ReadonlyDisplay({
    children,
    empty = true,
    suffix,
    badge,
}: {
    children: React.ReactNode;
    empty?: boolean;
    suffix?: string;
    badge?: React.ReactNode;
}) {
    return (
        <div className="flex h-10 items-center rounded-md border border-input bg-muted/40 px-3 text-sm">
            {empty ? (
                <span className="text-muted-foreground">—</span>
            ) : (
                <span className="font-medium text-foreground">
                    {children}
                    {suffix && (
                        <span className="ml-1 text-muted-foreground">
                            {suffix}
                        </span>
                    )}
                </span>
            )}
            {badge && <div className="ml-auto">{badge}</div>}
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

export function SurvivorForm({
    survivor,
    mode,
    submitUrl,
    cancelUrl,
}: SurvivorFormProps) {
    const form = useForm<SurvivorFormData>(defaultsFrom(survivor));
    const { data, setData, post, put, processing, errors, reset } = form;

    const {
        counties,
        subCounties,
        wards,
        villages,
        genderOptions,
        ageRanges,
        disabilityTypes,
        idTypes,
        relationshipOptions,
    } = useAppData();

    const isEdit = mode === "edit";
    const [tab, setTab] = useState<TabKey>("identity");

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
        (v: number | "") => {
            setData((prev) => ({
                ...prev,
                county_id: v,
                sub_county_id: "",
                ward_id: "",
                village_id: "",
                village_name: "",
            }));
        },
        [setData],
    );

    const onSubCountyChange = useCallback(
        (v: number | "") => {
            setData((prev) => ({
                ...prev,
                sub_county_id: v,
                ward_id: "",
                village_id: "",
                village_name: "",
            }));
        },
        [setData],
    );

    const onWardChange = useCallback(
        (v: number | "") => {
            setData((prev) => ({
                ...prev,
                ward_id: v,
                village_id: "",
                village_name: "",
            }));
        },
        [setData],
    );

    // ---- Auto-calc age + age range from DOB ----
    const lastDob = useRef(data.dob);
    useEffect(() => {
        if (lastDob.current === data.dob) return;
        lastDob.current = data.dob;

        const { age, ageRangeId } = computeAgeAndRange(data.dob, ageRanges);
        if (age !== "") {
            setData((prev) => ({
                ...prev,
                age,
                age_range_id: ageRangeId,
            }));
        }
    }, [data.dob, ageRanges, setData]);

    // ---- Document type dynamic visibility ----
    const selectedIdType = useMemo<IdType | undefined>(
        () => idTypes.find((t) => String(t.id) === String(data.id_type_id)),
        [idTypes, data.id_type_id],
    );
    const idTypeRequiresNumber = selectedIdType?.requires_number ?? false;

    // ---- Error → tab mapping ----
    const errorMap = useMemo<Record<TabKey, boolean>>(() => {
        const keys = (obj: Record<string, unknown>) => Object.keys(obj);
        const has = (fields: string[]) =>
            fields.some((f) =>
                keys(errors as Record<string, unknown>).includes(f),
            );

        return {
            identity: has([
                "full_name",
                "gender_option_id",
                "dob",
                "age",
                "age_range_id",
                "phone",
                "alternate_phone",
                "id_type_id",
                "id_number",
                "disability_type_id",
                "pwd_registration_number",
                "is_pwd",
            ]),
            location: has([
                "county_id",
                "sub_county_id",
                "ward_id",
                "village_id",
                "village_name",
                "landmark",
                "location_coordinates",
            ]),
            emergency: has([
                "emergency_contact_name",
                "emergency_contact_phone",
                "emergency_contact_relationship_id",
            ]),
            consent: has(["anonymous", "consent_given", "consent_details"]),
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

            const payload = { ...data, unique_code: "" };

            // If the user picked a village from the list, let the id win.
            if (data.village_id) {
                payload.village_name = "";
            }

            // Only submit ID number when the selected document type requires it.
            if (!idTypeRequiresNumber) payload.id_number = "";

            form.transform(() => payload);

            if (isEdit && survivor) {
                put(submitUrl, { preserveScroll: true });
            } else {
                post(submitUrl, { preserveScroll: true });
            }
        },
        [
            form,
            data,
            idTypeRequiresNumber,
            isEdit,
            survivor,
            put,
            post,
            submitUrl,
        ],
    );

    const cancel = useCallback(() => {
        reset();
        window.location.href = cancelUrl;
    }, [reset, cancelUrl]);

    // ---------- Typed setters ----------
    const setStr =
        <
            K extends
                | "full_name"
                | "phone"
                | "alternate_phone"
                | "id_number"
                | "pwd_registration_number"
                | "landmark"
                | "emergency_contact_name"
                | "emergency_contact_phone"
                | "dob"
                | "village_name",
        >(
            key: K,
        ) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setData(key as never, e.target.value as never);

    const setNum =
        <
            K extends
                | "gender_option_id"
                | "id_type_id"
                | "disability_type_id"
                | "emergency_contact_relationship_id",
        >(
            key: K,
        ) =>
        (v: number | "") =>
            setData(key as never, v as never);

    // ---------- Derived UI state ----------
    const dobFilled = !!data.dob && data.age !== "";
    const ageRangeName =
        ageRanges.find((r) => String(r.id) === String(data.age_range_id))
            ?.name ?? "";

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
                            Sensitive fields stay private when{" "}
                            <span className="font-medium text-foreground">
                                Anonymous
                            </span>{" "}
                            is enabled.
                        </span>
                    </p>
                </div>
            </aside>

            <div className="flex min-w-0 flex-col gap-4">
                {/* IDENTITY */}
                {tab === "identity" && (
                    <div className="flex flex-col gap-4">
                        {data.anonymous && (
                            <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900 dark:border-violet-900/40 dark:bg-violet-900/20 dark:text-violet-200">
                                <Lock className="mt-0.5 h-4 w-4 shrink-0" />
                                <div>
                                    <p className="font-medium">
                                        Anonymous mode is on
                                    </p>
                                    <p className="text-xs text-violet-800/80 dark:text-violet-200/70">
                                        Name, phone, ID number, and emergency
                                        contact are hidden from this record.
                                    </p>
                                </div>
                            </div>
                        )}

                        <FormCard>
                            <div className="col-span-full">
                                <SectionHeader
                                    icon={UserRound}
                                    title="Personal details"
                                    description="Basic demographics of the survivor"
                                />
                            </div>

                            <Field
                                label="Full name"
                                htmlFor="full_name"
                                required={!data.anonymous}
                                error={errors.full_name}
                                className="sm:col-span-2"
                            >
                                <Input
                                    id="full_name"
                                    value={data.full_name}
                                    onChange={setStr("full_name")}
                                    disabled={processing || data.anonymous}
                                    aria-invalid={!!errors.full_name}
                                    placeholder="e.g. Jane Doe"
                                />
                            </Field>

                            <Field
                                label="Gender"
                                htmlFor="gender_option_id"
                                error={errors.gender_option_id}
                                required
                            >
                                <LabelSelect
                                    id="gender_option_id"
                                    value={data.gender_option_id}
                                    onChange={setNum("gender_option_id")}
                                    options={genderOptions}
                                    placeholder="Select gender"
                                    invalid={!!errors.gender_option_id}
                                />
                            </Field>

                            <Field
                                label="Date of birth"
                                htmlFor="dob"
                                error={errors.dob}
                                required
                                hint="Age and age range are auto-calculated"
                            >
                                <Input
                                    id="dob"
                                    type="date"
                                    value={data.dob}
                                    onChange={setStr("dob")}
                                    disabled={processing}
                                    aria-invalid={!!errors.dob}
                                />
                            </Field>

                            <Field
                                label="Age"
                                error={errors.age}
                                hint={
                                    dobFilled
                                        ? "Auto-calculated from date of birth"
                                        : "Enter date of birth to calculate age"
                                }
                            >
                                <ReadonlyDisplay
                                    empty={data.age === ""}
                                    suffix="years"
                                    badge={
                                        dobFilled ? (
                                            <Badge
                                                variant="outline"
                                                className="gap-1 border-0 bg-emerald-100 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                            >
                                                <BadgeCheck className="h-3 w-3" />
                                                Auto
                                            </Badge>
                                        ) : undefined
                                    }
                                >
                                    {data.age}
                                </ReadonlyDisplay>
                            </Field>

                            <Field
                                label="Age range"
                                error={errors.age_range_id}
                                hint="Auto-matched from age"
                            >
                                <ReadonlyDisplay empty={!ageRangeName}>
                                    {ageRangeName}
                                </ReadonlyDisplay>
                            </Field>
                        </FormCard>

                        <FormCard>
                            <div className="col-span-full">
                                <SectionHeader
                                    icon={Phone}
                                    title="Contact"
                                    description="Primary and alternate phone numbers"
                                />
                            </div>

                            <Field
                                label="Primary phone"
                                htmlFor="phone"
                                error={errors.phone}
                                optional
                                hint="Leave empty if the survivor (e.g. a child) has no phone"
                            >
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={setStr("phone")}
                                    disabled={processing || data.anonymous}
                                    aria-invalid={!!errors.phone}
                                    placeholder="+254 …"
                                />
                            </Field>

                            <Field
                                label="Alternate phone"
                                htmlFor="alternate_phone"
                                error={errors.alternate_phone}
                                optional
                            >
                                <Input
                                    id="alternate_phone"
                                    value={data.alternate_phone}
                                    onChange={setStr("alternate_phone")}
                                    disabled={processing || data.anonymous}
                                    aria-invalid={!!errors.alternate_phone}
                                />
                            </Field>
                        </FormCard>

                        <FormCard>
                            <div className="col-span-full">
                                <SectionHeader
                                    icon={FileBadge}
                                    title="Identification"
                                    description="Select the document type — the number field appears only when required"
                                />
                            </div>

                            <Field
                                label="Document Type"
                                htmlFor="id_type_id"
                                error={errors.id_type_id}
                            >
                                <LabelSelect
                                    id="id_type_id"
                                    value={data.id_type_id}
                                    onChange={setNum("id_type_id")}
                                    options={idTypes}
                                    placeholder="Select document type"
                                    invalid={!!errors.id_type_id}
                                />
                            </Field>

                            <div
                                className={cn(
                                    "overflow-hidden transition-all duration-300",
                                    idTypeRequiresNumber
                                        ? "max-h-40 opacity-100"
                                        : "max-h-0 opacity-0",
                                )}
                                aria-hidden={!idTypeRequiresNumber}
                            >
                                {idTypeRequiresNumber && (
                                    <Field
                                        label={`${selectedIdType?.name ?? "Document"} number`}
                                        htmlFor="id_number"
                                        error={errors.id_number}
                                        hint="Required for this document type"
                                    >
                                        <Input
                                            id="id_number"
                                            value={data.id_number}
                                            onChange={setStr("id_number")}
                                            disabled={
                                                processing || data.anonymous
                                            }
                                            aria-invalid={!!errors.id_number}
                                        />
                                    </Field>
                                )}
                            </div>
                        </FormCard>

                        <FormCard>
                            <div className="col-span-full">
                                <SectionHeader
                                    icon={ShieldCheck}
                                    title="Disability"
                                    description="Enable only if the survivor has a disability"
                                />
                            </div>

                            <div className="col-span-full">
                                <label
                                    htmlFor="is_pwd"
                                    className={cn(
                                        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                                        data.is_pwd
                                            ? "border-primary/40 bg-primary/5"
                                            : "border-border hover:bg-muted/50",
                                    )}
                                >
                                    <Checkbox
                                        id="is_pwd"
                                        checked={data.is_pwd}
                                        onCheckedChange={(c) =>
                                            setData("is_pwd", Boolean(c))
                                        }
                                        disabled={processing}
                                        className="mt-0.5"
                                    />
                                    <div className="text-sm">
                                        <p className="font-medium text-foreground">
                                            Person with disability
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Reveals disability type and PWD
                                            registration fields
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {data.is_pwd && (
                                <>
                                    <Field
                                        label="Disability type"
                                        htmlFor="disability_type_id"
                                        error={errors.disability_type_id}
                                        required
                                    >
                                        <LabelSelect
                                            id="disability_type_id"
                                            value={data.disability_type_id}
                                            onChange={setNum(
                                                "disability_type_id",
                                            )}
                                            options={disabilityTypes}
                                            placeholder="Select disability type"
                                            invalid={
                                                !!errors.disability_type_id
                                            }
                                        />
                                    </Field>

                                    <Field
                                        label="PWD registration no."
                                        htmlFor="pwd_registration_number"
                                        error={errors.pwd_registration_number}
                                    >
                                        <Input
                                            id="pwd_registration_number"
                                            value={data.pwd_registration_number}
                                            onChange={setStr(
                                                "pwd_registration_number",
                                            )}
                                            disabled={processing}
                                            aria-invalid={
                                                !!errors.pwd_registration_number
                                            }
                                        />
                                    </Field>
                                </>
                            )}
                        </FormCard>
                    </div>
                )}

                {/* LOCATION */}
                {tab === "location" && (
                    <FormCard>
                        <div className="col-span-full">
                            <SectionHeader
                                icon={MapPin}
                                title="Location"
                                description="Select county → sub-county → ward. Type a village if it isn't listed — it will be created automatically."
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
                                emptyText="No sub-counties for this county"
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
                                emptyText="No wards for this sub-county"
                            />
                        </Field>

                        <Field
                            label="Village"
                            htmlFor="village_id"
                            error={errors.village_id || errors.village_name}
                            hint={
                                villageOptions.length > 0
                                    ? "Pick a registered village, or type one that isn't listed"
                                    : "Not all villages are registered yet — type the name"
                            }
                        >
                            <div className="flex flex-col gap-2">
                                {villageOptions.length > 0 && (
                                    <LabelSelect
                                        id="village_id"
                                        value={data.village_id}
                                        onChange={(v) =>
                                            setData((prev) => ({
                                                ...prev,
                                                village_id: v,
                                                // Clear the free-text when the
                                                // user picks from the list.
                                                village_name: v
                                                    ? ""
                                                    : prev.village_name,
                                            }))
                                        }
                                        options={villageOptions}
                                        placeholder="Select registered village"
                                        disabled={processing || !data.ward_id}
                                        invalid={!!errors.village_id}
                                        emptyText="No villages registered for this ward"
                                    />
                                )}
                                <Input
                                    aria-label="Village name (free text)"
                                    placeholder="Or type the village name"
                                    value={data.village_name}
                                    onChange={setStr("village_name")}
                                    disabled={
                                        processing ||
                                        !data.ward_id ||
                                        !!data.village_id
                                    }
                                    aria-invalid={!!errors.village_name}
                                />
                            </div>
                        </Field>

                        <Field
                            label="Landmark"
                            htmlFor="landmark"
                            error={errors.landmark}
                            className="sm:col-span-2"
                            optional
                        >
                            <Input
                                id="landmark"
                                value={data.landmark}
                                onChange={setStr("landmark")}
                                disabled={processing}
                                aria-invalid={!!errors.landmark}
                                placeholder="e.g. near the mosque"
                            />
                        </Field>
                    </FormCard>
                )}

                {/* EMERGENCY */}
                {tab === "emergency" && (
                    <FormCard>
                        <div className="col-span-full">
                            <SectionHeader
                                icon={Phone}
                                title="Emergency contact"
                                description="Guardian, parent, or next of kin — required"
                            />
                        </div>

                        <Field
                            label="Contact name"
                            htmlFor="emergency_contact_name"
                            required
                            error={errors.emergency_contact_name}
                            className="sm:col-span-2"
                        >
                            <Input
                                id="emergency_contact_name"
                                value={data.emergency_contact_name}
                                onChange={setStr("emergency_contact_name")}
                                disabled={processing || data.anonymous}
                                aria-invalid={!!errors.emergency_contact_name}
                                placeholder="Full name of guardian"
                            />
                        </Field>

                        <Field
                            label="Contact phone"
                            htmlFor="emergency_contact_phone"
                            required
                            error={errors.emergency_contact_phone}
                        >
                            <Input
                                id="emergency_contact_phone"
                                value={data.emergency_contact_phone}
                                onChange={setStr("emergency_contact_phone")}
                                disabled={processing || data.anonymous}
                                aria-invalid={!!errors.emergency_contact_phone}
                                placeholder="+254 …"
                            />
                        </Field>

                        <Field
                            label="Relationship"
                            htmlFor="emergency_contact_relationship_id"
                            error={errors.emergency_contact_relationship_id}
                        >
                            <LabelSelect
                                id="emergency_contact_relationship_id"
                                value={data.emergency_contact_relationship_id}
                                onChange={setNum(
                                    "emergency_contact_relationship_id",
                                )}
                                options={relationshipOptions}
                                placeholder="Select relationship"
                                invalid={
                                    !!errors.emergency_contact_relationship_id
                                }
                            />
                        </Field>
                    </FormCard>
                )}

                {/* CONSENT */}
                {tab === "consent" && (
                    <FormCard>
                        <div className="col-span-full">
                            <SectionHeader
                                icon={ShieldCheck}
                                title="Consent & privacy"
                                description="Record the survivor's privacy preferences"
                            />
                        </div>

                        <div className="col-span-full grid gap-3 sm:grid-cols-2">
                            <label
                                htmlFor="anonymous"
                                className={cn(
                                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                                    data.anonymous
                                        ? "border-violet-300 bg-violet-50 dark:border-violet-900/50 dark:bg-violet-900/20"
                                        : "border-border hover:bg-muted/50",
                                )}
                            >
                                <Checkbox
                                    id="anonymous"
                                    checked={data.anonymous}
                                    onCheckedChange={(c) =>
                                        setData("anonymous", Boolean(c))
                                    }
                                    disabled={processing}
                                    className="mt-0.5"
                                />
                                <div className="text-sm">
                                    <p className="font-medium text-foreground">
                                        Anonymous
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Hides name, phone, ID, and emergency
                                        contacts
                                    </p>
                                </div>
                            </label>

                            <label
                                htmlFor="consent_given"
                                className={cn(
                                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                                    data.consent_given
                                        ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20"
                                        : "border-border hover:bg-muted/50",
                                )}
                            >
                                <Checkbox
                                    id="consent_given"
                                    checked={data.consent_given}
                                    onCheckedChange={(c) =>
                                        setData("consent_given", Boolean(c))
                                    }
                                    disabled={processing}
                                    className="mt-0.5"
                                />
                                <div className="text-sm">
                                    <p className="font-medium text-foreground">
                                        Informed consent given
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Survivor has agreed to share this
                                        information
                                    </p>
                                </div>
                            </label>
                        </div>

                        <Field
                            label="Consent notes"
                            htmlFor="consent_notes"
                            className="col-span-full"
                            optional
                        >
                            <Textarea
                                id="consent_notes"
                                rows={3}
                                placeholder="Any additional consent or privacy notes…"
                                value={
                                    (data.consent_details?.notes as
                                        | string
                                        | undefined) ?? ""
                                }
                                onChange={(e) =>
                                    setData("consent_details", {
                                        ...(data.consent_details ?? {}),
                                        notes: e.target.value,
                                    })
                                }
                                disabled={processing}
                            />
                        </Field>
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
                                  ? "Update survivor"
                                  : "Register survivor"}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
}
