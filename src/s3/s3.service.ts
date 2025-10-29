import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class S3Service {
    private readonly minioClient: Minio.Client;
    private readonly bucketName: string;

    constructor(private configService: ConfigService) {
        this.minioClient = new Minio.Client({
            endPoint: this.configService.get<string>('MINIO_ENDPOINT')!,
            port: +this.configService.get<number>('MINIO_PORT')!,
            useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
            accessKey: this.configService.get<string>('MINIO_ACCESS_KEY')!,
            secretKey: this.configService.get<string>('MINIO_SECRET_KEY')!,
        });
        this.bucketName = this.configService.get<string>('MINIO_BUCKET')!;
    }

    /**
   * Genera una URL firmada para SUBIR un archivo (PUT).
   * El cliente usará esta URL para enviar el archivo.
   */
    async getPresignedUploadUrl(fileName: string): Promise<string> {
        const bucketExists = await this.minioClient.bucketExists(this.bucketName);
        if (!bucketExists) {
            await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        }

        return this.minioClient.presignedPutObject(this.bucketName, fileName, 3600);
    }

    /**
     * Genera una URL firmada para DESCARGAR un archivo (GET).
     * El cliente (ej. la empresa) usará esta URL para ver el CV.
     */
    async getPresignedDownloadUrl(fileName: string): Promise<string> {
       
        return this.minioClient.presignedGetObject(this.bucketName, fileName, 900);
    }
}
