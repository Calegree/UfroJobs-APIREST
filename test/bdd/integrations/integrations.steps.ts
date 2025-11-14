import { Given, When, Then } from '@cucumber/cucumber';
import request from 'supertest';
import { strict as assert } from 'assert';

const apiUrl = 'http://localhost:3000';
let response: any;

Given('el usuario {string} existe', async function (email: string) {
  // Crear usuario si no existe
  // ...
});

When('sube el archivo {string} a S3', async function (archivo: string) {
  // Simula la subida de archivo
  // ...
});

Then('el archivo debe estar disponible en S3', async function () {
  // Verifica que el archivo está en S3
  // ...
});

Given('el archivo {string} existe en S3', async function (archivo: string) {
  // Simula existencia de archivo en S3
  // ...
});

When('el usuario descarga el archivo {string}', async function (archivo: string) {
  response = await request(apiUrl)
    .get(`/s3/download/${archivo}`);
});

Then('la respuesta debe contener el archivo', function () {
  assert.equal(response.status, 200);
  // Verifica contenido del archivo
});

When('se crea una empresa', async function () {
  response = await request(apiUrl)
    .post('/companies')
    .send({ email: 'empresa@test.com' });
});

Then('se debe emitir un mensaje {string} a RabbitMQ', async function (mensaje: string) {
  // Verifica que se emitió el mensaje
  // ...
});
