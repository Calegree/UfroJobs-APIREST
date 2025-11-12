import { Test, TestingModule } from '@nestjs/testing';
import { S3Controller } from './s3.controller';
import { S3Service } from './s3.service';

describe('S3Controller', () => {
  let controller: S3Controller;
  let s3Service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [S3Controller],
      providers: [
        {
          provide: S3Service,
          useValue: {
            getPresignedUploadUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<S3Controller>(S3Controller);
    s3Service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPresignedUrl', () => {
    it('should return a presigned URL', async () => {
      const fileName = 'test.pdf';
      const expectedUrl = 'https://s3.amazonaws.com/bucket/test.pdf?signed_url_params';
      (s3Service.getPresignedUploadUrl as jest.Mock).mockResolvedValue(expectedUrl);

      const result = await controller.getPresignedUrl(fileName);

      expect(result).toEqual({ url: expectedUrl });
      expect(s3Service.getPresignedUploadUrl).toHaveBeenCalledWith(fileName);
    });
  });
});
