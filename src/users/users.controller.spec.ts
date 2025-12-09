import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findPublicProfile: jest.fn(),
            create: jest.fn(),
            findByRole: jest.fn(),
            findById: jest.fn(),
            toggleState: jest.fn(),
            updateCvKey: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('controller endpoints', () => {
    it('create calls service.create', async () => {
      const dto = { name: 'User' } as any;
      const spy = jest.spyOn((controller as any).usersService, 'create').mockResolvedValue({ id: 1 } as any);
      const res = await controller.create(dto);
      expect(spy).toHaveBeenCalledWith(dto);
      expect(res).toEqual({ id: 1 });
    });

    it('getMe calls findPublicProfile with req.user.userId', async () => {
      const mockReq = { user: { userId: 7 } } as any;
      const spy = jest.spyOn((controller as any).usersService, 'findPublicProfile').mockResolvedValue({ id: 7 } as any);
      const res = await controller.getMe(mockReq);
      expect(spy).toHaveBeenCalledWith(7);
      expect(res).toEqual({ id: 7 });
    });

    it('updateMe calls service.update with resolved userId', async () => {
      const mockReq = { user: { userId: 9 } } as any;
      const dto = { name: 'New' } as any;
      // provider mock did not include update, attach mock here
      (controller as any).usersService.update = jest.fn().mockResolvedValue({ id: 9 } as any);
      const res = await controller.updateMe(mockReq as any, dto);
      expect((controller as any).usersService.update).toHaveBeenCalledWith(9, dto);
      expect(res).toEqual({ id: 9 });
    });

    it('updateUserCv calls updateCvKey with cvKey', async () => {
      const mockReq = { user: { sub: 11 } } as any;
      const spy = jest.spyOn((controller as any).usersService, 'updateCvKey').mockResolvedValue({ id: 11 } as any);
      const res = await controller.updateUserCv(mockReq as any, 'cv.pdf');
      expect(spy).toHaveBeenCalledWith(11, 'cv.pdf');
      expect(res).toEqual({ id: 11 });
    });

    it('getStudents maps users returned by findByRole', async () => {
      const users = [
        { id: 1, name: 'A', email: 'a@a', phone: '1', state: 'activo', applications: [] },
      ];
      const spy = jest.spyOn((controller as any).usersService, 'findByRole').mockResolvedValue(users as any);
      const res = await controller.getStudents();
      expect(spy).toHaveBeenCalled();
      expect(res[0]).toHaveProperty('type', 'student');
    });

    it('getUserById maps user returned by findById', async () => {
      const user = { id: 5, name: 'B', email: 'b@b', phone: '2', role: 'estudiante', state: 'activo', applications: [] } as any;
      const spy = jest.spyOn((controller as any).usersService, 'findById').mockResolvedValue(user);
      const res = await controller.getUserById(5 as any);
      expect(spy).toHaveBeenCalledWith(5);
      expect(res).toHaveProperty('id', 5);
      expect(res).toHaveProperty('type', 'student');
    });

    it('toggleUserState calls service.toggleState', async () => {
      const spy = jest.spyOn((controller as any).usersService, 'toggleState').mockResolvedValue({ state: 'INACTIVO' } as any);
      const res = await controller.toggleUserState(8 as any);
      expect(spy).toHaveBeenCalledWith(8);
      expect(res).toEqual({ state: 'INACTIVO' });
    });
  });
});