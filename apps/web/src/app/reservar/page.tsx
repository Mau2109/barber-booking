'use client';

import { useEffect, useState } from 'react';

import {
    createReservation,
    getAvailability,
    getServices,
    resolveCustomer,
} from '@/services/booking.service';

import {
    AvailabilitySlot,
    Reservation,
    Service,
} from '@/types/booking';

export default function ReservarPage() {
    // ============================================================
    // 1. ESTADOS GENERALES
    // ============================================================

    const [services, setServices] = useState<Service[]>([]);

    const [selectedService, setSelectedService] =
        useState<Service | null>(null);

    const [selectedDate, setSelectedDate] =
        useState<string | null>(null);

    const [slots, setSlots] =
        useState<AvailabilitySlot[]>([]);

    const [selectedSlot, setSelectedSlot] =
        useState<AvailabilitySlot | null>(null);

    // ============================================================
    // 2. ESTADOS DEL CLIENTE
    // ============================================================

    const [showCustomerForm, setShowCustomerForm] =
        useState(false);

    const [customerName, setCustomerName] =
        useState('');

    const [customerPhone, setCustomerPhone] =
        useState('');

    // ============================================================
    // 3. ESTADO DE LA RESERVACIÓN CREADA
    // ============================================================

    const [reservation, setReservation] =
        useState<Reservation | null>(null);

    // ============================================================
    // 4. ESTADOS DE CARGA
    // ============================================================

    const [loading, setLoading] =
        useState(true);

    const [
        loadingAvailability,
        setLoadingAvailability,
    ] = useState(false);

    const [
        creatingReservation,
        setCreatingReservation,
    ] = useState(false);

    // ============================================================
    // 5. ERROR GENERAL
    // ============================================================

    const [error, setError] =
        useState<string | null>(null);

    // ============================================================
    // 6. CARGAR SERVICIOS
    // ============================================================

    useEffect(() => {
        async function loadServices() {
            try {
                setLoading(true);
                setError(null);

                const data =
                    await getServices();

                setServices(data);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : 'Ocurrió un error al cargar los servicios',
                );
            } finally {
                setLoading(false);
            }
        }

        loadServices();
    }, []);

    // ============================================================
    // 7. GENERAR FECHAS DISPONIBLES
    //
    // Hoy hasta +7 días.
    // La barbería no abre los sábados.
    // ============================================================

    const getAvailableDates = () => {
        const dates: Date[] = [];

        const today = new Date();

        for (let i = 0; i <= 7; i++) {
            const date =
                new Date(today);

            date.setDate(
                today.getDate() + i,
            );

            // 6 = sábado
            if (date.getDay() === 6) {
                continue;
            }

            dates.push(date);
        }

        return dates;
    };

    const availableDates =
        getAvailableDates();

    // ============================================================
    // 8. FORMATEAR FECHA PARA BACKEND
    //
    // Date -> YYYY-MM-DD
    // ============================================================

    const formatDateForApi = (
        date: Date,
    ) => {
        const year =
            date.getFullYear();

        const month = String(
            date.getMonth() + 1,
        ).padStart(2, '0');

        const day = String(
            date.getDate(),
        ).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    // ============================================================
    // 9. FORMATEAR FECHA PARA MOSTRAR AL USUARIO
    // ============================================================

    const formatDateForDisplay = (
        dateString: string,
    ) => {
        const [year, month, day] =
            dateString
                .split('-')
                .map(Number);

        const date = new Date(
            year,
            month - 1,
            day,
        );

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
    // 10. CONSULTAR DISPONIBILIDAD
    //
    // Se ejecuta al cambiar:
    // - servicio
    // - fecha
    // ============================================================

    useEffect(() => {
        if (
            !selectedService ||
            !selectedDate
        ) {
            return;
        }

        async function loadAvailability() {
            try {
                setLoadingAvailability(true);
                setError(null);

                // Reiniciar horario anterior
                setSelectedSlot(null);
                setSlots([]);

                const data =
                    await getAvailability(
                        selectedDate!,
                        selectedService!.id,
                    );

                setSlots(data.slots);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : 'No se pudo consultar la disponibilidad',
                );
            } finally {
                setLoadingAvailability(
                    false,
                );
            }
        }

        loadAvailability();
    }, [
        selectedService,
        selectedDate,
    ]);

    // ============================================================
    // 11. SELECCIONAR SERVICIO
    // ============================================================

    const handleServiceSelect = (
        service: Service,
    ) => {
        setSelectedService(service);

        // Reiniciar pasos posteriores
        setSelectedDate(null);
        setSelectedSlot(null);
        setSlots([]);

        setShowCustomerForm(false);

        setError(null);
    };

    // ============================================================
    // 12. SELECCIONAR FECHA
    // ============================================================

    const handleDateSelect = (
        date: string,
    ) => {
        setSelectedDate(date);

        // Reiniciar horario anterior
        setSelectedSlot(null);
        setSlots([]);

        setShowCustomerForm(false);

        setError(null);
    };

    // ============================================================
    // 13. MOSTRAR FORMULARIO DE CLIENTE
    // ============================================================

    const handleContinue = () => {
        if (
            !selectedService ||
            !selectedDate ||
            !selectedSlot
        ) {
            setError(
                'Selecciona servicio, fecha y horario.',
            );

            return;
        }

        setError(null);
        setShowCustomerForm(true);
    };

    // ============================================================
    // 14. CREAR RESERVACIÓN
    // ============================================================

    const handleCreateReservation =
        async () => {
            // ----------------------------------------------------
            // Validar selección
            // ----------------------------------------------------

            if (
                !selectedService ||
                !selectedDate ||
                !selectedSlot
            ) {
                setError(
                    'Selecciona servicio, fecha y horario.',
                );

                return;
            }

            // ----------------------------------------------------
            // Limpiar datos
            // ----------------------------------------------------

            const name =
                customerName.trim();

            const phone =
                customerPhone.trim();

            // ----------------------------------------------------
            // Validar nombre
            // ----------------------------------------------------

            if (!name) {
                setError(
                    'Ingresa tu nombre.',
                );

                return;
            }

            // ----------------------------------------------------
            // Validar teléfono
            // ----------------------------------------------------

            if (!phone) {
                setError(
                    'Ingresa tu número de teléfono.',
                );

                return;
            }

            if (!/^\d{10}$/.test(phone)) {
                setError(
                    'El teléfono debe contener 10 dígitos.',
                );

                return;
            }

            try {
                setCreatingReservation(true);
                setError(null);

                // =================================================
                // 14.1 BUSCAR O CREAR CLIENTE
                // =================================================

                const customer =
                    await resolveCustomer(
                        name,
                        phone,
                    );

                // =================================================
                // 14.2 CONSTRUIR FECHA/HORA
                //
                // Ejemplo:
                //
                // 2026-08-12
                // +
                // 12:00
                //
                // =
                //
                // 2026-08-12T12:00:00.000Z
                // =================================================

                const startTime =
                    `${selectedDate}T${selectedSlot.start}:00.000Z`;

                // =================================================
                // 14.3 CREAR RESERVACIÓN
                //
                // barberId NO se envía.
                // NestJS lo asigna automáticamente.
                // =================================================

                const createdReservation =
                    await createReservation({
                        customerId:
                            customer.id,

                        serviceId:
                            selectedService.id,

                        startTime,
                    });

                // =================================================
                // 14.4 GUARDAR RESULTADO
                // =================================================

                setReservation(
                    createdReservation,
                );

                setShowCustomerForm(
                    false,
                );
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : 'No se pudo completar la reservación',
                );
            } finally {
                setCreatingReservation(
                    false,
                );
            }
        };

    // ============================================================
    // 15. REINICIAR FLUJO
    // ============================================================

    const handleNewReservation =
        () => {
            setReservation(null);

            setSelectedService(null);
            setSelectedDate(null);
            setSelectedSlot(null);

            setSlots([]);

            setCustomerName('');
            setCustomerPhone('');

            setShowCustomerForm(false);

            setError(null);
        };

    // ============================================================
    // 16. CARGA INICIAL
    // ============================================================

    if (loading) {
        return (
            <main className="min-h-screen bg-zinc-950 p-6 text-white">
                <div className="mx-auto max-w-md">
                    <p className="text-zinc-400">
                        Cargando servicios...
                    </p>
                </div>
            </main>
        );
    }

    // ============================================================
    // 17. PÁGINA
    // ============================================================

    return (
        <main className="min-h-screen bg-zinc-950 text-white">
            <div className="mx-auto max-w-md px-4 py-8">

                {/* =================================================
                    CONFIRMACIÓN FINAL
                ================================================= */}

                {reservation ? (
                    <section className="rounded-2xl border border-emerald-800 bg-emerald-950/30 p-6">

                        <div className="text-center">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl font-bold text-black">
                                ✓
                            </div>

                            <h1 className="mt-5 text-3xl font-bold">
                                ¡Cita confirmada!
                            </h1>

                            <p className="mt-2 text-sm text-zinc-300">
                                Tu reservación fue registrada correctamente.
                            </p>

                        </div>

                        {/* DATOS DE LA RESERVACIÓN */}

                        <div className="mt-8 space-y-4 rounded-xl bg-zinc-950/60 p-5">

                            <div>
                                <p className="text-xs uppercase text-zinc-500">
                                    Cliente
                                </p>

                                <p className="mt-1 font-semibold">
                                    {
                                        reservation
                                            .customer
                                            .name
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-xs uppercase text-zinc-500">
                                    Servicio
                                </p>

                                <p className="mt-1 font-semibold">
                                    {
                                        reservation
                                            .service
                                            .name
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-xs uppercase text-zinc-500">
                                    Fecha
                                </p>

                                <p className="mt-1 capitalize">
                                    {selectedDate
                                        ? formatDateForDisplay(
                                            selectedDate,
                                        )
                                        : ''}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs uppercase text-zinc-500">
                                    Hora
                                </p>

                                <p className="mt-1 font-semibold">
                                    {
                                        selectedSlot?.start
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-xs uppercase text-zinc-500">
                                    Barbero asignado
                                </p>

                                <p className="mt-1">
                                    {
                                        reservation
                                            .barber
                                            .name
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-xs uppercase text-zinc-500">
                                    Precio
                                </p>

                                <p className="mt-1 font-semibold">
                                    $
                                    {
                                        reservation
                                            .service
                                            .price
                                    }
                                </p>
                            </div>

                            <div>
                                <p className="text-xs uppercase text-zinc-500">
                                    Estado
                                </p>

                                <p className="mt-1 font-semibold text-emerald-400">
                                    Confirmada
                                </p>
                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={
                                handleNewReservation
                            }
                            className="
                                mt-8
                                w-full
                                rounded-xl
                                bg-white
                                px-4
                                py-4
                                font-semibold
                                text-black
                                transition
                                hover:bg-zinc-200
                            "
                        >
                            Hacer otra reservación
                        </button>

                    </section>
                ) : (
                    <>
                        {/* =================================================
                            ENCABEZADO
                        ================================================= */}

                        <h1 className="text-3xl font-bold">
                            Reserva tu cita
                        </h1>

                        <p className="mt-2 text-zinc-400">
                            Selecciona el servicio,
                            la fecha y el horario
                            que prefieras.
                        </p>

                        {/* =================================================
                            ERROR GENERAL
                        ================================================= */}

                        {error && (
                            <div className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4">
                                <p className="text-sm text-red-300">
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* =================================================
                            PASO 1 - SERVICIO
                        ================================================= */}

                        <section className="mt-8">

                            <h2 className="text-xl font-semibold">
                                1. Selecciona un servicio
                            </h2>

                            <div className="mt-4 space-y-4">

                                {services.map(
                                    (
                                        service,
                                    ) => {
                                        const selected =
                                            selectedService?.id ===
                                            service.id;

                                        return (
                                            <button
                                                key={
                                                    service.id
                                                }
                                                type="button"
                                                onClick={() =>
                                                    handleServiceSelect(
                                                        service,
                                                    )
                                                }
                                                className={`
                                                    w-full
                                                    rounded-xl
                                                    border
                                                    p-5
                                                    text-left
                                                    transition
                                                    ${selected
                                                        ? 'border-white bg-zinc-800'
                                                        : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800'
                                                    }
                                                `}
                                            >

                                                <div className="flex items-start justify-between gap-4">

                                                    <div>

                                                        <h3 className="text-lg font-semibold">
                                                            {
                                                                service.name
                                                            }
                                                        </h3>

                                                        {service.description && (
                                                            <p className="mt-1 text-sm text-zinc-400">
                                                                {
                                                                    service.description
                                                                }
                                                            </p>
                                                        )}

                                                        <p className="mt-3 text-sm text-zinc-300">
                                                            {
                                                                service.durationMinutes
                                                            }{' '}
                                                            minutos
                                                        </p>

                                                    </div>

                                                    <span className="font-semibold">
                                                        $
                                                        {
                                                            service.price
                                                        }
                                                    </span>

                                                </div>

                                            </button>
                                        );
                                    },
                                )}

                            </div>

                        </section>

                        {/* =================================================
                            PASO 2 - FECHA
                        ================================================= */}

                        {selectedService && (
                            <section className="mt-10">

                                <h2 className="text-xl font-semibold">
                                    2. Selecciona una fecha
                                </h2>

                                <p className="mt-1 text-sm text-zinc-400">
                                    Puedes reservar desde hoy
                                    hasta 7 días después.
                                </p>

                                <div className="mt-4 grid grid-cols-2 gap-3">

                                    {availableDates.map(
                                        (
                                            date,
                                        ) => {
                                            const value =
                                                formatDateForApi(
                                                    date,
                                                );

                                            const selected =
                                                selectedDate ===
                                                value;

                                            return (
                                                <button
                                                    key={
                                                        value
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        handleDateSelect(
                                                            value,
                                                        )
                                                    }
                                                    className={`
                                                        rounded-xl
                                                        border
                                                        p-4
                                                        text-left
                                                        transition
                                                        ${selected
                                                            ? 'border-white bg-zinc-800'
                                                            : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800'
                                                        }
                                                    `}
                                                >

                                                    <p className="font-semibold capitalize">
                                                        {date.toLocaleDateString(
                                                            'es-MX',
                                                            {
                                                                weekday:
                                                                    'long',
                                                            },
                                                        )}
                                                    </p>

                                                    <p className="mt-1 text-sm text-zinc-400">
                                                        {date.toLocaleDateString(
                                                            'es-MX',
                                                            {
                                                                day: 'numeric',
                                                                month: 'short',
                                                            },
                                                        )}
                                                    </p>

                                                </button>
                                            );
                                        },
                                    )}

                                </div>

                            </section>
                        )}

                        {/* =================================================
                            PASO 3 - HORARIO
                        ================================================= */}

                        {selectedService &&
                            selectedDate && (
                                <section className="mt-10">

                                    <h2 className="text-xl font-semibold">
                                        3. Selecciona un horario
                                    </h2>

                                    <p className="mt-1 text-sm text-zinc-400">
                                        Solo se muestran
                                        horarios disponibles.
                                    </p>

                                    {/* CARGANDO */}

                                    {loadingAvailability && (
                                        <p className="mt-4 text-zinc-400">
                                            Consultando horarios...
                                        </p>
                                    )}

                                    {/* HORARIOS */}

                                    {!loadingAvailability && (
                                        <>
                                            {slots.filter(
                                                (
                                                    slot,
                                                ) =>
                                                    slot.available,
                                            ).length >
                                                0 ? (
                                                <div className="mt-4 grid grid-cols-3 gap-3">

                                                    {slots
                                                        .filter(
                                                            (
                                                                slot,
                                                            ) =>
                                                                slot.available,
                                                        )
                                                        .map(
                                                            (
                                                                slot,
                                                            ) => {
                                                                const selected =
                                                                    selectedSlot?.start ===
                                                                    slot.start;

                                                                return (
                                                                    <button
                                                                        key={
                                                                            slot.start
                                                                        }
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setSelectedSlot(
                                                                                slot,
                                                                            );

                                                                            setShowCustomerForm(
                                                                                false,
                                                                            );

                                                                            setError(
                                                                                null,
                                                                            );
                                                                        }}
                                                                        className={`
                                                                            rounded-xl
                                                                            border
                                                                            px-3
                                                                            py-3
                                                                            text-sm
                                                                            font-semibold
                                                                            transition
                                                                            ${selected
                                                                                ? 'border-white bg-white text-black'
                                                                                : 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800'
                                                                            }
                                                                        `}
                                                                    >
                                                                        {
                                                                            slot.start
                                                                        }
                                                                    </button>
                                                                );
                                                            },
                                                        )}

                                                </div>
                                            ) : (
                                                <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4">

                                                    <p className="text-sm text-zinc-400">
                                                        No hay horarios disponibles para esta fecha.
                                                    </p>

                                                </div>
                                            )}
                                        </>
                                    )}

                                </section>
                            )}

                        {/* =================================================
                            PASO 4 - RESUMEN
                        ================================================= */}

                        {selectedService &&
                            selectedDate &&
                            selectedSlot &&
                            !showCustomerForm && (
                                <section className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900 p-5">

                                    <h2 className="text-lg font-semibold">
                                        Tu selección
                                    </h2>

                                    <div className="mt-4 space-y-2 text-sm">

                                        <p>
                                            <span className="text-zinc-400">
                                                Servicio:{' '}
                                            </span>

                                            {
                                                selectedService.name
                                            }
                                        </p>

                                        <p>
                                            <span className="text-zinc-400">
                                                Fecha:{' '}
                                            </span>

                                            <span className="capitalize">
                                                {formatDateForDisplay(
                                                    selectedDate,
                                                )}
                                            </span>
                                        </p>

                                        <p>
                                            <span className="text-zinc-400">
                                                Hora:{' '}
                                            </span>

                                            {
                                                selectedSlot.start
                                            }
                                        </p>

                                        <p>
                                            <span className="text-zinc-400">
                                                Duración:{' '}
                                            </span>

                                            {
                                                selectedService.durationMinutes
                                            }{' '}
                                            minutos
                                        </p>

                                        <p>
                                            <span className="text-zinc-400">
                                                Precio:{' '}
                                            </span>

                                            $
                                            {
                                                selectedService.price
                                            }
                                        </p>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={
                                            handleContinue
                                        }
                                        className="
                                            mt-6
                                            w-full
                                            rounded-xl
                                            bg-white
                                            px-4
                                            py-4
                                            font-semibold
                                            text-black
                                            transition
                                            hover:bg-zinc-200
                                        "
                                    >
                                        Continuar
                                    </button>

                                </section>
                            )}

                        {/* =================================================
                            PASO 5 - DATOS DEL CLIENTE
                        ================================================= */}

                        {showCustomerForm &&
                            selectedService &&
                            selectedDate &&
                            selectedSlot && (
                                <section className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900 p-5">

                                    <h2 className="text-xl font-semibold">
                                        4. Tus datos
                                    </h2>

                                    <p className="mt-1 text-sm text-zinc-400">
                                        Ingresa tus datos para
                                        confirmar la cita.
                                    </p>

                                    {/* NOMBRE */}

                                    <div className="mt-6">

                                        <label
                                            htmlFor="name"
                                            className="mb-2 block text-sm font-medium"
                                        >
                                            Nombre
                                        </label>

                                        <input
                                            id="name"
                                            type="text"
                                            value={
                                                customerName
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                setCustomerName(
                                                    event
                                                        .target
                                                        .value,
                                                )
                                            }
                                            placeholder="Tu nombre"
                                            autoComplete="name"
                                            className="
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

                                    </div>

                                    {/* TELÉFONO */}

                                    <div className="mt-4">

                                        <label
                                            htmlFor="phone"
                                            className="mb-2 block text-sm font-medium"
                                        >
                                            Teléfono
                                        </label>

                                        <input
                                            id="phone"
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={
                                                10
                                            }
                                            value={
                                                customerPhone
                                            }
                                            onChange={(
                                                event,
                                            ) => {
                                                const value =
                                                    event.target.value.replace(
                                                        /\D/g,
                                                        '',
                                                    );

                                                setCustomerPhone(
                                                    value,
                                                );
                                            }}
                                            placeholder="9511234567"
                                            autoComplete="tel"
                                            className="
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

                                        <p className="mt-2 text-xs text-zinc-500">
                                            Ingresa 10 dígitos.
                                        </p>

                                    </div>

                                    {/* RESUMEN PEQUEÑO */}

                                    <div className="mt-6 rounded-xl bg-zinc-950 p-4 text-sm">

                                        <p>
                                            {
                                                selectedService.name
                                            }
                                            {' · '}
                                            {
                                                selectedSlot.start
                                            }
                                        </p>

                                        <p className="mt-1 capitalize text-zinc-400">
                                            {formatDateForDisplay(
                                                selectedDate,
                                            )}
                                        </p>

                                    </div>

                                    {/* CONFIRMAR */}

                                    <button
                                        type="button"
                                        disabled={
                                            creatingReservation
                                        }
                                        onClick={
                                            handleCreateReservation
                                        }
                                        className="
                                            mt-6
                                            w-full
                                            rounded-xl
                                            bg-white
                                            px-4
                                            py-4
                                            font-semibold
                                            text-black
                                            transition
                                            hover:bg-zinc-200
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                        "
                                    >
                                        {creatingReservation
                                            ? 'Reservando...'
                                            : 'Confirmar reservación'}
                                    </button>

                                    {/* REGRESAR */}

                                    <button
                                        type="button"
                                        disabled={
                                            creatingReservation
                                        }
                                        onClick={() => {
                                            setShowCustomerForm(
                                                false,
                                            );

                                            setError(
                                                null,
                                            );
                                        }}
                                        className="
                                            mt-3
                                            w-full
                                            rounded-xl
                                            border
                                            border-zinc-700
                                            px-4
                                            py-3
                                            text-sm
                                            font-medium
                                            transition
                                            hover:bg-zinc-800
                                            disabled:opacity-50
                                        "
                                    >
                                        Regresar
                                    </button>

                                </section>
                            )}
                    </>
                )}

            </div>
        </main>
    );
}