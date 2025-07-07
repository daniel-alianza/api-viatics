import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiResponse, Comprobacion } from '../interfaces/database.interface';
import { PrismaClient, Document } from '@prisma/client';
import { DocumentType, UploadDocumentDto } from './dto/upload-document.dto';
import { ComprobacionStatus } from './dto/update-status.dto';
import * as xml2js from 'xml2js';

@Injectable()
export class ComprobacionesService {
  private readonly logger = new Logger(ComprobacionesService.name);
  private readonly allowedMimeTypes = {
    [DocumentType.FACTURA]: {
      pdf: ['application/pdf'],
      xml: ['application/xml', 'text/xml'],
    },
    [DocumentType.TICKET]: ['application/pdf', 'image/jpeg', 'image/png'],
  };

  constructor(private readonly prisma: PrismaClient) {}

  async getAllComprobaciones(): Promise<ApiResponse<Comprobacion[]>> {
    try {
      const comprobaciones = await this.prisma.comprobacion.findMany({
        where: {
          OR: [
            { status: ComprobacionStatus.PENDIENTE },
            { status: ComprobacionStatus.RECHAZADA },
            { status: ComprobacionStatus.APROBADA },
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          expenseRequest: {
            select: {
              id: true,
              totalAmount: true,
              status: true,
              travelReason: true,
            },
          },
          documents: {
            select: {
              id: true,
              type: true,
              fileName: true,
              fileSize: true,
              mimeType: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        status: 'success',
        message: 'Comprobaciones obtenidas correctamente',
        data: comprobaciones as unknown as Comprobacion[],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error al obtener las comprobaciones:', error);
      return {
        status: 'error',
        message: 'Error al obtener las comprobaciones',
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async updateStatus(
    id: number,
    status: ComprobacionStatus,
    approverId: number,
    comment?: string,
  ): Promise<ApiResponse<Comprobacion>> {
    try {
      const comprobacion = await this.prisma.comprobacion.findUnique({
        where: { id },
        include: {
          expenseRequest: true,
        },
      });

      if (!comprobacion) {
        throw new NotFoundException(`Comprobación con ID ${id} no encontrada`);
      }

      const updatedComprobacion = await this.prisma.comprobacion.update({
        where: { id },
        data: {
          status,
          approverId,
          approverComment: comment,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          expenseRequest: {
            select: {
              id: true,
              totalAmount: true,
              status: true,
              travelReason: true,
            },
          },
          documents: {
            select: {
              id: true,
              type: true,
              fileName: true,
              mimeType: true,
            },
          },
        },
      });

      if (status === ComprobacionStatus.RECHAZADA) {
        // Eliminar el registro de MovimientosComprobados relacionado
        await this.prisma.movimientosComprobados.deleteMany({
          where: {
            movimientoSequence: comprobacion.sequence,
            movimientoDueDate: comprobacion.dueDate,
            movimientoRef: comprobacion.ref,
            movimientoAcctName: comprobacion.acctName,
            movimientoDebAmount: comprobacion.debitAmount,
            movimientoMemo: comprobacion.memo,
          },
        });
      }

      return {
        status: 'success',
        message: 'Estado de la comprobación actualizado correctamente',
        data: updatedComprobacion as unknown as Comprobacion,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error al actualizar el estado:', error);
      throw error;
    }
  }

  private async parseXmlFile(file: Express.Multer.File): Promise<any> {
    try {
      const parser = new xml2js.Parser();
      const xmlContent = file.buffer.toString('utf-8');
      return await parser.parseStringPromise(xmlContent);
    } catch (error) {
      this.logger.error('Error al parsear XML:', error);
      throw new BadRequestException('Error al procesar el archivo XML');
    }
  }

  private async getNextSequence(comprobacionId: number): Promise<string> {
    const count = await this.prisma.comprobacion.count({
      where: { expenseRequestId: comprobacionId },
    });
    return `${comprobacionId}_${count + 1}`;
  }

  async uploadDocument(
    files: Express.Multer.File[],
    uploadDto: UploadDocumentDto,
  ) {
    try {
      if (!files || files.length === 0) {
        throw new BadRequestException('Se requiere al menos un archivo');
      }
      if (!uploadDto.sequence) {
        throw new BadRequestException('El campo sequence es obligatorio');
      }

      // Validar campos obligatorios según el tipo
      if (uploadDto.type === DocumentType.TICKET) {
        const requiredFields = [
          'cuentaPorMayor',
          'indicadorImpuestos',
          'normaReparto',
        ];
        for (const field of requiredFields) {
          if (!uploadDto[field]) {
            throw new BadRequestException(
              `El campo ${field} es obligatorio para tickets`,
            );
          }
        }
      }

      // Validar tipos de archivo
      const hasPdf = files.some((file) =>
        this.allowedMimeTypes[DocumentType.FACTURA].pdf.includes(file.mimetype),
      );
      const hasXml = files.some((file) =>
        this.allowedMimeTypes[DocumentType.FACTURA].xml.includes(file.mimetype),
      );

      if (uploadDto.type === DocumentType.FACTURA && !hasPdf && !hasXml) {
        throw new BadRequestException(
          'Para facturas se requiere al menos un archivo PDF o XML',
        );
      }

      // Crear la comprobación
      const comprobacion = await this.prisma.comprobacion.create({
        data: {
          viaticoId: uploadDto.comprobacionId.toString(),
          sequence: uploadDto.sequence,
          dueDate: new Date(uploadDto.movimientoDueDate),
          memo: uploadDto.movimientoMemo,
          debitAmount: uploadDto.movimientoDebAmount,
          acctName: uploadDto.movimientoAcctName,
          ref: uploadDto.movimientoRef,
          status: 'pendiente',
          userId: uploadDto.userId,
          expenseRequestId: uploadDto.comprobacionId,
          comprobanteType: uploadDto.type,
          responsable: uploadDto.responsable,
          motivo: uploadDto.motivo,
          descripcion: uploadDto.descripcion,
          importe: uploadDto.importe,
        },
      });

      // Guardar el registro en la tabla pivote MovimientosComprobados
      await this.prisma.movimientosComprobados.create({
        data: {
          movimientoSequence: uploadDto.sequence,
          movimientoDueDate: new Date(uploadDto.movimientoDueDate),
          movimientoRef: uploadDto.movimientoRef,
          movimientoAcctName: uploadDto.movimientoAcctName,
          movimientoDebAmount: uploadDto.movimientoDebAmount,
          movimientoMemo: uploadDto.movimientoMemo,
        },
      });

      // Guardar los documentos en la base de datos
      for (const file of files) {
        await this.prisma.document.create({
          data: {
            type: file.mimetype.includes('xml')
              ? 'factura_xml'
              : file.mimetype.includes('pdf')
                ? 'factura_pdf'
                : 'ticket',
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
            comprobacionId: comprobacion.id,
            description: uploadDto.description ?? '',
            fileContent: file.buffer,
          },
        });
      }

      return {
        success: true,
        message: 'Documentos subidos correctamente',
        data: {
          comprobacion,
          documents: files.map((f) => ({
            name: f.originalname,
            type: f.mimetype,
          })),
        },
      };
    } catch (error) {
      this.logger.error('Error al subir documento:', error);
      throw error;
    }
  }

  async getDocumentById(
    documentId: number,
  ): Promise<{ fileContent: Buffer; mimeType: string; fileName: string }> {
    try {
      const document = await this.prisma.document.findUnique({
        where: { id: documentId },
        select: {
          fileContent: true,
          mimeType: true,
          fileName: true,
        },
      });

      if (!document) {
        throw new NotFoundException(
          `Documento con ID ${documentId} no encontrado`,
        );
      }

      return {
        fileContent: Buffer.from(
          document.fileContent as unknown as ArrayBuffer,
        ),
        mimeType: document.mimeType,
        fileName: document.fileName,
      };
    } catch (error) {
      this.logger.error('Error al obtener el documento:', error);
      throw error;
    }
  }

  async getComprobacionDocuments(
    comprobacionId: number,
  ): Promise<ApiResponse<Document[]>> {
    try {
      const comprobacion = await this.prisma.comprobacion.findUnique({
        where: { id: comprobacionId },
        include: {
          documents: {
            select: {
              id: true,
              type: true,
              fileName: true,
              mimeType: true,
              fileSize: true,
              createdAt: true,
              updatedAt: true,
              comprobacionId: true,
              description: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!comprobacion) {
        throw new NotFoundException(
          `Comprobación con ID ${comprobacionId} no encontrada`,
        );
      }

      return {
        status: 'success',
        message: 'Documentos obtenidos correctamente',
        data: comprobacion.documents as unknown as Document[],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error al obtener los documentos:', error);
      return {
        status: 'error',
        message: 'Error al obtener los documentos',
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // NUEVOS MÉTODOS PARA SAP STATUS
  async getPendientesSap(): Promise<ApiResponse<Comprobacion[]>> {
    try {
      const comprobaciones = await this.prisma.comprobacion.findMany({
        where: {
          OR: [
            { sapStatus: null }, // Sin registro en SapStatus
            { sapStatus: { isSentToSap: false } }, // Con error o pendiente
          ],
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          expenseRequest: {
            select: {
              id: true,
              totalAmount: true,
              status: true,
              travelReason: true,
            },
          },
          documents: {
            select: {
              id: true,
              type: true,
              fileName: true,
              mimeType: true,
            },
          },
          sapStatus: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        status: 'success',
        message: 'Comprobaciones pendientes de SAP obtenidas correctamente',
        data: comprobaciones as unknown as Comprobacion[],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        'Error al obtener comprobaciones pendientes de SAP:',
        error,
      );
      return {
        status: 'error',
        message: 'Error al obtener comprobaciones pendientes de SAP',
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getEnviadasSap(): Promise<ApiResponse<Comprobacion[]>> {
    try {
      const comprobaciones = await this.prisma.comprobacion.findMany({
        where: {
          sapStatus: {
            isSentToSap: true,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          expenseRequest: {
            select: {
              id: true,
              totalAmount: true,
              status: true,
              travelReason: true,
            },
          },
          documents: {
            select: {
              id: true,
              type: true,
              fileName: true,
              mimeType: true,
            },
          },
          sapStatus: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        status: 'success',
        message: 'Comprobaciones enviadas a SAP obtenidas correctamente',
        data: comprobaciones as unknown as Comprobacion[],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        'Error al obtener comprobaciones enviadas a SAP:',
        error,
      );
      return {
        status: 'error',
        message: 'Error al obtener comprobaciones enviadas a SAP',
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
