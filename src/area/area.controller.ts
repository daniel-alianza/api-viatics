import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { AreaService } from './area.service';

@Controller('area')
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @Post()
  create(@Body() data: { name: string; branchId: number }) {
    return this.areaService.create(data);
  }

  @Get(':branchId')
  findAll(@Param('branchId') branchId: string) {
    return this.areaService.findAll(parseInt(branchId));
  }
}
