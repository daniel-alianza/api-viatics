import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './dto/branch.dto';

@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() data: CreateBranchDto) {
    return this.branchService.create(data);
  }

  @Get(':companyId')
  findAll(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.branchService.findAll(companyId);
  }
}
