// resources/js/lib/local-paginator.ts
import type { Paginator } from "@/types";

/**
 * Build a Laravel-shaped paginator object from an in-memory array.
 *
 * The returned object is structurally identical to what Laravel's
 * `LengthAwarePaginator` serializes to, so `DataTable` accepts it
 * without any changes. `data` is sliced to the current page; the
 * `links` array is placeholder (`url: "#"`) because navigation is
 * handled client-side by the caller.
 */
export function buildLocalPaginator<T>(
    items: T[],
    page: number,
    perPage: number,
): Paginator<T> {
    const total = items.length;
    const safePerPage = Math.max(1, perPage);
    const lastPage = Math.max(1, Math.ceil(total / safePerPage));
    const currentPage = Math.min(Math.max(1, page), lastPage);
    const from = (currentPage - 1) * safePerPage;
    const to = Math.min(from + safePerPage, total);
    const slice = items.slice(from, to);

    // Laravel-style links array: previous, 1..n, next.
    // All `url`s are "#" since navigation is handled by the caller.
    const links: Array<{ url: string; label: string; active: boolean }> = [
        { url: "#", label: "&laquo; Previous", active: false },
        ...Array.from({ length: lastPage }, (_, i) => ({
            url: "#",
            label: String(i + 1),
            active: i + 1 === currentPage,
        })),
        { url: "#", label: "Next &raquo;", active: false },
    ];

    return {
        data: slice,
        total,
        current_page: currentPage,
        last_page: lastPage,
        per_page: safePerPage,
        from: total === 0 ? null : from + 1,
        to: total === 0 ? null : to,
        links,
        // If your `Paginator` type declares additional optional fields
        // (e.g. `first_page_url`, `path`), you can omit them — the
        // `DataTable` component only reads `data`, `total`,
        // `current_page`, `last_page`, `per_page`, `from`, `to`, and
        // `links`. If TS complains about missing required fields,
        // add placeholders (e.g. `path: "#"`, `first_page_url: "#"`).
    } as Paginator<T>;
}