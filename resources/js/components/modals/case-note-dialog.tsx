// components/modals/case-note-dialog.tsx

import { useForm } from "@inertiajs/react";
import { Lock, MessageSquarePlus, Pencil, Star } from "lucide-react";
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
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
import type { CaseNote, NoteFormData } from "@/types/gbv-cases";

interface Props {
    caseId: number;
    trigger: ReactNode;
    /** When provided, the dialog operates in edit mode. */
    note?: CaseNote;
}

// Radix Select forbids empty-string values — use a sentinel for "no type".
const NO_TYPE = "__none__";

const DEFAULT_FORM: NoteFormData = {
    content: "",
    note_type_id: NO_TYPE,
    is_private: false,
    is_important: false,
};

function noteToForm(note: CaseNote): NoteFormData {
    return {
        content: note.content,
        note_type_id: note.note_type_id ? String(note.note_type_id) : NO_TYPE,
        is_private: note.is_private,
        is_important: note.is_important,
    };
}

export function CaseNoteDialog({ caseId, trigger, note }: Props) {
    const { noteTypes } = useAppData();
    const isEdit = Boolean(note);
    const [open, setOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const form = useForm<NoteFormData>(DEFAULT_FORM);

    const resetForm = useCallback(() => {
        form.reset();
        form.clearErrors();
    }, [form]);

    const handleOpenChange = useCallback(
        (next: boolean) => {
            if (form.processing) return;
            if (!next) resetForm();
            setOpen(next);
        },
        [form, resetForm],
    );

    // Hydrate form whenever the dialog opens.
    useEffect(() => {
        if (!open) return;
        if (note) {
            form.setData(noteToForm(note));
        } else {
            resetForm();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, note?.id]);

    // Auto-focus the textarea when the dialog opens.
    useEffect(() => {
        if (!open) return;
        const t = setTimeout(() => textareaRef.current?.focus(), 50);
        return () => clearTimeout(t);
    }, [open]);

    const pickType = useCallback(
        (value: string) => {
            form.setData("note_type_id", value);
            if (isEdit) return;

            const type = noteTypes.find((t) => String(t.id) === value);
            form.setData("is_private", type?.is_private_by_default ?? false);
        },
        [form, isEdit, noteTypes],
    );

    // Translate sentinel → nullable value at submit time.
    form.transform((data) => ({
        ...data,
        note_type_id: data.note_type_id === NO_TYPE ? "" : data.note_type_id,
    }));

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            if (form.data.content.trim().length < 2) {
                form.setError(
                    "content",
                    "Please write a note (at least 2 characters).",
                );
                return;
            }
            form.clearErrors("content");

            const onSuccess = () => {
                toast.success(isEdit ? "Note updated" : "Note added");
                resetForm();
                setOpen(false);
            };

            const onError = (errors: Record<string, string>) => {
                const first = Object.values(errors)[0];
                if (first) toast.error(first);
            };

            if (isEdit && note) {
                form.put(
                    route("gbv-cases.notes.update", {
                        gbvCase: caseId,
                        note: note.id,
                    }),
                    {
                        preserveScroll: true,
                        preserveState: true,
                        onSuccess,
                        onError,
                    },
                );
            } else {
                form.post(route("gbv-cases.notes.store", { gbvCase: caseId }), {
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess,
                    onError,
                });
            }
        },
        [caseId, form, isEdit, note, resetForm],
    );

    const { errors, processing, data } = form;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>

            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isEdit ? (
                            <Pencil className="h-4 w-4" />
                        ) : (
                            <MessageSquarePlus className="h-4 w-4" />
                        )}
                        {isEdit ? "Edit Note" : "Add Note"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEdit
                            ? "Update this case note."
                            : "Record a note against this case. Private notes are only visible to staff with the right permission."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Note type */}
                    <div className="space-y-2">
                        <Label htmlFor="note_type_id">
                            Note type{" "}
                            <span className="text-muted-foreground">
                                (optional)
                            </span>
                        </Label>
                        <Select
                            value={data.note_type_id}
                            onValueChange={pickType}
                            disabled={noteTypes.length === 0}
                        >
                            <SelectTrigger id="note_type_id">
                                <SelectValue
                                    placeholder={
                                        noteTypes.length === 0
                                            ? "No note types available"
                                            : "Select type"
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NO_TYPE}>No type</SelectItem>
                                {noteTypes.map((t) => (
                                    <SelectItem key={t.id} value={String(t.id)}>
                                        {t.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.note_type_id && (
                            <p className="text-xs text-rose-600">
                                {errors.note_type_id}
                            </p>
                        )}
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                        <Label htmlFor="content">Note</Label>
                        <Textarea
                            id="content"
                            ref={textareaRef}
                            rows={6}
                            value={data.content}
                            onChange={(e) =>
                                form.setData("content", e.target.value)
                            }
                            placeholder="Write your note…"
                            maxLength={10000}
                        />
                        {errors.content && (
                            <p className="text-xs text-rose-600">
                                {errors.content}
                            </p>
                        )}
                    </div>

                    {/* Flags */}
                    <div className="flex flex-wrap items-center gap-4">
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300"
                                checked={data.is_private}
                                onChange={(e) =>
                                    form.setData("is_private", e.target.checked)
                                }
                            />
                            <Lock className="h-3.5 w-3.5" /> Private
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300"
                                checked={data.is_important}
                                onChange={(e) =>
                                    form.setData(
                                        "is_important",
                                        e.target.checked,
                                    )
                                }
                            />
                            <Star className="h-3.5 w-3.5" /> Mark as important
                        </label>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={
                                processing || data.content.trim().length < 2
                            }
                        >
                            {processing
                                ? "Saving…"
                                : isEdit
                                  ? "Save changes"
                                  : "Add note"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
