import { UserRole, UserState } from "src/users/users.entity";

export class LoginDto {
  email: string;
  password: string;
}

export class RegisterDto {
  name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  titles: string[];
  cv: string;
  applications: number[];
  state: UserState;
  role: UserRole;
}
