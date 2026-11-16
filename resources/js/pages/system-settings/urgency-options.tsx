import { AlarmClock, Hash } from "lucide-react";

import {
    ActiveCell,
    ColorSwatch,
    LookupIndexPage,
    type LookupFilters,
    type LookupPaginator,
    type LookupRecord,
} from "@/components/lookup-index-page";

type UrgencyOption = LookupRecord;
type Props = {
    records: LookupPaginator<UrgencyOption>;
    filters: LookupFilters;
};

const BASE_URL = "/system-settings/urgency-options";

const config = {
    title: "Urgency Options",
    singular: "urgency option",
    plural: "urgency options",
    icon: AlarmClock,
    route: "system-settings.urgency-options.index",
    baseUrl: BASE_URL,
    defaultSort: "sort_order",
    columns: [
        {
            key: "name",
            label: "Name",
            icon: AlarmClock,
            sortable: true,
            headerClassName: "w-[30%]",
            cell: (r: UrgencyOption) => (
                <span className="font-medium">{r.name}</span>
            ),
        },
        {
            key: "slug",
            label: "Slug",
            icon: Hash,
            sortable: true,
            headerClassName: "w-[25%]",
            cell: (r: UrgencyOption) => (
                <span className="font-mono text-sm text-muted-foreground">
                    {r.slug}
                </span>
            ),
        },
        {
            key: "color",
            label: "Color",
            sortable: false,
            headerClassName: "w-[20%]",
            cell: (r: UrgencyOption) => <ColorSwatch color={r.color} />,
        },
        {
            key: "is_active",
            label: "Active",
            sortable: true,
            headerClassName: "w-[15%]",
            cell: (r: UrgencyOption) => <ActiveCell active={r.is_active} />,
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
    formFromRecord: (r: UrgencyOption) => ({
        name: r.name,
        slug: r.slug,
        color: r.color ?? "",
        icon: r.icon ?? "",
        description: r.description ?? "",
        is_active: r.is_active,
        sort_order: String(r.sort_order),
    }),
};

export default function UrgencyOptionsIndex({ records, filters }: Props) {
    return (
        <LookupIndexPage
            records={records}
            filters={filters}
            config={config as never}
        />
    );
}

UrgencyOptionsIndex.layout = {
    breadcrumbs: [{ title: "Urgency Options", href: BASE_URL }],
};
