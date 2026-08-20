import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ServicesModule } from './modules/services/services.module';
import { ConfigModule } from '@nestjs/config';
import { BarbersModule } from './modules/barbers/barbers.module';
import { CustomersModule } from './modules/customers/curtomers.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { ReservationsModule } from './modules/reservations/reservations.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }), DatabaseModule, ServicesModule, BarbersModule, CustomersModule, AvailabilityModule, ReservationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
