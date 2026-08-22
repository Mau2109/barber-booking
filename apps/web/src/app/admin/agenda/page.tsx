'use client';

import { useEffect, useState } from 'react';

import {
    completeReservation,
    getReservationsByDate,
} from '@/services/booking.service';

import { Reservation } from '@/types/booking';

export default function AdminAgendaPage() {
    // ============================================================
    // ESTADOS
    // ============================================================

    const [selectedDate, setSelectedDate] =
        useState('');

    const [reservations, setReservations] =
        useState<Reservation[]>([]);

    const [loading, setLoading] =
        useState(false);

    const [completingId, setCompletingId] =
        useState<string | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    // ============================================================
    // DEFINIR HOY COMO FECHA INICIAL
    // ============================================================

    useEffect(() => {
        const now = new Date();

        const year =
            now.getFullYear();

        const month = String(
            now.getMonth() + 1,
        ).padStart(2, '0');

        const day = String(
            now.getDate(),
        ).padStart(2, '0');

        setSelectedDate(
            `${year}-${month}-${day}`,
        );
    }, []);

    // ============================================================
    // CONSULTAR AGENDA
    // ============================================================

    useEffect(() => {
        if (!selectedDate) {
            return;
        }

        async function loadAgenda() {
            try {
                setLoading(true);
                setError(null);

                const data =
                    await getReservationsByDate(
                        selectedDate,
                    );

                setReservations(data);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : 'No se pudo cargar la agenda',
                );

                setReservations([]);
            } finally {
                setLoading(false);
            }
        }

        loadAgenda();
    }, [selectedDate]);

    // ============================================================
    // FORMATEAR HORA
    // ============================================================

    const formatTime = (
        value: string,
    ) => {
        const date = new Date(value);

        return date.toLocaleTimeString(
            'es-MX',
            {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
                timeZone:
                    'America/Mexico_City',
            },
        );
    };
    // ============================================================
    // ESTADO EN ESPAÑOL
    // ============================================================

    const getStatusLabel = (
        status: Reservation['status'],
    ) => {
        switch (status) {
            case 'CONFIRMED':
                return 'Confirmada';

            case 'COMPLETED':
                return 'Completada';

            case 'CANCELLED':
                return 'Cancelada';

            default:
                return status;
        }
    };

    // ============================================================
    // MARCAR COMO COMPLETADA
    // ============================================================

    const handleComplete =
        async (
            reservationId: string,
        ) => {
            const confirmed =
                window.confirm(
                    '¿Deseas marcar esta cita como completada?',
                );

            if (!confirmed) {
                return;
            }

            try {
                setCompletingId(
                    reservationId,
                );

                setError(null);

                const updated =
                    await completeReservation(
                        reservationId,
                    );

                setReservations(
                    (current) =>
                        current.map(
                            (reservation) =>
                                reservation.id ===
                                    updated.id
                                    ? updated
                                    : reservation,
                        ),
                );
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : 'No se pudo completar la cita',
                );
            } finally {
                setCompletingId(null);
            }
        };

    // ============================================================
    // CONTADORES
    // ============================================================

    const confirmedCount =
        reservations.filter(
            (reservation) =>
                reservation.status ===
                'CONFIRMED',
        ).length;

    const completedCount =
        reservations.filter(
            (reservation) =>
                reservation.status ===
                'COMPLETED',
        ).length;

    const cancelledCount =
        reservations.filter(
            (reservation) =>
                reservation.status ===
                'CANCELLED',
        ).length;

    // ============================================================
    // PÁGINA
    // ============================================================

    return (
        <main className="min-h-screen bg-zinc-950 text-white">
            <div className="mx-auto max-w-5xl px-4 py-8">

                {/* =================================================
                    ENCABEZADO
                ================================================= */}

                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

                    <div>
                        <p className="text-sm font-medium text-zinc-500">
                            Administración
                        </p>

                        <h1 className="mt-1 text-3xl font-bold">
                            Agenda
                        </h1>

                        <p className="mt-2 text-zinc-400">
                            Consulta y administra las citas de la barbería.
                        </p>
                    </div>

                    {/* FECHA */}

                    <div>
                        <label
                            htmlFor="agenda-date"
                            className="mb-2 block text-sm text-zinc-400"
                        >
                            Fecha
                        </label>

                        <input
                            id="agenda-date"
                            type="date"
                            value={
                                selectedDate
                            }
                            onChange={(
                                event,
                            ) =>
                                setSelectedDate(
                                    event
                                        .target
                                        .value,
                                )
                            }
                            className="
                                rounded-xl
                                border
                                border-zinc-700
                                bg-zinc-900
                                px-4
                                py-3
                                text-white
                                outline-none
                                transition
                                focus:border-white
                            "
                        />
                    </div>

                </div>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4">
                        <p className="text-sm text-red-300">
                            {error}
                        </p>
                    </div>
                )}

                {/* =================================================
                    RESUMEN DEL DÍA
                ================================================= */}

                <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                        <p className="text-sm text-zinc-500">
                            Total
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                            {
                                reservations.length
                            }
                        </p>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                        <p className="text-sm text-zinc-500">
                            Confirmadas
                        </p>

                        <p className="mt-1 text-2xl font-bold text-emerald-400">
                            {
                                confirmedCount
                            }
                        </p>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                        <p className="text-sm text-zinc-500">
                            Completadas
                        </p>

                        <p className="mt-1 text-2xl font-bold text-blue-400">
                            {
                                completedCount
                            }
                        </p>
                    </div>

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
                        <p className="text-sm text-zinc-500">
                            Canceladas
                        </p>

                        <p className="mt-1 text-2xl font-bold text-red-400">
                            {
                                cancelledCount
                            }
                        </p>
                    </div>

                </section>

                {/* =================================================
                    CARGANDO
                ================================================= */}

                {loading && (
                    <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                        <p className="text-zinc-400">
                            Cargando agenda...
                        </p>
                    </div>
                )}

                {/* =================================================
                    SIN CITAS
                ================================================= */}

                {!loading &&
                    reservations.length ===
                    0 && (
                        <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center">

                            <h2 className="text-lg font-semibold">
                                No hay citas
                            </h2>

                            <p className="mt-2 text-sm text-zinc-400">
                                No hay reservaciones registradas para esta fecha.
                            </p>

                        </div>
                    )}

                {/* =================================================
                    AGENDA
                ================================================= */}

                {!loading &&
                    reservations.length >
                    0 && (
                        <section className="mt-8">

                            <h2 className="text-xl font-semibold">
                                Citas del día
                            </h2>

                            <div className="mt-4 space-y-4">

                                {reservations.map(
                                    (
                                        reservation,
                                    ) => (
                                        <article
                                            key={
                                                reservation.id
                                            }
                                            className="
                                                rounded-xl
                                                border
                                                border-zinc-800
                                                bg-zinc-900
                                                p-5
                                            "
                                        >

                                            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                                                {/* INFORMACIÓN PRINCIPAL */}

                                                <div className="flex gap-5">

                                                    {/* HORA */}

                                                    <div className="min-w-20">

                                                        <p className="text-xl font-bold">
                                                            {formatTime(
                                                                reservation.startTime,
                                                            )}
                                                        </p>

                                                        <p className="mt-1 text-xs text-zinc-500">
                                                            hasta{' '}
                                                            {formatTime(
                                                                reservation.endTime,
                                                            )}
                                                        </p>

                                                    </div>

                                                    {/* CITA */}

                                                    <div>

                                                        <div className="flex flex-wrap items-center gap-2">

                                                            <h3 className="font-semibold">
                                                                {
                                                                    reservation
                                                                        .customer
                                                                        .name
                                                                }
                                                            </h3>

                                                            <span
                                                                className={`
                                                                    rounded-full
                                                                    px-2.5
                                                                    py-1
                                                                    text-xs
                                                                    font-semibold
                                                                    ${reservation.status ===
                                                                        'CONFIRMED'
                                                                        ? 'bg-emerald-950 text-emerald-400'
                                                                        : reservation.status ===
                                                                            'COMPLETED'
                                                                            ? 'bg-blue-950 text-blue-400'
                                                                            : 'bg-red-950 text-red-400'
                                                                    }
                                                                `}
                                                            >
                                                                {getStatusLabel(
                                                                    reservation.status,
                                                                )}
                                                            </span>

                                                        </div>

                                                        <p className="mt-2 text-sm text-zinc-300">
                                                            {
                                                                reservation
                                                                    .service
                                                                    .name
                                                            }
                                                        </p>

                                                        <div className="mt-2 space-y-1 text-sm text-zinc-500">

                                                            <p>
                                                                Tel:{' '}
                                                                {
                                                                    reservation
                                                                        .customer
                                                                        .phone
                                                                }
                                                            </p>

                                                            <p>
                                                                Barbero:{' '}
                                                                {
                                                                    reservation
                                                                        .barber
                                                                        .name
                                                                }
                                                            </p>

                                                            <p>
                                                                Precio: $
                                                                {
                                                                    reservation
                                                                        .service
                                                                        .price
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                </div>

                                                {/* ACCIONES */}

                                                {reservation.status ===
                                                    'CONFIRMED' && (
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                completingId ===
                                                                reservation.id
                                                            }
                                                            onClick={() =>
                                                                handleComplete(
                                                                    reservation.id,
                                                                )
                                                            }
                                                            className="
                                                            rounded-xl
                                                            bg-white
                                                            px-5
                                                            py-3
                                                            text-sm
                                                            font-semibold
                                                            text-black
                                                            transition
                                                            hover:bg-zinc-200
                                                            disabled:opacity-50
                                                        "
                                                        >
                                                            {completingId ===
                                                                reservation.id
                                                                ? 'Guardando...'
                                                                : 'Marcar completada'}
                                                        </button>
                                                    )}

                                            </div>

                                        </article>
                                    ),
                                )}

                            </div>

                        </section>
                    )}

            </div>
        </main>
    );
}