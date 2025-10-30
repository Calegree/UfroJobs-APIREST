import { Controller, Post, Body } from '@nestjs/common';
import { S3Service } from './s3.service';

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Post('presigned-url')
  async getPresignedUrl(@Body('fileName') fileName: string) {
    const presignedUrl = await this.s3Service.getPresignedUploadUrl(fileName);
    return { url: presignedUrl };
  }
}
