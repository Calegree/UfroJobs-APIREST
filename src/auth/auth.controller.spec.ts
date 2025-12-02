import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto, RegisterCompanyDto, RegisterDto } from './dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
            registerCompany: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login with the correct data', async () => {
      const loginDto: LoginDto = {
        email: 'test@test.com',
        password: 'password',
      };
      await controller.login(loginDto);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('register', () => {
    it('should call authService.register with the correct data', async () => {
      const registerDto: RegisterDto = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password123',
        phone: '123456789',
        career: 'Computer Science',
        academicYear: '2023',
        studentId: '12345',
      };
      await controller.register(registerDto);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('registerCompany', () => {
    it('should call authService.registerCompany with the correct data', async () => {
      const registerCompanyDto: RegisterCompanyDto = {
        name: 'Test Company',
        phone: '123456789',
        email: 'company@test.com',
        rut: '12.345.678-9',
        localization: 'Someplace',
        description: 'A test company',
        password: 'password123',
        documentKeys: ['key1', 'key2'],
      };
      await controller.registerCompany(registerCompanyDto);
      expect(authService.registerCompany).toHaveBeenCalledWith(
        registerCompanyDto,
      );
    });
  });
});
