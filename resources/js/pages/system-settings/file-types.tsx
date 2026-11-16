import { FileText, Hash } from "lucide-react";

import {
    ActiveCell,
    ColorSwatch,
    LookupIndexPage,
    type LookupFilters,
    type LookupPaginator,
    type LookupRecord,
} from "@/components/lookup-index-page";

type FileType = LookupRecord & {
    is_evidence: boolean;
    requires_review: boolean;
};
type Props = {
    records: LookupPaginator<FileType>;
    filters: LookupFilters;
};

const BASE_URL = "/system-settings/file-types";

const config = {
    title: "File Types",
    singular: "file type",
    plural: "file types",
    icon: FileText,
    route: "system-settings.file-types.index",
    baseUrl: BASE_URL,
    defaultSort: "sort_order",
    columns: [
        {
            key: "name",
            label: "Name",
            icon: FileText,
            sortable: true,
            headerClassName: "w-[20%]",
            cell: (r: FileType) => (
                <span className="font-medium">{r.name}</span>
            ),
        },
        {
            key: "slug",
            label: "Slug",
            icon: Hash,
            sortable: true,
            headerClassName: "w-[15%]",
            cell: (r: FileType) => (
                <span className="font-mono text-sm text-muted-foreground">
                    {r.slug}
                </span>
            ),
        },
        {
            key: "color",
            label: "Color",
            sortable: false,
            headerClassName: "w-[10%]",
            cell: (r: FileType) => <ColorSwatch color={r.color} />,
        },
        {
            key: "is_evidence",
            label: "Evidence",
            sortable: true,
            headerClassName: "w-[10%]",
            cell: (r: FileType) => <ActiveCell active={r.is_evidence} />,
        },
        {
            key: "requires_review",
            label: "Review",
            sortable: true,
            headerClassName: "w-[10%]",
            cell: (r: FileType) => <ActiveCell active={r.requires_review} />,
        },
        {
            key: "is_active",
            label: "Active",
            sortable: true,
            headerClassName: "w-[10%]",
            cell: (r: FileType) => <ActiveCell active={r.is_active} />,
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
        { name: "is_evidence", label: "Is Evidence", type: "boolean" as const },
        {
            name: "requires_review",
            label: "Requires Review",
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
        is_evidence: false,
        requires_review: false,
        is_active: true,
        sort_order: "0",
    },
    formFromRecord: (r: FileType) => ({
        name: r.name,
        slug: r.slug,
        icon: r.icon ?? "",
        color: r.color ?? "",
        description: r.description ?? "",
        is_evidence: r.is_evidence,
        requires_review: r.requires_review,
        is_active: r.is_active,
        sort_order: String(r.sort_order),
    }),
};

export default function FileTypesIndex({ records, filters }: Props) {
    return (
        <LookupIndexPage
            records={records}
            filters={filters}
            config={config as never}
        />
    );
}

FileTypesIndex.layout = {
    breadcrumbs: [{ title: "File Types", href: BASE_URL }],
};
