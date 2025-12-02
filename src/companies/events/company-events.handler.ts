import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CompaniesService } from '../companies.service';

@Controller()
export class CompanyEventsHandler {
  constructor(private readonly companiesService: CompaniesService) {}

  @EventPattern('company_created')
  async handleCompanyCreated(@Payload() data: { companyId: number }) {
    console.log(`Processing new company creation event for company ID: ${data.companyId}`);
    try {
      const company = await this.companiesService.findOne(data.companyId);
      if (company) {
        console.log(`Company ${company.name} (ID: ${data.companyId}) successfully registered and processed.`);
        // Add additional processing logic here
      }
    } catch (error) {
      console.error(`Failed to process company creation event for company ID: ${data.companyId}`, error);
    }
  }
}
