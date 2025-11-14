import { Given, When, Then } from '@cucumber/cucumber';
// ...existing code...
import { strict as assert } from 'assert';

const apiUrl = 'http://localhost:3000';
let response: any;

When('registro una empresa con email {string}', async function (email: string) {
  await this.initApp();
  response = await this.request.post('/companies').send({ email });
});

Then('la empresa debe existir en la base de datos', async function () {
  // Verifica existencia de la empresa
  // ...
});

// Step movido a common.steps.ts

When('actualizo el nombre de la empresa a {string}', async function (nombre: string) {
  await this.initApp();
  response = await this.request.put('/companies/1').send({ nombre });
});

Then('la empresa debe tener el nombre {string}', function (nombre: string) {
  assert.equal(response.body.nombre, nombre);
});

When('elimino la empresa {string}', async function (email: string) {
    // Step movido a common.steps.ts
});

When('consulto el listado de empresas', async function () {
  await this.initApp();
  response = await this.request.get('/companies');
});

Then('la respuesta debe contener empresas', function () {
  assert.ok(Array.isArray(response.body));
});
