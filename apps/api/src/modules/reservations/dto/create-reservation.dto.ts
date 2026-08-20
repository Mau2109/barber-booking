import {
    IsISO8601,
    IsUUID,
} from 'class-validator';

export class CreateReservationDto {
    @IsUUID()
    customerId: string;

    @IsUUID()
    serviceId: string;

    @IsISO8601()
    startTime: string;
}