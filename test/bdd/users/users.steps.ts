import { Given, When, Then } from '@cucumber/cucumber';
import request from 'supertest';
import { strict as assert } from 'assert';

const apiUrl = 'http://localhost:3000';
let response: any;

When('registro un usuario con email {string}', async function (email: string) {
  response = await request(apiUrl)
    .post('/users')
    .send({ email });
});

Then('el usuario debe existir en la base de datos', async function () {
  // Verifica existencia del usuario
  // ...
});

Given('el usuario {string} existe', async function (email: string) {
  // Crear usuario si no existe
  // ...
});

When('actualizo el nombre del usuario a {string}', async function (nombre: string) {
  response = await request(apiUrl)
    .put('/users/1') // Cambia por el id correcto
    .send({ nombre });
});

Then('el usuario debe tener el nombre {string}', function (nombre: string) {
  assert.equal(response.body.nombre, nombre);
});

When('elimino el usuario {string}', async function (email: string) {
  response = await request(apiUrl)
    .delete('/users/1'); // Cambia por el id correcto
});

Then('el usuario no debe existir en la base de datos', async function () {
  // Verifica que el usuario fue eliminado
  // ...
});

When('consulto el perfil del usuario {string}', async function (email: string) {
  response = await request(apiUrl)
    .get('/users/1'); // Cambia por el id correcto
});

Then('la respuesta debe contener los datos del usuario', function () {
  assert.ok(response.body.email);
});
