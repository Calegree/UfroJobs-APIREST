import { Given, When, Then } from '@cucumber/cucumber';
import request from 'supertest';
import { strict as assert } from 'assert';

const apiUrl = 'http://localhost:3000';
let response: any;

Given('el usuario {string} tiene el rol {string}', async function (email: string, rol: string) {
  // Crear usuario con rol admin
  // ...
});

When('accede al dashboard de administración', async function () {
  response = await request(apiUrl)
    .get('/admin/dashboard');
});

Then('la respuesta debe ser exitosa', function () {
  assert.equal(response.status, 200);
});

Then('debe ver métricas', function () {
  assert.ok(response.body.metrics);
});

When('accede a la sección de métricas', async function () {
  response = await request(apiUrl)
    .get('/admin/metrics');
});

Then('la respuesta debe contener métricas', function () {
  expect(response.body).toHaveProperty('metrics');
});

When('accede a la gestión de usuarios y empresas', async function () {
  response = await request(apiUrl)
    .get('/admin/manage');
});

Then('debe poder ver y modificar usuarios y empresas', function () {
  assert.ok(response.body.users);
  assert.ok(response.body.companies);
});
