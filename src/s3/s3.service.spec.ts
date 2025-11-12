import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

jest.mock('minio', () => {
  const mMinio = {
    Client: jest.fn(() => ({
      presignedPutObject: jest.fn().mockResolvedValue('http://presigned-upload-url.com'),
      presignedGetObject: jest.fn().mockResolvedValue('http://presigned-download-url.com'),
      bucketExists: jest.fn().mockResolvedValue(true),
      makeBucket: jest.fn().mockResolvedValue(undefined),
    })),
  };
  return mMinio;
});

describe('S3Service', () => {
  let s3Service: S3Service;
  let minioClient: Minio.Client;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              switch (key) {
                case 'MINIO_ENDPOINT':
                  return 'localhost';
                case 'MINIO_PORT':
                  return 9000;
                case 'MINIO_USE_SSL':
                  return 'false';
                case 'MINIO_ACCESS_KEY':
                  return 'minioadmin';
                case 'MINIO_SECRET_KEY':
                  return 'minioadmin';
                case 'MINIO_BUCKET':
                  return 'test-bucket';
                default:
                  return null;
              }
            }),
          },
        },
      ],
    }).compile();

    s3Service = module.get<S3Service>(S3Service);
    minioClient = s3Service['minioClient'];
  });

  it('should be defined', () => {
    expect(s3Service).toBeDefined();
  });

  it('should get a presigned URL for upload', async () => {
    const url = await s3Service.getPresignedUploadUrl('test-file.txt');
    expect(url).toBe('http://presigned-upload-url.com');
    expect(minioClient.presignedPutObject).toHaveBeenCalledWith('test-bucket', 'test-file.txt', 3600);
  });

  it('should get a presigned URL for download', async () => {
    const url = await s3Service.getPresignedDownloadUrl('test-file.txt');
    expect(url).toBe('http://presigned-download-url.com');
    expect(minioClient.presignedGetObject).toHaveBeenCalledWith('test-bucket', 'test-file.txt', 900);
  });

  it('should create bucket if it does not exist', async () => {
    (minioClient.bucketExists as jest.Mock).mockResolvedValueOnce(false);
    await s3Service.getPresignedUploadUrl('test-file.txt');
    expect(minioClient.makeBucket).toHaveBeenCalledWith('test-bucket', 'us-east-1');
  });

  it('should handle errors when getting presigned upload url', async () => {
    (minioClient.presignedPutObject as jest.Mock).mockRejectedValueOnce(
      new Error('Upload URL failed'),
    );
    await expect(
      s3Service.getPresignedUploadUrl('test.txt'),
    ).rejects.toThrow('Upload URL failed');
  });

  it('should handle errors when getting presigned download url', async () => {
    (minioClient.presignedGetObject as jest.Mock).mockRejectedValueOnce(
      new Error('Download URL failed'),
    );
    await expect(
      s3Service.getPresignedDownloadUrl('non-existent-file.txt'),
    ).rejects.toThrow('Download URL failed');
  });
});

