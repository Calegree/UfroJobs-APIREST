import { Given, When, Then } from '@cucumber/cucumber';
import request from 'supertest';
import { strict as assert } from 'assert';

const apiUrl = 'http://localhost:3000';
let response: any;

Given('el usuario {string} y la oferta {string} existen', async function (email: string, titulo: string) {
  // Crear usuario y oferta si no existen
  // ...
});

When('el usuario postula a la oferta {string}', async function (titulo: string) {
  response = await request(apiUrl)
    .post('/applications')
    .send({ oferta: titulo });
});

Then('la postulación debe existir en la base de datos', async function () {
  // Verifica existencia de la postulación
  // ...
});

Given('el usuario {string} tiene postulaciones', async function (email: string) {
  // Crear postulaciones si no existen
  // ...
});

When('consulto las postulaciones del usuario', async function () {
  response = await request(apiUrl)
    .get('/applications?user=user@test.com');
});

Then('la respuesta debe contener las postulaciones', function () {
  assert.ok(Array.isArray(response.body));
});

Given('la postulación del usuario {string} a {string} existe', async function (email: string, titulo: string) {
  // Crear postulación si no existe
  // ...
});

When('retiro la postulación', async function () {
  response = await request(apiUrl)
    .delete('/applications/1'); // Cambia por el id correcto
});

Then('la postulación no debe existir en la base de datos', async function () {
  // Verifica que la postulación fue eliminada
  // ...
});
