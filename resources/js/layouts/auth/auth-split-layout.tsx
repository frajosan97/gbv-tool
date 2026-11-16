import { Link } from "@inertiajs/react";
import { Shield, Heart, PhoneCall, Lock } from "lucide-react";
import AppLogo from "@/components/app-logo";
import { home } from "@/routes";
import type { AuthLayoutProps } from "@/types";

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="relative grid h-dvh flex-col items-center justify-center bg-background font-sans text-foreground selection:bg-destructive selection:text-destructive-foreground antialiased transition-colors duration-300 px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* ============ LEFT BRAND PANEL ============ */}
            <div className="relative hidden h-full flex-col bg-primary p-10 text-primary-foreground lg:flex dark:border-r dark:border-border">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />

                {/* Decorative Patterns */}
                <div className="pointer-events-none absolute inset-0 z-0 opacity-10">
                    <svg
                        width="100%"
                        height="100%"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <pattern
                                id="dots"
                                x="0"
                                y="0"
                                width="20"
                                height="20"
                                patternUnits="userSpaceOnUse"
                            >
                                <circle
                                    cx="2"
                                    cy="2"
                                    r="1.5"
                                    fill="currentColor"
                                />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#dots)" />
                    </svg>
                </div>
                <div className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-brand-red/10 blur-[120px]" />
                <div className="pointer-events-none absolute bottom-0 -left-40 h-[500px] w-[500px] rounded-full bg-primary-foreground/10 blur-[100px]" />

                <Link
                    href={home()}
                    className="relative z-20 flex items-center transition-opacity hover:opacity-80"
                >
                    <AppLogo className="h-12 w-auto sm:h-14" />
                </Link>

                {/* Hero Content on Left Panel */}
                <div className="relative z-20 mt-auto">
                    <div className="mb-6 flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/10 px-3.5 py-1.5 text-xs font-bold tracking-wide shadow-sm backdrop-blur-sm">
                            <Shield size={14} /> Kitui County
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive px-3.5 py-1.5 text-xs font-bold tracking-wide text-destructive-foreground shadow-sm">
                            <Heart size={14} /> Emergency 24/7
                        </span>
                    </div>

                    <h2 className="mb-4 text-4xl font-extrabold leading-[1.1] tracking-tight">
                        Gender-Based Violence <br />
                        <span className="bg-gradient-to-r from-primary-foreground/80 to-brand-amber bg-clip-text text-transparent">
                            Information System
                        </span>
                    </h2>

                    <p className="mb-8 max-w-md text-sm leading-relaxed text-primary-foreground/80">
                        A secure, confidential platform dedicated to supporting
                        survivors and coordinating response across Kitui County.
                    </p>

                    <div className="flex items-center gap-4 rounded-xl border border-primary-foreground/10 bg-primary-foreground/5 p-4 backdrop-blur-sm">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive text-destructive-foreground">
                            <PhoneCall size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Emergency: 1195</p>
                            <p className="text-[11px] font-medium text-primary-foreground/70">
                                GBV Helpline · 24/7
                            </p>
                        </div>
                        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-primary-foreground/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                            <Lock size={10} /> Secure
                        </span>
                    </div>
                </div>
            </div>

            {/* ============ RIGHT FORM PANEL ============ */}
            <div className="relative flex w-full flex-col lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 py-16 sm:w-[350px] lg:py-0">
                    {/* Mobile Logo */}
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <AppLogo className="h-12 w-auto sm:h-14" />
                    </Link>

                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-extrabold tracking-tight">
                            {title}
                        </h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
