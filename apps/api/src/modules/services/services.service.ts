import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ServicesService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.service.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
    }

    async findAllAdmin() {
        return this.prisma.service.findMany({
            orderBy: {
                name: 'asc',
            },
        });
    }

    async create(data: {
        name: string;
        description?: string;
        durationMinutes: number;
        price: number;
    }) {
        return this.prisma.service.create({
            data: {
                name: data.name,
                description: data.description,
                durationMinutes: data.durationMinutes,
                price: data.price,
            },
        });
    }

    async update(
        id: string,
        data: {
            name?: string;
            description?: string;
            durationMinutes?: number;
            price?: number;
            isActive?: boolean;
        },
    ) {
        const service = await this.prisma.service.findUnique({
            where: { id },
        });

        if (!service) {
            throw new NotFoundException(
                'El servicio no existe',
            );
        }

        return this.prisma.service.update({
            where: { id },
            data,
        });
    }
}