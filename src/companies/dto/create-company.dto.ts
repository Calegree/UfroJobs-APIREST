import { CompanyState } from "../entities/company.entity";

export class CreateCompanyDto {
  name: string;
  rut: string;
  pass: string;
  phone: string;
  email: string;
  localization: string;
  description: string;
  web?: string;
  documents?: string[];
  state?: CompanyState;
}
