import { Heart, Hash } from "lucide-react";

import {
    ActiveCell,
    LookupIndexPage,
    type LookupFilters,
    type LookupPaginator,
    type LookupRecord,
} from "@/components/lookup-index-page";

type RelationshipOption = LookupRecord;
type Props = {
    records: LookupPaginator<RelationshipOption>;
    filters: LookupFilters;
};

const BASE_URL = "/system-settings/relationship-options";

const config = {
    title: "Relationship Options",
    singular: "relationship option",
    plural: "relationship options",
    icon: Heart,
    route: "system-settings.relationship-options.index",
    baseUrl: BASE_URL,
    defaultSort: "sort_order",
    columns: [
        {
            key: "name",
            label: "Name",
            icon: Heart,
            sortable: true,
            headerClassName: "w-[40%]",
            cell: (r: RelationshipOption) => (
                <span className="font-medium">{r.name}</span>
            ),
        },
        {
            key: "slug",
            label: "Slug",
            icon: Hash,
            sortable: true,
            headerClassName: "w-[30%]",
            cell: (r: RelationshipOption) => (
                <span className="font-mono text-sm text-muted-foreground">
                    {r.slug}
                </span>
            ),
        },
        {
            key: "is_active",
            label: "Active",
            sortable: true,
            headerClassName: "w-[15%]",
            cell: (r: RelationshipOption) => (
                <ActiveCell active={r.is_active} />
            ),
        },
    ],
    fields: [
        { name: "name", label: "Name", type: "text" as const, required: true },
        { name: "slug", label: "Slug", type: "text" as const, required: true },
        { name: "is_active", label: "Active", type: "boolean" as const },
        { name: "sort_order", label: "Sort Order", type: "number" as const },
    ],
    emptyForm: {
        name: "",
        slug: "",
        is_active: true,
        sort_order: "0",
    },
    formFromRecord: (r: RelationshipOption) => ({
        name: r.name,
        slug: r.slug,
        is_active: r.is_active,
        sort_order: String(r.sort_order),
    }),
};

export default function RelationshipOptionsIndex({ records, filters }: Props) {
    return (
        <LookupIndexPage
            records={records}
            filters={filters}
            config={config as never}
        />
    );
}

RelationshipOptionsIndex.layout = {
    breadcrumbs: [{ title: "Relationship Options", href: BASE_URL }],
};
