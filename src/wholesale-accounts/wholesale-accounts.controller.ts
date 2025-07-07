import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { WholesaleAccountsService } from './wholesale-accounts.service';
import { SearchAccountsDto } from './dto/search-accounts.dto';
import { CustomError } from './interfaces/custom-error';
import { ServiceResponse } from '../common/interfaces/service-response.interface';

@Controller('wholesale-accounts')
export class WholesaleAccountsController {
  private readonly logger = new Logger(WholesaleAccountsController.name);

  constructor(private readonly service: WholesaleAccountsService) {}

  private isCustomError(error: unknown): error is CustomError {
    return error instanceof Error && (error as CustomError).code !== undefined;
  }

  @Get()
  async getAccounts(
    @Query() query: SearchAccountsDto,
  ): Promise<ServiceResponse<Array<{ name: string; code: string }>>> {
    try {
      if (!query.empresa) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'El parámetro empresa es requerido',
            error: 'Bad Request',
          },
          HttpStatus.BAD_REQUEST,
        );
      }
      const code = query.code ?? '6001';

      this.logger.debug(
        `Buscando cuentas para empresa: ${query.empresa}, código: ${code}`,
      );

      const response = await this.service.findAccountsByCode(
        code,
        query.empresa,
      );

      if (!response.data || response.data.length === 0) {
        return {
          success: true,
          message: 'Operación exitosa',
          data: [],
        };
      }

      const accountsWithCodes = response.data.map((item) => ({
        name: item.Name,
        code: item.Code,
      }));
      return {
        success: true,
        message: 'Operación exitosa',
        data: accountsWithCodes,
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      if (error instanceof Error) {
        this.logger.error(
          `Error al obtener cuentas mayoristas: ${error.message}`,
          error.stack,
        );
      }

      throw new HttpException(
        {
          success: false,
          message: 'Error al obtener las cuentas mayoristas',
          error: {
            code:
              error instanceof HttpException
                ? error.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR,
            message:
              error instanceof Error ? error.message : 'Error desconocido',
            details: error instanceof Error ? error.stack : undefined,
          },
        },
        error instanceof HttpException
          ? error.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
