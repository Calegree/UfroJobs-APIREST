import { Given, When, Then } from '@cucumber/cucumber';
// ...existing code...
import { strict as assert } from 'assert';

const apiUrl = 'http://localhost:3000'; // Cambia si usas otro puerto
let response: any;


When('el usuario accede a la ruta protegida {string}', async function (ruta: string) {
  await this.initApp();
  response = await this.request.get(ruta).set('Authorization', `Bearer ${response.body.access_token}`);
});


Then('debe ver el dashboard de administración', function () {
  assert.ok(response.body.dashboard);
});

When('registro un usuario con email {string} y contraseña {string}', async function (email: string, password: string) {
  await this.initApp();
  response = await this.request.post('/auth/register').send({ email, password });
});

Then('el usuario debe existir en la base de datos', async function () {
  // Aquí deberías consultar la base de datos o la API para verificar
  // ...
});
