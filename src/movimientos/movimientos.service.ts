import { Injectable } from '@nestjs/common';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';
import { QueryMovimientosHelper } from '../helpers/query-movimientos';
import { ApiResponse } from '../interfaces/database.interface';
import { Movimiento } from '../helpers/query-movimientos';

@Injectable()
export class MovimientosService {
  constructor(
    private readonly queryMovimientosHelper: QueryMovimientosHelper,
  ) {}

  async getMovimientosByViatico(
    idViatico: string,
  ): Promise<ApiResponse<Movimiento[]>> {
    return this.queryMovimientosHelper.getMovimientosByViatico(idViatico);
  }

  create(createMovimientoDto: CreateMovimientoDto) {
    return 'This action adds a new movimiento';
  }

  findAll() {
    return `This action returns all movimientos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} movimiento`;
  }

  update(id: number, updateMovimientoDto: UpdateMovimientoDto) {
    return `This action updates a #${id} movimiento`;
  }

  remove(id: number) {
    return `This action removes a #${id} movimiento`;
  }
}
