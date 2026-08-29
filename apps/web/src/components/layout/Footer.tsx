"use client";

import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

/**
 * Enlaces de redes sociales y WhatsApp.
 *
 * Reemplaza los "#" por tus enlaces reales:
 * - instagram: URL de tu perfil de Instagram
 * - facebook: URL de tu página de Facebook
 * - tiktok: URL de tu perfil de TikTok
 * - whatsapp: usa el formato https://wa.me/52XXXXXXXXXX (con código de país,
 *   sin espacios ni signos). Ej: https://wa.me/529511234567
 */
const SOCIAL_LINKS = {
    instagram: "#",
    facebook: "#",
    tiktok: "#",
    whatsapp: "#",
};

function InstagramIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
        </svg>
    );
}

function FacebookIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path
                d="M14 8.5h2V5.5h-2c-1.9 0-3.5 1.6-3.5 3.5v2H8.5v3H10.5V21h3v-7h2l0.5-3h-2.5v-2c0-0.4 0.3-0.5 0.5-0.5Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function TikTokIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path
                d="M14 4v10.2a2.8 2.8 0 1 1-2-2.68"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <path
                d="M14 4c0 2.2 1.8 4 4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </svg>
    );
}

function WhatsappIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path
                d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
            />
            <path
                d="M8.5 8.8c0-.4.4-1 .8-1s.7 0 .9.4c.2.5.6 1.5.6 1.6.1.1.1.3 0 .4-.1.2-.2.3-.3.4-.1.2-.3.3-.1.6.2.4 1 1.5 2.1 2 .3.2.5.1.6 0 .2-.2.6-.7.8-.9.1-.2.3-.2.5-.1.2.1 1.4.7 1.6.8.2.1.4.2.4.3 0 .2 0 .8-.3 1.2-.3.5-1.3.9-1.8.9-.5 0-1 .1-3.3-.8-2.8-1.1-4.5-4-4.6-4.2-.1-.2-.9-1.2-.9-2.3Z"
                fill="currentColor"
            />
        </svg>
    );
}

const SOCIAL_ITEMS = [
    { key: "instagram" as const, label: "Instagram", Icon: InstagramIcon },
    { key: "facebook" as const, label: "Facebook", Icon: FacebookIcon },
    { key: "tiktok" as const, label: "TikTok", Icon: TikTokIcon },
];

export function Footer() {
    const pathname = usePathname();

    if (pathname?.startsWith("/admin")) {
        return null;
    }

    return (
        <footer className="border-t border-border bg-background">
            <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6">
                <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
                    <Logo size={34} />

                    <div className="space-y-1">
                        <p className="text-sm font-medium text-text-primary">
                            Chalcatongo de Hidalgo, Tlaxiaco, Oaxaca
                        </p>
                        <p className="text-sm text-text-muted">
                            Cortes de precisión, atención de barbero.
                        </p>
                    </div>

                    {/* Redes sociales */}
                    <div className="flex items-center gap-3">
                        {SOCIAL_ITEMS.map(({ key, label, Icon }) => (
                            <a
                                key={key}
                                href={SOCIAL_LINKS[key]}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={label}
                                className="
                                    flex h-10 w-10 items-center justify-center rounded-lg
                                    border border-border bg-surface text-text-muted
                                    transition-colors duration-200
                                    hover:border-accent/40 hover:text-accent
                                    focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2
                                "
                            >
                                <Icon />
                            </a>
                        ))}
                    </div>

                    {/* WhatsApp — botón destacado */}
                    <a
                        href={SOCIAL_LINKS.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                            inline-flex items-center gap-2 rounded-lg border border-border-strong
                            bg-surface px-4 py-2.5 text-sm font-medium text-text-primary
                            transition-colors duration-200
                            hover:border-accent/40 hover:bg-surface-elevated
                            focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2
                        "
                    >
                        <WhatsappIcon />
                        Escríbenos por WhatsApp
                    </a>
                </div>

                <p className="mt-9 text-center text-xs text-text-subtle sm:text-left">
                    © {new Date().getFullYear()} Deluxe Barber. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    );
}
