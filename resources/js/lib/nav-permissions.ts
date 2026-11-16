import type { InertiaLinkProps } from '@inertiajs/react';

/** Same href shape your NavItem uses, so they stay in sync. */
export type NavHref = NonNullable<InertiaLinkProps['href']>;

/** Normalizes a nav href (string or Wayfinder RouteDefinition) to a path string. */
export function hrefToPath(href: NavHref): string {
    if (typeof href === 'string') return href;
    if (href && typeof href === 'object' && 'url' in href) {
        return (href as { url: string }).url;
    }
    return '';
}

/**
 * Maps sidebar routes to the permission(s) required to view them.
 * A user only needs ANY of the permissions listed.
 * Empty array or missing entry = unrestricted.
 */
export const navPermissions: Record<string, string[]> = {
    '/dashboard': [],
    '/survivors': ['view survivors'],
    '/gbv-cases': ['view gbv cases'],
    '/perpetrators': ['manage perpetrators'],
    '/referrals': ['create referrals', 'accept referrals', 'complete referrals'],
    '/partners': ['manage partners'],
    '/settings/locations': ['manage lookups'],
    '/settings/lookups': ['manage lookups'],
    '/settings/organization-types': ['manage lookups'],
};