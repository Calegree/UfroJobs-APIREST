import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserRole, UserState,User } from '../src/users/users.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

describe('AuthController (e2e) - CU-01: Iniciar Sesión', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let testUser: User;
  const rawPassword = 'Password123!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    userRepository = moduleFixture.get(getRepositoryToken(User));
  });

  beforeEach(async () => {
    // Delete child tables first (applications), then parent tables (users)
    await userRepository.query('DELETE FROM "applications"');
    await userRepository.query('DELETE FROM "users"');
    
    // Crear usuario de prueba con contraseña hasheada
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    testUser = await userRepository.save(
      userRepository.create({
        name: 'Auth Test User',
        email: 'auth@test.com',
        password: hashedPassword,
        role: UserRole.STUDENT,
        state: UserState.ACTIVE,
        rut: '11.222.333-4',
        career: 'Ingeniería',
        academicYear: '1',
      }),
    );
  });

  afterAll(async () => {
    // Delete child tables first (applications), then parent tables (users)
    await userRepository.query('DELETE FROM "applications"');
    await userRepository.query('DELETE FROM "users"');
    await app.close();
  });

  it('IT-AUTH-01: Login exitoso debe retornar JWT (Camino Feliz)', async () => {
    const loginDto = {
      email: 'auth@test.com',
      password: rawPassword,
    };

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(201); // Login devuelve 201 Created

    expect(response.body).toHaveProperty('access_token');
    expect(response.body.user).toBeDefined();
    expect(response.body.user.id).toEqual(testUser.id);
    expect(response.body.user.role).toEqual(UserRole.STUDENT);
  });

  it('IT-AUTH-02: Login con contraseña incorrecta debe fallar (401)', async () => {
    const loginDto = {
      email: 'auth@test.com',
      password: 'WrongPassword',
    };

    await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(401); // Unauthorized
  });

  it('IT-AUTH-03: Login con usuario inexistente debe fallar (401)', async () => {
    const loginDto = {
      email: 'noexist@test.com',
      password: 'AnyPassword',
    };

    await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginDto)
      .expect(401); // Unauthorized
  });
});