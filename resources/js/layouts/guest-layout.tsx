import { ReactNode } from "react";
import GuestHeader from "./guest/guest-header";
import GuestFooter from "./guest/guest-footer";

interface GuestLayoutProps {
    children: ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
    const scrollToSection = (id: string): void => {
        const element = document.getElementById(id);
        if (!element) return;
        const headerOffset = 100;
        const offsetPosition =
            element.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    };

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-destructive selection:text-destructive-foreground antialiased transition-colors duration-300">
            <GuestHeader scrollToSection={scrollToSection} />
            <main className="flex-grow">{children}</main>
            <GuestFooter />
        </div>
    );
}
