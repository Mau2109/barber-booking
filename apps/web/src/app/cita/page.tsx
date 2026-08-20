'use client';

import { useState } from 'react';

import {
    cancelReservation,
    getReservationsByPhone,
} from '@/services/booking.service';

import { Reservation } from '@/types/booking';

export default function MiCitaPage() {
    // ============================================================
    // ESTADOS
    // ============================================================

    const [phone, setPhone] =
        useState('');

    const [reservations, setReservations] =
        useState<Reservation[]>([]);

    const [loading, setLoading] =
        useState(false);

    const [cancellingId, setCancellingId] =
        useState<string | null>(null);

    const [error, setError] =
        useState<string | null>(null);

    const [searched, setSearched] =
        useState(false);

    // ============================================================
    // FORMATEAR FECHA
    // ============================================================

    const formatDate = (
        value: string,
    ) => {
        const date = new Date(value);

        return date.toLocaleDateString(
            'es-MX',
            {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            },
        );
    };

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
            },
        );
    };

    // ============================================================
    // BUSCAR RESERVACIONES
    // ============================================================

    const handleSearch = async () => {
        const cleanPhone =
            phone.trim();

        if (
            !/^\d{10}$/.test(
                cleanPhone,
            )
        ) {
            setError(
                'Ingresa un número de teléfono de 10 dígitos.',
            );

            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSearched(false);

            const data =
                await getReservationsByPhone(
                    cleanPhone,
                );

            setReservations(data);
            setSearched(true);
        } catch (error) {
            setReservations([]);
            setSearched(true);

            setError(
                error instanceof Error
                    ? error.message
                    : 'No se pudieron consultar tus citas',
            );
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // CANCELAR RESERVACIÓN
    // ============================================================

    const handleCancel =
        async (
            reservationId: string,
        ) => {
            const confirmed =
                window.confirm(
                    '¿Seguro que deseas cancelar esta cita?',
                );

            if (!confirmed) {
                return;
            }

            try {
                setCancellingId(
                    reservationId,
                );

                setError(null);

                const updated =
                    await cancelReservation(
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
                        : 'No se pudo cancelar la cita',
                );
            } finally {
                setCancellingId(
                    null,
                );
            }
        };

    // ============================================================
    // OBTENER TEXTO DEL ESTADO
    // ============================================================

    const getStatusLabel = (
        status: Reservation['status'],
    ) => {
        switch (status) {
            case 'CONFIRMED':
                return 'Confirmada';

            case 'CANCELLED':
                return 'Cancelada';

            case 'COMPLETED':
                return 'Completada';

            default:
                return status;
        }
    };

    // ============================================================
    // PÁGINA
    // ============================================================

    return (
        <main className="min-h-screen bg-zinc-950 text-white">
            <div className="mx-auto max-w-md px-4 py-8">

                <h1 className="text-3xl font-bold">
                    Mi cita
                </h1>

                <p className="mt-2 text-zinc-400">
                    Ingresa el teléfono que utilizaste al hacer tu reservación.
                </p>

                {/* =================================================
                    BUSCADOR
                ================================================= */}

                <section className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5">

                    <label
                        htmlFor="phone"
                        className="block text-sm font-medium"
                    >
                        Teléfono
                    </label>

                    <input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={phone}
                        onChange={(
                            event,
                        ) => {
                            const value =
                                event.target.value.replace(
                                    /\D/g,
                                    '',
                                );

                            setPhone(value);
                        }}
                        placeholder="9511234567"
                        className="
                            mt-2
                            w-full
                            rounded-xl
                            border
                            border-zinc-700
                            bg-zinc-950
                            px-4
                            py-3
                            text-white
                            outline-none
                            transition
                            placeholder:text-zinc-600
                            focus:border-white
                        "
                    />

                    <button
                        type="button"
                        disabled={loading}
                        onClick={
                            handleSearch
                        }
                        className="
                            mt-4
                            w-full
                            rounded-xl
                            bg-white
                            px-4
                            py-4
                            font-semibold
                            text-black
                            transition
                            hover:bg-zinc-200
                            disabled:opacity-50
                        "
                    >
                        {loading
                            ? 'Buscando...'
                            : 'Buscar mis citas'}
                    </button>

                </section>

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
                    SIN RESERVACIONES
                ================================================= */}

                {searched &&
                    !error &&
                    reservations.length ===
                    0 && (
                        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5">

                            <p className="text-zinc-400">
                                No tienes citas registradas.
                            </p>

                        </div>
                    )}

                {/* =================================================
                    LISTA DE RESERVACIONES
                ================================================= */}

                {reservations.length >
                    0 && (
                        <section className="mt-8">

                            <h2 className="text-xl font-semibold">
                                Tus citas
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
                                            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
                                        >

                                            {/* ESTADO */}

                                            <div className="flex items-center justify-between gap-4">

                                                <h3 className="font-semibold">
                                                    {
                                                        reservation
                                                            .service
                                                            .name
                                                    }
                                                </h3>

                                                <span
                                                    className={`
                                                    rounded-full
                                                    px-3
                                                    py-1
                                                    text-xs
                                                    font-semibold
                                                    ${reservation.status ===
                                                            'CONFIRMED'
                                                            ? 'bg-emerald-950 text-emerald-400'
                                                            : reservation.status ===
                                                                'CANCELLED'
                                                                ? 'bg-red-950 text-red-400'
                                                                : 'bg-zinc-800 text-zinc-300'
                                                        }
                                                `}
                                                >
                                                    {getStatusLabel(
                                                        reservation.status,
                                                    )}
                                                </span>

                                            </div>

                                            {/* INFORMACIÓN */}

                                            <div className="mt-5 space-y-3 text-sm">

                                                <p>
                                                    <span className="text-zinc-500">
                                                        Fecha:{' '}
                                                    </span>

                                                    <span className="capitalize">
                                                        {formatDate(
                                                            reservation.startTime,
                                                        )}
                                                    </span>
                                                </p>

                                                <p>
                                                    <span className="text-zinc-500">
                                                        Hora:{' '}
                                                    </span>

                                                    {formatTime(
                                                        reservation.startTime,
                                                    )}
                                                </p>

                                                <p>
                                                    <span className="text-zinc-500">
                                                        Barbero:{' '}
                                                    </span>

                                                    {
                                                        reservation
                                                            .barber
                                                            .name
                                                    }
                                                </p>

                                                <p>
                                                    <span className="text-zinc-500">
                                                        Precio:{' '}
                                                    </span>

                                                    $
                                                    {
                                                        reservation
                                                            .service
                                                            .price
                                                    }
                                                </p>

                                            </div>

                                            {/* CANCELACIÓN */}

                                            {reservation.status ===
                                                'CONFIRMED' && (
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            cancellingId ===
                                                            reservation.id
                                                        }
                                                        onClick={() =>
                                                            handleCancel(
                                                                reservation.id,
                                                            )
                                                        }
                                                        className="
                                                    mt-6
                                                    w-full
                                                    rounded-xl
                                                    border
                                                    border-red-900
                                                    px-4
                                                    py-3
                                                    text-sm
                                                    font-semibold
                                                    text-red-400
                                                    transition
                                                    hover:bg-red-950/40
                                                    disabled:opacity-50
                                                "
                                                    >
                                                        {cancellingId ===
                                                            reservation.id
                                                            ? 'Cancelando...'
                                                            : 'Cancelar cita'}
                                                    </button>
                                                )}

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