import { setWorldConstructor } from '@cucumber/cucumber';
import * as request from 'supertest';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';

class CustomWorld {
  public request: any;
  public app: any;
  public response: any;

  constructor() {
    this.request = request;
    this.app = null;
    this.response = null;
  }

  async initApp() {
        if (!this.app) {
          try {
            console.log('[World] Inicializando NestJS App...');
            this.app = await NestFactory.create(AppModule, { logger: false });
            await this.app.init();
            this.request = (request as any)(this.app.getHttpServer());
            console.log('[World] App inicializada correctamente');
          } catch (error) {
            console.error('[World] Error inicializando la app:', error);
            throw error;
          }
        }
  }
}

setWorldConstructor(CustomWorld);
