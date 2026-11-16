import { useForm } from "@inertiajs/react";
import { AlertCircle, Info, Send, SquarePen } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { useAppData } from "@/hooks/use-app-data";

import type {
    Referral,
    ReferralFormData,
    ReferralStatusValue,
} from "@/types/gbv-cases";

interface Props {
    caseId: number;
    trigger: ReactNode;
    referral?: Referral;
}

/* ---------- status options ---------- */

const STATUS_OPTIONS: { value: ReferralStatusValue; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "declined", label: "Declined" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
];

/** Statuses the receiving partner can move a referral to. */
const RECEIVER_STATUS_OPTIONS: { value: ReferralStatusValue; label: string }[] =
    [
        { value: "accepted", label: "Accepted" },
        { value: "declined", label: "Declined" },
        { value: "completed", label: "Completed" },
    ];

/* ---------- form helpers ---------- */

function emptyForm(): ReferralFormData {
    return {
        to_partner_id: "",
        referral_type_id: "",
        urgency_option_id: "",
        case_file_id: "",
        reason: "",
        services_requested: [],
        feedback: "",
        status: "pending",
    };
}

function referralToForm(r: Referral): ReferralFormData {
    return {
        to_partner_id: r.to_partner ? String(r.to_partner.id) : "",
        referral_type_id: r.referral_type ? String(r.referral_type.id) : "",
        urgency_option_id: r.urgency ? String(r.urgency.id) : "",
        case_file_id: r.case_file ? String(r.case_file.id) : "",
        reason: r.reason ?? "",
        services_requested: r.services_requested ?? [],
        feedback: r.feedback ?? "",
        status: r.status,
    };
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <p className="flex items-center gap-1 text-xs text-rose-600">
            <AlertCircle className="h-3 w-3" />
            {message}
        </p>
    );
}

function RequiredMark() {
    return <span className="text-rose-600"> *</span>;
}

/* ---------- component ---------- */

export function ReferralDialog({ caseId, trigger, referral }: Props) {
    const { partners, referralTypes, urgencyOptions, user } = useAppData();
    const isEdit = Boolean(referral);
    const [open, setOpen] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } =
        useForm<ReferralFormData>(emptyForm());

    useEffect(() => {
        if (!open) return;
        clearErrors();
        if (referral) setData(referralToForm(referral));
        else reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, referral?.id]);

    const isReceivingPartner =
        isEdit &&
        !!user?.partner_id &&
        !!referral?.to_partner &&
        Number(user.partner_id) === Number(referral.to_partner.id);

    const isSender = !isReceivingPartner;

    const statusOptions = isReceivingPartner
        ? RECEIVER_STATUS_OPTIONS
        : STATUS_OPTIONS;

    const summariseErrors = (errs: Record<string, string>) => {
        const messages = Object.values(errs).filter(
            (m): m is string => typeof m === "string" && m.length > 0,
        );
        if (messages.length === 0) return null;
        if (messages.length === 1) return messages[0];
        return `${messages[0]} (+${messages.length - 1} more)`;
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success(isEdit ? "Referral updated" : "Referral created");
                reset();
                clearErrors();
                setOpen(false);
            },
            onError: (errs: Record<string, string>) => {
                console.error(
                    isEdit
                        ? "Referral update errors:"
                        : "Referral create errors:",
                    errs,
                );

                const summary = summariseErrors(errs);
                if (summary) {
                    toast.error("Please fix the highlighted fields.", {
                        description: summary,
                    });
                    return;
                }

                toast.error(
                    isEdit
                        ? "Could not update referral."
                        : "Could not create referral.",
                    {
                        description:
                            "Server error — check DevTools → Network for details.",
                    },
                );
            },
        };

        if (isEdit && referral) {
            put(
                route("gbv-cases.referrals.update", {
                    gbvCase: caseId,
                    referral: referral.id,
                }),
                options,
            );
        } else {
            post(
                route("gbv-cases.referrals.store", { gbvCase: caseId }),
                options,
            );
        }
    };

    const Icon = isEdit ? SquarePen : Send;
    const errorCount = Object.keys(errors).length;

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!processing) {
                    setOpen(next);
                    if (!next) {
                        reset();
                        clearErrors();
                    }
                }
            }}
        >
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {isEdit ? "Referral" : "New Referral"}
                    </DialogTitle>
                    <DialogDescription>
                        {isReceivingPartner
                            ? "Update this referral's status and share your feedback."
                            : isEdit
                              ? "Update this referral's details or status."
                              : "Refer the survivor to another service provider."}
                    </DialogDescription>
                </DialogHeader>

                {/* Receiving partner notice */}
                {isReceivingPartner && (
                    <div className="flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-800 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-300">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>
                            As the receiving partner, you can update the{" "}
                            <strong>status</strong> and share{" "}
                            <strong>feedback</strong> on this referral. Contact
                            the referring partner if you need other details
                            changed.
                        </span>
                    </div>
                )}

                {/* Top error summary */}
                {errorCount > 0 && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm dark:border-rose-900 dark:bg-rose-950/30">
                        <p className="flex items-center gap-1.5 font-medium text-rose-700 dark:text-rose-300">
                            <AlertCircle className="h-4 w-4" />
                            {errorCount} field{errorCount === 1 ? "" : "s"} need
                            {errorCount === 1 ? "s" : ""} attention
                        </p>
                        <ul className="mt-1.5 list-inside list-disc text-xs text-rose-600 dark:text-rose-400">
                            {Object.entries(errors).map(([field, message]) => (
                                <li key={field}>
                                    <span className="font-medium">
                                        {field}:
                                    </span>{" "}
                                    {message}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    {/* Sender-only fields */}
                    {isSender && (
                        <>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* ---- Partner ---- */}
                                <div className="space-y-2">
                                    <Label htmlFor="to_partner_id">
                                        Partner
                                        <RequiredMark />
                                    </Label>
                                    <Select
                                        value={data.to_partner_id}
                                        onValueChange={(v) =>
                                            setData("to_partner_id", v)
                                        }
                                    >
                                        <SelectTrigger id="to_partner_id">
                                            <SelectValue placeholder="Select a partner" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none" disabled>
                                                Select a partner
                                            </SelectItem>
                                            {partners.length === 0 ? (
                                                <SelectItem
                                                    value="__empty"
                                                    disabled
                                                >
                                                    No partners available
                                                </SelectItem>
                                            ) : (
                                                partners.map((p) => (
                                                    <SelectItem
                                                        key={p.id}
                                                        value={String(p.id)}
                                                    >
                                                        {p.organization_name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FieldError
                                        message={errors.to_partner_id}
                                    />
                                </div>

                                {/* ---- Referral type ---- */}
                                <div className="space-y-2">
                                    <Label htmlFor="referral_type_id">
                                        Referral type
                                        <RequiredMark />
                                    </Label>
                                    <Select
                                        value={data.referral_type_id}
                                        onValueChange={(v) =>
                                            setData("referral_type_id", v)
                                        }
                                    >
                                        <SelectTrigger id="referral_type_id">
                                            <SelectValue placeholder="Select a referral type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__none" disabled>
                                                Select a referral type
                                            </SelectItem>
                                            {referralTypes.length === 0 ? (
                                                <SelectItem
                                                    value="__empty"
                                                    disabled
                                                >
                                                    No referral types
                                                    available
                                                </SelectItem>
                                            ) : (
                                                referralTypes.map((t) => (
                                                    <SelectItem
                                                        key={t.id}
                                                        value={String(t.id)}
                                                    >
                                                        {t.name}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FieldError
                                        message={errors.referral_type_id}
                                    />
                                </div>
                            </div>

                            {/* ---- Urgency ---- */}
                            <div className="space-y-2">
                                <Label htmlFor="urgency_option_id">
                                    Urgency
                                    <RequiredMark />
                                </Label>
                                <Select
                                    value={data.urgency_option_id}
                                    onValueChange={(v) =>
                                        setData("urgency_option_id", v)
                                    }
                                >
                                    <SelectTrigger id="urgency_option_id">
                                        <SelectValue placeholder="Select urgency level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__none" disabled>
                                            Select urgency level
                                        </SelectItem>
                                        {urgencyOptions.length === 0 ? (
                                            <SelectItem
                                                value="__empty"
                                                disabled
                                            >
                                                No urgency levels available
                                            </SelectItem>
                                        ) : (
                                            urgencyOptions.map((u) => (
                                                <SelectItem
                                                    key={u.id}
                                                    value={String(u.id)}
                                                >
                                                    {u.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <FieldError
                                    message={errors.urgency_option_id}
                                />
                            </div>

                            {/* ---- Reason ---- */}
                            <div className="space-y-2">
                                <Label htmlFor="reason">
                                    Reason for referral
                                    <RequiredMark />
                                </Label>
                                <Textarea
                                    id="reason"
                                    rows={3}
                                    value={data.reason}
                                    onChange={(e) =>
                                        setData("reason", e.target.value)
                                    }
                                    placeholder="Why is this referral being made?"
                                />
                                <FieldError message={errors.reason} />
                            </div>

                            {/* ---- Services requested ---- */}
                            <div className="space-y-2">
                                <Label htmlFor="services_requested">
                                    Services requested (comma-separated)
                                </Label>
                                <Input
                                    id="services_requested"
                                    value={data.services_requested.join(", ")}
                                    onChange={(e) =>
                                        setData(
                                            "services_requested",
                                            e.target.value
                                                .split(",")
                                                .map((s) => s.trim())
                                                .filter(Boolean),
                                        )
                                    }
                                    placeholder="e.g. medical exam, legal aid, counselling"
                                />
                                <FieldError
                                    message={errors.services_requested}
                                />
                            </div>
                        </>
                    )}

                    {/* ---- Status (always visible) ---- */}
                    <div className="space-y-2">
                        <Label htmlFor="status">
                            Status
                            <RequiredMark />
                        </Label>
                        <Select
                            value={data.status}
                            onValueChange={(v) =>
                                setData("status", v as ReferralStatusValue)
                            }
                        >
                            <SelectTrigger id="status">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldError message={errors.status} />
                        {isReceivingPartner && (
                            <p className="text-xs text-muted-foreground">
                                Available transitions for you: accepted →
                                completed, or declined. Cancelling is the
                                sender&apos;s decision.
                            </p>
                        )}
                        {!isReceivingPartner && isEdit && (
                            <p className="text-xs text-muted-foreground">
                                You can set the referral back to{" "}
                                <strong>Pending</strong> or cancel it while it
                                hasn&apos;t been accepted.
                            </p>
                        )}
                    </div>

                    {/* ---- Feedback (receiver only) ---- */}
                    {isReceivingPartner && (
                        <div className="space-y-2">
                            <Label htmlFor="feedback">Feedback</Label>
                            <Textarea
                                id="feedback"
                                rows={3}
                                value={data.feedback}
                                onChange={(e) =>
                                    setData("feedback", e.target.value)
                                }
                                placeholder="Notes from the receiving partner…"
                            />
                            <FieldError message={errors.feedback} />
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? "Saving…"
                                : isEdit
                                  ? "Save changes"
                                  : "Create referral"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}