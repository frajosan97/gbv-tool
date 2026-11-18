import { Head } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Search,
    FileText,
    FileSpreadsheet,
    FileImage,
    File as FileIcon,
    Download,
    ExternalLink,
    FolderOpen,
    X,
    LoaderCircle,
    LayoutGrid,
    List,
    RefreshCw,
} from "lucide-react";
import GuestLayout from "@/layouts/guest-layout";

type ResourceType = "pdf" | "doc" | "sheet" | "image" | "other";

type Resource = {
    id: string | number;
    title: string;
    description?: string | null;
    category: string;
    type: ResourceType;
    url: string;
    updatedAt?: string | null;
    size?: string | null;
};

type ResourcesResponse = {
    data?: Resource[];
};

const RESOURCE_ENDPOINT = "/api/resources";

const CARD_BASE =
    "rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md";

function getFileIcon(type: ResourceType) {
    switch (type) {
        case "pdf":
            return (
                <FileText className="h-6 w-6 text-red-500 dark:text-red-400" />
            );
        case "doc":
            return (
                <FileText className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            );
        case "sheet":
            return (
                <FileSpreadsheet className="h-6 w-6 text-green-600 dark:text-green-400" />
            );
        case "image":
            return (
                <FileImage className="h-6 w-6 text-purple-500 dark:text-purple-400" />
            );
        default:
            return <FileIcon className="h-6 w-6 text-muted-foreground" />;
    }
}

function formatDate(value?: string | null) {
    if (!value) return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
          });
}

export default function Resources() {
    const [resources, setResources] = useState<Resource[]>([]);
    const [search, setSearch] = useState("");
    const [preview, setPreview] = useState<Resource | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const loadResources = useCallback(async (signal?: AbortSignal) => {
        setRefreshing(true);
        setError(null);

        try {
            const response = await fetch(RESOURCE_ENDPOINT, {
                method: "GET",
                headers: { Accept: "application/json" },
                credentials: "same-origin",
                signal,
            });

            if (!response.ok) {
                throw new Error(
                    `Unable to load resources (HTTP ${response.status}).`,
                );
            }

            const payload = (await response.json()) as ResourcesResponse;

            if (!payload || !Array.isArray(payload.data)) {
                throw new Error(
                    "The resources endpoint returned an invalid response. Expected { data: [...] }.",
                );
            }

            // Always display actual files returned by the Laravel API.
            setResources(payload.data);
        } catch (err) {
            if (err instanceof DOMException && err.name === "AbortError") {
                return;
            }

            setError(
                err instanceof Error
                    ? err.message
                    : "An unexpected error occurred while loading resources.",
            );
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();

        loadResources(controller.signal);

        return () => controller.abort();
    }, [loadResources]);

    useEffect(() => {
        if (!preview) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setPreview(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [preview]);

    const filteredResources = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) return resources;

        return resources.filter((resource) => {
            return (
                resource.title.toLowerCase().includes(term) ||
                (resource.description ?? "").toLowerCase().includes(term) ||
                (resource.category ?? "").toLowerCase().includes(term) ||
                resource.type.toLowerCase().includes(term)
            );
        });
    }, [resources, search]);

    return (
        <GuestLayout>
            <Head title="Resources" />

            <main className="min-h-screen bg-background text-foreground transition-colors">
                {/* ============ HERO ============ */}
                <section className="relative isolate overflow-hidden border-b border-border bg-gradient-to-br from-emerald-50 via-green-50 to-background px-6 py-8 dark:from-emerald-950/60 dark:via-green-950/40 dark:to-background sm:py-10">
                    {/* Topographic pattern */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 -z-10 text-emerald-700/[0.09] dark:text-emerald-300/[0.10]"
                        style={{
                            backgroundImage: `
                repeating-radial-gradient(
                    ellipse at 15% 20%,
                    transparent 0,
                    transparent 24px,
                    currentColor 25px,
                    transparent 26px,
                    transparent 48px
                ),
                repeating-radial-gradient(
                    ellipse at 85% 80%,
                    transparent 0,
                    transparent 30px,
                    currentColor 31px,
                    transparent 32px,
                    transparent 60px
                )
            `,
                        }}
                    />

                    {/* Soft decorative colour accents */}
                    <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-green-400/15 blur-3xl dark:bg-green-400/10" />
                    <div className="pointer-events-none absolute -bottom-28 -left-20 -z-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />

                    <div className="mx-auto max-w-6xl text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-green-600/20 bg-green-600/10 text-green-700 shadow-sm dark:border-green-400/20 dark:bg-green-400/10 dark:text-green-400">
                            <FolderOpen className="h-6 w-6" />
                        </div>

                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-green-700 dark:text-green-400">
                            Knowledge Centre
                        </p>

                        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            Resources{" "}
                            <span className="bg-gradient-to-r from-green-700 via-emerald-600 to-green-500 bg-clip-text text-transparent dark:from-green-400 dark:via-emerald-300 dark:to-green-500">
                                &amp; Documents
                            </span>
                        </h1>

                        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                            Explore and download documents, reports, guides and
                            other resources stored in our library.
                        </p>

                        <div className="mx-auto mt-6 max-w-xl">
                            <div className="flex items-center rounded-xl border border-green-700/15 bg-card/95 px-4 py-2 shadow-lg shadow-green-900/5 backdrop-blur-sm transition focus-within:border-green-600/50 focus-within:ring-2 focus-within:ring-green-600/10 dark:border-green-400/15">
                                <Search className="h-5 w-5 shrink-0 text-green-700 dark:text-green-400" />

                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search documents..."
                                    aria-label="Search documents"
                                    className="w-full border-0 bg-transparent px-3 py-2 text-foreground outline-none ring-0 placeholder:text-muted-foreground focus:ring-0"
                                />

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch("")}
                                        className="text-muted-foreground transition hover:text-foreground"
                                        aria-label="Clear search"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============ DOCUMENT LIBRARY ============ */}
                <section className="bg-secondary/30 py-12 transition-colors">
                    <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
                        {/* Section header */}
                        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                                    <FolderOpen className="h-4 w-4" />
                                    Resource Collection
                                </div>

                                <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                                    Document Library
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {loading
                                        ? "Loading files..."
                                        : `${filteredResources.length} resources available`}
                                </p>
                            </div>

                            {/* View controls and refresh */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center rounded-lg border border-border bg-card p-1 shadow-sm">
                                    <button
                                        type="button"
                                        onClick={() => setViewMode("grid")}
                                        aria-label="Grid view"
                                        aria-pressed={viewMode === "grid"}
                                        className={`rounded-md p-2 transition ${
                                            viewMode === "grid"
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                        }`}
                                    >
                                        <LayoutGrid className="h-5 w-5" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setViewMode("list")}
                                        aria-label="List view"
                                        aria-pressed={viewMode === "list"}
                                        className={`rounded-md p-2 transition ${
                                            viewMode === "list"
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                        }`}
                                    >
                                        <List className="h-5 w-5" />
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => loadResources()}
                                    disabled={refreshing}
                                    aria-label="Refresh resources"
                                    title="Refresh resources"
                                    className="rounded-lg border border-border bg-card p-2.5 text-muted-foreground shadow-sm transition hover:border-primary/30 hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <RefreshCw
                                        className={`h-5 w-5 ${
                                            refreshing ? "animate-spin" : ""
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Loading */}
                        {loading ? (
                            <div className="flex items-center justify-center gap-3 rounded-xl border border-border bg-card py-20 text-muted-foreground shadow-sm">
                                <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
                                Loading files from storage...
                            </div>
                        ) : error ? (
                            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-12 text-center">
                                <FolderOpen className="mx-auto h-10 w-10 text-destructive" />

                                <h3 className="mt-4 text-lg font-bold text-foreground">
                                    Could not load resources
                                </h3>

                                <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
                                    {error}
                                </p>

                                <button
                                    type="button"
                                    onClick={() => loadResources()}
                                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Try again
                                </button>
                            </div>
                        ) : filteredResources.length > 0 ? (
                            viewMode === "grid" ? (
                                /* ============ GRID VIEW ============ */
                                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {filteredResources.map((resource) => (
                                        <article
                                            key={resource.id}
                                            className="group flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
                                        >
                                            <div className="mb-5 flex items-start justify-between gap-3">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
                                                    {getFileIcon(resource.type)}
                                                </div>

                                                <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
                                                    {resource.category ||
                                                        "Uncategorized"}
                                                </span>
                                            </div>

                                            <h3 className="break-words text-base font-bold text-foreground">
                                                {resource.title}
                                            </h3>

                                            <p className="mt-2 min-h-12 break-words text-sm leading-6 text-muted-foreground">
                                                {resource.description ||
                                                    "No description available."}
                                            </p>

                                            {(resource.updatedAt ||
                                                resource.size) && (
                                                <p className="mt-3 text-xs text-muted-foreground">
                                                    {[
                                                        resource.size,
                                                        formatDate(
                                                            resource.updatedAt,
                                                        ),
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" · ")}
                                                </p>
                                            )}

                                            <div className="mt-auto flex gap-2 border-t border-border pt-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPreview(resource)
                                                    }
                                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary/10 px-3 py-2.5 text-xs font-bold text-primary transition hover:bg-primary/20"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                    Preview
                                                </button>

                                                <a
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-secondary px-3 py-2.5 text-xs font-bold text-foreground transition hover:bg-accent"
                                                >
                                                    <Download className="h-4 w-4" />
                                                    Open
                                                </a>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                /* ============ LIST VIEW ============ */
                                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                                    {filteredResources.map(
                                        (resource, index) => (
                                            <article
                                                key={resource.id}
                                                className={`flex flex-col gap-4 p-5 transition-colors hover:bg-accent/40 sm:flex-row sm:items-center sm:justify-between ${
                                                    index !==
                                                    filteredResources.length - 1
                                                        ? "border-b border-border"
                                                        : ""
                                                }`}
                                            >
                                                <div className="flex min-w-0 items-center gap-4">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
                                                        {getFileIcon(
                                                            resource.type,
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <h3 className="break-words font-bold text-foreground">
                                                            {resource.title}
                                                        </h3>

                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            {resource.description ||
                                                                "No description available."}
                                                        </p>

                                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                            <span className="rounded-full bg-primary/10 px-2.5 py-1 font-bold text-primary">
                                                                {resource.category ||
                                                                    "Uncategorized"}
                                                            </span>

                                                            {resource.size && (
                                                                <span>
                                                                    {
                                                                        resource.size
                                                                    }
                                                                </span>
                                                            )}

                                                            {resource.updatedAt && (
                                                                <span>
                                                                    {formatDate(
                                                                        resource.updatedAt,
                                                                    )}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex shrink-0 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setPreview(resource)
                                                        }
                                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary transition hover:bg-primary/20"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                        Preview
                                                    </button>

                                                    <a
                                                        href={resource.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-bold text-foreground transition hover:bg-accent"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                        Open
                                                    </a>
                                                </div>
                                            </article>
                                        ),
                                    )}
                                </div>
                            )
                        ) : (
                            /* ============ EMPTY STATE ============ */
                            <div className="rounded-xl border border-dashed border-border bg-card py-20 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                                    <FolderOpen className="h-8 w-8 text-muted-foreground" />
                                </div>

                                <h3 className="mt-4 text-lg font-bold text-foreground">
                                    No files found
                                </h3>

                                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                                    {resources.length === 0
                                        ? "The resources directory is empty or contains no files exposed by the server."
                                        : "Try another search term."}
                                </p>

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch("")}
                                        className="mt-4 text-sm font-bold text-primary hover:underline"
                                    >
                                        Clear search
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </section>

                {/* ============ PREVIEW MODAL ============ */}
                {preview && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                        onClick={() => setPreview(null)}
                        role="presentation"
                    >
                        <div
                            className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
                            onClick={(event) => event.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                            aria-label={`Preview ${preview.title}`}
                        >
                            <div className="flex items-center justify-between border-b border-border p-5">
                                <div>
                                    <h3 className="font-bold text-foreground">
                                        {preview.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        {preview.category}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setPreview(null)}
                                    className="rounded-lg p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
                                    aria-label="Close preview"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="h-[70vh] bg-secondary">
                                {preview.type === "pdf" ? (
                                    <iframe
                                        src={preview.url}
                                        title={preview.title}
                                        className="h-full w-full"
                                    />
                                ) : preview.type === "image" ? (
                                    <div className="flex h-full items-center justify-center overflow-auto p-4">
                                        <img
                                            src={preview.url}
                                            alt={preview.title}
                                            className="max-h-full max-w-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                                        {getFileIcon(preview.type)}

                                        <h4 className="mt-4 font-bold text-foreground">
                                            {preview.title}
                                        </h4>

                                        <p className="mt-2 text-sm text-muted-foreground">
                                            Preview is not available for this
                                            file type. Open or download it to
                                            view its contents.
                                        </p>

                                        <a
                                            href={preview.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-5 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
                                        >
                                            Open Document
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </GuestLayout>
    );
}
