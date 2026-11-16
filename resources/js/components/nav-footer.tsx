import { Link } from "@inertiajs/react";
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { NavItem } from "@/types";

export function NavFooter({
    items,
    className,
}: {
    items: NavItem[];
    className?: string;
}) {
    if (!items.length) return null;

    return (
        <SidebarGroup className={className}>
            <SidebarMenu>
                {items.map((item) => {
                    const Icon = item.icon;

                    const content = (
                        <>
                            {Icon ? <Icon /> : null}
                            <span>{item.title}</span>
                        </>
                    );

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild tooltip={item.title}>
                                {item.href ? (
                                    <Link href={item.href}>{content}</Link>
                                ) : (
                                    <span>{content}</span>
                                )}
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
