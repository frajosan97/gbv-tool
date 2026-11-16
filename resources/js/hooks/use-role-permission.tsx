// resources/js/hooks/use-role-permission.tsx
import { usePage } from "@inertiajs/react";

type RoleShape = string | { name: string };

interface AuthProps {
    user: {
        id: number;
        name: string;
        email: string;
        roles?: RoleShape[]; // in case roles are nested on the user
        permissions?: string[];
    } | null;
    roles?: RoleShape[]; // shared at auth root (preferred)
    permissions?: string[]; // shared at auth root (preferred)
}

interface PageProps {
    auth: AuthProps;
    [key: string]: any;
}

/** Normalize role/permission names so casing and separators don't matter. */
function normalize(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_");
}

/** Flatten string | {name} | mixed arrays into normalized strings. */
function normalizeList(raw: unknown): string[] {
    if (!Array.isArray(raw)) return [];
    return raw
        .map((entry) => {
            if (typeof entry === "string") return entry;
            if (entry && typeof entry === "object" && "name" in entry) {
                return String((entry as { name: unknown }).name);
            }
            return null;
        })
        .filter((v): v is string => !!v)
        .map(normalize);
}

export function useRolePermission() {
    const { auth } = usePage<PageProps>().props;

    // Prefer auth.roles, fall back to auth.user.roles — then normalize.
    const rawRoles = auth?.roles ?? auth?.user?.roles ?? [];
    const rawPermissions = auth?.permissions ?? auth?.user?.permissions ?? [];

    const userRoles = normalizeList(rawRoles);
    const userPermissions = normalizeList(rawPermissions);

    const can = (permission: string): boolean =>
        userPermissions.includes(normalize(permission));

    const canAny = (permissions: string[]): boolean =>
        permissions.some((p) => userPermissions.includes(normalize(p)));

    const canAll = (permissions: string[]): boolean =>
        permissions.every((p) => userPermissions.includes(normalize(p)));

    const hasRole = (role: string): boolean =>
        userRoles.includes(normalize(role));

    const hasAnyRole = (roles: string[]): boolean =>
        roles.some((r) => userRoles.includes(normalize(r)));

    const hasEveryRole = (roles: string[]): boolean =>
        roles.every((r) => userRoles.includes(normalize(r)));

    return {
        can,
        canAny,
        canAll,
        hasRole,
        hasAnyRole,
        hasEveryRole,
        roles: userRoles,
        permissions: userPermissions,
    };
}
