import { Given, When, Then } from '@cucumber/cucumber';
// ...existing code...
import { strict as assert } from 'assert';

const apiUrl = 'http://localhost:3000';
let response: any;

Given('el usuario {string} y la oferta {string} existen', async function (email: string, titulo: string) {
  // Crear usuario y oferta si no existen
  // ...
});

When('el usuario postula a la oferta {string}', async function (titulo: string) {
  await this.initApp();
  response = await this.request.post('/applications').send({ oferta: titulo });
});

Then('la postulación debe existir en la base de datos', async function () {
  // Verifica existencia de la postulación
  // ...
});

When('consulto las postulaciones del usuario', async function () {
  await this.initApp();
  response = await this.request.get('/applications?user=user@test.com');
});

Then('la respuesta debe contener las postulaciones', function () {
  assert.ok(Array.isArray(response.body));
});


When('retiro la postulación', async function () {
  await this.initApp();
  response = await this.request.delete('/applications/1'); // Cambia por el id correcto
});

Then('la postulación no debe existir en la base de datos', async function () {
  // Verifica que la postulación fue eliminada
  // ...
});
