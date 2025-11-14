import { Given, When, Then } from '@cucumber/cucumber';
import request from 'supertest';
import { strict as assert } from 'assert';

const apiUrl = 'http://localhost:3000';
let response: any;

When('registro una empresa con email {string}', async function (email: string) {
  response = await request(apiUrl)
    .post('/companies')
    .send({ email });
});

Then('la empresa debe existir en la base de datos', async function () {
  // Verifica existencia de la empresa
  // ...
});

Given('la empresa {string} existe', async function (email: string) {
  // Crear empresa si no existe
  // ...
});

When('actualizo el nombre de la empresa a {string}', async function (nombre: string) {
  response = await request(apiUrl)
    .put('/companies/1') // Cambia por el id correcto
    .send({ nombre });
});

Then('la empresa debe tener el nombre {string}', function (nombre: string) {
  assert.equal(response.body.nombre, nombre);
});

When('elimino la empresa {string}', async function (email: string) {
  response = await request(apiUrl)
    .delete('/companies/1'); // Cambia por el id correcto
});

Then('la empresa no debe existir en la base de datos', async function () {
  // Verifica que la empresa fue eliminada
  // ...
});

When('consulto el listado de empresas', async function () {
  response = await request(apiUrl)
    .get('/companies');
});

Then('la respuesta debe contener empresas', function () {
  assert.ok(Array.isArray(response.body));
});
