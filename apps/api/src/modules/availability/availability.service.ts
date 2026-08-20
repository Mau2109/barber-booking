import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AvailabilityService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    // ============================================================
    // OBTENER DISPONIBILIDAD
    // ============================================================
    async getAvailability(
        date: string,
        serviceId: string,
    ) {
        // ========================================================
        // 1. VALIDAR FORMATO DE FECHA
        // ========================================================

        // Esperamos YYYY-MM-DD
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (!dateRegex.test(date)) {
            throw new BadRequestException(
                'La fecha debe tener el formato YYYY-MM-DD',
            );
        }

        const requestedDate = new Date(
            `${date}T00:00:00.000Z`,
        );

        if (Number.isNaN(requestedDate.getTime())) {
            throw new BadRequestException(
                'La fecha proporcionada no es válida',
            );
        }

        // ========================================================
        // 2. VALIDAR ANTICIPACIÓN
        //
        // Se puede reservar:
        // - Hoy
        // - Hasta 7 días después
        // ========================================================

        const now = new Date();

        const today = new Date(
            Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
            ),
        );

        const maxReservationDate = new Date(today);

        maxReservationDate.setUTCDate(
            maxReservationDate.getUTCDate() + 7,
        );

        // No permitir fechas anteriores a hoy
        if (requestedDate < today) {
            throw new BadRequestException(
                'No se puede consultar disponibilidad para una fecha pasada',
            );
        }

        // No permitir más de 7 días
        if (requestedDate > maxReservationDate) {
            throw new BadRequestException(
                'Solo se puede reservar con hasta 7 días de anticipación',
            );
        }

        // ========================================================
        // 3. VALIDAR DÍA DE TRABAJO
        //
        // Domingo = 0
        // ...
        // Sábado = 6
        // ========================================================

        if (requestedDate.getUTCDay() === 6) {
            throw new BadRequestException(
                'La barbería no abre los sábados',
            );
        }

        // ========================================================
        // 4. OBTENER SERVICIO
        // ========================================================

        const service =
            await this.prisma.service.findUnique({
                where: {
                    id: serviceId,
                },
            });

        if (!service || !service.isActive) {
            throw new NotFoundException(
                'El servicio no existe o no está disponible',
            );
        }

        // ========================================================
        // 5. OBTENER BARBEROS ACTIVOS
        // ========================================================

        const barbers =
            await this.prisma.barber.findMany({
                where: {
                    isActive: true,
                },

                orderBy: {
                    name: 'asc',
                },
            });

        if (barbers.length === 0) {
            throw new BadRequestException(
                'No hay barberos activos',
            );
        }

        // ========================================================
        // 6. CONFIGURACIÓN DEL HORARIO
        // ========================================================

        const OPENING_HOUR = 12;
        const CLOSING_HOUR = 20;

        // Tiempo de preparación entre citas
        const PREPARATION_MINUTES = 5;

        // IMPORTANTE:
        // Por ahora NO tenemos descanso.
        // El horario se considera corrido de 12:00 a 20:00.

        // ========================================================
        // 7. RANGO DEL DÍA
        // ========================================================

        const startOfDay = new Date(
            `${date}T00:00:00.000Z`,
        );

        const startOfNextDay = new Date(startOfDay);

        startOfNextDay.setUTCDate(
            startOfNextDay.getUTCDate() + 1,
        );

        // ========================================================
        // 8. OBTENER RESERVACIONES ACTIVAS DEL DÍA
        // ========================================================

        const reservations =
            await this.prisma.reservation.findMany({
                where: {
                    startTime: {
                        gte: startOfDay,
                        lt: startOfNextDay,
                    },

                    // Una cita cancelada ya no ocupa espacio
                    status: {
                        not: 'CANCELLED',
                    },
                },

                orderBy: {
                    startTime: 'asc',
                },
            });

        // ========================================================
        // 9. FUNCIÓN PARA FORMATEAR MINUTOS -> HH:mm
        // ========================================================

        const formatTime = (
            minutes: number,
        ): string => {
            const hours =
                Math.floor(minutes / 60);

            const mins =
                minutes % 60;

            return `${hours
                .toString()
                .padStart(2, '0')}:${mins
                    .toString()
                    .padStart(2, '0')}`;
        };

        // ========================================================
        // 10. ESTRUCTURA DE SLOTS
        // ========================================================

        const slots: {
            start: string;
            end: string;
            available: boolean;

            barbers: {
                id: string;
                name: string;
            }[];
        }[] = [];

        let currentMinutes =
            OPENING_HOUR * 60;

        const closingMinutes =
            CLOSING_HOUR * 60;

        // ========================================================
        // 11. GENERAR SLOTS
        // ========================================================

        while (
            currentMinutes +
            service.durationMinutes <=
            closingMinutes
        ) {
            const startMinutes =
                currentMinutes;

            const endMinutes =
                startMinutes +
                service.durationMinutes;

            const startFormatted =
                formatTime(startMinutes);

            const endFormatted =
                formatTime(endMinutes);

            // ----------------------------------------------------
            // Convertir el slot a Date para comparar
            // con las reservaciones almacenadas.
            // ----------------------------------------------------

            const slotStart = new Date(
                `${date}T${startFormatted}:00.000Z`,
            );

            const slotEnd = new Date(
                `${date}T${endFormatted}:00.000Z`,
            );

            // ====================================================
            // 12. BUSCAR BARBEROS DISPONIBLES PARA ESTE SLOT
            // ====================================================

            const availableBarbers =
                barbers.filter((barber) => {
                    // --------------------------------------------
                    // Buscar si el barbero tiene una reservación
                    // que se cruce con este intervalo.
                    //
                    // Conflicto:
                    //
                    // existingStart < slotEnd
                    // &&
                    // existingEnd > slotStart
                    // --------------------------------------------

                    const hasConflict =
                        reservations.some(
                            (reservation) =>
                                reservation.barberId ===
                                barber.id &&
                                reservation.startTime <
                                slotEnd &&
                                reservation.endTime >
                                slotStart,
                        );

                    return !hasConflict;
                });

            // ====================================================
            // 13. AGREGAR SLOT
            // ====================================================

            slots.push({
                start: startFormatted,

                end: endFormatted,

                // El horario está disponible mientras exista
                // al menos un barbero disponible.
                available:
                    availableBarbers.length > 0,

                barbers:
                    availableBarbers.map(
                        (barber) => ({
                            id: barber.id,
                            name: barber.name,
                        }),
                    ),
            });

            // ====================================================
            // 14. SIGUIENTE SLOT
            //
            // Ejemplo:
            //
            // Corte:
            // 12:00 - 12:45
            // + 5 minutos
            // siguiente = 12:50
            // ====================================================

            currentMinutes =
                endMinutes +
                PREPARATION_MINUTES;
        }

        // ========================================================
        // 15. RESPUESTA
        // ========================================================

        return {
            date,

            service: {
                id: service.id,
                name: service.name,
                durationMinutes:
                    service.durationMinutes,
            },

            slots,
        };
    }
}