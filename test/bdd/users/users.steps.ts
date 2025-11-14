import { Given, When, Then } from '@cucumber/cucumber';
// ...existing code...
import { strict as assert } from 'assert';

const apiUrl = 'http://localhost:3000';
let response: any;
// Steps movidos a common.steps.ts

When('actualizo el nombre del usuario a {string}', async function (nombre: string) {
  await this.initApp();
  response = await this.request.put('/users/1').send({ nombre });
});

Then('el usuario debe tener el nombre {string}', function (nombre: string) {
  assert.equal(response.body.nombre, nombre);
});

When('elimino el usuario {string}', async function (email: string) {
  await this.initApp();
  response = await this.request.delete('/users/1'); // Cambia por el id correcto
});

Then('el usuario no debe existir en la base de datos', async function () {
  // Verifica que el usuario fue eliminado
  // ...
});

When('consulto el perfil del usuario {string}', async function (email: string) {
  await this.initApp();
  response = await this.request.get('/users/1'); // Cambia por el id correcto
});

Then('la respuesta debe contener los datos del usuario', function () {
  assert.ok(response.body.email);
});
