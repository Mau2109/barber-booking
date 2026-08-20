import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class BarbersService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    // ============================================================
    // OBTENER SOLO BARBEROS ACTIVOS
    //
    // Este endpoint puede utilizarse en partes públicas.
    // ============================================================
    async findAll() {
        return this.prisma.barber.findMany({
            where: {
                isActive: true,
            },

            orderBy: {
                name: 'asc',
            },
        });
    }

    // ============================================================
    // OBTENER TODOS LOS BARBEROS
    //
    // Para administración.
    // Incluye activos e inactivos.
    // ============================================================
    async findAllAdmin() {
        return this.prisma.barber.findMany({
            orderBy: {
                name: 'asc',
            },
        });
    }

    // ============================================================
    // CREAR BARBERO
    // ============================================================
    async create(data: {
        name: string;
    }) {
        return this.prisma.barber.create({
            data: {
                name: data.name,
            },
        });
    }

    // ============================================================
    // ACTUALIZAR BARBERO
    //
    // Permite:
    // - cambiar nombre
    // - activar
    // - desactivar
    // ============================================================
    async update(
        id: string,
        data: {
            name?: string;
            isActive?: boolean;
        },
    ) {
        const barber =
            await this.prisma.barber.findUnique({
                where: {
                    id,
                },
            });

        if (!barber) {
            throw new NotFoundException(
                'El barbero no existe',
            );
        }

        return this.prisma.barber.update({
            where: {
                id,
            },

            data,
        });
    }
}