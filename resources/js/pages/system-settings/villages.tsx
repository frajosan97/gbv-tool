import { Hash, Home, Layers, MapPin } from "lucide-react";
import { useCallback, useMemo } from "react";

import {
    LookupIndexPage,
    type LookupFilters,
    type LookupIndexConfig,
    type LookupPaginator,
    type LookupRecord,
} from "@/components/lookup-index-page";
import { useAppData, type SubCounty, type Ward } from "@/hooks/use-app-data";

type Village = LookupRecord & {
    code: string;
    ward_id: number;
    ward?: Ward;
};

type Props = {
    records: LookupPaginator<Village>;
    filters: LookupFilters;
};

const BASE_URL = "/system-settings/villages";

export default function VillagesIndex({ records, filters }: Props) {
    const { wards = [], subCounties = [], counties = [] } = useAppData();

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

    const wardById = useMemo(() => {
        const map = new Map<number, Ward>();
        for (const w of wards) map.set(w.id, w);
        return map;
    }, [wards]);

    const resolveWard = useCallback(
        (v: Village) => v.ward ?? wardById.get(v.ward_id),
        [wardById],
    );

    const resolveSubCountyName = useCallback(
        (v: Village) => {
            const w = resolveWard(v);
            if (!w) return "—";
            return subCountyById.get(w.sub_county_id)?.name ?? "—";
        },
        [resolveWard, subCountyById],
    );

    const resolveCountyName = useCallback(
        (v: Village) => {
            const w = resolveWard(v);
            if (!w) return "—";
            const sc = subCountyById.get(w.sub_county_id);
            if (!sc) return "—";
            return countyNameById.get(sc.county_id) ?? "—";
        },
        [resolveWard, subCountyById, countyNameById],
    );

    const config = useMemo<LookupIndexConfig<Village>>(
        () => ({
            title: "Villages",
            singular: "village",
            plural: "villages",
            icon: Home,
            route: "system-settings.villages.index",
            baseUrl: BASE_URL,
            defaultSort: "name",
            defaultDir: "asc",
            searchPlaceholder: "Search village name or code...",
            columns: [
                {
                    key: "code",
                    label: "Village Code",
                    icon: Hash,
                    sortable: true,
                    headerClassName: "w-[15%]",
                    cell: (v) => (
                        <span className="font-mono text-sm font-medium">
                            {v.code}
                        </span>
                    ),
                },
                {
                    key: "name",
                    label: "Village Name",
                    icon: Home,
                    sortable: true,
                    headerClassName: "w-[25%]",
                    cell: (v) => <span className="font-medium">{v.name}</span>,
                },
                {
                    key: "ward",
                    label: "Ward",
                    icon: Layers,
                    sortable: false,
                    headerClassName: "w-[20%]",
                    cell: (v) => (
                        <span className="text-sm text-muted-foreground">
                            {resolveWard(v)?.name ?? "—"}
                        </span>
                    ),
                },
                {
                    key: "sub_county",
                    label: "Sub-County",
                    icon: MapPin,
                    sortable: false,
                    headerClassName: "w-[20%]",
                    cell: (v) => (
                        <span className="text-sm text-muted-foreground">
                            {resolveSubCountyName(v)}
                        </span>
                    ),
                },
                {
                    key: "county",
                    label: "County",
                    icon: MapPin,
                    sortable: false,
                    headerClassName: "w-[20%]",
                    cell: (v) => (
                        <span className="text-sm text-muted-foreground">
                            {resolveCountyName(v)}
                        </span>
                    ),
                },
            ],
            fields: [
                {
                    name: "ward_id",
                    label: "Ward",
                    type: "select",
                    required: true,
                    placeholder: "Select a ward",
                    options: wards.map((w) => {
                        const sc = subCountyById.get(w.sub_county_id);
                        return {
                            value: String(w.id),
                            label: sc ? `${w.name} — ${sc.name}` : w.name,
                        };
                    }),
                },
                {
                    name: "code",
                    label: "Village Code",
                    type: "text",
                    required: true,
                    placeholder: "e.g. 001",
                    help: "Enter the official village identification code.",
                },
                {
                    name: "name",
                    label: "Village Name",
                    type: "text",
                    required: true,
                    placeholder: "e.g. Kibera",
                },
            ],
            emptyForm: {
                ward_id: "",
                code: "",
                name: "",
            },
            formFromRecord: (v) => ({
                ward_id: String(v.ward_id),
                code: v.code,
                name: v.name,
            }),
            deleteWarning:
                "Villages with associated partners, users, survivors, or GBV cases may also have dependent records affected by database cascade rules.",
        }),
        [
            wards,
            subCountyById,
            resolveWard,
            resolveSubCountyName,
            resolveCountyName,
        ],
    );

    return (
        <LookupIndexPage records={records} filters={filters} config={config} />
    );
}

VillagesIndex.layout = {
    breadcrumbs: [{ title: "Villages", href: BASE_URL }],
};
