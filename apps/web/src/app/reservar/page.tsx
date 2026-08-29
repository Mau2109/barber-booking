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

import { Button } from '@/components/ui/Button';
import { ServiceCardSkeleton, TimeSlotSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { ServiceCard } from '@/components/booking/ServiceCard';
import { DateSelector } from '@/components/booking/DateSelector';
import { TimeSlotGrid } from '@/components/booking/TimeSlot';
import { StepHeading } from '@/components/booking/StepHeading';

export default function ReservarPage() {
    // ============================================================
    // 1. ESTADOS GENERALES
    // ============================================================

    const { showToast } = useToast();

    const [services, setServices] =
        useState<Service[]>([]);

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

    const [loadingAvailability, setLoadingAvailability] =
        useState(false);

    const [creatingReservation, setCreatingReservation] =
        useState(false);

    // ============================================================
    // 5. (el estado de error se maneja con toasts, ver useToast arriba)
    // ============================================================

    // ============================================================
    // 6. CARGAR SERVICIOS
    // ============================================================

    useEffect(() => {
        async function loadServices() {
            try {
                setLoading(true);

                const data = await getServices();

                setServices(data);
            } catch (error) {
                showToast(
                    error instanceof Error
                        ? error.message
                        : 'No se pudieron cargar los servicios. Revisa tu conexión e intenta de nuevo.',
                    'error',
                );
            } finally {
                setLoading(false);
            }
        }

        loadServices();
    }, []);

    // ============================================================
    // 7. FORMATEAR FECHA PARA MOSTRAR AL USUARIO
    // ============================================================

    const formatDateForDisplay = (dateString: string) => {
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);

        return date.toLocaleDateString('es-MX', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    // ============================================================
    // 8. CONSULTAR DISPONIBILIDAD
    //
    // Se ejecuta automáticamente al cambiar:
    // - servicio
    // - fecha
    // ============================================================

    useEffect(() => {
        if (!selectedService || !selectedDate) {
            return;
        }

        async function loadAvailability() {
            try {
                setLoadingAvailability(true);

                // Reiniciar selección anterior
                setSelectedSlot(null);
                setSlots([]);

                const data = await getAvailability(
                    selectedDate!,
                    selectedService!.id,
                );

                setSlots(data.slots);
            } catch (error) {
                showToast(
                    error instanceof Error
                        ? error.message
                        : 'No se pudo consultar la disponibilidad para esa fecha.',
                    'error',
                );

                setSlots([]);
            } finally {
                setLoadingAvailability(false);
            }
        }

        loadAvailability();
    }, [selectedService, selectedDate]);

    // ============================================================
    // 9. SELECCIONAR SERVICIO
    // ============================================================

    const handleServiceSelect = (service: Service) => {
        setSelectedService(service);

        // Reiniciar pasos posteriores
        setSelectedDate(null);
        setSelectedSlot(null);
        setSlots([]);
        setShowCustomerForm(false);
    };

    // ============================================================
    // 10. SELECCIONAR FECHA (bloquea sábados)
    // ============================================================

    const isSaturday = (date: Date) => date.getDay() === 6;

    const handleDateSelect = (date: string) => {
        const [year, month, day] = date.split('-').map(Number);
        const parsed = new Date(year, month - 1, day);

        if (isSaturday(parsed)) {
            showToast('La barbería no abre los sábados', 'error');
            return;
        }

        setSelectedDate(date);

        // Reiniciar horario anterior
        setSelectedSlot(null);
        setSlots([]);
        setShowCustomerForm(false);
    };

    // ============================================================
    // 11. SELECCIONAR HORARIO
    // ============================================================

    const handleSlotSelect = (slot: AvailabilitySlot) => {
        setSelectedSlot(slot);
        setShowCustomerForm(false);
    };

    // ============================================================
    // 12. MOSTRAR FORMULARIO DE CLIENTE
    // ============================================================

    const handleContinue = () => {
        if (!selectedService || !selectedDate || !selectedSlot) {
            showToast('Selecciona servicio, fecha y horario antes de continuar.', 'error');
            return;
        }

        setShowCustomerForm(true);
    };

    // ============================================================
    // 13. CREAR RESERVACIÓN
    // ============================================================

    const handleCreateReservation = async () => {
        if (!selectedService || !selectedDate || !selectedSlot) {
            showToast('Selecciona servicio, fecha y horario antes de continuar.', 'error');
            return;
        }

        const name = customerName.trim();
        const phone = customerPhone.trim();

        if (!name) {
            showToast('Ingresa tu nombre para continuar.', 'error');
            return;
        }

        if (!phone) {
            showToast('Ingresa tu número de teléfono.', 'error');
            return;
        }

        if (!/^\d{10}$/.test(phone)) {
            showToast('El teléfono debe tener 10 dígitos, sin espacios ni guiones.', 'error');
            return;
        }

        try {
            setCreatingReservation(true);

            // Buscar o crear cliente
            const customer = await resolveCustomer(name, phone);

            // Crear reservación
            // barberId NO se envía. NestJS lo asigna automáticamente.
            const createdReservation = await createReservation({
                customerId: customer.id,
                serviceId: selectedService.id,
                date: selectedDate,
                startTime: selectedSlot.start,
            });

            setReservation(createdReservation);
            setShowCustomerForm(false);
            showToast('Cita confirmada', 'success');
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'No se pudo completar tu reservación. Intenta de nuevo.';

            showToast(message, 'error');
        } finally {
            setCreatingReservation(false);
        }
    };

    // ============================================================
    // 14. REINICIAR FLUJO
    // ============================================================

    const handleNewReservation = () => {
        setReservation(null);
        setSelectedService(null);
        setSelectedDate(null);
        setSelectedSlot(null);
        setSlots([]);
        setCustomerName('');
        setCustomerPhone('');
        setShowCustomerForm(false);
    };

    const availableSlots = slots.filter((slot) => slot.available);

    // ============================================================
    // 15. CARGA INICIAL
    // ============================================================

    if (loading) {
        return (
            <main className="flex-1 px-4 py-10 sm:py-14">
                <div className="mx-auto max-w-lg">
                    <div className="h-8 w-48 animate-pulse rounded-md bg-surface-elevated" />
                    <div className="mt-3 h-4 w-72 animate-pulse rounded-md bg-surface-elevated" />

                    <div className="mt-8 space-y-3">
                        <ServiceCardSkeleton />
                        <ServiceCardSkeleton />
                        <ServiceCardSkeleton />
                    </div>
                </div>
            </main>
        );
    }

    // ============================================================
    // 16. PÁGINA
    // ============================================================

    return (
        <main className="flex-1 px-4 py-10 sm:py-14">
            <div className="mx-auto max-w-lg">

                {/* =================================================
                    CONFIRMACIÓN FINAL
                ================================================= */}

                {reservation ? (
                    <section className="animate-fade-up rounded-xl border border-accent/30 bg-surface p-6 sm:p-8">

                        <div className="text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl font-bold text-on-accent">
                                ✓
                            </div>

                            <h1 className="mt-5 font-display text-2xl font-semibold text-text-primary sm:text-3xl">
                                Cita confirmada
                            </h1>

                            <p className="mt-2 text-sm text-text-muted">
                                Tu reservación fue registrada correctamente.
                            </p>
                        </div>

                        {/* DATOS DE LA RESERVACIÓN */}

                        <div className="mt-8 divide-y divide-border rounded-lg bg-background/60 px-5">
                            {[
                                { label: 'Cliente', value: reservation.customer.name },
                                { label: 'Servicio', value: reservation.service.name },
                                {
                                    label: 'Fecha',
                                    value: selectedDate ? formatDateForDisplay(selectedDate) : '',
                                    capitalize: true,
                                },
                                { label: 'Hora', value: selectedSlot?.start, mono: true },
                                { label: 'Barbero asignado', value: reservation.barber.name },
                                {
                                    label: 'Precio',
                                    value: `$${reservation.service.price}`,
                                    mono: true,
                                },
                            ].map((row) => (
                                <div key={row.label} className="flex items-center justify-between py-3.5">
                                    <span className="text-xs uppercase tracking-wide text-text-subtle">
                                        {row.label}
                                    </span>
                                    <span
                                        className={`text-sm font-medium text-text-primary ${row.capitalize ? 'capitalize' : ''} ${row.mono ? 'font-mono' : ''}`}
                                    >
                                        {row.value}
                                    </span>
                                </div>
                            ))}

                            <div className="flex items-center justify-between py-3.5">
                                <span className="text-xs uppercase tracking-wide text-text-subtle">
                                    Estado
                                </span>
                                <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium text-accent">
                                    Confirmada
                                </span>
                            </div>
                        </div>

                        <Button
                            fullWidth
                            onClick={handleNewReservation}
                            className="mt-8"
                        >
                            Hacer otra reservación
                        </Button>
                    </section>
                ) : (
                    <>
                        {/* =================================================
                            ENCABEZADO
                        ================================================= */}

                        <h1 className="font-display text-2xl font-semibold text-text-primary sm:text-3xl">
                            Reserva tu cita
                        </h1>

                        <p className="mt-2 text-sm text-text-muted sm:text-base">
                            Selecciona el servicio, la fecha y el horario que prefieras.
                        </p>

                        {/* =================================================
                            PASO 1 - SERVICIO
                        ================================================= */}

                        <section className="mt-9">
                            <StepHeading step={1} title="Selecciona un servicio" />

                            <div className="mt-4 space-y-3">
                                {services.map((service) => (
                                    <ServiceCard
                                        key={service.id}
                                        service={service}
                                        selected={selectedService?.id === service.id}
                                        onSelect={handleServiceSelect}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* =================================================
                            PASO 2 - FECHA
                        ================================================= */}

                        {selectedService && (
                            <section className="animate-fade-up mt-9">
                                <StepHeading
                                    step={2}
                                    title="Selecciona una fecha"
                                    description="Puedes reservar desde hoy en adelante. La barbería no abre los sábados."
                                />

                                <div className="mt-4">
                                    <DateSelector
                                        selectedDate={selectedDate}
                                        onSelect={handleDateSelect}
                                        isDateDisabled={isSaturday}
                                    />
                                </div>

                                {selectedDate && (
                                    <div className="mt-3 rounded-lg border border-border bg-surface p-4">
                                        <p className="text-xs uppercase tracking-wide text-text-subtle">
                                            Fecha seleccionada
                                        </p>
                                        <p className="mt-1 font-medium capitalize text-text-primary">
                                            {formatDateForDisplay(selectedDate)}
                                        </p>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* =================================================
                            PASO 3 - HORARIO
                        ================================================= */}

                        {selectedService && selectedDate && (
                            <section className="animate-fade-up mt-9">
                                <StepHeading
                                    step={3}
                                    title="Selecciona un horario"
                                    description="Solo se muestran horarios disponibles."
                                />

                                <div className="mt-4">
                                    {loadingAvailability ? (
                                        <TimeSlotSkeleton />
                                    ) : (
                                        <TimeSlotGrid
                                            slots={availableSlots}
                                            selectedSlot={selectedSlot}
                                            onSelect={handleSlotSelect}
                                        />
                                    )}
                                </div>
                            </section>
                        )}

                        {/* =================================================
                            PASO 4 - RESUMEN
                        ================================================= */}

                        {selectedService &&
                            selectedDate &&
                            selectedSlot &&
                            !showCustomerForm && (
                                <section className="animate-fade-up mt-9 rounded-xl border border-border bg-surface p-5">
                                    <h2 className="font-display text-base font-semibold text-text-primary">
                                        Tu selección
                                    </h2>

                                    <div className="mt-4 space-y-2 text-sm">
                                        <p>
                                            <span className="text-text-muted">Servicio: </span>
                                            <span className="text-text-primary">{selectedService.name}</span>
                                        </p>
                                        <p>
                                            <span className="text-text-muted">Fecha: </span>
                                            <span className="capitalize text-text-primary">
                                                {formatDateForDisplay(selectedDate)}
                                            </span>
                                        </p>
                                        <p>
                                            <span className="text-text-muted">Hora: </span>
                                            <span className="font-mono text-text-primary">{selectedSlot.start}</span>
                                        </p>
                                        <p>
                                            <span className="text-text-muted">Duración: </span>
                                            <span className="text-text-primary">
                                                {selectedService.durationMinutes} minutos
                                            </span>
                                        </p>
                                        <p>
                                            <span className="text-text-muted">Precio: </span>
                                            <span className="font-mono text-text-primary">${selectedService.price}</span>
                                        </p>
                                    </div>

                                    <Button fullWidth onClick={handleContinue} className="mt-6">
                                        Continuar
                                    </Button>
                                </section>
                            )}

                        {/* =================================================
                            PASO 5 - DATOS DEL CLIENTE
                        ================================================= */}

                        {showCustomerForm &&
                            selectedService &&
                            selectedDate &&
                            selectedSlot && (
                                <section className="animate-fade-up mt-9 rounded-xl border border-border bg-surface p-5">
                                    <StepHeading step={4} title="Tus datos" description="Ingresa tus datos para confirmar la cita." />

                                    {/* NOMBRE */}
                                    <div className="mt-6">
                                        <label
                                            htmlFor="name"
                                            className="mb-2 block text-sm font-medium text-text-primary"
                                        >
                                            Nombre
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={customerName}
                                            onChange={(event) => setCustomerName(event.target.value)}
                                            placeholder="Tu nombre"
                                            autoComplete="name"
                                            className="
                                                w-full rounded-lg border border-border-strong bg-background
                                                px-4 py-3 text-text-primary outline-none transition-colors
                                                placeholder:text-text-subtle
                                                focus:border-accent
                                            "
                                        />
                                    </div>

                                    {/* TELÉFONO */}
                                    <div className="mt-4">
                                        <label
                                            htmlFor="phone"
                                            className="mb-2 block text-sm font-medium text-text-primary"
                                        >
                                            Teléfono
                                        </label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={10}
                                            value={customerPhone}
                                            onChange={(event) => {
                                                const value = event.target.value.replace(/\D/g, '');
                                                setCustomerPhone(value);
                                            }}
                                            placeholder="9511234567"
                                            autoComplete="tel"
                                            className="
                                                w-full rounded-lg border border-border-strong bg-background
                                                px-4 py-3 text-text-primary outline-none transition-colors
                                                placeholder:text-text-subtle
                                                focus:border-accent
                                            "
                                        />
                                        <p className="mt-2 text-xs text-text-subtle">
                                            Ingresa 10 dígitos.
                                        </p>
                                    </div>

                                    {/* RESUMEN PEQUEÑO */}
                                    <div className="mt-6 rounded-lg bg-background/60 p-4 text-sm">
                                        <p className="text-text-primary">
                                            {selectedService.name}
                                            {' · '}
                                            <span className="font-mono">{selectedSlot.start}</span>
                                        </p>
                                        <p className="mt-1 capitalize text-text-muted">
                                            {formatDateForDisplay(selectedDate)}
                                        </p>
                                    </div>

                                    {/* CONFIRMAR */}
                                    <Button
                                        fullWidth
                                        loading={creatingReservation}
                                        onClick={handleCreateReservation}
                                        className="mt-6"
                                    >
                                        {creatingReservation ? 'Reservando...' : 'Confirmar reservación'}
                                    </Button>

                                    {/* REGRESAR */}
                                    <Button
                                        variant="ghost"
                                        fullWidth
                                        disabled={creatingReservation}
                                        onClick={() => setShowCustomerForm(false)}
                                        className="mt-2"
                                    >
                                        Regresar
                                    </Button>
                                </section>
                            )}
                    </>
                )}
            </div>
        </main>
    );
}
