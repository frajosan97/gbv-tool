import { Hash, StickyNote } from "lucide-react";

import {
    ActiveCell,
    ColorSwatch,
    LookupIndexPage,
    type LookupFilters,
    type LookupPaginator,
    type LookupRecord,
} from "@/components/lookup-index-page";

type NoteType = LookupRecord & { is_private_by_default: boolean };
type Props = {
    records: LookupPaginator<NoteType>;
    filters: LookupFilters;
};

const BASE_URL = "/system-settings/note-types";

const config = {
    title: "Note Types",
    singular: "note type",
    plural: "note types",
    icon: StickyNote,
    route: "system-settings.note-types.index",
    baseUrl: BASE_URL,
    defaultSort: "sort_order",
    columns: [
        {
            key: "name",
            label: "Name",
            icon: StickyNote,
            sortable: true,
            headerClassName: "w-[25%]",
            cell: (r: NoteType) => (
                <span className="font-medium">{r.name}</span>
            ),
        },
        {
            key: "slug",
            label: "Slug",
            icon: Hash,
            sortable: true,
            headerClassName: "w-[20%]",
            cell: (r: NoteType) => (
                <span className="font-mono text-sm text-muted-foreground">
                    {r.slug}
                </span>
            ),
        },
        {
            key: "color",
            label: "Color",
            sortable: false,
            headerClassName: "w-[15%]",
            cell: (r: NoteType) => <ColorSwatch color={r.color} />,
        },
        {
            key: "is_private_by_default",
            label: "Private",
            sortable: true,
            headerClassName: "w-[15%]",
            cell: (r: NoteType) => (
                <ActiveCell active={r.is_private_by_default} />
            ),
        },
        {
            key: "is_active",
            label: "Active",
            sortable: true,
            headerClassName: "w-[10%]",
            cell: (r: NoteType) => <ActiveCell active={r.is_active} />,
        },
    ],
    fields: [
        { name: "name", label: "Name", type: "text" as const, required: true },
        { name: "slug", label: "Slug", type: "text" as const, required: true },
        { name: "icon", label: "Icon", type: "text" as const },
        { name: "color", label: "Color", type: "color" as const },
        {
            name: "description",
            label: "Description",
            type: "textarea" as const,
        },
        {
            name: "is_private_by_default",
            label: "Private by Default",
            type: "boolean" as const,
        },
        { name: "is_active", label: "Active", type: "boolean" as const },
        { name: "sort_order", label: "Sort Order", type: "number" as const },
    ],
    emptyForm: {
        name: "",
        slug: "",
        icon: "",
        color: "",
        description: "",
        is_private_by_default: false,
        is_active: true,
        sort_order: "0",
    },
    formFromRecord: (r: NoteType) => ({
        name: r.name,
        slug: r.slug,
        icon: r.icon ?? "",
        color: r.color ?? "",
        description: r.description ?? "",
        is_private_by_default: r.is_private_by_default,
        is_active: r.is_active,
        sort_order: String(r.sort_order),
    }),
};

export default function NoteTypesIndex({ records, filters }: Props) {
    return (
        <LookupIndexPage
            records={records}
            filters={filters}
            config={config as never}
        />
    );
}

NoteTypesIndex.layout = {
    breadcrumbs: [{ title: "Note Types", href: BASE_URL }],
};
