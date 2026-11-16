import { Hash, Users } from "lucide-react";

import {
    ActiveCell,
    LookupIndexPage,
    type LookupFilters,
    type LookupPaginator,
    type LookupRecord,
} from "@/components/lookup-index-page";

type GenderOption = LookupRecord;
type Props = {
    records: LookupPaginator<GenderOption>;
    filters: LookupFilters;
};

const BASE_URL = "/system-settings/gender-options";

const config = {
    title: "Gender Options",
    singular: "gender option",
    plural: "gender options",
    icon: Users,
    route: "system-settings.gender-options.index",
    baseUrl: BASE_URL,
    defaultSort: "sort_order",
    columns: [
        {
            key: "name",
            label: "Name",
            icon: Users,
            sortable: true,
            headerClassName: "w-[40%]",
            cell: (r: GenderOption) => (
                <span className="font-medium">{r.name}</span>
            ),
        },
        {
            key: "slug",
            label: "Slug",
            icon: Hash,
            sortable: true,
            headerClassName: "w-[30%]",
            cell: (r: GenderOption) => (
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
            cell: (r: GenderOption) => <ActiveCell active={r.is_active} />,
        },
    ],
    fields: [
        { name: "name", label: "Name", type: "text" as const, required: true },
        { name: "slug", label: "Slug", type: "text" as const, required: true },
        { name: "icon", label: "Icon", type: "text" as const },
        { name: "is_active", label: "Active", type: "boolean" as const },
        { name: "sort_order", label: "Sort Order", type: "number" as const },
    ],
    emptyForm: {
        name: "",
        slug: "",
        icon: "",
        is_active: true,
        sort_order: "0",
    },
    formFromRecord: (r: GenderOption) => ({
        name: r.name,
        slug: r.slug,
        icon: r.icon ?? "",
        is_active: r.is_active,
        sort_order: String(r.sort_order),
    }),
};

export default function GenderOptionsIndex({ records, filters }: Props) {
    return (
        <LookupIndexPage
            records={records}
            filters={filters}
            config={config as never}
        />
    );
}

GenderOptionsIndex.layout = {
    breadcrumbs: [{ title: "Gender Options", href: BASE_URL }],
};
