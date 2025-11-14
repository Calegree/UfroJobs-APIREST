import { Given, When, Then } from '@cucumber/cucumber';
import request from 'supertest';
import { strict as assert } from 'assert';

const apiUrl = 'http://localhost:3000';
let response: any;

When('creo una oferta de trabajo {string}', async function (titulo: string) {
  response = await request(apiUrl)
    .post('/job_offers')
    .send({ titulo });
});

Then('la oferta debe existir en la base de datos', async function () {
  // Verifica existencia de la oferta
  // ...
});

Given('la oferta {string} existe', async function (titulo: string) {
  // Crear oferta si no existe
  // ...
});

When('actualizo el título de la oferta a {string}', async function (titulo: string) {
  response = await request(apiUrl)
    .put('/job_offers/1') // Cambia por el id correcto
    .send({ titulo });
});

Then('la oferta debe tener el título {string}', function (titulo: string) {
  assert.equal(response.body.titulo, titulo);
});

When('elimino la oferta {string}', async function (titulo: string) {
  response = await request(apiUrl)
    .delete('/job_offers/1'); // Cambia por el id correcto
});

Then('la oferta no debe existir en la base de datos', async function () {
  // Verifica que la oferta fue eliminada
  // ...
});

When('consulto el listado de ofertas', async function () {
  response = await request(apiUrl)
    .get('/job_offers');
});

Then('la respuesta debe contener ofertas', function () {
  assert.ok(Array.isArray(response.body));
});
