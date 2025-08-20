// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserRole, UserState } from './users.entity'; 
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }

    async _create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepo.create(createUserDto);
    return this.userRepo.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find();
  }
  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async _update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepo.update(id, updateUserDto);
    return this.findOne(id);
  }
   async update(id: string, data: Partial<User>): Promise<User> {
        await this.userRepo.update(id, data);
        return this.findById(id);
    }

  async remove(id: string): Promise<void> {
    await this.userRepo.delete(id);
  }
    async findByEmail(email: string): Promise<User | null> {
        return this.userRepo.findOne({ where: { email } });
    }

    async create(data: Partial<User>): Promise<User> {
        const newUser = this.userRepo.create(data);
        return this.userRepo.save(newUser);
    }

    async findById(id: string): Promise<User> {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user) {
            throw new Error('Usuario no encontrado');
        }
        return user;
    }
   
    async delete(id: string): Promise<void> {
        await this.userRepo.delete(id);
    }
   
    async findByRole(role: UserRole): Promise<User[]> {
        return this.userRepo.find({ where: { role } });
    }
    async toggleState(id: string): Promise<User> {
        const user = await this.findById(id);
        if (!user) throw new Error('Usuario no encontrado');
        user.state = user.state === UserState.ACTIVO ? UserState.INACTIVO : UserState.ACTIVO;
        return this.userRepo.save(user);
    }
    async count(): Promise<number> {
        return this.userRepo.count();   
    }
    async countEstudiantes(): Promise<number> {
        return this.userRepo.count({ where: { role: UserRole.ESTUDIANTE } });
    }

    async findPublicProfile(id: string) {
        return this.userRepo.findOne({
            where: { id },
            select: ['id', 'email', 'role', 'state', 'createdAt'],
        });
    }


}
