import { Hash, IdCard } from "lucide-react";

import {
    ActiveCell,
    LookupIndexPage,
    type LookupFilters,
    type LookupPaginator,
    type LookupRecord,
} from "@/components/lookup-index-page";

type IdType = LookupRecord & { requires_number: boolean };
type Props = {
    records: LookupPaginator<IdType>;
    filters: LookupFilters;
};

const BASE_URL = "/system-settings/id-types";

const config = {
    title: "ID Types",
    singular: "ID type",
    plural: "ID types",
    icon: IdCard,
    route: "system-settings.id-types.index",
    baseUrl: BASE_URL,
    defaultSort: "sort_order",
    columns: [
        {
            key: "name",
            label: "Name",
            icon: IdCard,
            sortable: true,
            headerClassName: "w-[30%]",
            cell: (r: IdType) => <span className="font-medium">{r.name}</span>,
        },
        {
            key: "slug",
            label: "Slug",
            icon: Hash,
            sortable: true,
            headerClassName: "w-[25%]",
            cell: (r: IdType) => (
                <span className="font-mono text-sm text-muted-foreground">
                    {r.slug}
                </span>
            ),
        },
        {
            key: "requires_number",
            label: "Requires Number",
            sortable: true,
            headerClassName: "w-[20%]",
            cell: (r: IdType) => <ActiveCell active={r.requires_number} />,
        },
        {
            key: "is_active",
            label: "Active",
            sortable: true,
            headerClassName: "w-[15%]",
            cell: (r: IdType) => <ActiveCell active={r.is_active} />,
        },
    ],
    fields: [
        { name: "name", label: "Name", type: "text" as const, required: true },
        { name: "slug", label: "Slug", type: "text" as const, required: true },
        {
            name: "description",
            label: "Description",
            type: "textarea" as const,
        },
        {
            name: "requires_number",
            label: "Requires Number",
            type: "boolean" as const,
        },
        { name: "is_active", label: "Active", type: "boolean" as const },
        { name: "sort_order", label: "Sort Order", type: "number" as const },
    ],
    emptyForm: {
        name: "",
        slug: "",
        description: "",
        requires_number: true,
        is_active: true,
        sort_order: "0",
    },
    formFromRecord: (r: IdType) => ({
        name: r.name,
        slug: r.slug,
        description: r.description ?? "",
        requires_number: r.requires_number,
        is_active: r.is_active,
        sort_order: String(r.sort_order),
    }),
};

export default function IdTypesIndex({ records, filters }: Props) {
    return (
        <LookupIndexPage
            records={records}
            filters={filters}
            config={config as never}
        />
    );
}

IdTypesIndex.layout = {
    breadcrumbs: [{ title: "ID Types", href: BASE_URL }],
};
