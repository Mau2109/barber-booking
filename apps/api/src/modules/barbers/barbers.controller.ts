import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    UseGuards
} from '@nestjs/common';

import { BarbersService } from './barbers.service';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';

@Controller('barbers')
export class BarbersController {
    constructor(
        private readonly barbersService: BarbersService,
    ) { }

    // ============================================================
    // OBTENER BARBEROS ACTIVOS
    // ============================================================
    @Get()
    findAll() {
        return this.barbersService.findAll();
    }

    // ============================================================
    // OBTENER TODOS PARA ADMINISTRACIÓN
    // ============================================================
    @UseGuards(SupabaseAuthGuard)
    @Get('admin')
    findAllAdmin() {
        return this.barbersService.findAllAdmin();
    }

    // ============================================================
    // CREAR BARBERO
    // ============================================================
    @UseGuards(SupabaseAuthGuard)
    @Post()
    create(
        @Body()
        data: {
            name: string;
        },
    ) {
        return this.barbersService.create(data);
    }

    // ============================================================
    // EDITAR / ACTIVAR / DESACTIVAR
    // ============================================================
    @UseGuards(SupabaseAuthGuard)
    @Patch(':id')
    update(
        @Param('id') id: string,

        @Body()
        data: {
            name?: string;
            isActive?: boolean;
        },
    ) {
        return this.barbersService.update(
            id,
            data,
        );
    }
}