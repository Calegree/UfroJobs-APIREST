import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole, UserState } from './users.entity';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@user.com',
    password: 'password',
    role: UserRole.STUDENT,
    state: UserState.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
    skills: [],
    applications: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createDto: CreateUserDto = {
        name: 'Test User',
        email: 'test@user.com',
        password: 'password',
        role: UserRole.STUDENT,
        cv: 'cv.pdf',
      };
      jest.spyOn(userRepository, 'create').mockReturnValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockUser);

      const result = await service.create(createDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      jest.spyOn(userRepository, 'find').mockResolvedValue([mockUser]);
      const result = await service.findAll();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      const result = await service.findOne(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateDto: UpdateUserDto = { name: 'Updated User' };
      const updatedUser = { ...mockUser, ...updateDto };
      jest.spyOn(userRepository, 'update').mockResolvedValue({ affected: 1 } as UpdateResult);
      jest.spyOn(service, 'findById').mockResolvedValue(updatedUser);

      const result = await service.update(1, updateDto);
      expect(result.name).toEqual('Updated User');
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      jest.spyOn(userRepository, 'delete').mockResolvedValue({ affected: 1 } as DeleteResult);
      await service.remove(1);
      expect(userRepository.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      const result = await service.findByEmail('test@user.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      const result = await service.findById(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      await expect(service.findById(999)).rejects.toThrow('Usuario no encontrado');
    });
  });

  describe('toggleState', () => {
    it('should toggle state from ACTIVE to INACTIVE', async () => {
      const user = { ...mockUser, state: UserState.ACTIVE };
      const expectedUser = { ...mockUser, state: UserState.INACTIVE };
      jest.spyOn(service, 'findById').mockResolvedValue(user);
      jest.spyOn(userRepository, 'save').mockResolvedValue(expectedUser);

      const result = await service.toggleState(1);
      expect(result.state).toEqual(UserState.INACTIVE);
    });
  });

  describe('countEstudiantes', () => {
    it('should return the count of students', async () => {
      jest.spyOn(userRepository, 'count').mockResolvedValue(5);
      const result = await service.countEstudiantes();
      expect(result).toEqual(5);
      expect(userRepository.count).toHaveBeenCalledWith({ where: { role: UserRole.STUDENT } });
    });
  });

  describe('updateCvKey', () => {
    it('should update the cv key for a user', async () => {
      const newCvKey = 'new-cv.pdf';
      const updatedUser = { ...mockUser, cvKey: newCvKey };
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(mockUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(updatedUser);

      const result = await service.updateCvKey(1, newCvKey);
      expect(result.cvKey).toEqual(newCvKey);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);
      await expect(service.updateCvKey(999, 'cv.pdf')).rejects.toThrow(NotFoundException);
    });
  });
});