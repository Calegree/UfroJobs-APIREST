import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  findAll() {
    return this.companiesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(@Req() req) {
    const companyId = req.user.userId || req.user.companyId;
    return this.companiesService.findOne(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(Number(id), updateCompanyDto);
  }

  @Patch(':id/toggle-state')
  toggleCompanyState(@Param('id') id: string) {
    return this.companiesService.toggleState(Number(id));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.companiesService.remove(Number(id));
  }
}
