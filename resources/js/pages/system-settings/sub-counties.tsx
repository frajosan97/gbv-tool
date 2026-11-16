import { Hash, Layers, MapPin } from "lucide-react";
import { useCallback, useMemo } from "react";

import {
    LookupIndexPage,
    type LookupFilters,
    type LookupIndexConfig,
    type LookupPaginator,
    type LookupRecord,
} from "@/components/lookup-index-page";
import { useAppData, type County } from "@/hooks/use-app-data";

type SubCounty = LookupRecord & {
    code: string;
    county_id: number;
    county?: County;
};

type Props = {
    records: LookupPaginator<SubCounty>;
    filters: LookupFilters;
};

const BASE_URL = "/system-settings/sub-counties";

export default function SubCountiesIndex({ records, filters }: Props) {
    const { counties = [] } = useAppData();

    const countyNameById = useMemo(() => {
        const map = new Map<number, string>();
        for (const c of counties) map.set(c.id, c.name);
        return map;
    }, [counties]);

    const resolveCountyName = useCallback(
        (sc: SubCounty) =>
            sc.county?.name ?? countyNameById.get(sc.county_id) ?? "—",
        [countyNameById],
    );

    const config = useMemo<LookupIndexConfig<SubCounty>>(
        () => ({
            title: "Sub-Counties",
            singular: "sub-county",
            plural: "sub-counties",
            icon: Layers,
            route: "system-settings.sub-counties.index",
            baseUrl: BASE_URL,
            defaultSort: "name",
            defaultDir: "asc",
            searchPlaceholder: "Search sub-county name or code...",
            columns: [
                {
                    key: "code",
                    label: "Sub-County Code",
                    icon: Hash,
                    sortable: true,
                    headerClassName: "w-[20%]",
                    cell: (sc) => (
                        <span className="font-mono text-sm font-medium">
                            {sc.code}
                        </span>
                    ),
                },
                {
                    key: "name",
                    label: "Sub-County Name",
                    icon: MapPin,
                    sortable: true,
                    headerClassName: "w-[35%]",
                    cell: (sc) => (
                        <span className="font-medium">{sc.name}</span>
                    ),
                },
                {
                    key: "county",
                    label: "County",
                    icon: Layers,
                    sortable: false,
                    headerClassName: "w-[35%]",
                    cell: (sc) => (
                        <span className="text-sm text-muted-foreground">
                            {resolveCountyName(sc)}
                        </span>
                    ),
                },
            ],
            fields: [
                {
                    name: "county_id",
                    label: "County",
                    type: "select",
                    required: true,
                    placeholder: "Select a county",
                    options: counties.map((c) => ({
                        value: String(c.id),
                        label: c.name,
                    })),
                },
                {
                    name: "code",
                    label: "Sub-County Code",
                    type: "text",
                    required: true,
                    placeholder: "e.g. 001",
                    help: "Enter the official sub-county identification code.",
                },
                {
                    name: "name",
                    label: "Sub-County Name",
                    type: "text",
                    required: true,
                    placeholder: "e.g. Westlands",
                },
            ],
            emptyForm: {
                county_id: "",
                code: "",
                name: "",
            },
            formFromRecord: (sc) => ({
                county_id: String(sc.county_id),
                code: sc.code,
                name: sc.name,
            }),
            deleteWarning:
                "Sub-counties with associated wards, partners, users, survivors, or GBV cases may also have dependent records affected by database cascade rules.",
        }),
        [counties, resolveCountyName],
    );

    return (
        <LookupIndexPage records={records} filters={filters} config={config} />
    );
}

SubCountiesIndex.layout = {
    breadcrumbs: [{ title: "Sub-Counties", href: BASE_URL }],
};
