import { Hash, Tag } from "lucide-react";

import {
    ActiveCell,
    ColorSwatch,
    LookupIndexPage,
    type LookupFilters,
    type LookupPaginator,
    type LookupRecord,
} from "@/components/lookup-index-page";

type PriorityLevel = LookupRecord;

type Props = {
    records: LookupPaginator<PriorityLevel>;
    filters: LookupFilters;
};

const BASE_URL = "/system-settings/priority-levels";

const config = {
    title: "Priority Levels",
    singular: "priority level",
    plural: "priority levels",
    icon: Tag,
    route: "system-settings.priority-levels.index",
    baseUrl: BASE_URL,
    defaultSort: "sort_order",
    columns: [
        {
            key: "name",
            label: "Name",
            icon: Tag,
            sortable: true,
            headerClassName: "w-[25%]",
            cell: (r: PriorityLevel) => (
                <span className="font-medium">{r.name}</span>
            ),
        },
        {
            key: "slug",
            label: "Slug",
            icon: Hash,
            sortable: true,
            headerClassName: "w-[20%]",
            cell: (r: PriorityLevel) => (
                <span className="font-mono text-sm text-muted-foreground">
                    {r.slug}
                </span>
            ),
        },
        {
            key: "color",
            label: "Color",
            sortable: true,
            headerClassName: "w-[20%]",
            cell: (r: PriorityLevel) => <ColorSwatch color={r.color} />,
        },
        {
            key: "is_active",
            label: "Active",
            sortable: true,
            headerClassName: "w-[10%]",
            cell: (r: PriorityLevel) => <ActiveCell active={r.is_active} />,
        },
    ],
    fields: [
        { name: "name", label: "Name", type: "text" as const, required: true },
        { name: "slug", label: "Slug", type: "text" as const, required: true },
        {
            name: "color",
            label: "Color",
            type: "color" as const,
            required: true,
            placeholder: "#ef4444",
        },
        { name: "icon", label: "Icon", type: "text" as const },
        {
            name: "description",
            label: "Description",
            type: "textarea" as const,
        },
        { name: "is_active", label: "Active", type: "boolean" as const },
        { name: "sort_order", label: "Sort Order", type: "number" as const },
    ],
    emptyForm: {
        name: "",
        slug: "",
        color: "",
        icon: "",
        description: "",
        is_active: true,
        sort_order: "0",
    },
    formFromRecord: (r: PriorityLevel) => ({
        name: r.name,
        slug: r.slug,
        color: r.color ?? "",
        icon: r.icon ?? "",
        description: r.description ?? "",
        is_active: r.is_active,
        sort_order: String(r.sort_order),
    }),
};

export default function PriorityLevelsIndex({ records, filters }: Props) {
    return (
        <LookupIndexPage
            records={records}
            filters={filters}
            config={config as never}
        />
    );
}

PriorityLevelsIndex.layout = {
    breadcrumbs: [{ title: "Priority Levels", href: BASE_URL }],
};
