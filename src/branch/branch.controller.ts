import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { BranchService } from './branch.service';

@Controller('branch')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post()
  create(@Body() data: { name: string; companyId: number }) {
    return this.branchService.create(data);
  }

  @Get(':companyId')
  findAll(@Param('companyId') companyId: string) {
    return this.branchService.findAll(parseInt(companyId));
  }
}
