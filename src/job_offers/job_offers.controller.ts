import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JobOffersService } from './job_offers.service';
import { CreateJobOfferDto } from './dto/create-job_offer.dto';
import { UpdateJobOfferDto } from './dto/update-job_offer.dto';

@Controller('job-offers')
export class JobOffersController {
  constructor(
    private readonly jobOffersService: JobOffersService,
  ) {}

  @Post()
  create(@Body() createJobOfferDto: CreateJobOfferDto) {
    return this.jobOffersService.create(createJobOfferDto);
  }

  @Get()
  findAll() {
    return this.jobOffersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.jobOffersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateJobOfferDto: UpdateJobOfferDto) {
    return this.jobOffersService.update(id, updateJobOfferDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.jobOffersService.remove(id);
  }

  @Get('/company/:companyId')
  findByCompany(@Param('companyId') companyId: number) {
    return this.jobOffersService.findByCompany(companyId);
  }

  @Get(':id/applicants')
  async findApplicants(@Param('id') id: number) {
    return this.jobOffersService.findApplicantsByOffer(id);
  }

  @Patch(':id/toggle-state')
  toggleState(@Param('id') id: number) {
    return this.jobOffersService.toggleState(id);
  }
}
