import { Building2, Hash } from "lucide-react";
import { useMemo } from "react";

import {
    ActiveCell,
    LookupIndexPage,
    type LookupFilters,
    type LookupIndexConfig,
    type LookupPaginator,
    type LookupRecord,
} from "@/components/lookup-index-page";

type OrganizationType = LookupRecord;

type Props = {
    records: LookupPaginator<OrganizationType>;
    filters: LookupFilters;
};

const BASE_URL = "/system-settings/organization-types";

export default function OrganizationTypesIndex({ records, filters }: Props) {
    const config = useMemo<LookupIndexConfig<OrganizationType>>(
        () => ({
            title: "Organization Types",
            singular: "organization type",
            plural: "organization types",
            icon: Building2,
            route: "system-settings.organization-types.index",
            baseUrl: BASE_URL,
            defaultSort: "sort_order",
            defaultDir: "asc",
            searchPlaceholder: "Search organization types...",
            columns: [
                {
                    key: "name",
                    label: "Name",
                    icon: Building2,
                    sortable: true,
                    headerClassName: "w-[35%]",
                    cell: (r) => <span className="font-medium">{r.name}</span>,
                },
                {
                    key: "slug",
                    label: "Slug",
                    icon: Hash,
                    sortable: true,
                    headerClassName: "w-[25%]",
                    cell: (r) => (
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
                    cell: (r) => <ActiveCell active={r.is_active} />,
                },
                {
                    key: "sort_order",
                    label: "Order",
                    sortable: true,
                    headerClassName: "w-[10%]",
                    cell: (r) => (
                        <span className="text-sm">{r.sort_order}</span>
                    ),
                },
            ],
            fields: [
                {
                    name: "name",
                    label: "Name",
                    type: "text",
                    required: true,
                    placeholder: "e.g. Non-Governmental Organization",
                },
                {
                    name: "slug",
                    label: "Slug",
                    type: "text",
                    required: true,
                    placeholder: "e.g. ngo",
                },
                {
                    name: "icon",
                    label: "Icon",
                    type: "text",
                    placeholder: "lucide icon name",
                },
                {
                    name: "description",
                    label: "Description",
                    type: "textarea",
                    placeholder: "Describe this organization type...",
                    fullWidth: true,
                },
                {
                    name: "is_active",
                    label: "Active",
                    type: "boolean",
                },
                {
                    name: "sort_order",
                    label: "Sort Order",
                    type: "number",
                },
            ],
            emptyForm: {
                name: "",
                slug: "",
                icon: "",
                description: "",
                is_active: true,
                sort_order: "0",
            },
            formFromRecord: (r) => ({
                name: r.name,
                slug: r.slug,
                icon: r.icon ?? "",
                description: r.description ?? "",
                is_active: r.is_active,
                sort_order: String(r.sort_order),
            }),
            deleteWarning:
                "Organization types with associated partners may also have dependent records affected by database cascade rules.",
        }),
        [],
    );

    return (
        <LookupIndexPage records={records} filters={filters} config={config} />
    );
}

OrganizationTypesIndex.layout = {
    breadcrumbs: [{ title: "Organization Types", href: BASE_URL }],
};
