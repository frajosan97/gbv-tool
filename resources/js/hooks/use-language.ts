import { useSyncExternalStore } from "react";
import { translations } from "@/lib/translations";

export type LanguageType = keyof typeof translations;

const STORAGE_KEY = "language";

const listeners = new Set<() => void>();
let currentLanguage: LanguageType = "English";

const isLanguage = (v: unknown): v is LanguageType =>
    typeof v === "string" && v in translations;

const getStoredLanguage = (): LanguageType => {
    if (typeof window === "undefined") return "English";
    const stored = localStorage.getItem(STORAGE_KEY);
    return isLanguage(stored) ? stored : "English";
};

const setCookie = (name: string, value: string, days = 365): void => {
    if (typeof document === "undefined") return;
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const notify = (): void => listeners.forEach((l) => l());

const subscribe = (cb: () => void) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
};

export function initializeLanguage(): void {
    if (typeof window === "undefined") return;
    currentLanguage = getStoredLanguage();
    setCookie(STORAGE_KEY, currentLanguage);
}

export function useLanguage() {
    const language: LanguageType = useSyncExternalStore(
        subscribe,
        () => currentLanguage,
        () => "English" as LanguageType,
    );

    const setLanguage = (lang: LanguageType): void => {
        currentLanguage = lang;
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, lang);
        }
        setCookie(STORAGE_KEY, lang);
        notify();
    };

    const t = (key: keyof (typeof translations)["English"]): string =>
        translations[language][key] ?? String(key);

    return { language, setLanguage, t } as const;
}