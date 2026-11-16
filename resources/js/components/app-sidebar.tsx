import { Link } from "@inertiajs/react";
import {
    LayoutGrid,
    Users,
    Scale,
    Share2,
    UserCheck,
    Settings,
    MapPin,
    Building2,
    Layers,
    Home,
    Tag,
    AlertTriangle,
    Lock,
    CheckCircle2,
    CheckSquare,
    Activity,
    Clock,
    IdCard,
    Accessibility,
    UserRound,
    Heart,
    FileText,
    StickyNote,
} from "lucide-react";
import AppLogo from "@/components/app-logo";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { dashboard } from "@/routes";
import { useRolePermission } from "@/hooks/use-role-permission";
import {
    navPermissions,
    hrefToPath,
    type NavHref,
} from "@/lib/nav-permissions";
import type { NavItem } from "@/types";

/**
 * Roles allowed to view the Settings section.
 * Must match the role names seeded in RolePermissionSeeder exactly.
 * Only Super Admin has `manage lookups`, so only they get Settings.
 */
const SETTINGS_ROLES = ["Super Admin"] as const;

export function AppSidebar() {
    const { canAny, hasAnyRole } = useRolePermission();

    const canSee = (href: NavHref | undefined): boolean => {
        if (!href) return false;
        const path = hrefToPath(href);
        const required = navPermissions[path] ?? [];
        if (required.length === 0) return true;
        return canAny(required);
    };

    // Role gate for the entire Settings section.
    const canSeeSettings = hasAnyRole([...SETTINGS_ROLES]);

    // Settings children are gated ONLY by role — no per-item permission check.
    const settingsChildren: NavItem[] = canSeeSettings
        ? ([
              // ---------- Locations ----------
              {
                  title: "Counties",
                  href: "/system-settings/counties",
                  icon: MapPin,
              },
              {
                  title: "Sub Counties",
                  href: "/system-settings/sub-counties",
                  icon: Layers,
              },
              {
                  title: "Wards",
                  href: "/system-settings/wards",
                  icon: Building2,
              },
              {
                  title: "Villages",
                  href: "/system-settings/villages",
                  icon: Home,
              },

              // ---------- Partners / Organizations ----------
              {
                  title: "Organization Types",
                  href: "/system-settings/organization-types",
                  icon: Building2,
              },

              // ---------- Incident / Case ----------
              {
                  title: "Incident Types",
                  href: "/system-settings/incident-types",
                  icon: Tag,
              },
              {
                  title: "Priority Levels",
                  href: "/system-settings/priority-levels",
                  icon: AlertTriangle,
              },
              {
                  title: "Confidentiality Levels",
                  href: "/system-settings/confidentiality-levels",
                  icon: Lock,
              },
              {
                  title: "Case Statuses",
                  href: "/system-settings/case-statuses",
                  icon: CheckCircle2,
              },
              {
                  title: "Conclusion Types",
                  href: "/system-settings/conclusion-types",
                  icon: CheckSquare,
              },
              {
                  title: "Timeline Event Types",
                  href: "/system-settings/timeline-event-types",
                  icon: Activity,
              },

              // ---------- Referral ----------
              {
                  title: "Referral Types",
                  href: "/system-settings/referral-types",
                  icon: Share2,
              },
              {
                  title: "Urgency Options",
                  href: "/system-settings/urgency-options",
                  icon: Clock,
              },

              // ---------- Person / Demographic ----------
              {
                  title: "ID Types",
                  href: "/system-settings/id-types",
                  icon: IdCard,
              },
              {
                  title: "Disability Types",
                  href: "/system-settings/disability-types",
                  icon: Accessibility,
              },
              {
                  title: "Age Ranges",
                  href: "/system-settings/age-ranges",
                  icon: Users,
              },
              {
                  title: "Gender Options",
                  href: "/system-settings/gender-options",
                  icon: UserRound,
              },
              {
                  title: "Relationship Options",
                  href: "/system-settings/relationship-options",
                  icon: Heart,
              },

              // ---------- Files / Notes ----------
              {
                  title: "File Types",
                  href: "/system-settings/file-types",
                  icon: FileText,
              },
              {
                  title: "Note Types",
                  href: "/system-settings/note-types",
                  icon: StickyNote,
              },
          ] as NavItem[])
        : [];

    const mainNavItems: NavItem[] = [
        { title: "Dashboard", href: dashboard(), icon: LayoutGrid },
        { title: "Survivors", href: "/survivors", icon: Users },
        { title: "GBV Cases", href: "/gbv-cases", icon: Scale },
        { title: "Referrals", href: "/referrals", icon: Share2 },
        { title: "Partners", href: "/partners", icon: UserCheck },
        ...(canSeeSettings && settingsChildren.length > 0
            ? [
                  {
                      title: "Settings",
                      icon: Settings,
                      children: settingsChildren,
                  } satisfies NavItem,
              ]
            : []),
    ].filter((item) => item.children?.length || canSee(item.href));

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} label="Platform" />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
