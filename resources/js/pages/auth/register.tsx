// resources/js/pages/auth/register.tsx
import { Form, Head, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";
import InputError from "@/components/input-error";
import PasswordInput from "@/components/password-input";
import CustomReactSelect from "@/components/custom-react-select";
import TextLink from "@/components/text-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
    subCountiesOf,
    useAppData,
    villagesOf,
    wardsOf,
} from "@/hooks/use-app-data";
import { login } from "@/routes";
import { store } from "@/routes/register";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type Props = {
    passwordRules: string;
};

type FlashProps = {
    flash?: {
        success?: string | null;
        error?: string | null;
    };
};

type TabKey = "organization" | "location" | "account" | "security";

export default function Register({ passwordRules }: Props) {
    // Read the shared flash prop from HandleInertiaRequests::share().
    const { flash } = usePage<FlashProps>().props;
    const successMessage = flash?.success ?? null;

    const { counties, subCounties, wards, villages, organizationTypes } =
        useAppData();

    const [activeTab, setActiveTab] = useState<TabKey>("organization");

    // State
    const [organizationName, setOrganizationName] = useState("");
    const [organizationTypeId, setOrganizationTypeId] = useState("");
    const [countyId, setCountyId] = useState("");
    const [subCountyId, setSubCountyId] = useState("");
    const [wardId, setWardId] = useState("");
    const [villageId, setVillageId] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");

    const [clientErrors, setClientErrors] = useState<Record<string, string>>(
        {},
    );

    // Derived Data
    const filteredSubCounties = useMemo(
        () => subCountiesOf(subCounties, countyId ? Number(countyId) : null),
        [subCounties, countyId],
    );
    const filteredWards = useMemo(
        () => wardsOf(wards, subCountyId ? Number(subCountyId) : null),
        [wards, subCountyId],
    );
    const filteredVillages = useMemo(
        () => villagesOf(villages, wardId ? Number(wardId) : null),
        [villages, wardId],
    );

    const organizationTypeOptions = useMemo(
        () =>
            organizationTypes.map((t) => ({
                value: String(t.id),
                label: t.name,
            })),
        [organizationTypes],
    );
    const countyOptions = useMemo(
        () => counties.map((c) => ({ value: String(c.id), label: c.name })),
        [counties],
    );
    const subCountyOptions = useMemo(
        () =>
            filteredSubCounties.map((s) => ({
                value: String(s.id),
                label: s.name,
            })),
        [filteredSubCounties],
    );
    const wardOptions = useMemo(
        () =>
            filteredWards.map((w) => ({ value: String(w.id), label: w.name })),
        [filteredWards],
    );
    const villageOptions = useMemo(
        () =>
            filteredVillages.map((v) => ({
                value: String(v.id),
                label: v.name,
            })),
        [filteredVillages],
    );

    const steps = [
        { key: "organization", label: "Organization Details" },
        { key: "location", label: "Location Details" },
        { key: "account", label: "Account Details" },
        { key: "security", label: "Security" },
    ];

    const currentIndex = steps.findIndex((t) => t.key === activeTab);

    /**
     * Validate a specific step. Reused by validateCurrentStep (Next button)
     * and validateAllSteps (final submit) so both paths stay in sync.
     */
    const validateStep = (step: TabKey): Record<string, string> => {
        const errors: Record<string, string> = {};

        if (step === "organization") {
            if (!organizationName.trim())
                errors.organization_name = "Organization name is required.";
            if (!organizationTypeId)
                errors.organization_type_id = "Organization type is required.";
        }

        if (step === "location") {
            if (!countyId) errors.county_id = "County is required.";
            if (!subCountyId) errors.sub_county_id = "Sub-county is required.";
            if (!wardId) errors.ward_id = "Ward is required.";
            if (!villageId) errors.village_id = "Village is required.";
        }

        if (step === "account") {
            if (!name.trim()) errors.name = "Full name is required.";
            if (!email.trim()) errors.email = "Email is required.";
            if (!phone.trim()) errors.phone = "Phone is required.";
        }

        if (step === "security") {
            if (!password) errors.password = "Password is required.";
            if (!passwordConfirmation)
                errors.password_confirmation = "Please confirm your password.";
            if (
                password &&
                passwordConfirmation &&
                password !== passwordConfirmation
            ) {
                errors.password_confirmation = "Passwords do not match.";
            }
        }

        return errors;
    };

    const validateCurrentStep = () => {
        const newErrors = validateStep(activeTab);
        setClientErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Validate EVERY step before the final submit. Returns the first invalid
     * step so we can jump the user back to it. The POST only proceeds when
     * this returns null.
     */
    const validateAllSteps = (): TabKey | null => {
        const allErrors: Record<string, string> = {};
        let firstInvalidStep: TabKey | null = null;

        for (const step of steps) {
            const errors = validateStep(step.key as TabKey);
            if (Object.keys(errors).length > 0) {
                Object.assign(allErrors, errors);
                if (!firstInvalidStep) firstInvalidStep = step.key as TabKey;
            }
        }

        setClientErrors(allErrors);
        return firstInvalidStep;
    };

    const handleNext = () => {
        if (validateCurrentStep()) {
            if (currentIndex < steps.length - 1) {
                setActiveTab(steps[currentIndex + 1].key as TabKey);
                setClientErrors({});
            }
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setActiveTab(steps[currentIndex - 1].key as TabKey);
            setClientErrors({});
        }
    };

    // ─────────────────────────────────────────────────────────────────────
    // SUCCESS SCREEN
    // Driven by Inertia's shared flash prop. After RegisterResponse flashes
    // `success` and redirects to /register, this renders instead of the form.
    // ─────────────────────────────────────────────────────────────────────
    if (successMessage) {
        return (
            <>
                <Head title="Registration successful" />
                <div className="flex flex-col items-center gap-4 rounded-lg border p-8 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-xl font-semibold tracking-tight text-foreground">
                        Registration successful
                    </h1>
                    <p className="max-w-md text-sm text-muted-foreground">
                        {successMessage}
                    </p>
                    <p className="max-w-md text-sm text-muted-foreground">
                        You will be able to log in once your organization has
                        been approved. If you have any questions, please contact
                        your administrator.
                    </p>
                    <div className="mt-2">
                        <TextLink href={login()}>Back to login</TextLink>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Register" />
            <Form
                {...store.form()}
                onSubmit={(e) => {
                    // Block submission on any non-final tab and advance instead.
                    if (activeTab !== "security") {
                        e.preventDefault();
                        handleNext();
                        return;
                    }

                    // Final tab: validate every step before letting the POST
                    // through. Jump to the first invalid step if any fail.
                    const firstInvalidStep = validateAllSteps();
                    if (firstInvalidStep) {
                        e.preventDefault();
                        setActiveTab(firstInvalidStep);
                    }
                }}
                onKeyDown={(e) => {
                    // Enter inside a text input implicitly submits the form.
                    // On non-final tabs, intercept it and advance instead.
                    if (e.key === "Enter" && activeTab !== "security") {
                        const target = e.target as HTMLElement;
                        if (target.tagName === "TEXTAREA") return;

                        e.preventDefault();
                        handleNext();
                    }
                }}
                transform={(data) => ({
                    ...data,
                    name,
                    email,
                    phone,
                    organization_name: organizationName,
                    organization_type_id: organizationTypeId,
                    county_id: countyId,
                    sub_county_id: subCountyId,
                    ward_id: wardId,
                    village_id: villageId,
                    password,
                    password_confirmation: passwordConfirmation,
                })}
                resetOnSuccess={["password", "password_confirmation"]}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => {
                    const allErrors = { ...errors, ...clientErrors };

                    return (
                        <>
                            {Object.keys(errors).length > 0 && (
                                <div className="mb-2 flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive dark:bg-destructive/20">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <p>
                                        Please correct the errors below and try
                                        again.
                                    </p>
                                </div>
                            )}

                            <div className="rounded-lg border p-4">
                                <div className="mb-6 border-b pb-4">
                                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                                        Step {currentIndex + 1} of{" "}
                                        {steps.length}:{" "}
                                        {steps[currentIndex].label}
                                    </h2>
                                </div>

                                {/* ============ ORGANIZATION ============ */}
                                {activeTab === "organization" && (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2 sm:col-span-2">
                                            <Label htmlFor="organization_name">
                                                Organization name *
                                            </Label>
                                            <Input
                                                id="organization_name"
                                                name="organization_name"
                                                type="text"
                                                value={organizationName}
                                                onChange={(e) =>
                                                    setOrganizationName(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="e.g. Hope Community Centre"
                                            />
                                            <InputError
                                                message={
                                                    allErrors.organization_name
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2 sm:col-span-2">
                                            <Label htmlFor="organization_type_id">
                                                Organization type *
                                            </Label>
                                            <div className="w-full [&_.system-select__control]:w-full [&_.system-select__container]:w-full">
                                                <CustomReactSelect
                                                    id="organization_type_id"
                                                    value={organizationTypeId}
                                                    onChange={(val) => {
                                                        setOrganizationTypeId(
                                                            val,
                                                        );
                                                        if (
                                                            clientErrors.organization_type_id
                                                        )
                                                            setClientErrors(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    organization_type_id:
                                                                        "",
                                                                }),
                                                            );
                                                    }}
                                                    options={
                                                        organizationTypeOptions
                                                    }
                                                    placeholder="Select type"
                                                />
                                            </div>
                                            <InputError
                                                message={
                                                    allErrors.organization_type_id
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="registration_number">
                                                Registration number
                                            </Label>
                                            <Input
                                                id="registration_number"
                                                name="registration_number"
                                                type="text"
                                                placeholder="Optional"
                                            />
                                            <InputError
                                                message={
                                                    errors.registration_number
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="year_established">
                                                Year established
                                            </Label>
                                            <Input
                                                id="year_established"
                                                name="year_established"
                                                type="number"
                                                min={1900}
                                                max={new Date().getFullYear()}
                                                placeholder="Optional"
                                            />
                                            <InputError
                                                message={
                                                    errors.year_established
                                                }
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* ============ LOCATION ============ */}
                                {activeTab === "location" && (
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="county_select">
                                                County *
                                            </Label>
                                            <div className="w-full [&_.system-select__control]:w-full [&_.system-select__container]:w-full">
                                                <CustomReactSelect
                                                    id="county_select"
                                                    value={countyId}
                                                    onChange={(v) => {
                                                        setCountyId(v);
                                                        setSubCountyId("");
                                                        setWardId("");
                                                        setVillageId("");
                                                        if (
                                                            clientErrors.county_id
                                                        )
                                                            setClientErrors(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    county_id:
                                                                        "",
                                                                }),
                                                            );
                                                    }}
                                                    options={countyOptions}
                                                    placeholder="Select county"
                                                />
                                            </div>
                                            <InputError
                                                message={allErrors.county_id}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="sub_county_select">
                                                Sub-county *
                                            </Label>
                                            <div className="w-full [&_.system-select__control]:w-full [&_.system-select__container]:w-full">
                                                <CustomReactSelect
                                                    id="sub_county_select"
                                                    value={subCountyId}
                                                    onChange={(v) => {
                                                        setSubCountyId(v);
                                                        setWardId("");
                                                        setVillageId("");
                                                        if (
                                                            clientErrors.sub_county_id
                                                        )
                                                            setClientErrors(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    sub_county_id:
                                                                        "",
                                                                }),
                                                            );
                                                    }}
                                                    options={subCountyOptions}
                                                    placeholder="Select sub-county"
                                                    isDisabled={!countyId}
                                                />
                                            </div>
                                            <InputError
                                                message={
                                                    allErrors.sub_county_id
                                                }
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="ward_select">
                                                Ward *
                                            </Label>
                                            <div className="w-full [&_.system-select__control]:w-full [&_.system-select__container]:w-full">
                                                <CustomReactSelect
                                                    id="ward_select"
                                                    value={wardId}
                                                    onChange={(v) => {
                                                        setWardId(v);
                                                        setVillageId("");
                                                        if (
                                                            clientErrors.ward_id
                                                        )
                                                            setClientErrors(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    ward_id: "",
                                                                }),
                                                            );
                                                    }}
                                                    options={wardOptions}
                                                    placeholder="Select ward"
                                                    isDisabled={!subCountyId}
                                                />
                                            </div>
                                            <InputError
                                                message={allErrors.ward_id}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="village_select">
                                                Village *
                                            </Label>
                                            <div className="w-full [&_.system-select__control]:w-full [&_.system-select__container]:w-full">
                                                <CustomReactSelect
                                                    id="village_select"
                                                    value={villageId}
                                                    onChange={(v) => {
                                                        setVillageId(v);
                                                        if (
                                                            clientErrors.village_id
                                                        )
                                                            setClientErrors(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    village_id:
                                                                        "",
                                                                }),
                                                            );
                                                    }}
                                                    options={villageOptions}
                                                    placeholder="Select village"
                                                    isDisabled={!wardId}
                                                />
                                            </div>
                                            <InputError
                                                message={allErrors.village_id}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* ============ ACCOUNT ============ */}
                                {activeTab === "account" && (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2 sm:col-span-2">
                                            <Label htmlFor="name">
                                                Your full name *
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                type="text"
                                                value={name}
                                                onChange={(e) =>
                                                    setName(e.target.value)
                                                }
                                                placeholder="Full name"
                                            />
                                            <InputError
                                                message={allErrors.name}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email">
                                                Email address *
                                            </Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) =>
                                                    setEmail(e.target.value)
                                                }
                                                placeholder="email@example.com"
                                            />
                                            <InputError
                                                message={allErrors.email}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">
                                                Phone *
                                            </Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                type="tel"
                                                value={phone}
                                                onChange={(e) =>
                                                    setPhone(e.target.value)
                                                }
                                                placeholder="+254 7XX XXX XXX"
                                            />
                                            <InputError
                                                message={allErrors.phone}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* ============ SECURITY ============ */}
                                {activeTab === "security" && (
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="password">
                                                Password *
                                            </Label>
                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                value={password}
                                                onChange={(e) =>
                                                    setPassword(e.target.value)
                                                }
                                                placeholder="Password"
                                                passwordrules={passwordRules}
                                                className="w-full"
                                            />
                                            <InputError
                                                message={allErrors.password}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password_confirmation">
                                                Confirm password *
                                            </Label>
                                            <PasswordInput
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                value={passwordConfirmation}
                                                onChange={(e) =>
                                                    setPasswordConfirmation(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Confirm password"
                                                passwordrules={passwordRules}
                                                className="w-full"
                                            />
                                            <InputError
                                                message={
                                                    allErrors.password_confirmation
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ---------------- Footer Actions ---------------- */}
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handlePrev}
                                        disabled={currentIndex === 0}
                                        className={
                                            currentIndex === 0
                                                ? "invisible"
                                                : ""
                                        }
                                    >
                                        Previous
                                    </Button>

                                    {activeTab !== "security" ? (
                                        <Button
                                            type="button"
                                            onClick={handleNext}
                                        >
                                            Next
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            className="w-full sm:w-auto"
                                            disabled={processing}
                                            data-test="register-user-button"
                                        >
                                            {processing && (
                                                <Spinner className="mr-2" />
                                            )}
                                            Create account
                                        </Button>
                                    )}
                                </div>

                                <div className="text-center text-sm text-muted-foreground">
                                    Already have an account?{" "}
                                    <TextLink href={login()}>Log in</TextLink>
                                </div>
                            </div>
                        </>
                    );
                }}
            </Form>
        </>
    );
}

Register.layout = {
    title: "Create an account",
    description: "Register your organization and create your account",
};
