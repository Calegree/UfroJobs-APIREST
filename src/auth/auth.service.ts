import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto, RegisterCompanyDto, RegisterDto } from './dto/auth.dto';
import { UserRole, UserState } from 'src/users/users.entity';
import { CompaniesService } from 'src/companies/companies.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly companiesService: CompaniesService,
  ) { }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    const payload = { sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, role: user.role },
    };
  }

  async register(dto: RegisterDto) {
    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) throw new ConflictException('El correo ya se encuentra registrado.');

    const hash = await bcrypt.hash(dto.password, 10);

    const skillsArray = dto.skills || [];

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hash,
      phone: dto.phone,
      role: UserRole.STUDENT,
      state: UserState.ACTIVE,
      career: dto.career,
      academicYear: dto.academicYear,
      rut: dto.studentId,
      skills: skillsArray,
    });


    return user;
  }

  async registerCompany(dto: RegisterCompanyDto) {
    const exists = await this.companiesService.findByEmail(dto.email);
    if (exists)
      throw new ConflictException('El correo ya se encuentra registrado.');

    const hash = await bcrypt.hash(dto.pass, 10);
    const company = await this.companiesService.create({
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      web: dto.web,
      rut: dto.rut,
      localization: dto.localization,
      description: dto.description,
      documents: dto.documentKeys,
      pass: hash,
    });
    return company;
  }
}

