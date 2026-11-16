import { Hash, MapPin } from "lucide-react";
import { useMemo } from "react";

import {
    LookupIndexPage,
    type LookupFilters,
    type LookupIndexConfig,
    type LookupPaginator,
    type LookupRecord,
} from "@/components/lookup-index-page";

type County = LookupRecord & { code: string };

type Props = {
    records: LookupPaginator<County>;
    filters: LookupFilters;
};

const BASE_URL = "/system-settings/counties";

export default function CountiesIndex({ records, filters }: Props) {
    const config = useMemo<LookupIndexConfig<County>>(
        () => ({
            title: "Counties",
            singular: "county",
            plural: "counties",
            icon: MapPin,
            route: "system-settings.counties.index",
            baseUrl: BASE_URL,
            defaultSort: "name",
            defaultDir: "asc",
            searchPlaceholder: "Search county name or code...",
            columns: [
                {
                    key: "code",
                    label: "County Code",
                    icon: Hash,
                    sortable: true,
                    headerClassName: "w-[25%]",
                    cell: (c) => (
                        <span className="font-mono text-sm font-medium">
                            {c.code}
                        </span>
                    ),
                },
                {
                    key: "name",
                    label: "County Name",
                    icon: MapPin,
                    sortable: true,
                    headerClassName: "w-[55%]",
                    cell: (c) => <span className="font-medium">{c.name}</span>,
                },
            ],
            fields: [
                {
                    name: "code",
                    label: "County Code",
                    type: "text",
                    required: true,
                    placeholder: "e.g. 001",
                    help: "Enter the official county identification code.",
                },
                {
                    name: "name",
                    label: "County Name",
                    type: "text",
                    required: true,
                    placeholder: "e.g. Nairobi",
                },
            ],
            emptyForm: {
                code: "",
                name: "",
            },
            formFromRecord: (c) => ({
                code: c.code,
                name: c.name,
            }),
            deleteWarning:
                "Counties with associated sub-counties may also have dependent records affected by database cascade rules.",
        }),
        [],
    );

    return (
        <LookupIndexPage records={records} filters={filters} config={config} />
    );
}

CountiesIndex.layout = {
    breadcrumbs: [{ title: "Counties", href: BASE_URL }],
};
