import { UserRole, UserState } from '../users.entity';

export class CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  location?: string;
  titles?: string[];
  cv: string;
  applications?: number[];
  state?: UserState;
  role?: UserRole;
}