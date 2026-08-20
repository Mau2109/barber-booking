import { Body, Controller, Get, Post, Patch, Param, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { SupabaseAuthGuard } from "../../auth/supabase-auth.guard";

@Controller('services')
export class ServicesController {
    constructor(
        private readonly servicesService: ServicesService,
    ) { }

    @Get()
    async findAll() {
        return this.servicesService.findAll();
    }

    @UseGuards(SupabaseAuthGuard)
    @Get('admin')
    async findAllAdmin() {
        return this.servicesService.findAllAdmin();
    }

    @UseGuards(SupabaseAuthGuard)
    @Post()
    async create(
        @Body()
        data: {
            name: string;
            description?: string;
            durationMinutes: number;
            price: number;
        },
    ) {
        return this.servicesService.create(data);
    }

    @UseGuards(SupabaseAuthGuard)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body()
        data: {
            name?: string;
            description?: string;
            durationMinutes?: number;
            price?: number;
            isActive?: boolean;
        },
    ) {
        return this.servicesService.update(
            id,
            data,
        );
    }
}
