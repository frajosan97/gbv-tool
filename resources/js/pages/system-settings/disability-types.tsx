import { Accessibility, Hash } from "lucide-react";

import {
    ActiveCell,
    LookupIndexPage,
    type LookupFilters,
    type LookupPaginator,
    type LookupRecord,
} from "@/components/lookup-index-page";

type DisabilityType = LookupRecord & { category: string };
type Props = {
    records: LookupPaginator<DisabilityType>;
    filters: LookupFilters;
};

const BASE_URL = "/system-settings/disability-types";

const config = {
    title: "Disability Types",
    singular: "disability type",
    plural: "disability types",
    icon: Accessibility,
    route: "system-settings.disability-types.index",
    baseUrl: BASE_URL,
    defaultSort: "sort_order",
    columns: [
        {
            key: "name",
            label: "Name",
            icon: Accessibility,
            sortable: true,
            headerClassName: "w-[25%]",
            cell: (r: DisabilityType) => (
                <span className="font-medium">{r.name}</span>
            ),
        },
        {
            key: "slug",
            label: "Slug",
            icon: Hash,
            sortable: true,
            headerClassName: "w-[20%]",
            cell: (r: DisabilityType) => (
                <span className="font-mono text-sm text-muted-foreground">
                    {r.slug}
                </span>
            ),
        },
        {
            key: "category",
            label: "Category",
            sortable: true,
            headerClassName: "w-[20%]",
            cell: (r: DisabilityType) => (
                <span className="text-sm capitalize">{r.category}</span>
            ),
        },
        {
            key: "is_active",
            label: "Active",
            sortable: true,
            headerClassName: "w-[15%]",
            cell: (r: DisabilityType) => <ActiveCell active={r.is_active} />,
        },
    ],
    fields: [
        { name: "name", label: "Name", type: "text" as const, required: true },
        { name: "slug", label: "Slug", type: "text" as const, required: true },
        {
            name: "category",
            label: "Category",
            type: "select" as const,
            required: true,
            options: [
                { value: "physical", label: "Physical" },
                { value: "sensory", label: "Sensory" },
                { value: "intellectual", label: "Intellectual" },
                { value: "mental", label: "Mental" },
                { value: "other", label: "Other" },
            ],
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
        category: "",
        icon: "",
        description: "",
        is_active: true,
        sort_order: "0",
    },
    formFromRecord: (r: DisabilityType) => ({
        name: r.name,
        slug: r.slug,
        category: r.category,
        icon: r.icon ?? "",
        description: r.description ?? "",
        is_active: r.is_active,
        sort_order: String(r.sort_order),
    }),
};

export default function DisabilityTypesIndex({ records, filters }: Props) {
    return (
        <LookupIndexPage
            records={records}
            filters={filters}
            config={config as never}
        />
    );
}

DisabilityTypesIndex.layout = {
    breadcrumbs: [{ title: "Disability Types", href: BASE_URL }],
};
