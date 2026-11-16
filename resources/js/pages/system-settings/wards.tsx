import { Hash, Layers, MapPin } from "lucide-react";
import { useCallback, useMemo } from "react";

import {
    LookupIndexPage,
    type LookupFilters,
    type LookupIndexConfig,
    type LookupPaginator,
    type LookupRecord,
} from "@/components/lookup-index-page";
import { useAppData, type SubCounty } from "@/hooks/use-app-data";

type Ward = LookupRecord & {
    code: string;
    sub_county_id: number;
    sub_county?: SubCounty;
};

type Props = {
    records: LookupPaginator<Ward>;
    filters: LookupFilters;
};

const BASE_URL = "/system-settings/wards";

export default function WardsIndex({ records, filters }: Props) {
    const { subCounties = [], counties = [] } = useAppData();

    const countyNameById = useMemo(() => {
        const map = new Map<number, string>();
        for (const c of counties) map.set(c.id, c.name);
        return map;
    }, [counties]);

    const subCountyById = useMemo(() => {
        const map = new Map<number, SubCounty>();
        for (const sc of subCounties) map.set(sc.id, sc);
        return map;
    }, [subCounties]);

    const resolveSubCounty = useCallback(
        (w: Ward) => w.sub_county ?? subCountyById.get(w.sub_county_id),
        [subCountyById],
    );

    const resolveCountyName = useCallback(
        (w: Ward) => {
            const sc = resolveSubCounty(w);
            if (!sc) return "—";
            return countyNameById.get(sc.county_id) ?? "—";
        },
        [resolveSubCounty, countyNameById],
    );

    const config = useMemo<LookupIndexConfig<Ward>>(
        () => ({
            title: "Wards",
            singular: "ward",
            plural: "wards",
            icon: Layers,
            route: "system-settings.wards.index",
            baseUrl: BASE_URL,
            defaultSort: "name",
            defaultDir: "asc",
            searchPlaceholder: "Search ward name or code...",
            columns: [
                {
                    key: "code",
                    label: "Ward Code",
                    icon: Hash,
                    sortable: true,
                    headerClassName: "w-[18%]",
                    cell: (w) => (
                        <span className="font-mono text-sm font-medium">
                            {w.code}
                        </span>
                    ),
                },
                {
                    key: "name",
                    label: "Ward Name",
                    icon: MapPin,
                    sortable: true,
                    headerClassName: "w-[32%]",
                    cell: (w) => <span className="font-medium">{w.name}</span>,
                },
                {
                    key: "sub_county",
                    label: "Sub-County",
                    icon: Layers,
                    sortable: false,
                    headerClassName: "w-[25%]",
                    cell: (w) => (
                        <span className="text-sm text-muted-foreground">
                            {resolveSubCounty(w)?.name ?? "—"}
                        </span>
                    ),
                },
                {
                    key: "county",
                    label: "County",
                    icon: Layers,
                    sortable: false,
                    headerClassName: "w-[25%]",
                    cell: (w) => (
                        <span className="text-sm text-muted-foreground">
                            {resolveCountyName(w)}
                        </span>
                    ),
                },
            ],
            fields: [
                {
                    name: "sub_county_id",
                    label: "Sub-County",
                    type: "select",
                    required: true,
                    placeholder: "Select a sub-county",
                    options: subCounties.map((sc) => {
                        const countyName = countyNameById.get(sc.county_id);
                        return {
                            value: String(sc.id),
                            label: countyName
                                ? `${sc.name} — ${countyName}`
                                : sc.name,
                        };
                    }),
                },
                {
                    name: "code",
                    label: "Ward Code",
                    type: "text",
                    required: true,
                    placeholder: "e.g. 001",
                    help: "Enter the official ward identification code.",
                },
                {
                    name: "name",
                    label: "Ward Name",
                    type: "text",
                    required: true,
                    placeholder: "e.g. Parklands",
                },
            ],
            emptyForm: {
                sub_county_id: "",
                code: "",
                name: "",
            },
            formFromRecord: (w) => ({
                sub_county_id: String(w.sub_county_id),
                code: w.code,
                name: w.name,
            }),
            deleteWarning:
                "Wards with associated villages, partners, users, survivors, or GBV cases may also have dependent records affected by database cascade rules.",
        }),
        [subCounties, countyNameById, resolveSubCounty, resolveCountyName],
    );

    return (
        <LookupIndexPage records={records} filters={filters} config={config} />
    );
}

WardsIndex.layout = {
    breadcrumbs: [{ title: "Wards", href: BASE_URL }],
};
