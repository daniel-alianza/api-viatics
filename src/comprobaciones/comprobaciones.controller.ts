import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  UseInterceptors,
  UploadedFiles,
  Body,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  Logger,
  NotFoundException,
  Res,
  Query,
  Header,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ComprobacionesService } from './comprobaciones.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('comprobaciones')
export class ComprobacionesController {
  private readonly logger = new Logger(ComprobacionesController.name);

  constructor(private readonly comprobacionesService: ComprobacionesService) {}

  @Get()
  async getAllComprobaciones(
    @Query('pendingSap') pendingSap?: boolean,
    @Query('sentToSap') sentToSap?: boolean,
  ) {
    if (pendingSap) {
      return await this.comprobacionesService.getPendientesSap();
    }
    if (sentToSap) {
      return await this.comprobacionesService.getEnviadasSap();
    }
    return await this.comprobacionesService.getAllComprobaciones();
  }

  @Get(':comprobacionId/documents')
  async getComprobacionDocuments(
    @Param('comprobacionId') comprobacionId: string,
  ) {
    try {
      const id = parseInt(comprobacionId, 10);
      if (isNaN(id)) {
        throw new BadRequestException('ID de comprobación inválido');
      }
      return await this.comprobacionesService.getComprobacionDocuments(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Error al obtener los documentos',
      );
    }
  }

  @Get('documents/:documentId')
  async getDocument(
    @Param('documentId') documentId: string,
    @Res() res: Response,
  ) {
    try {
      const id = parseInt(documentId, 10);
      if (isNaN(id)) {
        throw new BadRequestException('ID de documento inválido');
      }

      const document = await this.comprobacionesService.getDocumentById(id);

      res.setHeader('Content-Type', document.mimeType);
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${document.fileName}"`,
      );

      res.send(document.fileContent);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Error al obtener el documento',
      );
    }
  }

  @Patch(':id/status')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Query('approverId') approverId: number,
    @Query('comment') comment?: string,
  ) {
    try {
      const comprobacionId = parseInt(id, 10);
      if (isNaN(comprobacionId)) {
        throw new BadRequestException('ID de comprobación inválido');
      }
      return await this.comprobacionesService.updateStatus(
        comprobacionId,
        updateStatusDto.status,
        approverId,
        comment,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        error instanceof Error
          ? error.message
          : 'Error al actualizar la comprobación',
      );
    }
  }

  @Post('upload')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 2 }]))
  @UsePipes(new ValidationPipe({ transform: true }))
  async uploadDocument(
    @UploadedFiles() files: { files?: Express.Multer.File[] },
    @Body() uploadDto: UploadDocumentDto,
  ) {
    this.logger.debug('Datos recibidos:', {
      files: files?.files?.map((f) => ({
        name: f.originalname,
        type: f.mimetype,
      })),
      uploadDto,
    });

    if (!files.files || files.files.length === 0) {
      throw new BadRequestException('No se han proporcionado archivos');
    }

    return await this.comprobacionesService.uploadDocument(
      files.files,
      uploadDto,
    );
  }
}
