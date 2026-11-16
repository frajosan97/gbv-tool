import { Activity, Hash } from "lucide-react";

import {
    ActiveCell,
    ColorSwatch,
    LookupIndexPage,
    type LookupFilters,
    type LookupPaginator,
    type LookupRecord,
} from "@/components/lookup-index-page";

type TimelineEventType = LookupRecord;
type Props = {
    records: LookupPaginator<TimelineEventType>;
    filters: LookupFilters;
};

const BASE_URL = "/system-settings/timeline-event-types";

const config = {
    title: "Timeline Event Types",
    singular: "timeline event type",
    plural: "timeline event types",
    icon: Activity,
    route: "system-settings.timeline-event-types.index",
    baseUrl: BASE_URL,
    defaultSort: "sort_order",
    columns: [
        {
            key: "name",
            label: "Name",
            icon: Activity,
            sortable: true,
            headerClassName: "w-[30%]",
            cell: (r: TimelineEventType) => (
                <span className="font-medium">{r.name}</span>
            ),
        },
        {
            key: "slug",
            label: "Slug",
            icon: Hash,
            sortable: true,
            headerClassName: "w-[25%]",
            cell: (r: TimelineEventType) => (
                <span className="font-mono text-sm text-muted-foreground">
                    {r.slug}
                </span>
            ),
        },
        {
            key: "icon",
            label: "Icon",
            sortable: false,
            headerClassName: "w-[15%]",
            cell: (r: TimelineEventType) => (
                <span className="font-mono text-xs text-muted-foreground">
                    {r.icon ?? "—"}
                </span>
            ),
        },
        {
            key: "color",
            label: "Color",
            sortable: false,
            headerClassName: "w-[15%]",
            cell: (r: TimelineEventType) => <ColorSwatch color={r.color} />,
        },
        {
            key: "is_active",
            label: "Active",
            sortable: true,
            headerClassName: "w-[10%]",
            cell: (r: TimelineEventType) => <ActiveCell active={r.is_active} />,
        },
    ],
    fields: [
        { name: "name", label: "Name", type: "text" as const, required: true },
        { name: "slug", label: "Slug", type: "text" as const, required: true },
        { name: "icon", label: "Icon", type: "text" as const, required: true },
        { name: "color", label: "Color", type: "color" as const },
        { name: "is_active", label: "Active", type: "boolean" as const },
        { name: "sort_order", label: "Sort Order", type: "number" as const },
    ],
    emptyForm: {
        name: "",
        slug: "",
        icon: "",
        color: "",
        is_active: true,
        sort_order: "0",
    },
    formFromRecord: (r: TimelineEventType) => ({
        name: r.name,
        slug: r.slug,
        icon: r.icon ?? "",
        color: r.color ?? "",
        is_active: r.is_active,
        sort_order: String(r.sort_order),
    }),
};

export default function TimelineEventTypesIndex({ records, filters }: Props) {
    return (
        <LookupIndexPage
            records={records}
            filters={filters}
            config={config as never}
        />
    );
}

TimelineEventTypesIndex.layout = {
    breadcrumbs: [{ title: "Timeline Event Types", href: BASE_URL }],
};
