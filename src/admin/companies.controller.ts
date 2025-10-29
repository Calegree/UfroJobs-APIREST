import { Controller, Put, Param, ParseIntPipe, HttpException, HttpStatus } from '@nestjs/common';
import { CompaniesService } from '../companies/companies.service';

@Controller('api/admin/empresas')
export class AdminCompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Put(':id/aprobar')
  async approve(@Param('id', ParseIntPipe) id: number) {
    try {
      const updated = await this.companiesService.approveCompany(id);
      return { success: true, company: updated };
    } catch (err) {
      // Si ya es una excepción HTTP (NotFoundException por ejemplo), relanzarla
      if (err instanceof HttpException) throw err;

      const message = err?.message || 'Error al aprobar la compañía';
      if (message.includes('no es PENDIENTE')) {
        throw new HttpException({ success: false, message }, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException({ success: false, message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/rechazar')
  async reject(@Param('id', ParseIntPipe) id: number) {
    try {
      const updated = await this.companiesService.rejectCompany(id);
      return { success: true, company: updated };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      const message = err?.message || 'Error al rechazar la compañía';
      if (message.includes('no es PENDIENTE')) {
        throw new HttpException({ success: false, message }, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException({ success: false, message }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
