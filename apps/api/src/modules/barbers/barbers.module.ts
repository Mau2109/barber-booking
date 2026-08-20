import { Module } from '@nestjs/common';
import { BarbersController } from './barbers.controller';
import { BarbersService } from './barbers.service';

@Module({
    controllers: [BarbersController],
    providers: [BarbersService],
})
export class BarbersModule { }