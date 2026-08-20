'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
    const router = useRouter();

    const [email, setEmail] =
        useState('');

    const [password, setPassword] =
        useState('');

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError(null);

            const supabase =
                createClient();

            const {
                error,
            } =
                await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

            if (error) {
                throw error;
            }

            router.push(
                '/admin/agenda',
            );

            router.refresh();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'No se pudo iniciar sesión',
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">

            <section className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-6">

                <p className="text-sm text-zinc-500">
                    Administración
                </p>

                <h1 className="mt-1 text-3xl font-bold">
                    Iniciar sesión
                </h1>

                <p className="mt-2 text-sm text-zinc-400">
                    Accede al panel de la barbería.
                </p>

                {error && (
                    <div className="mt-5 rounded-xl border border-red-900 bg-red-950/40 p-4">
                        <p className="text-sm text-red-300">
                            {error}
                        </p>
                    </div>
                )}

                <form
                    onSubmit={
                        handleSubmit
                    }
                    className="mt-6 space-y-4"
                >

                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium"
                        >
                            Correo
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(
                                event,
                            ) =>
                                setEmail(
                                    event.target
                                        .value,
                                )
                            }
                            required
                            autoComplete="email"
                            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium"
                        >
                            Contraseña
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={
                                password
                            }
                            onChange={(
                                event,
                            ) =>
                                setPassword(
                                    event.target
                                        .value,
                                )
                            }
                            required
                            autoComplete="current-password"
                            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-white"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-white px-4 py-4 font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
                    >
                        {loading
                            ? 'Ingresando...'
                            : 'Entrar'}
                    </button>

                </form>

            </section>

        </main>
    );
}