import {
  Controller, Get, Req, UseGuards, Body, Post, Param, Patch,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UserRole } from './users.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req) {
    return this.usersService.findPublicProfile(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user.userId || req.user.sub;
    return this.usersService.update(userId, updateUserDto);
  }

  @Patch('me/cv')
  @UseGuards(JwtAuthGuard)
  async updateUserCv(@Request() req, @Body('cvKey') cvKey: string) {
    const userId = req.user.sub || req.user.userId; 
    return this.usersService.updateCvKey(userId, cvKey);
  }

  @Get('students')
  async getStudents() {
    const students = await this.usersService.findByRole(UserRole.STUDENT);
    return students.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      type: 'student',
      status: user.state === 'activo' ? 'active' : 'suspended',
      createdAt: user.createdAt,
      lastLogin: null, 
      applications: user.applications?.length ?? 0,
    }));
  }

  @Get(':id')
  async getUserById(@Param('id') id: number) {
    const user = await this.usersService.findById(id);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      type: user.role === 'estudiante' ? 'student' : 'company',
      status: user.state === 'activo' ? 'active' : 'suspended',
      createdAt: user.createdAt,
      lastLogin: null, 
      applications: user.applications?.length ?? 0,
    };
  }

  @Patch(':id/toggle-state')
  async toggleUserState(@Param('id') id: number) {
    return this.usersService.toggleState(id);
  }
  
}