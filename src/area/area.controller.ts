import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { AreaService } from './area.service';
import { CreateAreaDto } from './dto/create-area.dto';

@Controller('area')
export class AreaController {
  constructor(private readonly areaService: AreaService) {}

  @Post()
  create(@Body() data: CreateAreaDto) {
    return this.areaService.create(data);
  }

  @Get(':branchId')
  async findAll(@Param('branchId', ParseIntPipe) branchId: number) {
    return this.areaService.findAll(branchId);
  }
}
