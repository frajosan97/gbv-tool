import { CheckCircle2, Hash } from "lucide-react";

import {
    ActiveCell,
    ColorSwatch,
    LookupIndexPage,
    type LookupFilters,
    type LookupPaginator,
    type LookupRecord,
} from "@/components/lookup-index-page";

type CaseStatus = LookupRecord & { is_concluded: boolean };
type Props = {
    records: LookupPaginator<CaseStatus>;
    filters: LookupFilters;
};

const BASE_URL = "/system-settings/case-statuses";

const config = {
    title: "Case Statuses",
    singular: "case status",
    plural: "case statuses",
    icon: CheckCircle2,
    route: "system-settings.case-statuses.index",
    baseUrl: BASE_URL,
    defaultSort: "sort_order",
    columns: [
        {
            key: "name",
            label: "Name",
            icon: CheckCircle2,
            sortable: true,
            headerClassName: "w-[25%]",
            cell: (r: CaseStatus) => (
                <span className="font-medium">{r.name}</span>
            ),
        },
        {
            key: "slug",
            label: "Slug",
            icon: Hash,
            sortable: true,
            headerClassName: "w-[20%]",
            cell: (r: CaseStatus) => (
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
            cell: (r: CaseStatus) => <ColorSwatch color={r.color} />,
        },
        {
            key: "is_concluded",
            label: "Concluded",
            sortable: true,
            headerClassName: "w-[15%]",
            cell: (r: CaseStatus) => <ActiveCell active={r.is_concluded} />,
        },
        {
            key: "is_active",
            label: "Active",
            sortable: true,
            headerClassName: "w-[15%]",
            cell: (r: CaseStatus) => <ActiveCell active={r.is_active} />,
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
        { name: "is_concluded", label: "Concluded", type: "boolean" as const },
        { name: "is_active", label: "Active", type: "boolean" as const },
        { name: "sort_order", label: "Sort Order", type: "number" as const },
    ],
    emptyForm: {
        name: "",
        slug: "",
        color: "",
        icon: "",
        description: "",
        is_concluded: false,
        is_active: true,
        sort_order: "0",
    },
    formFromRecord: (r: CaseStatus) => ({
        name: r.name,
        slug: r.slug,
        color: r.color ?? "",
        icon: r.icon ?? "",
        description: r.description ?? "",
        is_concluded: r.is_concluded,
        is_active: r.is_active,
        sort_order: String(r.sort_order),
    }),
};

export default function CaseStatusesIndex({ records, filters }: Props) {
    return (
        <LookupIndexPage
            records={records}
            filters={filters}
            config={config as never}
        />
    );
}

CaseStatusesIndex.layout = {
    breadcrumbs: [{ title: "Case Statuses", href: BASE_URL }],
};
