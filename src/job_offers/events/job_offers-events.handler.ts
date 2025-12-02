import {Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { JobOffersService } from '../job_offers.service';

@Controller()
export class JobOffersEventsHandler {
  constructor(private readonly jobOffersService: JobOffersService) {}

  @EventPattern('job_offer_created')
  async handleJobOfferCreated(@Payload() data: { id: number }) {
    console.log(`Processing new job offer creation event for offer ID: ${data.id}`);
    try {
      const jobOffer = await this.jobOffersService.findOne(data.id);
      if (jobOffer) {
        console.log(`Job offer ${jobOffer.title} (ID: ${data.id}) successfully registered and processed.`);
        // Add additional processing logic here
      }
    } catch (error) {
      console.error(`Failed to process job offer creation event for offer ID: ${data.id}`, error);
    }
  }
}