import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReservationsService {
    constructor(private readonly prisma: PrismaService) { }

    // ============================================================
    // 1. CREAR RESERVACIÓN
    // ============================================================
    // ============================================================
    // 1. CREAR RESERVACIÓN
    // ============================================================
    async create(data: {
        customerId: string;
        serviceId: string;
        startTime: string;
    }) {
        const {
            customerId,
            serviceId,
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

        if (!service || !service.isActive) {
            throw new NotFoundException(
                'El servicio no existe o no está disponible',
            );
        }

        // ========================================================
        // 1.3 VALIDAR FECHA DE INICIO
        // ========================================================
        const start = new Date(startTime);

        if (Number.isNaN(start.getTime())) {
            throw new BadRequestException(
                'La fecha de inicio no es válida',
            );
        }

        // ========================================================
        // VALIDAR DÍA Y ANTICIPACIÓN DE LA RESERVACIÓN
        // ========================================================

        const now = new Date();

        // Tomamos únicamente año, mes y día
        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
        );

        const reservationDate = new Date(
            start.getFullYear(),
            start.getMonth(),
            start.getDate(),
        );

        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        // No permitir fechas pasadas
        if (reservationDate < today) {
            throw new BadRequestException(
                'No se puede reservar en una fecha pasada',
            );
        }

        // Solo hoy o mañana
        if (reservationDate > sevenDaysFromNow) {
            throw new BadRequestException(
                'Solo se puede reservar con una semana de anticipación',
            );
        }

        // Sábado = 6
        if (reservationDate.getDay() === 6) {
            throw new BadRequestException(
                'La barbería no abre los sábados',
            );
        }
        // ========================================================
        // 1.4 CALCULAR HORA DE FINALIZACIÓN
        // ========================================================
        const end = new Date(
            start.getTime() +
            service.durationMinutes * 60 * 1000,
        );
        // ========================================================
        // 1.5 VERIFICAR QUE EL CLIENTE NO TENGA OTRA
        //     RESERVACIÓN QUE SE CRUCE CON ESTE HORARIO
        // ========================================================
        const customerConflict =
            await this.prisma.reservation.findFirst({
                where: {
                    customerId,

                    // Las reservaciones canceladas ya no bloquean
                    status: {
                        not: 'CANCELLED',
                    },

                    // La reservación existente empieza antes
                    // de que termine la nueva
                    startTime: {
                        lt: end,
                    },

                    // La reservación existente termina después
                    // de que empieza la nueva
                    endTime: {
                        gt: start,
                    },
                },
            });

        if (customerConflict) {
            throw new BadRequestException(
                'El cliente ya tiene una reservación en ese horario',
            );
        }

        // ========================================================
        // 1.5 OBTENER BARBEROS ACTIVOS
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
                'No hay barberos disponibles',
            );
        }

        // ========================================================
        // 1.6 BUSCAR BARBERO DISPONIBLE
        // ========================================================
        let availableBarber: (typeof barbers)[number] | null = null;

        for (const barber of barbers) {
            const conflictingReservation =
                await this.prisma.reservation.findFirst({
                    where: {
                        barberId: barber.id,

                        // Las canceladas no bloquean
                        status: {
                            not: 'CANCELLED',
                        },

                        // La reservación existente comienza
                        // antes de que termine la nueva
                        startTime: {
                            lt: end,
                        },

                        // La reservación existente termina
                        // después de que comienza la nueva
                        endTime: {
                            gt: start,
                        },
                    },
                });

            // Si no hay conflicto, encontramos un barbero
            if (!conflictingReservation) {
                availableBarber = barber;
                break;
            }
        }

        // ========================================================
        // 1.7 SI NO HAY BARBEROS DISPONIBLES
        // ========================================================
        if (!availableBarber) {
            throw new BadRequestException(
                'No hay barberos disponibles para ese horario',
            );
        }

        // ========================================================
        // 1.8 CREAR RESERVACIÓN
        // ========================================================
        return this.prisma.reservation.create({
            data: {
                customerId,

                // El backend asigna automáticamente
                barberId: availableBarber.id,

                serviceId,
                startTime: start,
                endTime: end,
            },

            // ======================================================
            // DEVOLVER INFORMACIÓN COMPLETA
            // ======================================================
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
    // También permite filtrar opcionalmente por fecha.
    // ============================================================
    async findAll(date?: string) {
        const where: any = {};

        // --------------------------------------------------------
        // 2.1 Si se recibe una fecha, filtrar por ese día
        // --------------------------------------------------------
        if (date) {
            const startOfDay = new Date(
                `${date}T00:00:00.000Z`,
            );

            const endOfDay = new Date(
                `${date}T23:59:59.999Z`,
            );

            where.startTime = {
                gte: startOfDay,
                lte: endOfDay,
            };
        }

        // --------------------------------------------------------
        // 2.2 Consultar reservaciones
        // --------------------------------------------------------
        return this.prisma.reservation.findMany({
            where,

            // Ordenar de la más temprana a la más tarde
            orderBy: {
                startTime: 'asc',
            },

            // Incluir información del cliente,
            // barbero y servicio
            include: {
                customer: true,
                barber: true,
                service: true,
            },
        });
    }

    // ============================================================
    // 3. OBTENER RESERVACIONES POR FECHA
    // ============================================================
    async findByDate(date: string) {
        // --------------------------------------------------------
        // 3.1 Crear rango del día
        // --------------------------------------------------------
        const startOfDay = new Date(
            `${date}T00:00:00.000Z`,
        );

        const endOfDay = new Date(
            `${date}T23:59:59.999Z`,
        );

        // --------------------------------------------------------
        // 3.2 Buscar reservaciones dentro del rango
        // --------------------------------------------------------
        return this.prisma.reservation.findMany({
            where: {
                startTime: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },

            // Incluir información relacionada
            include: {
                customer: true,
                barber: true,
                service: true,
            },

            // Orden cronológico
            orderBy: {
                startTime: 'asc',
            },
        });
    }

    // ============================================================
    // 4. CANCELAR RESERVACIÓN
    //
    // Regla del negocio:
    // Solo se puede cancelar con al menos 2 horas
    // de anticipación.
    // ============================================================
    async cancel(id: string) {
        // --------------------------------------------------------
        // 4.1 Buscar la reservación
        // --------------------------------------------------------
        const reservation =
            await this.prisma.reservation.findUnique({
                where: {
                    id,
                },
            });

        if (!reservation) {
            throw new NotFoundException(
                'La reservación no existe',
            );
        }

        // --------------------------------------------------------
        // 4.2 Verificar que no esté cancelada
        // --------------------------------------------------------
        if (reservation.status === 'CANCELLED') {
            throw new BadRequestException(
                'La reservación ya está cancelada',
            );
        }

        // --------------------------------------------------------
        // 4.3 Una reservación completada no puede cancelarse
        // --------------------------------------------------------
        if (reservation.status === 'COMPLETED') {
            throw new BadRequestException(
                'No se puede cancelar una reservación completada',
            );
        }

        // --------------------------------------------------------
        // 4.4 Calcular cuánto falta para la reservación
        // --------------------------------------------------------
        const now = new Date();

        const differenceInMilliseconds =
            reservation.startTime.getTime() -
            now.getTime();

        const differenceInHours =
            differenceInMilliseconds /
            (1000 * 60 * 60);

        // La cita ya comenzó o ya pasó
        if (differenceInHours <= 0) {
            throw new BadRequestException(
                'No se puede cancelar una reservación cuya hora ya pasó',
            );
        }

        // --------------------------------------------------------
        // 4.5 Verificar regla de 2 horas
        // --------------------------------------------------------
        if (differenceInHours < 2) {
            throw new BadRequestException(
                'La reservación solo puede cancelarse con al menos 2 horas de anticipación',
            );
        }

        // --------------------------------------------------------
        // 4.6 Cambiar estado a CANCELLED
        // --------------------------------------------------------
        return this.prisma.reservation.update({
            where: {
                id,
            },

            data: {
                status: 'CANCELLED',
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
    // Cambia:
    // CONFIRMED -> COMPLETED
    // ============================================================
    async complete(id: string) {
        // --------------------------------------------------------
        // 5.1 Buscar la reservación
        // --------------------------------------------------------
        const reservation =
            await this.prisma.reservation.findUnique({
                where: {
                    id,
                },
            });

        if (!reservation) {
            throw new NotFoundException(
                'La reservación no existe',
            );
        }

        // --------------------------------------------------------
        // 5.2 Una reservación cancelada no puede completarse
        // --------------------------------------------------------
        if (reservation.status === 'CANCELLED') {
            throw new BadRequestException(
                'No se puede completar una reservación cancelada',
            );
        }

        // --------------------------------------------------------
        // 5.3 Evitar completar dos veces
        // --------------------------------------------------------
        if (reservation.status === 'COMPLETED') {
            throw new BadRequestException(
                'La reservación ya está completada',
            );
        }

        // --------------------------------------------------------
        // 5.4 Cambiar estado a COMPLETED
        // --------------------------------------------------------
        return this.prisma.reservation.update({
            where: {
                id,
            },

            data: {
                status: 'COMPLETED',
            },

            include: {
                customer: true,
                barber: true,
                service: true,
            },
        });
    }
    async findByCustomerPhone(phone: string) {
        const customer = await this.prisma.customer.findUnique({
            where: {
                phone,
            },
        });

        if (!customer) {
            throw new NotFoundException(
                'No se encontró ningún cliente con ese número',
            );
        }

        return this.prisma.reservation.findMany({
            where: {
                customerId: customer.id,
            },

            orderBy: {
                startTime: 'desc',
            },

            include: {
                customer: true,
                barber: true,
                service: true,
            },
        });
    }
}