import { router } from "@inertiajs/react";
import { Download, FileText, FolderClosed, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AddFileDialog } from "@/components/modals/file-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAppData } from "@/hooks/use-app-data";
import { formatDate } from "@/lib/formatters";
import { buildLocalPaginator } from "@/lib/local-paginator";

import type {
    CaseFile,
    Column,
    DataTableFilters,
    GbvCaseShowProps,
    Referral,
} from "@/types";

interface Props {
    caseId: number;
    files: CaseFile[];
    can: GbvCaseShowProps["can"];
    /** Referrals loaded on the parent case — used to detect receiving-partner upload rights. */
    referrals?: Referral[];
}

interface FilesTabFilters {
    search: string;
    sort: string;
    dir: "asc" | "desc";
    per_page: number;
    [key: string]: string | number | boolean | undefined;
}

const DEFAULT_FILTERS: FilesTabFilters = {
    search: "",
    sort: "created_at",
    dir: "desc",
    per_page: 10,
};

function formatSize(bytes: number | null): string {
    if (!bytes) return "—";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let n = bytes;
    while (n >= 1024 && i < units.length - 1) {
        n /= 1024;
        i++;
    }
    return `${n.toFixed(1)} ${units[i]}`;
}

export function CaseFilesTab({ caseId, files, can, referrals = [] }: Props) {
    const { user } = useAppData();
    const [filters, setFilters] = useState<FilesTabFilters>(DEFAULT_FILTERS);
    const [page, setPage] = useState(1);

    const [pendingDelete, setPendingDelete] = useState<CaseFile | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const isDeleting = deletingId !== null;

    /* ---------- referral-awareness ---------- */

    /**
     * The referral (if any) on this case addressed to the current user's
     * partner. When set, the user is a "receiving partner" for that
     * referral and can:
     *   - upload files attached to it,
     *   - delete files they uploaded against it,
     *   - download files attached to it.
     */
    const receivingReferral: Referral | undefined = useMemo(() => {
        if (!user?.partner_id) return undefined;
        return referrals.find(
            (r) =>
                r.to_partner &&
                Number(r.to_partner.id) === Number(user.partner_id),
        );
    }, [referrals, user?.partner_id]);

    /** Files belonging to the receiving partner's referral. */
    const referralFileIds = useMemo(() => {
        if (!receivingReferral) return new Set<number>();
        return new Set(
            files
                .filter((f) => f.referral_id === receivingReferral.id)
                .map((f) => f.id),
        );
    }, [files, receivingReferral]);

    /**
     * Can the current user upload a file?
     * - Case owner with can.update → yes (uploads as case-level).
     * - Receiving partner with an open referral → yes (uploads to that referral).
     */
    const canUpload =
        can.update ||
        (receivingReferral !== undefined &&
            receivingReferral.status !== "completed" &&
            receivingReferral.status !== "cancelled");

    /** Referral id to attach to uploads — null for case-owner uploads. */
    const uploadReferralId = can.update
        ? null
        : (receivingReferral?.id ?? null);

    /**
     * Can the current user delete a specific file?
     * - Case owner → yes for all files.
     * - Receiving partner → only files they uploaded to their referral.
     */
    const canDeleteFile = useCallback(
        (f: CaseFile): boolean => {
            if (can.update) return true;
            if (!receivingReferral) return false;
            if (f.referral_id !== receivingReferral.id) return false;
            // The backend further restricts to uploader / referral creator.
            return true;
        },
        [can.update, receivingReferral],
    );

    /* ---------- filter + sort ---------- */

    const filtered = useMemo(() => {
        const term = filters.search.trim().toLowerCase();
        let result = files;

        if (term) {
            result = result.filter(
                (f) =>
                    (f.title ?? "").toLowerCase().includes(term) ||
                    (f.file_name ?? "").toLowerCase().includes(term) ||
                    (f.description ?? "").toLowerCase().includes(term) ||
                    (f.file_type ?? "").toLowerCase().includes(term) ||
                    (f.file_number ?? "").toLowerCase().includes(term) ||
                    (f.uploaded_by ?? "").toLowerCase().includes(term),
            );
        }

        const key = filters.sort as keyof CaseFile;
        const sorted = [...result].sort((a, b) => {
            const av = (a[key] ?? "") as string | number;
            const bv = (b[key] ?? "") as string | number;
            if (typeof av === "number" && typeof bv === "number") {
                return av - bv;
            }
            return String(av).localeCompare(String(bv));
        });
        return filters.dir === "desc" ? sorted.reverse() : sorted;
    }, [files, filters.search, filters.sort, filters.dir]);

    const lastPage = Math.max(
        1,
        Math.ceil(filtered.length / Math.max(1, filters.per_page)),
    );
    useEffect(() => {
        if (page > lastPage) setPage(lastPage);
    }, [page, lastPage]);

    const paginator = useMemo(
        () => buildLocalPaginator(filtered, page, filters.per_page),
        [filtered, page, filters.per_page],
    );

    const handleFilterChange = useCallback(
        (patch: Partial<DataTableFilters> & Record<string, unknown>) => {
            const narrowed = patch as Partial<FilesTabFilters>;

            if (
                narrowed.search !== undefined ||
                narrowed.sort !== undefined ||
                narrowed.dir !== undefined
            ) {
                setPage(1);
            }

            setFilters((prev) => ({ ...prev, ...narrowed }));
        },
        [],
    );

    /* ---------- delete flow ---------- */

    const requestDelete = useCallback((file: CaseFile) => {
        setPendingDelete(file);
    }, []);

    const confirmDelete = useCallback(() => {
        const file = pendingDelete;
        if (!file) return;

        setDeletingId(file.id);
        router.delete(
            route("gbv-cases.files.destroy", {
                gbvCase: caseId,
                file: file.id,
            }),
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success(`"${file.title}" deleted`);
                    setPendingDelete(null);
                },
                onError: () => {
                    toast.error("Could not delete file. Please try again.");
                },
                onFinish: () => setDeletingId(null),
            },
        );
    }, [pendingDelete, caseId]);

    /* ---------- columns ---------- */

    const columns: Column<CaseFile>[] = [
        {
            key: "title",
            label: "File",
            icon: FileText,
            sortable: true,
            headerClassName: "w-[36%]",
            cell: (f) => (
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{f.title}</p>
                        {f.referral_id ? (
                            <Badge
                                variant="outline"
                                className="shrink-0 text-[10px]"
                            >
                                Referral
                            </Badge>
                        ) : null}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                        {f.file_name}
                        {f.file_size ? ` · ${formatSize(f.file_size)}` : ""}
                        {f.description ? ` · ${f.description}` : ""}
                    </p>
                </div>
            ),
        },
        {
            key: "file_type",
            label: "Type",
            headerClassName: "w-[16%]",
            cell: (f) =>
                f.file_type ? (
                    <Badge variant="outline" className="truncate">
                        {f.file_type}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground">—</span>
                ),
        },
        {
            key: "uploaded_by",
            label: "Uploaded By",
            headerClassName: "w-[14%]",
            cell: (f) => (
                <span className="truncate">{f.uploaded_by ?? "—"}</span>
            ),
        },
        {
            key: "created_at",
            label: "Uploaded",
            sortable: true,
            headerClassName: "w-[12%] text-right",
            className: "text-right",
            cell: (f) => (
                <span className="text-xs text-muted-foreground">
                    {f.created_at ? formatDate(f.created_at) : "—"}
                </span>
            ),
        },
        {
            key: "actions",
            label: "",
            headerClassName: "w-[10%] text-right",
            className: "text-right",
            cell: (f) => (
                <div className="flex items-center justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-7 w-7"
                        title="Download"
                    >
                        <a
                            href={route("gbv-cases.files.download", {
                                gbvCase: caseId,
                                file: f.id,
                            })}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Download ${f.title}`}
                        >
                            <Download className="h-3.5 w-3.5" />
                        </a>
                    </Button>
                    {canDeleteFile(f) && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-600 hover:text-rose-700"
                            title="Delete"
                            aria-label={`Delete ${f.title}`}
                            onClick={() => requestDelete(f)}
                            disabled={deletingId === f.id}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    /* ---------- render ---------- */

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                    {files.length} file{files.length === 1 ? "" : "s"}
                </p>
                {canUpload && (
                    <AddFileDialog
                        caseId={caseId}
                        referralId={uploadReferralId ?? undefined}
                        trigger={
                            <Button size="sm">
                                <Plus className="mr-1.5 h-4 w-4" />
                                Add file
                            </Button>
                        }
                    />
                )}
            </div>

            <DataTable<CaseFile, FilesTabFilters>
                paginator={paginator}
                filters={filters}
                columns={columns}
                routeName="gbv-cases.show"
                rowKey={(f) => f.id}
                searchPlaceholder="Search by title, name, type, or reference…"
                emptyIcon={FolderClosed}
                emptyTitle="No case files"
                emptyDescription="Upload the PRC form, P3 form, OB record, or other case documents to get started."
                emptyAction={
                    canUpload ? (
                        <AddFileDialog
                            caseId={caseId}
                            referralId={uploadReferralId ?? undefined}
                            trigger={
                                <Button size="sm">
                                    <Plus className="mr-1.5 h-4 w-4" />
                                    Upload first file
                                </Button>
                            }
                        />
                    ) : undefined
                }
                defaultSort="created_at"
                defaultDir="desc"
                showFilters
                onChange={handleFilterChange}
                onPageChange={setPage}
            />

            <Dialog
                open={pendingDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) setPendingDelete(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete file?</DialogTitle>
                        <DialogDescription>
                            {pendingDelete
                                ? `"${pendingDelete.title}" will be permanently deleted. This cannot be undone.`
                                : ""}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setPendingDelete(null)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting…" : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
