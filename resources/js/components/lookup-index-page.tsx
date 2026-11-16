import { Head, router, useForm } from "@inertiajs/react";
import {
    useCallback,
    useMemo,
    useState,
    type FormEvent,
    type ReactNode,
} from "react";
import { Pencil, Plus, RefreshCw, Trash2, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import CustomReactSelect from "@/components/custom-react-select";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";

import type { Column } from "@/types";

/* ===================================================================== */
/* Public types                                                          */
/* ===================================================================== */

export type SortDirection = "asc" | "desc";

/**
 * Shape shared by every lookup record. Deliberately has **no index
 * signature** — an index signature here would widen `name`, `slug`, etc.
 * to `unknown` inside the generic `LookupIndexPage<T>`, which causes the
 * `Type 'unknown' is not assignable to type 'ReactNode'` error.
 *
 * Each page extends this with its own concrete fields:
 *
 *     type County     = LookupRecord & { code: string };
 *     type IncidentType = LookupRecord & { category: string };
 */
export type LookupRecord = {
    id: number;
    slug: string;
    name: string;
    icon?: string | null;
    color?: string | null;
    description?: string | null;
    is_active: boolean;
    sort_order: number;
    created_at?: string | null;
    updated_at?: string | null;
};

export type LookupFilters = {
    search: string;
    sort: string;
    dir: SortDirection;
};

export type LookupPaginator<T extends LookupRecord> = {
    data: T[];
    current_page: number;
    first_page_url: string | null;
    from: number | null;
    last_page: number;
    last_page_url: string | null;
    links: Array<{ url: string | null; label: string; active: boolean }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
};

type FieldBase = {
    name: string;
    label: string;
    required?: boolean;
    placeholder?: string;
    help?: string;
    /** Force the field to take a full row in the 2-column grid. */
    fullWidth?: boolean;
};

export type LookupField =
    | (FieldBase & {
          type: "text" | "number" | "color" | "textarea";
      })
    | (FieldBase & {
          type: "boolean";
      })
    | (FieldBase & {
          type: "select";
          options: Array<{ value: string; label: string }>;
      });

export type LookupFormData = Record<string, string | boolean | number>;

export type LookupIndexConfig<T extends LookupRecord> = {
    title: string;
    headTitle?: string;
    singular: string;
    plural: string;
    icon: LucideIcon;
    route: string;
    baseUrl: string;
    searchPlaceholder?: string;
    defaultSort?: string;
    defaultDir?: SortDirection;
    columns: Column<T>[];
    fields: LookupField[];
    emptyForm: LookupFormData;
    formFromRecord: (record: T) => LookupFormData;
    deleteWarning?: string;
};

type LookupIndexPageProps<T extends LookupRecord> = {
    records: LookupPaginator<T>;
    filters: LookupFilters;
    config: LookupIndexConfig<T>;
};

/* ===================================================================== */
/* Component                                                             */
/* ===================================================================== */

export function LookupIndexPage<T extends LookupRecord>({
    records,
    filters,
    config,
}: LookupIndexPageProps<T>) {
    const {
        title,
        headTitle,
        singular,
        plural,
        icon: Icon,
        route,
        baseUrl,
        searchPlaceholder = `Search ${plural}...`,
        defaultSort = "sort_order",
        defaultDir = "asc",
        columns,
        fields,
        emptyForm,
        formFromRecord,
        deleteWarning,
    } = config;

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<T | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
    const [deleting, setDeleting] = useState(false);

    const { data, setData, errors, processing, reset, clearErrors, put, post } =
        useForm<LookupFormData>(emptyForm);

    const isEditing = editing !== null;

    /* ---------- Dialog handlers ---------- */

    const openCreateDialog = useCallback(() => {
        setEditing(null);
        reset();
        clearErrors();
        setDialogOpen(true);
    }, [reset, clearErrors]);

    const openEditDialog = useCallback(
        (record: T) => {
            setEditing(record);
            setData(formFromRecord(record));
            clearErrors();
            setDialogOpen(true);
        },
        [setData, clearErrors, formFromRecord],
    );

    const closeDialog = useCallback(
        (open: boolean) => {
            if (processing) return;
            setDialogOpen(open);
            if (!open) {
                setEditing(null);
                reset();
                clearErrors();
            }
        },
        [processing, reset, clearErrors],
    );

    /* ---------- Submit ---------- */

    const handleSubmit = useCallback(
        (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            const options = {
                preserveScroll: true,
                onSuccess: () => {
                    setDialogOpen(false);
                    setEditing(null);
                    reset();
                    clearErrors();
                },
            };

            if (editing) {
                put(`${baseUrl}/${editing.id}`, options);
            } else {
                post(baseUrl, options);
            }
        },
        [editing, put, post, reset, clearErrors, baseUrl],
    );

    /* ---------- Delete ---------- */

    const requestDelete = useCallback((record: T) => {
        setDeleteTarget(record);
    }, []);

    const confirmDelete = useCallback(() => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(`${baseUrl}/${deleteTarget.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setDeleting(false);
                setDeleteTarget(null);
            },
        });
    }, [deleteTarget, baseUrl]);

    const cancelDelete = useCallback(() => {
        if (deleting) return;
        setDeleteTarget(null);
    }, [deleting]);

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        router.reload({ onFinish: () => setIsRefreshing(false) });
    }, []);

    /* ---------- Row actions ---------- */

    const rowKey = useCallback((r: T) => r.id, []);

    const rowActions = useCallback(
        (record: T) => (
            <>
                <Button
                    variant="ghost"
                    size="icon"
                    title={`Edit ${singular}`}
                    aria-label={`Edit ${record.name}`}
                    onClick={() => openEditDialog(record)}
                >
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    title={`Delete ${singular}`}
                    aria-label={`Delete ${record.name}`}
                    onClick={() => requestDelete(record)}
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-900/20"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </>
        ),
        [openEditDialog, requestDelete, singular],
    );

    /* ---------- Field rendering ---------- */

    const renderField = useCallback(
        (field: LookupField): ReactNode => {
            const value = data[field.name];
            const error = errors[field.name] as string | undefined;

            const wrapperClass = field.fullWidth
                ? "space-y-2 sm:col-span-2"
                : "space-y-2";

            const labelNode = (
                <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && (
                        <span className="text-destructive"> *</span>
                    )}
                </Label>
            );

            const errorNode = error ? (
                <p className="text-sm text-destructive">{error}</p>
            ) : null;

            const helpNode = field.help ? (
                <p className="text-xs text-muted-foreground">{field.help}</p>
            ) : null;

            switch (field.type) {
                case "boolean":
                    return (
                        <div
                            key={field.name}
                            className="flex items-start gap-3 sm:col-span-2"
                        >
                            <Switch
                                id={field.name}
                                checked={Boolean(value)}
                                onCheckedChange={(v) => setData(field.name, v)}
                                disabled={processing}
                                className="mt-0.5"
                            />
                            <div className="space-y-1">
                                <Label
                                    htmlFor={field.name}
                                    className="cursor-pointer"
                                >
                                    {field.label}
                                </Label>
                                {helpNode}
                            </div>
                        </div>
                    );

                case "select":
                    return (
                        <div key={field.name} className={wrapperClass}>
                            {labelNode}
                            <CustomReactSelect
                                id={field.name}
                                value={String(value ?? "")}
                                onChange={(v) => setData(field.name, v)}
                                options={field.options}
                                placeholder={
                                    field.placeholder ??
                                    `Select ${field.label.toLowerCase()}`
                                }
                                isDisabled={processing}
                                isClearable={!field.required}
                            />
                            {errorNode}
                            {helpNode}
                        </div>
                    );

                case "textarea":
                    return (
                        <div
                            key={field.name}
                            className="space-y-2 sm:col-span-2"
                        >
                            {labelNode}
                            <Textarea
                                id={field.name}
                                value={String(value ?? "")}
                                onChange={(e) =>
                                    setData(field.name, e.target.value)
                                }
                                disabled={processing}
                                aria-invalid={!!error}
                                rows={3}
                                placeholder={
                                    field.placeholder ??
                                    `Enter ${field.label.toLowerCase()}`
                                }
                            />
                            {errorNode}
                            {helpNode}
                        </div>
                    );

                case "color":
                    return (
                        <div key={field.name} className={wrapperClass}>
                            {labelNode}
                            <div className="flex items-center gap-2">
                                <span
                                    className="inline-block h-9 w-9 shrink-0 rounded border border-border"
                                    style={{
                                        backgroundColor:
                                            String(value) || "#ffffff",
                                    }}
                                />
                                <Input
                                    id={field.name}
                                    type="text"
                                    value={String(value ?? "")}
                                    onChange={(e) =>
                                        setData(field.name, e.target.value)
                                    }
                                    disabled={processing}
                                    aria-invalid={!!error}
                                    placeholder={field.placeholder ?? "#000000"}
                                    className="font-mono"
                                />
                            </div>
                            {errorNode}
                            {helpNode}
                        </div>
                    );

                case "number":
                    return (
                        <div key={field.name} className={wrapperClass}>
                            {labelNode}
                            <Input
                                id={field.name}
                                type="number"
                                value={String(value ?? "")}
                                onChange={(e) =>
                                    setData(field.name, e.target.value)
                                }
                                disabled={processing}
                                aria-invalid={!!error}
                                placeholder={field.placeholder ?? "0"}
                            />
                            {errorNode}
                            {helpNode}
                        </div>
                    );

                default:
                    return (
                        <div key={field.name} className={wrapperClass}>
                            {labelNode}
                            <Input
                                id={field.name}
                                type="text"
                                value={String(value ?? "")}
                                onChange={(e) =>
                                    setData(field.name, e.target.value)
                                }
                                disabled={processing}
                                aria-invalid={!!error}
                                placeholder={
                                    field.placeholder ??
                                    `Enter ${field.label.toLowerCase()}`
                                }
                            />
                            {errorNode}
                            {helpNode}
                        </div>
                    );
            }
        },
        [data, errors, processing, setData],
    );

    /* ---------- Render ---------- */

    const addLabel = useMemo(
        () => `Add ${singular.charAt(0).toUpperCase()}${singular.slice(1)}`,
        [singular],
    );

    return (
        <>
            <Head title={headTitle ?? title} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title={title}
                    icon={
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Icon className="h-5 w-5" />
                        </div>
                    }
                    meta={
                        <span>
                            {records.total}{" "}
                            {records.total === 1 ? singular : plural} configured
                        </span>
                    }
                    onRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                    actions={
                        <Button size="sm" onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            {addLabel}
                        </Button>
                    }
                />

                <DataTable<T, LookupFilters>
                    paginator={records}
                    filters={filters}
                    columns={columns}
                    routeName={route}
                    rowKey={rowKey}
                    searchPlaceholder={searchPlaceholder}
                    actions={rowActions}
                    emptyIcon={Icon}
                    emptyTitle={`No ${plural} found`}
                    emptyDescription={`Add your first ${singular} to get started.`}
                    defaultSort={defaultSort}
                    defaultDir={defaultDir}
                />
            </div>

            {/* ---------- Create / Edit Dialog ---------- */}

            <Dialog open={dialogOpen} onOpenChange={closeDialog}>
                <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-2xl">
                    <DialogHeader className="border-b px-6 py-4">
                        <DialogTitle>
                            {isEditing
                                ? `Edit ${singular}`
                                : `Create ${singular}`}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? `Update this ${singular}.`
                                : `Add a new ${singular}.`}
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleSubmit}
                        className="flex min-h-0 flex-1 flex-col"
                    >
                        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
                            {fields.map((f) => renderField(f))}
                        </div>

                        <DialogFooter className="border-t px-6 py-4">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={processing}
                                onClick={() => closeDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing && (
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {processing
                                    ? "Saving..."
                                    : isEditing
                                      ? "Update"
                                      : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ---------- Delete Confirmation ---------- */}

            <AlertDialog
                open={deleteTarget !== null}
                onOpenChange={(open) => {
                    if (!open) cancelDelete();
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {singular}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-foreground">
                                {deleteTarget?.name}
                            </span>
                            ? This action cannot be undone.
                            {deleteWarning && (
                                <>
                                    <br />
                                    {deleteWarning}
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            disabled={deleting}
                            onClick={cancelDelete}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={deleting}
                            onClick={(e) => {
                                e.preventDefault();
                                confirmDelete();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

/* ===================================================================== */
/* Small helpers                                                         */
/* ===================================================================== */

export function ColorSwatch({ color }: { color: string | null | undefined }) {
    if (!color) return <span className="text-sm text-muted-foreground">—</span>;
    return (
        <div className="flex items-center gap-2">
            <span
                className="inline-block h-4 w-4 rounded border border-border"
                style={{ backgroundColor: color }}
            />
            <span className="font-mono text-xs text-muted-foreground">
                {color}
            </span>
        </div>
    );
}

export function ActiveCell({ active }: { active: boolean }) {
    return (
        <span
            className={
                active
                    ? "text-sm font-medium text-emerald-600"
                    : "text-sm text-muted-foreground"
            }
        >
            {active ? "Yes" : "No"}
        </span>
    );
}
