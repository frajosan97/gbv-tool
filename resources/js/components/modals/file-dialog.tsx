import { useForm } from "@inertiajs/react";
import { FileUp, Loader2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
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

interface Props {
    caseId: number;
    /**
     * When set, the uploaded file is attached to this referral
     * (`case_files.referral_id`) instead of being a case-level file.
     * The backend authorizes the upload against the referral.
     */
    referralId?: number;
    trigger?: React.ReactNode;
    children?: React.ReactNode;
    onSuccess?: () => void;
}

interface FormData {
    file: File | null;
    title: string;
    description: string;
    file_type_id: string;
}

/* ---------- Allowed file policy ---------- */

type FileCategory = "document" | "image" | "video" | "other";

const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

const ALLOWED_MIME_TYPES: Record<string, string[]> = {
    "application/pdf": [".pdf"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
    "video/mp4": [".mp4"],
    "video/webm": [".webm"],
    "video/quicktime": [".mov"],
};

const ACCEPT = [
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".mp4",
    ".webm",
    ".mov",
].join(",");

function fileCategory(file: File): FileCategory {
    if (file.type === "application/pdf") return "document";
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";

    const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? "";
    if (ext === ".pdf") return "document";
    if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return "image";
    if ([".mp4", ".webm", ".mov"].includes(ext)) return "video";

    return "other";
}

function isAllowedFile(
    file: File,
): { ok: true } | { ok: false; reason: string } {
    const category = fileCategory(file);

    if (category === "other") {
        return {
            ok: false,
            reason: "Unsupported file type. Only PDF documents, JPG/PNG/WEBP images, and MP4/WEBM/MOV videos are allowed.",
        };
    }

    const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? "";
    const allowedForMime = ALLOWED_MIME_TYPES[file.type];

    if (allowedForMime && !allowedForMime.includes(ext)) {
        return {
            ok: false,
            reason: `The file extension "${ext}" does not match the detected type.`,
        };
    }

    return { ok: true };
}

function humanSize(bytes: number): string {
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let n = bytes;
    while (n >= 1024 && i < units.length - 1) {
        n /= 1024;
        i++;
    }
    return `${n.toFixed(1)} ${units[i]}`;
}

function titleFromFilename(name: string): string {
    return name
        .replace(/\.[^.]+$/, "")
        .replace(/[_-]+/g, " ")
        .trim();
}

/* ---------- Component ---------- */

export function AddFileDialog({
    caseId,
    referralId,
    trigger,
    children,
    onSuccess,
}: Props) {
    const { fileTypes } = useAppData();

    const isReferralUpload = referralId !== undefined && referralId !== null;

    const [open, setOpen] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<FormData>({
        file: null,
        title: "",
        description: "",
        file_type_id: "",
    });

    const resetForm = useCallback(() => {
        form.reset();
        form.clearErrors();
        setDragActive(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, [form]);

    const handleOpenChange = useCallback(
        (next: boolean) => {
            if (!next) resetForm();
            setOpen(next);
        },
        [resetForm],
    );

    const acceptFile = useCallback(
        (file: File | null) => {
            if (!file) return;

            const verdict = isAllowedFile(file);
            if (!verdict.ok) {
                toast.error(verdict.reason);
                form.setError("file", verdict.reason);
                return;
            }

            if (file.size > MAX_SIZE_BYTES) {
                const msg = `File is too large (${humanSize(file.size)}). Maximum allowed is ${humanSize(MAX_SIZE_BYTES)}.`;
                toast.error(msg);
                form.setError("file", msg);
                return;
            }

            form.clearErrors("file");
            form.setData("file", file);
            if (!form.data.title.trim()) {
                form.setData("title", titleFromFilename(file.name));
            }
        },
        [form],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setDragActive(false);
            acceptFile(e.dataTransfer.files?.[0] ?? null);
        },
        [acceptFile],
    );

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            if (!form.data.file) {
                form.setError("file", "Please choose a file to upload.");
                return;
            }
            if (!form.data.title.trim()) {
                form.setError("title", "Title is required.");
                return;
            }
            if (!form.data.file_type_id) {
                form.setError("file_type_id", "Please select a file type.");
                return;
            }

            // `useForm.post` accepts a data override as the third arg —
            // we splice in `referral_id` when uploading against a referral.
            form.post(`/gbv-cases/${caseId}/files`, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        isReferralUpload
                            ? "Referral document uploaded successfully."
                            : "File uploaded successfully.",
                    );
                    resetForm();
                    setOpen(false);
                    onSuccess?.();
                },
                onError: (errors) => {
                    const first = Object.values(errors)[0];
                    if (first) toast.error(first);
                },
            });
        },
        [caseId, form, onSuccess, resetForm, isReferralUpload],
    );

    /* -------- Splice referral_id into the submitted payload -------- */

    // `useForm.post` serializes `data` automatically. To attach
    // `referral_id` without adding it to the form state (it's a prop,
    // not a user-editable field), we use `transform`.
    form.transform((data) => ({
        ...data,
        ...(isReferralUpload ? { referral_id: referralId } : {}),
    }));

    const { errors, processing, data } = form;
    const selectedFile = data.file;

    const availableTypes = fileTypes.filter((t) => t.is_active !== false);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger ?? children ?? (
                    <Button size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        {isReferralUpload
                            ? "Upload referral document"
                            : "Upload file"}
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {isReferralUpload
                            ? "Upload referral document"
                            : "Upload case file"}
                    </DialogTitle>
                    <DialogDescription>
                        {isReferralUpload
                            ? "Attach a supporting document to this referral. Accepted: PDF documents, JPG/PNG/WEBP images, and MP4/WEBM/MOV videos. Max 15 MB."
                            : "Attach a document to this case. Accepted: PDF documents, JPG/PNG/WEBP images, and MP4/WEBM/MOV videos. Max 15 MB."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* -------- File picker -------- */}
                    <div className="space-y-2">
                        <Label>File</Label>

                        {selectedFile ? (
                            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                                <FileUp className="h-5 w-5 shrink-0 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {selectedFile.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {humanSize(selectedFile.size)}
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 shrink-0"
                                    onClick={() => {
                                        form.setData("file", null);
                                        if (fileInputRef.current) {
                                            fileInputRef.current.value = "";
                                        }
                                    }}
                                    aria-label="Remove file"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div
                                onDragEnter={(e) => {
                                    e.preventDefault();
                                    setDragActive(true);
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setDragActive(true);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    setDragActive(false);
                                }}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={
                                    "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors " +
                                    (dragActive
                                        ? "border-primary bg-primary/5"
                                        : "border-muted-foreground/25 hover:border-muted-foreground/50")
                                }
                            >
                                <FileUp className="mb-2 h-8 w-8 text-muted-foreground" />
                                <p className="text-sm font-medium">
                                    Drop file here or click to browse
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    PDF, JPG, PNG, WEBP, MP4, WEBM, MOV — max 15
                                    MB
                                </p>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={ACCEPT}
                            className="hidden"
                            onChange={(e) =>
                                acceptFile(e.target.files?.[0] ?? null)
                            }
                        />

                        {errors.file && (
                            <p className="text-xs text-rose-600">
                                {errors.file}
                            </p>
                        )}
                    </div>

                    {/* -------- Title -------- */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) =>
                                form.setData("title", e.target.value)
                            }
                            placeholder={
                                isReferralUpload
                                    ? "e.g. Assessment form"
                                    : "e.g. PRC Form — MOH 363"
                            }
                            maxLength={255}
                        />
                        {errors.title && (
                            <p className="text-xs text-rose-600">
                                {errors.title}
                            </p>
                        )}
                    </div>

                    {/* -------- File type -------- */}
                    <div className="space-y-2">
                        <Label htmlFor="file_type_id">File type</Label>
                        <Select
                            value={data.file_type_id}
                            onValueChange={(v) =>
                                form.setData("file_type_id", v)
                            }
                            disabled={availableTypes.length === 0}
                        >
                            <SelectTrigger id="file_type_id">
                                <SelectValue
                                    placeholder={
                                        availableTypes.length === 0
                                            ? "No file types available"
                                            : "Select type"
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {availableTypes.map((t) => (
                                    <SelectItem key={t.id} value={String(t.id)}>
                                        {t.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {availableTypes.length === 0 && (
                            <p className="text-xs text-amber-600">
                                No file types are configured. Ask an
                                administrator to seed the{" "}
                                <code>file_types</code> table.
                            </p>
                        )}
                        {errors.file_type_id && (
                            <p className="text-xs text-rose-600">
                                {errors.file_type_id}
                            </p>
                        )}
                    </div>

                    {/* -------- Description -------- */}
                    <div className="space-y-2">
                        <Label htmlFor="description">
                            Description{" "}
                            <span className="text-muted-foreground">
                                (optional)
                            </span>
                        </Label>
                        <Textarea
                            id="description"
                            rows={3}
                            value={data.description}
                            onChange={(e) =>
                                form.setData("description", e.target.value)
                            }
                            placeholder={
                                isReferralUpload
                                    ? "Notes from the receiving partner…"
                                    : "Notes about this file (form number, context, etc.)"
                            }
                            maxLength={2000}
                        />
                        {errors.description && (
                            <p className="text-xs text-rose-600">
                                {errors.description}
                            </p>
                        )}
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
                            disabled={processing || availableTypes.length === 0}
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading…
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
