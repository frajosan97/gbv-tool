import { Hash, Share2 } from "lucide-react";

import {
    ActiveCell,
    ColorSwatch,
    LookupIndexPage,
    type LookupFilters,
    type LookupPaginator,
    type LookupRecord,
} from "@/components/lookup-index-page";

type ReferralType = LookupRecord;
type Props = {
    records: LookupPaginator<ReferralType>;
    filters: LookupFilters;
};

const BASE_URL = "/system-settings/referral-types";

const config = {
    title: "Referral Types",
    singular: "referral type",
    plural: "referral types",
    icon: Share2,
    route: "system-settings.referral-types.index",
    baseUrl: BASE_URL,
    defaultSort: "sort_order",
    columns: [
        {
            key: "name",
            label: "Name",
            icon: Share2,
            sortable: true,
            headerClassName: "w-[30%]",
            cell: (r: ReferralType) => (
                <span className="font-medium">{r.name}</span>
            ),
        },
        {
            key: "slug",
            label: "Slug",
            icon: Hash,
            sortable: true,
            headerClassName: "w-[25%]",
            cell: (r: ReferralType) => (
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
            cell: (r: ReferralType) => <ColorSwatch color={r.color} />,
        },
        {
            key: "is_active",
            label: "Active",
            sortable: true,
            headerClassName: "w-[15%]",
            cell: (r: ReferralType) => <ActiveCell active={r.is_active} />,
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
    formFromRecord: (r: ReferralType) => ({
        name: r.name,
        slug: r.slug,
        color: r.color ?? "",
        icon: r.icon ?? "",
        description: r.description ?? "",
        is_active: r.is_active,
        sort_order: String(r.sort_order),
    }),
};

export default function ReferralTypesIndex({ records, filters }: Props) {
    return (
        <LookupIndexPage
            records={records}
            filters={filters}
            config={config as never}
        />
    );
}

ReferralTypesIndex.layout = {
    breadcrumbs: [{ title: "Referral Types", href: BASE_URL }],
};
