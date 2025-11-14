import { Given, When, Then } from '@cucumber/cucumber';
import request from 'supertest';
import { strict as assert } from 'assert';

const apiUrl = 'http://localhost:3000'; // Cambia si usas otro puerto
let response: any;

Given('el usuario {string} existe y tiene la contraseña {string}', async function (email: string, password: string) {
  // Aquí deberías crear el usuario en la base de datos o mockearlo
  // ...
});

When('el usuario intenta iniciar sesión con email {string} y contraseña {string}', async function (email: string, password: string) {
  response = await request(apiUrl)
    .post('/auth/login')
    .send({ email, password });
});

Then('la respuesta debe ser exitosa y debe recibir un token', function () {
  assert.equal(response.status, 201);
  assert.ok(response.body.access_token);
});

Given('el usuario {string} tiene el rol {string}', async function (email: string, role: string) {
  // Crear usuario con rol específico
  // ...
});

When('el usuario accede a la ruta protegida {string}', async function (ruta: string) {
  // Suponiendo que ya tienes el token
  response = await request(apiUrl)
    .get(ruta)
    .set('Authorization', `Bearer ${response.body.access_token}`);
});

Then('la respuesta debe ser exitosa', function () {
  assert.equal(response.status, 200);
});

Then('debe ver el dashboard de administración', function () {
  assert.ok(response.body.dashboard);
});

When('registro un usuario con email {string} y contraseña {string}', async function (email: string, password: string) {
  response = await request(apiUrl)
    .post('/auth/register')
    .send({ email, password });
});

Then('el usuario debe existir en la base de datos', async function () {
  // Aquí deberías consultar la base de datos o la API para verificar
  // ...
});
