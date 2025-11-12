import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User, UserRole, UserState } from '../users/users.entity';
import { RegisterCompanyDto, RegisterDto } from './dto/auth.dto';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let companiesService: CompaniesService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: CompaniesService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    companiesService = module.get<CompaniesService>(CompaniesService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if validation is successful', async () => {
      const user = { email: 'test@test.com', password: 'hashedpassword' };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await service.validateUser('test@test.com', 'password');
      expect(result).toEqual(user);
    });

    it('should return null if user not found', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      const result = await service.validateUser('test@test.com', 'password');
      expect(result).toBeNull();
    });

    it('should return null if password does not match', async () => {
      const user = { email: 'test@test.com', password: 'hashedpassword' };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const result = await service.validateUser('test@test.com', 'wrongpassword');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token and user info', async () => {
      const user = { id: 1, role: UserRole.STUDENT };
      jest.spyOn(service, 'validateUser').mockResolvedValue(user as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('test_token');

      const result = await service.login({ email: 'test@test.com', password: 'password' });

      expect(result).toEqual({
        access_token: 'test_token',
        user: { id: user.id, role: user.role },
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(service, 'validateUser').mockResolvedValue(null);
      await expect(service.login({ email: 'test@test.com', password: 'password' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto: RegisterDto = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password',
        phone: '123456789',
        career: 'Computer Science',
        academicYear: '3',
        studentId: '12345',
        skills: ['nestjs', 'typeorm'],
      };
      const hashedPassword = 'hashedpassword';
      const createdUser = { id: 1, ...registerDto, role: UserRole.STUDENT, state: UserState.ACTIVE };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      jest.spyOn(usersService, 'create').mockResolvedValue(createdUser as any);

      const result = await service.register(registerDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(usersService.create).toHaveBeenCalledWith({
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
        phone: registerDto.phone,
        role: UserRole.STUDENT,
        state: UserState.ACTIVE,
        career: registerDto.career,
        academicYear: registerDto.academicYear,
        rut: registerDto.studentId,
        skills: registerDto.skills,
      });
      expect(result).toEqual(createdUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto: RegisterDto = {
        name: 'Test',
        email: 'test@test.com',
        password: 'password',
        phone: '123456789',
        career: 'some-career',
        academicYear: '1',
        studentId: '12345',
      };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue({} as User);
      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('registerCompany', () => {
    it('should register a new company successfully', async () => {
      const registerDto: RegisterCompanyDto = {
        name: 'Test Company',
        email: 'company@test.com',
        pass: 'password',
        phone: '987654321',
        web: 'test.com',
        rut: '12345678-9',
        localization: 'Test Location',
        description: 'A test company',
        documentKeys: ['doc1.pdf'],
      };
      const hashedPassword = 'hashedpassword';
      const createdCompany = { id: 1, ...registerDto };

      jest.spyOn(companiesService, 'findByEmail').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      jest.spyOn(companiesService, 'create').mockResolvedValue(createdCompany as any);

      const result = await service.registerCompany(registerDto);

      expect(companiesService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.pass, 10);
      expect(companiesService.create).toHaveBeenCalledWith({
        name: registerDto.name,
        phone: registerDto.phone,
        email: registerDto.email,
        web: registerDto.web,
        rut: registerDto.rut,
        localization: registerDto.localization,
        description: registerDto.description,
        documents: registerDto.documentKeys,
        pass: hashedPassword,
      });
      expect(result).toEqual(createdCompany);
    });

    it('should throw ConflictException if company email already exists', async () => {
      const registerDto: RegisterCompanyDto = { name: 'Test', email: 'company@test.com', pass: 'password', phone: '', web: '', rut: '', localization: '', description: '', documentKeys: [] };
      jest.spyOn(companiesService, 'findByEmail').mockResolvedValue({} as any);
      await expect(service.registerCompany(registerDto)).rejects.toThrow(ConflictException);
    });
  });
});