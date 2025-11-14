import { Given, Then } from '@cucumber/cucumber';
import request from 'supertest';
import { strict as assert } from 'assert';

const apiUrl = 'http://localhost:3000';
let response: any;

Given('el usuario {string} postula a la oferta {string}', async function (email: string, titulo: string) {
  // Simula la postulación y el envío de email
  // ...
});

Then('se debe enviar un email de confirmación a {string}', async function (email: string) {
  // Verifica que se envió el email
  // ...
});

Given('la postulación del usuario {string} a {string} cambia de estado', async function (email: string, titulo: string) {
  // Simula el cambio de estado
  // ...
});

Then('el usuario debe recibir una notificación', async function () {
  // Verifica la notificación
  // ...
});
