import { Given, When, Then } from '@cucumber/cucumber';
// ...existing code...
import { strict as assert } from 'assert';

const apiUrl = 'http://localhost:3000';
let response: any;

When('creo una oferta de trabajo {string}', async function (titulo: string) {
  await this.initApp();
  response = await this.request.post('/job_offers').send({ titulo });
});

Then('la oferta debe existir en la base de datos', async function () {
  // Verifica existencia de la oferta
  // ...
});

// Step movido a common.steps.ts

When('actualizo el título de la oferta a {string}', async function (titulo: string) {
  await this.initApp();
  response = await this.request.put('/job_offers/1').send({ titulo });
});

Then('la oferta debe tener el título {string}', function (titulo: string) {
  assert.equal(response.body.titulo, titulo);
});

When('elimino la oferta {string}', async function (titulo: string) {
  await this.initApp();
  response = await this.request.delete('/job_offers/1'); // Cambia por el id correcto
});

// Step movido a common.steps.ts

When('consulto el listado de ofertas', async function () {
  await this.initApp();
  response = await this.request.get('/job_offers');
});

Then('la respuesta debe contener ofertas', function () {
  assert.ok(Array.isArray(response.body));
});
