// src/users/users.controller.ts
import {
  Controller, Get, Req, UseGuards, Body, Post, Param, Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UserRole } from './users.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req) {
    return this.usersService.findPublicProfile(req.user.userId);
  }

  @Post()
  create(@Body() createUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('students')
  async getStudents() {
    const students = await this.usersService.findByRole(UserRole.ESTUDIANTE);
    // Puedes mapear los campos aquí si quieres devolver solo los necesarios
    return students.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      type: 'student',
      status: user.state === 'activo' ? 'active' : 'suspended',
      createdAt: user.createdAt,
      lastLogin: null, // Si tienes este campo, cámbialo aquí
      applications: user.applications?.length ?? 0,
    }));
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      type: user.role === 'estudiante' ? 'student' : 'company',
      status: user.state === 'activo' ? 'active' : 'suspended',
      createdAt: user.createdAt,
      lastLogin: null, // Si tienes este campo, cámbialo aquí
      applications: user.applications?.length ?? 0,
    };
  }

  @Patch(':id/toggle-state')
  async toggleUserState(@Param('id') id: string) {
    return this.usersService.toggleState(id);
  }
}