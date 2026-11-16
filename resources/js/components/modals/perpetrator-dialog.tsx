import { useForm } from "@inertiajs/react";
import { UserPen, UserPlus } from "lucide-react";
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

import type { Perpetrator, PerpetratorFormData } from "@/types/gbv-cases";

interface Props {
    caseId: number;
    trigger: ReactNode;
    /** When provided, the dialog operates in edit mode. */
    perpetrator?: Perpetrator;
}

function emptyForm(): PerpetratorFormData {
    return {
        name: "",
        name_known: true,
        gender_option_id: "",
        age_range_id: "",
        relationship_option_id: "",
        relationship_details: "",
        physical_description_text: "",
        identifying_features_text: "",
        is_repeat_offender: false,
        previous_incidents_count: "0",
        additional_info: "",
    };
}

function perpetratorToForm(p: Perpetrator): PerpetratorFormData {
    return {
        name: p.name ?? "",
        name_known: p.name_known,
        gender_option_id: p.gender_option ? String(p.gender_option.id) : "",
        age_range_id: p.age_range ? String(p.age_range.id) : "",
        relationship_option_id: p.relationship_option
            ? String(p.relationship_option.id)
            : "",
        relationship_details: p.relationship_details ?? "",
        physical_description_text:
            (p.physical_description as { notes?: string } | null)?.notes ?? "",
        identifying_features_text:
            (p.identifying_features as { notes?: string } | null)?.notes ?? "",
        is_repeat_offender: p.is_repeat_offender,
        previous_incidents_count: String(p.previous_incidents_count ?? 0),
        additional_info: p.additional_info ?? "",
    };
}

export function AddPerpetratorDialog({ caseId, trigger, perpetrator }: Props) {
    const { genderOptions, ageRanges, relationshipOptions } = useAppData();
    const isEdit = Boolean(perpetrator);
    const [open, setOpen] = useState(false);

    const { data, setData, post, put, processing, errors, reset } =
        useForm<PerpetratorFormData>(emptyForm());

    // Hydrate / reset form whenever the dialog opens.
    useEffect(() => {
        if (!open) return;
        if (perpetrator) {
            setData(perpetratorToForm(perpetrator));
        } else {
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, perpetrator?.id]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const options = {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                toast.success(
                    isEdit ? "Perpetrator updated" : "Perpetrator added",
                );
                reset();
                setOpen(false);
            },
            onError: () =>
                toast.error(
                    isEdit
                        ? "Could not update perpetrator."
                        : "Could not add perpetrator. Please check the form.",
                ),
        };

        if (isEdit && perpetrator) {
            put(
                route("gbv-cases.perpetrators.update", {
                    gbvCase: caseId,
                    perpetrator: perpetrator.id,
                }),
                options,
            );
        } else {
            post(
                route("gbv-cases.perpetrators.store", { gbvCase: caseId }),
                options,
            );
        }
    };

    const Icon = isEdit ? UserPen : UserPlus;
    const title = isEdit ? "Edit Perpetrator" : "Add Perpetrator";
    const description = isEdit
        ? "Update the recorded information about this perpetrator."
        : "Record information about the alleged perpetrator for this case.";
    const submitLabel = isEdit
        ? processing
            ? "Saving…"
            : "Save changes"
        : processing
          ? "Saving…"
          : "Add perpetrator";

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!processing) {
                    setOpen(next);
                    if (!next) reset();
                }
            }}
        >
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {title}
                    </DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    {/* Name + known toggle */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Name
                                {data.name_known
                                    ? ""
                                    : " (if unknown, leave blank)"}
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                placeholder="Full name"
                                disabled={!data.name_known}
                            />
                            {errors.name && (
                                <p className="text-xs text-rose-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="flex items-end">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={data.name_known}
                                    onChange={(e) => {
                                        setData("name_known", e.target.checked);
                                        if (!e.target.checked)
                                            setData("name", "");
                                    }}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                Name is known
                            </label>
                        </div>
                    </div>

                    {/* Gender / Age / Relationship */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                            <Label>Gender</Label>
                            <Select
                                value={data.gender_option_id}
                                onValueChange={(v) =>
                                    setData("gender_option_id", v)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    {genderOptions.map((o) => (
                                        <SelectItem
                                            key={o.id}
                                            value={String(o.id)}
                                        >
                                            {o.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.gender_option_id && (
                                <p className="text-xs text-rose-600">
                                    {errors.gender_option_id}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Age range</Label>
                            <Select
                                value={data.age_range_id}
                                onValueChange={(v) =>
                                    setData("age_range_id", v)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select age range" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ageRanges.map((o) => (
                                        <SelectItem
                                            key={o.id}
                                            value={String(o.id)}
                                        >
                                            {o.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.age_range_id && (
                                <p className="text-xs text-rose-600">
                                    {errors.age_range_id}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Relationship</Label>
                            <Select
                                value={data.relationship_option_id}
                                onValueChange={(v) =>
                                    setData("relationship_option_id", v)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                                <SelectContent>
                                    {relationshipOptions.map((o) => (
                                        <SelectItem
                                            key={o.id}
                                            value={String(o.id)}
                                        >
                                            {o.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.relationship_option_id && (
                                <p className="text-xs text-rose-600">
                                    {errors.relationship_option_id}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Relationship details */}
                    <div className="space-y-2">
                        <Label htmlFor="relationship_details">
                            Relationship details
                        </Label>
                        <Input
                            id="relationship_details"
                            value={data.relationship_details}
                            onChange={(e) =>
                                setData("relationship_details", e.target.value)
                            }
                            placeholder="e.g. neighbour, employer, ex-partner…"
                        />
                    </div>

                    {/* Physical description + identifying features */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="physical_description_text">
                                Physical description
                            </Label>
                            <Textarea
                                id="physical_description_text"
                                rows={3}
                                value={data.physical_description_text}
                                onChange={(e) =>
                                    setData(
                                        "physical_description_text",
                                        e.target.value,
                                    )
                                }
                                placeholder="Height, build, complexion, clothing…"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="identifying_features_text">
                                Identifying features
                            </Label>
                            <Textarea
                                id="identifying_features_text"
                                rows={3}
                                value={data.identifying_features_text}
                                onChange={(e) =>
                                    setData(
                                        "identifying_features_text",
                                        e.target.value,
                                    )
                                }
                                placeholder="Tattoos, scars, marks, disabilities…"
                            />
                        </div>
                    </div>

                    {/* Repeat offender */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={data.is_repeat_offender}
                                onChange={(e) =>
                                    setData(
                                        "is_repeat_offender",
                                        e.target.checked,
                                    )
                                }
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            Repeat offender
                        </label>

                        <div className="space-y-2">
                            <Label htmlFor="previous_incidents_count">
                                Previous incidents
                            </Label>
                            <Input
                                id="previous_incidents_count"
                                type="number"
                                min={0}
                                value={data.previous_incidents_count}
                                onChange={(e) =>
                                    setData(
                                        "previous_incidents_count",
                                        e.target.value,
                                    )
                                }
                                disabled={!data.is_repeat_offender}
                            />
                        </div>
                    </div>

                    {/* Additional info */}
                    <div className="space-y-2">
                        <Label htmlFor="additional_info">
                            Additional information
                        </Label>
                        <Textarea
                            id="additional_info"
                            rows={3}
                            value={data.additional_info}
                            onChange={(e) =>
                                setData("additional_info", e.target.value)
                            }
                            placeholder="Any other relevant details…"
                        />
                    </div>

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
                            {submitLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
