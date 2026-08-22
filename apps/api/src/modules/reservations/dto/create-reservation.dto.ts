import {
    IsDateString,
    IsString,
    IsUUID,
    Matches,
} from 'class-validator';

export class CreateReservationDto {
    // ============================================================
    // CLIENTE
    // ============================================================

    @IsUUID()
    customerId: string;

    // ============================================================
    // SERVICIO
    // ============================================================

    @IsUUID()
    serviceId: string;

    // ============================================================
    // FECHA
    //
    // YYYY-MM-DD
    // ============================================================

    @IsDateString()
    date: string;

    // ============================================================
    // HORA
    //
    // HH:mm
    // ============================================================

    @IsString()
    @Matches(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        {
            message:
                'startTime debe tener formato HH:mm',
        },
    )
    startTime: string;
}