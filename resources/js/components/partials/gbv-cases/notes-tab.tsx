// components/case-notes-tab.tsx

import { router } from "@inertiajs/react";
import {
    AlertTriangle,
    FileUp,
    Filter,
    Lock,
    MessageSquarePlus,
    Pencil,
    Star,
    StickyNote,
    Trash2,
    UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { CaseNoteDialog } from "@/components/modals/case-note-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/data-table";
import { formatDate } from "@/lib/formatters";
import { buildLocalPaginator } from "@/lib/local-paginator";
import { useAppData } from "@/hooks/use-app-data";
import type { CaseNote } from "@/types/gbv-cases";
import type { Column, DataTableFilters, GbvCaseShowProps } from "@/types";

interface Props {
    caseId: number;
    notes: CaseNote[];
    can: GbvCaseShowProps["can"];
}

const TYPE_COLORS: Record<string, string> = {
    gray: "bg-gray-600",
    blue: "bg-blue-600",
    rose: "bg-rose-600",
    amber: "bg-amber-600",
    violet: "bg-violet-600",
    emerald: "bg-emerald-600",
};

export function CaseNotesTab({ caseId, notes, can }: Props) {
    const { noteTypes } = useAppData();

    /* -------- Filters & pagination -------- */
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [importantOnly, setImportantOnly] = useState(false);
    const [privateOnly, setPrivateOnly] = useState(false);
    const [sort, setSort] = useState("created_at");
    const [dir, setDir] = useState<"asc" | "desc">("desc");
    const [perPage, setPerPage] = useState(10);
    const [page, setPage] = useState(1);

    /* -------- Delete state -------- */
    const [pendingDelete, setPendingDelete] = useState<CaseNote | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const isDeleting = deletingId !== null;

    const filtered = useMemo(() => {
        let result = notes;
        const term = search.trim().toLowerCase();

        if (term) {
            result = result.filter(
                (n) =>
                    n.content.toLowerCase().includes(term) ||
                    (n.author ?? "").toLowerCase().includes(term) ||
                    (n.note_type?.name ?? "").toLowerCase().includes(term),
            );
        }
        if (typeFilter !== "all") {
            result = result.filter((n) =>
                typeFilter === "__none__"
                    ? n.note_type_id === null
                    : n.note_type?.slug === typeFilter,
            );
        }
        if (importantOnly) {
            result = result.filter((n) => n.is_important);
        }
        if (privateOnly) {
            result = result.filter((n) => n.is_private);
        }

        const key = sort as keyof CaseNote;
        const sorted = [...result].sort((a, b) => {
            const av = a[key];
            const bv = b[key];
            if (typeof av === "number" && typeof bv === "number")
                return av - bv;
            return String(av ?? "").localeCompare(String(bv ?? ""));
        });
        return dir === "desc" ? sorted.reverse() : sorted;
    }, [notes, search, typeFilter, importantOnly, privateOnly, sort, dir]);

    const lastPage = Math.max(
        1,
        Math.ceil(filtered.length / Math.max(1, perPage)),
    );
    useEffect(() => {
        if (page > lastPage) setPage(lastPage);
    }, [page, lastPage]);

    const paginator = useMemo(
        () => buildLocalPaginator(filtered, page, perPage),
        [filtered, page, perPage],
    );

    const handleFilterChange = useCallback(
        (patch: Partial<DataTableFilters> & Record<string, unknown>) => {
            const n = patch as Partial<{
                search: string;
                sort: string;
                dir: "asc" | "desc";
                per_page: number;
            }>;

            if (n.search !== undefined) {
                setSearch(n.search);
                setPage(1);
            }
            if (n.sort !== undefined) {
                setSort(n.sort);
                setPage(1);
            }
            if (n.dir !== undefined) {
                setDir(n.dir);
                setPage(1);
            }
            if (n.per_page !== undefined) {
                setPerPage(n.per_page);
                setPage(1);
            }
        },
        [],
    );

    /* -------- Delete flow -------- */
    const requestDelete = useCallback((n: CaseNote) => {
        setPendingDelete(n);
    }, []);

    const confirmDelete = useCallback(() => {
        const n = pendingDelete;
        if (!n) return;

        setDeletingId(n.id);
        router.delete(
            route("gbv-cases.notes.destroy", { gbvCase: caseId, note: n.id }),
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    toast.success("Note deleted");
                    setPendingDelete(null);
                },
                onError: () => toast.error("Could not delete note."),
                onFinish: () => setDeletingId(null),
            },
        );
    }, [pendingDelete, caseId]);

    /* -------- Columns -------- */
    const columns: Column<CaseNote>[] = [
        {
            key: "content",
            label: "Note",
            icon: StickyNote,
            headerClassName: "w-[50%]",
            cell: (n) => (
                <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                        {n.note_type && (
                            <Badge
                                className={`rounded-full border-none px-2 py-0.5 text-[10px] font-semibold text-white hover:opacity-90 ${
                                    TYPE_COLORS[n.note_type.color ?? "gray"] ??
                                    "bg-gray-600"
                                }`}
                            >
                                {n.note_type.name}
                            </Badge>
                        )}
                        {n.is_important && (
                            <Badge className="rounded-full border-none bg-amber-500 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-amber-500/90">
                                <Star className="mr-1 h-2.5 w-2.5" /> Important
                            </Badge>
                        )}
                        {n.is_private && (
                            <Badge className="rounded-full border-none bg-violet-600 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-violet-600/90">
                                <Lock className="mr-1 h-2.5 w-2.5" /> Private
                            </Badge>
                        )}
                        {n.attachments && n.attachments.length > 0 && (
                            <Badge
                                variant="outline"
                                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                            >
                                <FileUp className="mr-1 h-2.5 w-2.5" />
                                {n.attachments.length}
                            </Badge>
                        )}
                    </div>
                    <p className="line-clamp-3 whitespace-pre-wrap text-sm">
                        {n.content}
                    </p>
                </div>
            ),
        },
        {
            key: "author",
            label: "Author",
            headerClassName: "w-[18%]",
            cell: (n) => (
                <span className="inline-flex items-center gap-1 text-sm">
                    <UserRound className="h-3 w-3 text-muted-foreground" />
                    {n.author ?? "—"}
                </span>
            ),
        },
        {
            key: "created_at",
            label: "Created",
            sortable: true,
            headerClassName: "w-[20%] text-right",
            className: "text-right",
            cell: (n) => (
                <span className="text-muted-foreground">
                    {n.created_at ? formatDate(n.created_at) : "—"}
                </span>
            ),
        },
        {
            key: "actions",
            label: "",
            headerClassName: "w-[12%] text-right",
            className: "text-right",
            cell: (n) => {
                const canEdit = n.created_by === undefined || can.update;
                return (
                    <div className="flex items-center justify-end gap-1">
                        {can.createNote && (
                            <CaseNoteDialog
                                caseId={caseId}
                                note={n}
                                trigger={
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        title="Edit"
                                        aria-label="Edit note"
                                        disabled={!canEdit}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                }
                            />
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-600 hover:text-rose-700"
                            title="Delete"
                            aria-label="Delete note"
                            onClick={() => requestDelete(n)}
                            disabled={isDeleting && deletingId === n.id}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    /* -------- Toolbar helpers -------- */
    const totalFilters =
        (typeFilter !== "all" ? 1 : 0) +
        (importantOnly ? 1 : 0) +
        (privateOnly ? 1 : 0);

    return (
        <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                    {notes.length} note{notes.length === 1 ? "" : "s"}
                    {filtered.length !== notes.length && (
                        <span className="ml-1 text-muted-foreground/70">
                            · showing {filtered.length}
                        </span>
                    )}
                </p>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                            >
                                <Filter className="h-3.5 w-3.5" />
                                Filters
                                {totalFilters > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="ml-1 h-4 min-w-4 rounded-full px-1 text-[10px]"
                                    >
                                        {totalFilters}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Note type</DropdownMenuLabel>
                            <DropdownMenuCheckboxItem
                                checked={typeFilter === "all"}
                                onCheckedChange={() => {
                                    setTypeFilter("all");
                                    setPage(1);
                                }}
                            >
                                All types
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={typeFilter === "__none__"}
                                onCheckedChange={() => {
                                    setTypeFilter("__none__");
                                    setPage(1);
                                }}
                            >
                                No type
                            </DropdownMenuCheckboxItem>
                            {noteTypes.map((t) => (
                                <DropdownMenuCheckboxItem
                                    key={t.id}
                                    checked={typeFilter === t.slug}
                                    onCheckedChange={() => {
                                        setTypeFilter(t.slug);
                                        setPage(1);
                                    }}
                                >
                                    {t.name}
                                </DropdownMenuCheckboxItem>
                            ))}

                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Flags</DropdownMenuLabel>
                            <DropdownMenuCheckboxItem
                                checked={importantOnly}
                                onCheckedChange={(v) => {
                                    setImportantOnly(Boolean(v));
                                    setPage(1);
                                }}
                            >
                                Important only
                            </DropdownMenuCheckboxItem>
                            {can.viewPrivateNotes && (
                                <DropdownMenuCheckboxItem
                                    checked={privateOnly}
                                    onCheckedChange={(v) => {
                                        setPrivateOnly(Boolean(v));
                                        setPage(1);
                                    }}
                                >
                                    Private only
                                </DropdownMenuCheckboxItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {can.createNote && (
                        <CaseNoteDialog
                            caseId={caseId}
                            trigger={
                                <Button size="sm">
                                    <MessageSquarePlus className="mr-1.5 h-4 w-4" />
                                    Add note
                                </Button>
                            }
                        />
                    )}
                </div>
            </div>

            <DataTable<CaseNote, DataTableFilters>
                paginator={paginator}
                filters={{ search, sort, dir, per_page: perPage }}
                columns={columns}
                routeName="gbv-cases.show"
                rowKey={(n) => n.id}
                searchPlaceholder="Search notes by content, author, or type…"
                emptyIcon={
                    totalFilters > 0 || search ? AlertTriangle : StickyNote
                }
                emptyTitle={
                    totalFilters > 0 || search
                        ? "No matching notes"
                        : "No notes"
                }
                emptyDescription={
                    totalFilters > 0 || search
                        ? "Try adjusting your filters or search term."
                        : "No notes have been added to this case yet."
                }
                emptyAction={
                    can.createNote && !search && totalFilters === 0 ? (
                        <CaseNoteDialog
                            caseId={caseId}
                            trigger={
                                <Button size="sm">
                                    <MessageSquarePlus className="mr-1.5 h-4 w-4" />
                                    Add first note
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

            {/* Inline delete confirmation */}
            <Dialog
                open={pendingDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) setPendingDelete(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete note?</DialogTitle>
                        <DialogDescription>
                            {pendingDelete
                                ? "This note will be permanently removed from the case. This cannot be undone."
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
