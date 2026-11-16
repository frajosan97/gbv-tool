import { Link } from "@inertiajs/react";
import { useState } from "react";
import {
    Shield,
    Phone,
    Menu,
    X,
    Globe,
    Moon,
    Sun,
    LogIn,
    Home,
    BookOpen,
    Mail,
    ChevronDown,
    PhoneCall,
} from "lucide-react";
import AppLogo from "@/components/app-logo";
import { useAppearance } from "@/hooks/use-appearance";
import { useLanguage, type LanguageType } from "@/hooks/use-language";
import { useAppData } from "@/hooks/use-app-data";

const NAV_BTN_BASE =
    "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition";

interface GuestHeaderProps {
    scrollToSection: (id: string) => void;
}

export default function GuestHeader({ scrollToSection }: GuestHeaderProps) {
    const { user } = useAppData();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const { t, language, setLanguage } = useLanguage();
    const { resolvedAppearance, updateAppearance } = useAppearance();

    const isDark = resolvedAppearance === "dark";
    const toggleTheme = () => updateAppearance(isDark ? "light" : "dark");

    const languages: LanguageType[] = ["English", "Kiswahili", "Kamba"];

    return (
        <>
            {/* Emergency Bar */}
            <div className="relative z-[60] bg-destructive py-2.5 text-destructive-foreground shadow-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-xs font-semibold tracking-wide sm:px-8 sm:text-[13px] lg:px-12">
                    <div className="flex items-center gap-2">
                        <PhoneCall size={15} className="animate-pulse" />
                        <span className="font-bold">
                            {t("emergency")}: {t("gbvHelpline")} 1195
                        </span>
                        <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm">
                            24/7
                        </span>
                    </div>
                    <div className="hidden items-center gap-5 sm:flex">
                        <a
                            href="tel:1195"
                            className="flex items-center gap-1.5 transition hover:text-white/80"
                        >
                            <Phone size={14} /> {t("gbvHelpline")}: 1195
                        </a>
                        <span className="h-3 w-px bg-white/30" />
                        <a
                            href="tel:999"
                            className="flex items-center gap-1.5 transition hover:text-white/80"
                        >
                            <Shield size={14} /> {t("police")}: 999
                        </a>
                    </div>
                </div>
            </div>

            {/* Navbar */}
            <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
                <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
                    <nav className="flex h-20 items-center justify-between gap-4">
                        {/* Logo → Home link */}
                        <Link
                            href="/"
                            className="flex shrink-0 items-center transition-opacity hover:opacity-80"
                            aria-label="Go to home page"
                        >
                            <AppLogo className="h-12 w-auto sm:h-14" />
                        </Link>

                        {/* Desktop Nav Links */}
                        <div className="hidden items-center gap-1 lg:flex">
                            <Link
                                href="/"
                                className={`${NAV_BTN_BASE} bg-secondary font-bold text-secondary-foreground hover:bg-secondary/80`}
                            >
                                <Home
                                    size={16}
                                    className="text-muted-foreground"
                                />
                                {t("home")}
                            </Link>
                            <button
                                onClick={() =>
                                    scrollToSection("resources-banner")
                                }
                                className={`${NAV_BTN_BASE} font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground`}
                            >
                                <BookOpen size={16} />
                                {t("resources")}
                            </button>
                            <button
                                onClick={() =>
                                    scrollToSection("contact-footer")
                                }
                                className={`${NAV_BTN_BASE} font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground`}
                            >
                                <Mail size={16} />
                                {t("contacts")}
                            </button>
                        </div>

                        {/* Right Actions */}
                        <div className="hidden items-center gap-3 md:flex">
                            <div className="relative">
                                <button
                                    onClick={() =>
                                        setLangDropdownOpen(!langDropdownOpen)
                                    }
                                    className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold text-foreground shadow-sm transition hover:bg-secondary"
                                >
                                    <Globe size={14} className="text-primary" />
                                    {language}
                                    <ChevronDown
                                        size={14}
                                        className={`text-muted-foreground transition-transform ${langDropdownOpen ? "rotate-180" : ""}`}
                                    />
                                </button>

                                {langDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-36 overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
                                        {languages.map((lang) => (
                                            <button
                                                key={lang}
                                                onClick={() => {
                                                    setLanguage(lang);
                                                    setLangDropdownOpen(false);
                                                }}
                                                className={`flex w-full items-center px-4 py-2.5 text-left text-xs font-semibold transition hover:bg-secondary ${
                                                    language === lang
                                                        ? "bg-accent text-accent-foreground"
                                                        : "text-muted-foreground"
                                                }`}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={toggleTheme}
                                className="rounded-lg border border-border bg-card p-2 text-muted-foreground shadow-sm transition hover:bg-secondary"
                                aria-label="Toggle Dark Mode"
                            >
                                {isDark ? (
                                    <Sun size={18} />
                                ) : (
                                    <Moon size={18} />
                                )}
                            </button>

                            {user ? (
                                <Link
                                    href="/dashboard"
                                    className="rounded-lg bg-destructive px-5 py-2.5 text-sm font-bold text-destructive-foreground shadow-md shadow-destructive/20 transition hover:-translate-y-0.5 hover:bg-destructive/90"
                                >
                                    {t("dashboard")}
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-bold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-secondary hover:text-destructive"
                                    >
                                        <LogIn size={16} /> {t("login")}
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="rounded-lg bg-destructive px-5 py-2.5 text-sm font-bold text-destructive-foreground shadow-md shadow-destructive/20 transition hover:-translate-y-0.5 hover:bg-destructive/90"
                                    >
                                        {t("becomePartner")}
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="rounded-lg p-2 text-foreground hover:bg-secondary md:hidden"
                            aria-label="Toggle mobile menu"
                        >
                            {mobileMenuOpen ? (
                                <X size={24} />
                            ) : (
                                <Menu size={24} />
                            )}
                        </button>
                    </nav>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="absolute top-20 left-0 w-full border-b border-border bg-background px-4 py-4 shadow-xl md:hidden">
                        <div className="flex flex-col gap-1">
                            <Link
                                href="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 rounded-lg bg-secondary px-4 py-3 font-semibold text-secondary-foreground"
                            >
                                <Home size={18} /> {t("home")}
                            </Link>
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    scrollToSection("resources-banner");
                                }}
                                className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-muted-foreground hover:bg-secondary"
                            >
                                <BookOpen size={18} /> {t("resources")}
                            </button>
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    scrollToSection("contact-footer");
                                }}
                                className="flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-muted-foreground hover:bg-secondary"
                            >
                                <Mail size={18} /> {t("contacts")}
                            </button>
                        </div>
                        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                            <Link
                                href="/login"
                                className="rounded-lg border border-border px-4 py-2.5 text-center font-bold text-foreground"
                            >
                                {t("login")}
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-lg bg-destructive px-4 py-2.5 text-center font-bold text-destructive-foreground"
                            >
                                {t("becomePartner")}
                            </Link>
                        </div>
                    </div>
                )}
            </header>
        </>
    );
}
