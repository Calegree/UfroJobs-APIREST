import { Given } from '@cucumber/cucumber';

Given('el usuario {string} tiene el rol {string}', async function (email: string, rol: string) {
  // Crear usuario con rol específico
  // ...
});

Given('el usuario {string} existe', async function (email: string) {
  // Crear usuario si no existe
  // ...
});

Given('el usuario {string} existe y tiene la contraseña {string}', async function (email: string, password: string) {
  // Crear usuario con contraseña
  // ...
});

Given('la empresa {string} existe', async function (email: string) {
  // Crear empresa si no existe
  // ...
});

Given('la oferta {string} existe', async function (titulo: string) {
  // Crear oferta si no existe
  // ...
});

Given('el archivo {string} existe en S3', async function (archivo: string) {
  // Simula existencia de archivo en S3
  // ...
});

Given('el usuario {string} tiene postulaciones', async function (email: string) {
  // Crear postulaciones si no existen
  // ...
});

Given('la postulación del usuario {string} a {string} existe', async function (email: string, titulo: string) {
  // Crear postulación si no existe
  // ...
});

