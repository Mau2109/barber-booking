import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';

import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { SupabaseAuthGuard } from '../../auth/supabase-auth.guard';

@Controller('reservations')
export class ReservationsController {
    constructor(
        private readonly reservationsService: ReservationsService,
    ) { }

    // ============================================================
    // 1. CREAR RESERVACIÓN
    // ============================================================
    @Post()
    create(@Body() data: CreateReservationDto) {
        return this.reservationsService.create(data);
    }
    // ============================================================
    // 2. OBTENER TODAS LAS RESERVACIONES
    //
    // Opcionalmente:
    // GET /api/v1/reservations?date=2026-08-11
    // ============================================================
    @UseGuards(SupabaseAuthGuard)
    @Get()
    findAll(@Query('date') date?: string) {
        return this.reservationsService.findAll(date);
    }

    // ============================================================
    // 3. OBTENER RESERVACIONES POR FECHA
    //
    // GET /api/v1/reservations/date/2026-08-11
    // ============================================================
    @UseGuards(SupabaseAuthGuard)
    @Get('date/:date')
    findByDate(@Param('date') date: string) {
        return this.reservationsService.findByDate(date);
    }

    // ============================================================
    // 4. CANCELAR RESERVACIÓN
    //
    // PATCH /api/v1/reservations/:id/cancel
    // ============================================================
    @Patch(':id/cancel')
    cancel(@Param('id') id: string) {
        return this.reservationsService.cancel(id);
    }

    // ============================================================
    // 5. COMPLETAR RESERVACIÓN
    //
    // PATCH /api/v1/reservations/:id/complete
    // ============================================================
    @UseGuards(SupabaseAuthGuard)
    @Patch(':id/complete')
    complete(@Param('id') id: string) {
        return this.reservationsService.complete(id);
    }
    // ============================================================
    // OBTENER RESERVACIONES DE UN CLIENTE POR TELÉFONO
    //
    // GET /api/v1/reservations/customer?phone=9511234567
    // ============================================================
    @Get('customer')
    findByCustomerPhone(
        @Query('phone') phone: string,
    ) {
        return this.reservationsService.findByCustomerPhone(phone);
    }
}