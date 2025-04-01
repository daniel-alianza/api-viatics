import { Controller, Get, Post, Body } from '@nestjs/common';
import { CompaniesService } from './companies.service';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async findAll() {
    return await this.companiesService.findAll();
  }

  @Post()
  async create(@Body() data: { name: string }) {
    return await this.companiesService.create(data);
  }
}
