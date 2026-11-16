import { Hash, Users } from "lucide-react";

import {
    ActiveCell,
    LookupIndexPage,
    type LookupFilters,
    type LookupPaginator,
    type LookupRecord,
} from "@/components/lookup-index-page";

type AgeRange = LookupRecord & {
    min_age: number | null;
    max_age: number | null;
};
type Props = {
    records: LookupPaginator<AgeRange>;
    filters: LookupFilters;
};

const BASE_URL = "/system-settings/age-ranges";

const config = {
    title: "Age Ranges",
    singular: "age range",
    plural: "age ranges",
    icon: Users,
    route: "system-settings.age-ranges.index",
    baseUrl: BASE_URL,
    defaultSort: "sort_order",
    columns: [
        {
            key: "name",
            label: "Name",
            icon: Users,
            sortable: true,
            headerClassName: "w-[30%]",
            cell: (r: AgeRange) => (
                <span className="font-medium">{r.name}</span>
            ),
        },
        {
            key: "slug",
            label: "Slug",
            icon: Hash,
            sortable: true,
            headerClassName: "w-[25%]",
            cell: (r: AgeRange) => (
                <span className="font-mono text-sm text-muted-foreground">
                    {r.slug}
                </span>
            ),
        },
        {
            key: "range",
            label: "Range",
            sortable: false,
            headerClassName: "w-[20%]",
            cell: (r: AgeRange) => (
                <span className="text-sm">
                    {r.min_age ?? "?"} – {r.max_age ?? "?"}
                </span>
            ),
        },
        {
            key: "is_active",
            label: "Active",
            sortable: true,
            headerClassName: "w-[15%]",
            cell: (r: AgeRange) => <ActiveCell active={r.is_active} />,
        },
    ],
    fields: [
        { name: "name", label: "Name", type: "text" as const, required: true },
        { name: "slug", label: "Slug", type: "text" as const, required: true },
        { name: "min_age", label: "Min Age", type: "number" as const },
        { name: "max_age", label: "Max Age", type: "number" as const },
        { name: "is_active", label: "Active", type: "boolean" as const },
        { name: "sort_order", label: "Sort Order", type: "number" as const },
    ],
    emptyForm: {
        name: "",
        slug: "",
        min_age: "",
        max_age: "",
        is_active: true,
        sort_order: "0",
    },
    formFromRecord: (r: AgeRange) => ({
        name: r.name,
        slug: r.slug,
        min_age: r.min_age ?? "",
        max_age: r.max_age ?? "",
        is_active: r.is_active,
        sort_order: String(r.sort_order),
    }),
};

export default function AgeRangesIndex({ records, filters }: Props) {
    return (
        <LookupIndexPage
            records={records}
            filters={filters}
            config={config as never}
        />
    );
}

AgeRangesIndex.layout = {
    breadcrumbs: [{ title: "Age Ranges", href: BASE_URL }],
};
