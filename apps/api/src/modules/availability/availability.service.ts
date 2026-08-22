import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

import {
    barberLocalToUtc,
    utcToBarberLocal,
} from '../../common/date-time';

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
        //
        // Formato esperado:
        // YYYY-MM-DD
        // ========================================================

        const dateRegex =
            /^\d{4}-\d{2}-\d{2}$/;

        if (
            !dateRegex.test(date)
        ) {
            throw new BadRequestException(
                'La fecha debe tener el formato YYYY-MM-DD',
            );
        }

        // ========================================================
        // 2. CONSTRUIR FECHA SOLICITADA
        //
        // Importante:
        // No usamos Date con "Z" porque no queremos interpretar
        // esta fecha como UTC.
        // ========================================================

        const [
            year,
            month,
            day,
        ] = date
            .split('-')
            .map(Number);

        const requestedDate =
            new Date(
                year,
                month - 1,
                day,
            );

        // --------------------------------------------------------
        // Verificar que realmente sea una fecha válida.
        //
        // Evita casos como:
        //
        // 2026-02-31
        // --------------------------------------------------------

        if (
            Number.isNaN(
                requestedDate.getTime(),
            ) ||
            requestedDate.getFullYear() !==
            year ||
            requestedDate.getMonth() !==
            month - 1 ||
            requestedDate.getDate() !==
            day
        ) {
            throw new BadRequestException(
                'La fecha proporcionada no es válida',
            );
        }

        // ========================================================
        // 3. OBTENER FECHA ACTUAL DE LA BARBERÍA
        // ========================================================

        const now =
            new Date();

        const nowLocal =
            utcToBarberLocal(
                now,
            );

        const today =
            new Date(
                nowLocal.getFullYear(),
                nowLocal.getMonth(),
                nowLocal.getDate(),
            );

        // ========================================================
        // 4. NO PERMITIR FECHAS PASADAS
        // ========================================================

        if (
            requestedDate <
            today
        ) {
            throw new BadRequestException(
                'No se puede consultar disponibilidad para una fecha pasada',
            );
        }

        // ========================================================
        // 5. SÁBADO CERRADO
        //
        // Domingo = 0
        // Lunes   = 1
        // ...
        // Sábado  = 6
        // ========================================================

        if (
            requestedDate.getDay() ===
            6
        ) {
            throw new BadRequestException(
                'La barbería no abre los sábados',
            );
        }

        // ========================================================
        // 6. OBTENER SERVICIO
        // ========================================================

        const service =
            await this.prisma.service.findUnique({
                where: {
                    id: serviceId,
                },
            });

        if (
            !service ||
            !service.isActive
        ) {
            throw new NotFoundException(
                'El servicio no existe o no está disponible',
            );
        }

        // ========================================================
        // 7. OBTENER BARBEROS ACTIVOS
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

        if (
            barbers.length === 0
        ) {
            throw new BadRequestException(
                'No hay barberos activos',
            );
        }

        // ========================================================
        // 8. CONFIGURACIÓN DEL HORARIO
        // ========================================================

        const OPENING_HOUR =
            12;

        const CLOSING_HOUR =
            20;

        // Tiempo entre una cita y otra
        const PREPARATION_MINUTES =
            5;

        const OPENING_MINUTES =
            OPENING_HOUR * 60;

        const CLOSING_MINUTES =
            CLOSING_HOUR * 60;

        // ========================================================
        // 9. DETERMINAR SI LA FECHA CONSULTADA ES HOY
        // ========================================================

        const isToday =
            requestedDate.getTime() ===
            today.getTime();

        // Hora actual de la barbería expresada en minutos.
        //
        // Ejemplo:
        //
        // 15:30
        // =
        // 15 * 60 + 30
        // =
        // 930 minutos
        const currentLocalMinutes =
            nowLocal.getHours() *
            60 +
            nowLocal.getMinutes();

        // ========================================================
        // 10. OBTENER RANGO UTC DEL DÍA LOCAL
        //
        // Ejemplo:
        //
        // 2026-08-24 00:00 hora barbería
        //
        // se convierte al instante UTC correspondiente.
        // ========================================================

        const startOfDay =
            barberLocalToUtc(
                date,
                '00:00',
            );

        const nextDayDate =
            new Date(
                year,
                month - 1,
                day + 1,
            );

        const nextDayYear =
            nextDayDate.getFullYear();

        const nextDayMonth =
            String(
                nextDayDate.getMonth() +
                1,
            ).padStart(
                2,
                '0',
            );

        const nextDayDay =
            String(
                nextDayDate.getDate(),
            ).padStart(
                2,
                '0',
            );

        const nextDayString =
            `${nextDayYear}-${nextDayMonth}-${nextDayDay}`;

        const startOfNextDay =
            barberLocalToUtc(
                nextDayString,
                '00:00',
            );

        // ========================================================
        // 11. OBTENER RESERVACIONES ACTIVAS DEL DÍA
        //
        // CANCELLED ya no ocupa horario.
        // ========================================================

        const reservations =
            await this.prisma.reservation.findMany({
                where: {
                    startTime: {
                        gte:
                            startOfDay,

                        lt:
                            startOfNextDay,
                    },

                    status: {
                        not:
                            'CANCELLED',
                    },
                },

                orderBy: {
                    startTime:
                        'asc',
                },
            });

        // ========================================================
        // 12. FUNCIÓN PARA FORMATEAR MINUTOS A HH:mm
        // ========================================================

        const formatTime = (
            minutes: number,
        ): string => {
            const hours =
                Math.floor(
                    minutes / 60,
                );

            const mins =
                minutes % 60;

            return `${String(
                hours,
            ).padStart(
                2,
                '0',
            )}:${String(
                mins,
            ).padStart(
                2,
                '0',
            )}`;
        };

        // ========================================================
        // 13. ESTRUCTURA DE LOS SLOTS
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
            OPENING_MINUTES;

        // ========================================================
        // 14. GENERAR SLOTS
        // ========================================================

        while (
            currentMinutes +
            service.durationMinutes <=
            CLOSING_MINUTES
        ) {
            const startMinutes =
                currentMinutes;

            const endMinutes =
                startMinutes +
                service.durationMinutes;

            const startFormatted =
                formatTime(
                    startMinutes,
                );

            const endFormatted =
                formatTime(
                    endMinutes,
                );

            // ====================================================
            // 14.1 SI ES HOY, OMITIR HORARIOS QUE YA PASARON
            //
            // Por ejemplo:
            //
            // Hora actual = 17:20
            // ====================================================

            if (
                isToday &&
                startMinutes <=
                currentLocalMinutes
            ) {
                currentMinutes =
                    endMinutes +
                    PREPARATION_MINUTES;

                continue;
            }

            // ====================================================
            // 14.2 CONVERTIR EL SLOT LOCAL A UTC
            // ====================================================

            const slotStart =
                barberLocalToUtc(
                    date,
                    startFormatted,
                );

            const slotEnd =
                barberLocalToUtc(
                    date,
                    endFormatted,
                );

            // ====================================================
            // 14.3 DETERMINAR BARBEROS DISPONIBLES
            // ====================================================

            const availableBarbers =
                barbers.filter(
                    (barber) => {
                        // ----------------------------------------
                        // Existe conflicto cuando:
                        //
                        // reservación.start < slot.end
                        //
                        // Y
                        //
                        // reservación.end > slot.start
                        // ----------------------------------------

                        const hasConflict =
                            reservations.some(
                                (
                                    reservation,
                                ) =>
                                    reservation.barberId ===
                                    barber.id &&
                                    reservation.startTime <
                                    slotEnd &&
                                    reservation.endTime >
                                    slotStart,
                            );

                        return !hasConflict;
                    },
                );

            // ====================================================
            // 14.4 AGREGAR SLOT
            // ====================================================

            slots.push({
                start:
                    startFormatted,

                end:
                    endFormatted,

                available:
                    availableBarbers.length >
                    0,

                barbers:
                    availableBarbers.map(
                        (
                            barber,
                        ) => ({
                            id:
                                barber.id,

                            name:
                                barber.name,
                        }),
                    ),
            });

            // ====================================================
            // 14.5 AVANZAR AL SIGUIENTE SLOT
            //
            // Ejemplo Corte:
            //
            // 12:00 → 12:45
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
                id:
                    service.id,

                name:
                    service.name,

                durationMinutes:
                    service.durationMinutes,
            },

            slots,
        };
    }
}