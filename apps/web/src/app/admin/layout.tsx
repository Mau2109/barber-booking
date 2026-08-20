'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();

        await supabase.auth.signOut();

        router.push('/admin/login');
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <header className="border-b border-zinc-800 bg-zinc-950">
                <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">

                    <div>
                        <p className="text-xs uppercase tracking-wider text-zinc-500">
                            Barbería
                        </p>

                        <h1 className="text-xl font-bold">
                            Administración
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">

                        <nav className="flex flex-wrap gap-2">
                            <Link
                                href="/admin/agenda"
                                className="rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                            >
                                Agenda
                            </Link>

                            <Link
                                href="/admin/servicios"
                                className="rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                            >
                                Servicios
                            </Link>

                            <Link
                                href="/admin/barberos"
                                className="rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
                            >
                                Barberos
                            </Link>
                        </nav>

                        <button
                            type="button"
                            onClick={handleLogout}
                            className="
                                rounded-lg
                                border
                                border-red-900
                                px-3
                                py-2
                                text-sm
                                font-medium
                                text-red-400
                                transition
                                hover:bg-red-950/40
                            "
                        >
                            Cerrar sesión
                        </button>

                    </div>
                </div>
            </header>

            {children}
        </div>
    );
}