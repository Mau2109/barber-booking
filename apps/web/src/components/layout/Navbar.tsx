"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

interface NavLink {
    href: string;
    label: string;
}

const LINKS: NavLink[] = [
    { href: "/", label: "Inicio" },
    { href: "/reservar", label: "Reservar" },
    { href: "/cita", label: "Mi cita" },
];

export function Navbar() {
    const pathname = usePathname();

    if (pathname?.startsWith("/admin")) {
        return null;
    }

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
            <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 px-4 sm:px-6">
                <Link href="/" className="shrink-0">
                    <Logo size={30} nameClassName="hidden sm:inline-block" />
                </Link>

                <ul className="flex items-center gap-0.5 sm:gap-1">
                    {LINKS.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`
                                        relative inline-block whitespace-nowrap px-2.5 py-2.5 text-sm font-medium
                                        transition-colors duration-200
                                        focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2
                                        sm:px-3
                                        ${isActive
                                            ? "text-text-primary blade-line"
                                            : "text-text-muted hover:text-text-primary"
                                        }
                                    `}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </header>
    );
}
