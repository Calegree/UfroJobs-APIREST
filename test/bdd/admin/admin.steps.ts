import { Given, When, Then } from '@cucumber/cucumber';
import { strict as assert } from 'assert';
let response: any;

// Step movido a common.steps.ts

When('accede al dashboard de administración', async function () {
  await this.initApp();
  response = await this.request.get('/admin/dashboard');
});


Then('debe ver métricas', function () {
  assert.ok(response.body.metrics);
});

When('accede a la sección de métricas', async function () {
  await this.initApp();
  response = await this.request.get('/admin/metrics');
});

Then('la respuesta debe contener métricas', function () {
  expect(response.body).toHaveProperty('metrics');
});

When('accede a la gestión de usuarios y empresas', async function () {
  await this.initApp();
  response = await this.request.get('/admin/manage');
});

Then('debe poder ver y modificar usuarios y empresas', function () {
  assert.ok(response.body.users);
  assert.ok(response.body.companies);
});
