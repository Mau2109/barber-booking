'use client';

import {
    FormEvent,
    useEffect,
    useState,
} from 'react';

import {
    createBarber,
    getAdminBarbers,
    updateBarber,
} from '@/services/booking.service';

import { Barber } from '@/types/booking';

export default function AdminBarbersPage() {
    // ============================================================
    // ESTADOS
    // ============================================================

    const [barbers, setBarbers] =
        useState<Barber[]>([]);

    const [name, setName] =
        useState('');

    const [editingBarber, setEditingBarber] =
        useState<Barber | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [updatingId, setUpdatingId] =
        useState<string | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    const [success, setSuccess] =
        useState<string | null>(null);

    // ============================================================
    // CARGAR BARBEROS
    // ============================================================

    const loadBarbers = async () => {
        try {
            setLoading(true);
            setError(null);

            const data =
                await getAdminBarbers();

            setBarbers(data);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'No se pudieron cargar los barberos',
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBarbers();
    }, []);

    // ============================================================
    // CREAR / EDITAR
    // ============================================================

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const cleanName =
            name.trim();

        if (!cleanName) {
            setError(
                'El nombre del barbero es obligatorio',
            );

            return;
        }

        try {
            setSaving(true);
            setError(null);
            setSuccess(null);

            if (editingBarber) {
                await updateBarber(
                    editingBarber.id,
                    {
                        name: cleanName,
                    },
                );

                setSuccess(
                    'Barbero actualizado correctamente',
                );
            } else {
                await createBarber({
                    name: cleanName,
                });

                setSuccess(
                    'Barbero creado correctamente',
                );
            }

            setName('');
            setEditingBarber(null);

            await loadBarbers();
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'No se pudo guardar el barbero',
            );
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // EDITAR
    // ============================================================

    const handleEdit = (
        barber: Barber,
    ) => {
        setEditingBarber(barber);
        setName(barber.name);

        setError(null);
        setSuccess(null);

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    // ============================================================
    // ACTIVAR / DESACTIVAR
    // ============================================================

    const handleToggleActive =
        async (
            barber: Barber,
        ) => {
            try {
                setUpdatingId(
                    barber.id,
                );

                setError(null);
                setSuccess(null);

                const updated =
                    await updateBarber(
                        barber.id,
                        {
                            isActive:
                                !barber.isActive,
                        },
                    );

                setBarbers(
                    (current) =>
                        current.map(
                            (item) =>
                                item.id ===
                                    updated.id
                                    ? updated
                                    : item,
                        ),
                );

                setSuccess(
                    updated.isActive
                        ? 'Barbero activado'
                        : 'Barbero desactivado',
                );
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : 'No se pudo actualizar el barbero',
                );
            } finally {
                setUpdatingId(null);
            }
        };

    // ============================================================
    // PÁGINA
    // ============================================================

    return (
        <main className="min-h-screen bg-zinc-950 text-white">
            <div className="mx-auto max-w-6xl px-4 py-8">

                <div>
                    <p className="text-sm font-medium text-zinc-500">
                        Administración
                    </p>

                    <h1 className="mt-1 text-3xl font-bold">
                        Barberos
                    </h1>

                    <p className="mt-2 text-zinc-400">
                        Administra el personal disponible para las reservaciones.
                    </p>
                </div>

                {/* MENSAJES */}

                {error && (
                    <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4">
                        <p className="text-sm text-red-300">
                            {error}
                        </p>
                    </div>
                )}

                {success && (
                    <div className="mt-6 rounded-xl border border-emerald-900 bg-emerald-950/40 p-4">
                        <p className="text-sm text-emerald-300">
                            {success}
                        </p>
                    </div>
                )}

                {/* FORMULARIO */}

                <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">

                    <h2 className="text-xl font-semibold">
                        {editingBarber
                            ? 'Editar barbero'
                            : 'Nuevo barbero'}
                    </h2>

                    <form
                        onSubmit={
                            handleSubmit
                        }
                        className="mt-6 flex flex-col gap-4 md:flex-row"
                    >

                        <input
                            type="text"
                            value={name}
                            onChange={(
                                event,
                            ) =>
                                setName(
                                    event.target
                                        .value,
                                )
                            }
                            placeholder="Nombre del barbero"
                            className="
                                flex-1
                                rounded-xl
                                border
                                border-zinc-700
                                bg-zinc-950
                                px-4
                                py-3
                                text-white
                                outline-none
                                focus:border-white
                            "
                        />

                        <button
                            type="submit"
                            disabled={saving}
                            className="
                                rounded-xl
                                bg-white
                                px-6
                                py-3
                                font-semibold
                                text-black
                                transition
                                hover:bg-zinc-200
                                disabled:opacity-50
                            "
                        >
                            {saving
                                ? 'Guardando...'
                                : editingBarber
                                    ? 'Guardar cambios'
                                    : 'Crear barbero'}
                        </button>

                        {editingBarber && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingBarber(
                                        null,
                                    );

                                    setName('');
                                }}
                                className="
                                    rounded-xl
                                    border
                                    border-zinc-700
                                    px-5
                                    py-3
                                    text-sm
                                    transition
                                    hover:bg-zinc-800
                                "
                            >
                                Cancelar
                            </button>
                        )}

                    </form>

                </section>

                {/* LISTA */}

                <section className="mt-10">

                    <div className="flex items-end justify-between">

                        <div>
                            <h2 className="text-xl font-semibold">
                                Barberos registrados
                            </h2>

                            <p className="mt-1 text-sm text-zinc-400">
                                {barbers.length}{' '}
                                barbero(s)
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={
                                loadBarbers
                            }
                            className="
                                rounded-lg
                                border
                                border-zinc-700
                                px-3
                                py-2
                                text-sm
                                text-zinc-300
                                hover:bg-zinc-800
                            "
                        >
                            Actualizar
                        </button>

                    </div>

                    {loading ? (
                        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                            <p className="text-zinc-400">
                                Cargando barberos...
                            </p>
                        </div>
                    ) : (
                        <div className="mt-4 grid gap-4 md:grid-cols-2">

                            {barbers.map(
                                (barber) => (
                                    <article
                                        key={
                                            barber.id
                                        }
                                        className="
                                            rounded-xl
                                            border
                                            border-zinc-800
                                            bg-zinc-900
                                            p-5
                                        "
                                    >

                                        <div className="flex items-start justify-between gap-4">

                                            <div>
                                                <h3 className="text-lg font-semibold">
                                                    {
                                                        barber.name
                                                    }
                                                </h3>

                                                <span
                                                    className={`
                                                        mt-2
                                                        inline-block
                                                        rounded-full
                                                        px-2.5
                                                        py-1
                                                        text-xs
                                                        font-semibold
                                                        ${barber.isActive
                                                            ? 'bg-emerald-950 text-emerald-400'
                                                            : 'bg-zinc-800 text-zinc-400'
                                                        }
                                                    `}
                                                >
                                                    {barber.isActive
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </span>
                                            </div>

                                        </div>

                                        <div className="mt-6 flex gap-2">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleEdit(
                                                        barber,
                                                    )
                                                }
                                                className="
                                                    flex-1
                                                    rounded-lg
                                                    border
                                                    border-zinc-700
                                                    px-3
                                                    py-2
                                                    text-sm
                                                    font-medium
                                                    hover:bg-zinc-800
                                                "
                                            >
                                                Editar
                                            </button>

                                            <button
                                                type="button"
                                                disabled={
                                                    updatingId ===
                                                    barber.id
                                                }
                                                onClick={() =>
                                                    handleToggleActive(
                                                        barber,
                                                    )
                                                }
                                                className={`
                                                    flex-1
                                                    rounded-lg
                                                    border
                                                    px-3
                                                    py-2
                                                    text-sm
                                                    font-medium
                                                    disabled:opacity-50
                                                    ${barber.isActive
                                                        ? 'border-red-900 text-red-400 hover:bg-red-950/40'
                                                        : 'border-emerald-900 text-emerald-400 hover:bg-emerald-950/40'
                                                    }
                                                `}
                                            >
                                                {updatingId ===
                                                    barber.id
                                                    ? 'Guardando...'
                                                    : barber.isActive
                                                        ? 'Desactivar'
                                                        : 'Activar'}
                                            </button>

                                        </div>

                                    </article>
                                ),
                            )}

                        </div>
                    )}

                </section>

            </div>
        </main>
    );
}