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
export class ReservationsService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    // ============================================================
    // 1. CREAR RESERVACIÓN
    // ============================================================

    async create(data: {
        customerId: string;
        serviceId: string;
        date: string;
        startTime: string;
    }) {
        const {
            customerId,
            serviceId,
            date,
            startTime,
        } = data;

        // ========================================================
        // 1.1 VERIFICAR CLIENTE
        // ========================================================

        const customer =
            await this.prisma.customer.findUnique({
                where: {
                    id: customerId,
                },
            });

        if (!customer) {
            throw new NotFoundException(
                'El cliente no existe',
            );
        }

        // ========================================================
        // 1.2 VERIFICAR SERVICIO
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
        // 1.3 CONVERTIR FECHA/HORA LOCAL A UTC
        // ========================================================

        const start =
            barberLocalToUtc(
                date,
                startTime,
            );

        if (
            Number.isNaN(
                start.getTime(),
            )
        ) {
            throw new BadRequestException(
                'La fecha u hora de inicio no es válida',
            );
        }

        // ========================================================
        // 1.4 OBTENER FECHA ACTUAL DE LA BARBERÍA
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
        // 1.5 CONSTRUIR FECHA SOLICITADA
        // ========================================================

        const [
            reservationYear,
            reservationMonth,
            reservationDay,
        ] = date
            .split('-')
            .map(Number);

        const reservationDate =
            new Date(
                reservationYear,
                reservationMonth - 1,
                reservationDay,
            );

        if (
            Number.isNaN(
                reservationDate.getTime(),
            )
        ) {
            throw new BadRequestException(
                'La fecha proporcionada no es válida',
            );
        }

        // ========================================================
        // 1.6 NO PERMITIR FECHAS PASADAS
        // ========================================================

        if (
            reservationDate <
            today
        ) {
            throw new BadRequestException(
                'No se puede reservar en una fecha pasada',
            );
        }

        // ========================================================
        // 1.7 SÁBADO CERRADO
        //
        // Domingo = 0
        // ...
        // Sábado = 6
        // ========================================================

        if (
            reservationDate.getDay() ===
            6
        ) {
            throw new BadRequestException(
                'La barbería no abre los sábados',
            );
        }

        // ========================================================
        // 1.8 CONFIGURACIÓN DEL HORARIO
        // ========================================================

        const OPENING_HOUR =
            12;

        const CLOSING_HOUR =
            20;

        const PREPARATION_MINUTES =
            5;

        const OPENING_MINUTES =
            OPENING_HOUR * 60;

        const CLOSING_MINUTES =
            CLOSING_HOUR * 60;

        // ========================================================
        // 1.9 CONVERTIR HORA SOLICITADA A MINUTOS
        //
        // Ejemplo:
        //
        // 12:50
        // =
        // 12 * 60 + 50
        // =
        // 770 minutos
        // ========================================================

        const [
            requestedHour,
            requestedMinute,
        ] = startTime
            .split(':')
            .map(Number);

        const requestedStartMinutes =
            requestedHour * 60 +
            requestedMinute;

        const requestedEndMinutes =
            requestedStartMinutes +
            service.durationMinutes;

        // ========================================================
        // 1.10 VALIDAR HORARIO DE ATENCIÓN
        //
        // La cita debe comenzar después de las 12:00
        // y terminar como máximo a las 20:00.
        // ========================================================

        if (
            requestedStartMinutes <
            OPENING_MINUTES ||
            requestedEndMinutes >
            CLOSING_MINUTES
        ) {
            throw new BadRequestException(
                'El horario seleccionado está fuera del horario de atención',
            );
        }

        // ========================================================
        // 1.11 SI LA CITA ES HOY, NO PERMITIR UNA HORA PASADA
        // ========================================================

        const isToday =
            reservationDate.getTime() ===
            today.getTime();

        if (
            isToday &&
            start.getTime() <=
            now.getTime()
        ) {
            throw new BadRequestException(
                'No se puede reservar un horario que ya pasó',
            );
        }

        // ========================================================
        // 1.12 GENERAR LOS SLOTS VÁLIDOS DEL SERVICIO
        //
        // Para Corte de 45 minutos:
        //
        // 12:00
        // 12:50
        // 13:40
        // ...
        //
        // De esta manera alguien no puede mandar manualmente
        // un horario inventado como 12:17.
        // ========================================================

        const validStartTimes: string[] =
            [];

        let currentMinutes =
            OPENING_MINUTES;

        while (
            currentMinutes +
            service.durationMinutes <=
            CLOSING_MINUTES
        ) {
            const hours =
                Math.floor(
                    currentMinutes /
                    60,
                );

            const minutes =
                currentMinutes %
                60;

            const formattedTime =
                `${String(hours).padStart(
                    2,
                    '0',
                )}:${String(
                    minutes,
                ).padStart(
                    2,
                    '0',
                )}`;

            validStartTimes.push(
                formattedTime,
            );

            // Duración del servicio + 5 minutos
            // antes del siguiente cliente.
            currentMinutes +=
                service.durationMinutes +
                PREPARATION_MINUTES;
        }

        // ========================================================
        // 1.13 VALIDAR QUE SEA UN SLOT REAL
        // ========================================================

        if (
            !validStartTimes.includes(
                startTime,
            )
        ) {
            throw new BadRequestException(
                'El horario seleccionado no es un horario válido',
            );
        }

        // ========================================================
        // 1.14 CALCULAR HORA DE FINALIZACIÓN
        // ========================================================

        const end =
            new Date(
                start.getTime() +
                service.durationMinutes *
                60 *
                1000,
            );

        // ========================================================
        // 1.15 VERIFICAR CONFLICTO DEL CLIENTE
        //
        // Un cliente no puede tener dos citas simultáneamente.
        //
        // CANCELLED no bloquea.
        // ========================================================

        const customerConflict =
            await this.prisma.reservation.findFirst({
                where: {
                    customerId,

                    status: {
                        not: 'CANCELLED',
                    },

                    startTime: {
                        lt: end,
                    },

                    endTime: {
                        gt: start,
                    },
                },
            });

        if (
            customerConflict
        ) {
            throw new BadRequestException(
                'El cliente ya tiene una reservación en ese horario',
            );
        }

        // ========================================================
        // 1.16 OBTENER BARBEROS ACTIVOS
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
                'No hay barberos disponibles',
            );
        }

        // ========================================================
        // 1.17 BUSCAR BARBERO DISPONIBLE
        // ========================================================

        let availableBarber:
            | (typeof barbers)[number]
            | null = null;

        for (
            const barber of barbers
        ) {
            const conflictingReservation =
                await this.prisma.reservation.findFirst({
                    where: {
                        barberId:
                            barber.id,

                        // Las canceladas
                        // ya no bloquean.
                        status: {
                            not: 'CANCELLED',
                        },

                        startTime: {
                            lt: end,
                        },

                        endTime: {
                            gt: start,
                        },
                    },
                });

            if (
                !conflictingReservation
            ) {
                availableBarber =
                    barber;

                break;
            }
        }

        // ========================================================
        // 1.18 SIN BARBEROS DISPONIBLES
        // ========================================================

        if (
            !availableBarber
        ) {
            throw new BadRequestException(
                'No hay barberos disponibles para ese horario',
            );
        }

        // ========================================================
        // 1.19 CREAR RESERVACIÓN
        // ========================================================

        return this.prisma.reservation.create({
            data: {
                customerId,

                barberId:
                    availableBarber.id,

                serviceId,

                startTime:
                    start,

                endTime:
                    end,
            },

            include: {
                customer: true,
                barber: true,
                service: true,
            },
        });
    }

    // ============================================================
    // 2. OBTENER TODAS LAS RESERVACIONES
    //
    // También permite:
    //
    // GET /reservations?date=YYYY-MM-DD
    // ============================================================

    async findAll(
        date?: string,
    ) {
        const where: any =
            {};

        // ========================================================
        // 2.1 FILTRAR POR FECHA LOCAL DE LA BARBERÍA
        // ========================================================

        if (date) {
            const {
                startOfDay,
                startOfNextDay,
            } =
                this.getLocalDayRange(
                    date,
                );

            where.startTime = {
                gte:
                    startOfDay,

                lt:
                    startOfNextDay,
            };
        }

        // ========================================================
        // 2.2 CONSULTAR RESERVACIONES
        // ========================================================

        return this.prisma.reservation.findMany({
            where,

            orderBy: {
                startTime:
                    'asc',
            },

            include: {
                customer: true,
                barber: true,
                service: true,
            },
        });
    }

    // ============================================================
    // 3. OBTENER RESERVACIONES POR FECHA
    //
    // GET /reservations/date/YYYY-MM-DD
    // ============================================================

    async findByDate(
        date: string,
    ) {
        const {
            startOfDay,
            startOfNextDay,
        } =
            this.getLocalDayRange(
                date,
            );

        return this.prisma.reservation.findMany({
            where: {
                startTime: {
                    gte:
                        startOfDay,

                    lt:
                        startOfNextDay,
                },
            },

            include: {
                customer: true,
                barber: true,
                service: true,
            },

            orderBy: {
                startTime:
                    'asc',
            },
        });
    }

    // ============================================================
    // 4. CANCELAR RESERVACIÓN
    //
    // Solo puede cancelarse con al menos
    // 2 horas de anticipación.
    // ============================================================

    async cancel(
        id: string,
    ) {
        // ========================================================
        // 4.1 BUSCAR RESERVACIÓN
        // ========================================================

        const reservation =
            await this.prisma.reservation.findUnique({
                where: {
                    id,
                },
            });

        if (
            !reservation
        ) {
            throw new NotFoundException(
                'La reservación no existe',
            );
        }

        // ========================================================
        // 4.2 YA CANCELADA
        // ========================================================

        if (
            reservation.status ===
            'CANCELLED'
        ) {
            throw new BadRequestException(
                'La reservación ya está cancelada',
            );
        }

        // ========================================================
        // 4.3 COMPLETADA
        // ========================================================

        if (
            reservation.status ===
            'COMPLETED'
        ) {
            throw new BadRequestException(
                'No se puede cancelar una reservación completada',
            );
        }

        // ========================================================
        // 4.4 CALCULAR TIEMPO RESTANTE
        // ========================================================

        const now =
            new Date();

        const differenceInMilliseconds =
            reservation.startTime.getTime() -
            now.getTime();

        const differenceInHours =
            differenceInMilliseconds /
            (
                1000 *
                60 *
                60
            );

        // ========================================================
        // 4.5 LA CITA YA COMENZÓ O YA PASÓ
        // ========================================================

        if (
            differenceInHours <=
            0
        ) {
            throw new BadRequestException(
                'No se puede cancelar una reservación cuya hora ya pasó',
            );
        }

        // ========================================================
        // 4.6 REGLA DE 2 HORAS
        // ========================================================

        if (
            differenceInHours <
            2
        ) {
            throw new BadRequestException(
                'La reservación solo puede cancelarse con al menos 2 horas de anticipación',
            );
        }

        // ========================================================
        // 4.7 CANCELAR
        // ========================================================

        return this.prisma.reservation.update({
            where: {
                id,
            },

            data: {
                status:
                    'CANCELLED',
            },

            include: {
                customer: true,
                barber: true,
                service: true,
            },
        });
    }

    // ============================================================
    // 5. COMPLETAR RESERVACIÓN
    //
    // CONFIRMED -> COMPLETED
    // ============================================================

    async complete(
        id: string,
    ) {
        // ========================================================
        // 5.1 BUSCAR RESERVACIÓN
        // ========================================================

        const reservation =
            await this.prisma.reservation.findUnique({
                where: {
                    id,
                },
            });

        if (
            !reservation
        ) {
            throw new NotFoundException(
                'La reservación no existe',
            );
        }

        // ========================================================
        // 5.2 NO COMPLETAR UNA CANCELADA
        // ========================================================

        if (
            reservation.status ===
            'CANCELLED'
        ) {
            throw new BadRequestException(
                'No se puede completar una reservación cancelada',
            );
        }

        // ========================================================
        // 5.3 EVITAR COMPLETAR DOS VECES
        // ========================================================

        if (
            reservation.status ===
            'COMPLETED'
        ) {
            throw new BadRequestException(
                'La reservación ya está completada',
            );
        }

        // ========================================================
        // 5.4 ACTUALIZAR
        // ========================================================

        return this.prisma.reservation.update({
            where: {
                id,
            },

            data: {
                status:
                    'COMPLETED',
            },

            include: {
                customer: true,
                barber: true,
                service: true,
            },
        });
    }

    // ============================================================
    // 6. OBTENER RESERVACIONES POR TELÉFONO
    // ============================================================

    async findByCustomerPhone(
        phone: string,
    ) {
        if (
            !phone ||
            phone.trim().length ===
            0
        ) {
            throw new BadRequestException(
                'El número de teléfono es obligatorio',
            );
        }

        const customer =
            await this.prisma.customer.findUnique({
                where: {
                    phone,
                },
            });

        if (
            !customer
        ) {
            throw new NotFoundException(
                'No se encontró ningún cliente con ese número',
            );
        }

        return this.prisma.reservation.findMany({
            where: {
                customerId:
                    customer.id,
            },

            orderBy: {
                startTime:
                    'desc',
            },

            include: {
                customer: true,
                barber: true,
                service: true,
            },
        });
    }

    // ============================================================
    // 7. UTILIDAD PRIVADA:
    //    OBTENER RANGO UTC DE UN DÍA LOCAL DE LA BARBERÍA
    //
    // Ejemplo:
    //
    // fecha solicitada:
    // 2026-08-24
    //
    // obtenemos:
    //
    // inicio 2026-08-24 00:00 hora barbería
    // fin    2026-08-25 00:00 hora barbería
    //
    // y ambos se convierten correctamente a UTC.
    // ============================================================

    private getLocalDayRange(
        date: string,
    ) {
        const [
            year,
            month,
            day,
        ] = date
            .split('-')
            .map(Number);

        const localDate =
            new Date(
                year,
                month - 1,
                day,
            );

        const nextDate =
            new Date(
                year,
                month - 1,
                day + 1,
            );

        const formatLocalDate = (
            value: Date,
        ) => {
            const y =
                value.getFullYear();

            const m =
                String(
                    value.getMonth() +
                    1,
                ).padStart(
                    2,
                    '0',
                );

            const d =
                String(
                    value.getDate(),
                ).padStart(
                    2,
                    '0',
                );

            return `${y}-${m}-${d}`;
        };

        const startOfDay =
            barberLocalToUtc(
                formatLocalDate(
                    localDate,
                ),
                '00:00',
            );

        const startOfNextDay =
            barberLocalToUtc(
                formatLocalDate(
                    nextDate,
                ),
                '00:00',
            );

        return {
            startOfDay,
            startOfNextDay,
        };
    }
}