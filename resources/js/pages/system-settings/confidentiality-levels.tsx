import { Hash, Lock } from "lucide-react";

import {
    ActiveCell,
    LookupIndexPage,
    type LookupFilters,
    type LookupPaginator,
    type LookupRecord,
} from "@/components/lookup-index-page";

type ConfidentialityLevel = LookupRecord;
type Props = {
    records: LookupPaginator<ConfidentialityLevel>;
    filters: LookupFilters;
};

const BASE_URL = "/system-settings/confidentiality-levels";

const config = {
    title: "Confidentiality Levels",
    singular: "confidentiality level",
    plural: "confidentiality levels",
    icon: Lock,
    route: "system-settings.confidentiality-levels.index",
    baseUrl: BASE_URL,
    defaultSort: "sort_order",
    columns: [
        {
            key: "name",
            label: "Name",
            icon: Lock,
            sortable: true,
            headerClassName: "w-[40%]",
            cell: (r: ConfidentialityLevel) => (
                <span className="font-medium">{r.name}</span>
            ),
        },
        {
            key: "slug",
            label: "Slug",
            icon: Hash,
            sortable: true,
            headerClassName: "w-[30%]",
            cell: (r: ConfidentialityLevel) => (
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
            cell: (r: ConfidentialityLevel) => (
                <ActiveCell active={r.is_active} />
            ),
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
        { name: "is_active", label: "Active", type: "boolean" as const },
        { name: "sort_order", label: "Sort Order", type: "number" as const },
    ],
    emptyForm: {
        name: "",
        slug: "",
        description: "",
        is_active: true,
        sort_order: "0",
    },
    formFromRecord: (r: ConfidentialityLevel) => ({
        name: r.name,
        slug: r.slug,
        description: r.description ?? "",
        is_active: r.is_active,
        sort_order: String(r.sort_order),
    }),
};

export default function ConfidentialityLevelsIndex({
    records,
    filters,
}: Props) {
    return (
        <LookupIndexPage
            records={records}
            filters={filters}
            config={config as never}
        />
    );
}

ConfidentialityLevelsIndex.layout = {
    breadcrumbs: [{ title: "Confidentiality Levels", href: BASE_URL }],
};
