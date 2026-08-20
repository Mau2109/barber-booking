import { Body, Controller, Get, Post } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
    constructor(
        private readonly customersService: CustomersService,
    ) { }

    @Get()
    async findAll() {
        return this.customersService.findAll();
    }

    @Post()
    async create(
        @Body()
        body: {
            name: string;
            phone: string;
        },
    ) {
        return this.customersService.create(body);
    }

    @Post('resolve')
    async findOrCreate(
        @Body()
        body: {
            name: string;
            phone: string;
        },
    ) {
        return this.customersService.findOrCreate(body);
    }
}