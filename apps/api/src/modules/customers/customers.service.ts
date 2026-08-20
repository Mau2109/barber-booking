import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CustomersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.customer.findMany({
            orderBy: {
                name: 'asc',
            },
        });
    }

    async findOrCreate(data: {
        name: string;
        phone: string;
    }) {
        // ========================================================
        // BUSCAR CLIENTE POR TELÉFONO
        // ========================================================
        const existingCustomer =
            await this.prisma.customer.findUnique({
                where: {
                    phone: data.phone,
                },
            });

        // ========================================================
        // SI YA EXISTE, DEVOLVERLO
        // ========================================================
        if (existingCustomer) {
            return existingCustomer;
        }

        // ========================================================
        // SI NO EXISTE, CREARLO
        // ========================================================
        return this.prisma.customer.create({
            data: {
                name: data.name,
                phone: data.phone,
            },
        });
    }

    async create(data: {
        name: string;
        phone: string;
    }) {
        const existingCustomer = await this.prisma.customer.findUnique({
            where: {
                phone: data.phone,
            },
        });

        if (existingCustomer) {
            throw new ConflictException(
                'Ya existe un cliente con ese número de teléfono',
            );
        }

        return this.prisma.customer.create({
            data: {
                name: data.name,
                phone: data.phone,
            },
        });
    }
}