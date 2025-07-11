import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import {
  CreateExpenseRequestDto,
  UpdateExpenseRequestStatusDto,
} from './dto/expense-request.dto';
import { ExpenseRequestWithRelations } from './dto/types.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ExpenseRequestsService {
  constructor(
    private prisma: PrismaClient,
    private mailService: MailService,
  ) {}

  private conceptTranslations: Record<string, string> = {
    flight: 'Vuelo',
    hotel: 'Hotel',
    food: 'Alimentos',
    transport: 'Transporte',
    transportation: 'Transporte',
    taxi: 'Taxi',
    gasoline: 'Gasolina',
    toll: 'Caseta',
    tolls: 'Casetas',
    parking: 'Estacionamiento',
    breakfast: 'Desayuno',
    lunch: 'Comida',
    dinner: 'Cena',
    snacks: 'Snacks',
    supplies: 'Suministros',
    other: 'Otro',
    lodging: 'Hospedaje',
    freight: 'Flete',
    tools: 'Herramientas',
    shipping: 'Envío',
    miscellaneous: 'Misceláneos',
    // Agrega más traducciones según tus necesidades
  };

  private translateConcept(concept: string): string {
    if (!concept) return '';
    const normalized = concept.trim().toLowerCase();
    return this.conceptTranslations[normalized] || concept;
  }

  async create(
    data: CreateExpenseRequestDto,
  ): Promise<ExpenseRequestWithRelations> {
    try {
      // Validaciones de datos requeridos
      if (!data.userId) {
        throw new BadRequestException(
          'El ID del usuario es requerido para crear la solicitud',
        );
      }

      if (!data.totalAmount) {
        throw new BadRequestException(
          'El monto total es requerido para la solicitud',
        );
      }

      if (data.totalAmount <= 0) {
        throw new BadRequestException('El monto total debe ser mayor a 0');
      }

      if (!data.travelReason) {
        throw new BadRequestException(
          'La razón del viaje es requerida para la solicitud',
        );
      }

      if (!data.departureDate) {
        throw new BadRequestException(
          'La fecha de salida es requerida para la solicitud',
        );
      }

      if (!data.returnDate) {
        throw new BadRequestException(
          'La fecha de regreso es requerida para la solicitud',
        );
      }

      if (!data.disbursementDate) {
        throw new BadRequestException(
          'La fecha de desembolso es requerida para la solicitud',
        );
      }

      // Validaciones de fechas
      const departureDate = new Date(data.departureDate);
      const returnDate = new Date(data.returnDate);
      const disbursementDate = new Date(data.disbursementDate);
      const today = new Date();

      // Normalizar fechas para comparar solo la fecha sin la hora
      const normalizeDate = (date: Date) => {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
      };

      const normalizedDeparture = normalizeDate(departureDate);
      const normalizedReturn = normalizeDate(returnDate);
      const normalizedDisbursement = normalizeDate(disbursementDate);
      const normalizedToday = normalizeDate(today);

      if (normalizedDeparture < normalizedToday) {
        throw new BadRequestException(
          'La fecha de salida no puede ser anterior a la fecha actual',
        );
      }

      if (normalizedReturn < normalizedDeparture) {
        throw new BadRequestException(
          'La fecha de regreso no puede ser anterior a la fecha de salida',
        );
      }

      if (normalizedDisbursement > normalizedDeparture) {
        throw new BadRequestException(
          'La fecha de dispersión no puede ser posterior a la fecha de salida',
        );
      }

      // Validaciones de detalles
      if (!data.details || data.details.length === 0) {
        throw new BadRequestException(
          'Debe incluir al menos un detalle de gasto en la solicitud',
        );
      }

      // Validar que la suma de los detalles coincida con el total
      const totalDetails = data.details.reduce(
        (sum, detail) => sum + (detail.amount > 0 ? detail.amount : 0),
        0,
      );
      if (Math.abs(totalDetails - data.totalAmount) > 0.01) {
        // Permitir pequeñas diferencias por redondeo
        throw new BadRequestException(
          'La suma de los detalles no coincide con el monto total de la solicitud',
        );
      }

      // Validar cada detalle
      for (const [index, detail] of data.details.entries()) {
        if (!detail.concept) {
          throw new BadRequestException(
            `El concepto es requerido para el detalle ${index + 1}`,
          );
        }
        if (detail.amount < 0) {
          throw new BadRequestException(
            `El monto no puede ser negativo para el detalle ${index + 1}`,
          );
        }
      }

      // Verificar que el usuario existe y tiene los permisos necesarios
      const user = await this.prisma.user.findUnique({
        where: { id: data.userId },
        include: {
          role: true,
        },
      });

      if (!user) {
        throw new NotFoundException(
          'El usuario especificado no existe en el sistema',
        );
      }

      if (!user.role) {
        throw new BadRequestException('El usuario no tiene un rol asignado');
      }

      // Verificar que el usuario tiene una empresa asignada
      if (!user.companyId) {
        throw new BadRequestException(
          'El usuario no tiene una empresa asignada',
        );
      }

      // Crear la solicitud de viáticos
      const expenseRequest = await this.prisma.expenseRequest.create({
        data: {
          userId: data.userId,
          totalAmount: data.totalAmount,
          status: 'Pendiente',
          travelReason: data.travelReason,
          departureDate: departureDate,
          returnDate: returnDate,
          disbursementDate: disbursementDate,
          travelObjectives: data.travelObjectives,
          details: {
            create: data.details.map((detail) => ({
              concept: detail.concept,
              amount: detail.amount,
            })),
          },
        },
        include: {
          user: {
            include: {
              company: true,
              branch: true,
              area: true,
              role: true,
            },
          },
          details: true,
        },
      });

      // Enviar correo de notificación de forma asíncrona
      this.sendNotificationEmail(
        expenseRequest as ExpenseRequestWithRelations,
      ).catch((error) => {
        console.error('Error al enviar el correo:', error);
      });

      return expenseRequest as ExpenseRequestWithRelations;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Ya existe una solicitud con los mismos datos',
          );
        }
        if (error.code === 'P2003') {
          throw new BadRequestException(
            'Referencia a entidad no válida en la solicitud',
          );
        }
      }
      throw new InternalServerErrorException(
        'Error inesperado al crear la solicitud de gastos',
      );
    }
  }

  private async sendNotificationEmail(
    expenseRequest: ExpenseRequestWithRelations,
  ) {
    try {
      const user = expenseRequest.user;
      const totalAmount = expenseRequest.totalAmount.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN',
      });

      // Buscar al jefe inmediato del usuario
      let manager: any = null;
      if (user.managerId) {
        manager = await this.prisma.user.findUnique({
          where: { id: user.managerId },
        });
      }

      // Traducir conceptos de los detalles
      const translatedDetails = expenseRequest.details.map((detail) => ({
        ...detail,
        concept: this.translateConcept(detail.concept),
      }));

      // Preparar destinatarios para el correo
      // Ahora solo se envía al jefe inmediato
      if (!manager || !manager.email) {
        console.warn(
          'No se encontró jefe inmediato con email, no se envía correo',
        );
        return;
      }
      const destinatarios = [manager.email];
      const bccList: string[] = [];

      await this.mailService.enviarCorreo({
        to: destinatarios,
        subject: `Solicitud de Viáticos - ${user.name}`,
        template: 'request',
        bcc: bccList,
        context: {
          userName: user.name,
          company: user.company?.name || '',
          branch: user.branch?.name || '',
          area: user.area?.name || '',
          travelReason: expenseRequest.travelReason,
          departureDate:
            expenseRequest.departureDate.toLocaleDateString('es-MX'),
          returnDate: expenseRequest.returnDate.toLocaleDateString('es-MX'),
          disbursementDate:
            expenseRequest.disbursementDate.toLocaleDateString('es-MX'),
          totalAmount,
          details: translatedDetails,
          travelObjectives: expenseRequest.travelObjectives,
          requestedBy: user.name,
          requestId: expenseRequest.id,
          approverId: manager.id,
          apiUrl: process.env.API_URL || 'http://localhost:3000',
        },
      });
    } catch (error) {
      console.error('Error en el proceso de envío de correo:', error);
      throw new InternalServerErrorException(
        'Error al enviar la notificación por correo',
      );
    }
  }

  async approveRequest(
    requestId: number,
    approverId: number,
    comment?: string,
  ) {
    try {
      // Verificar que la solicitud existe
      const existingRequest = await this.prisma.expenseRequest.findUnique({
        where: { id: requestId },
      });

      if (!existingRequest) {
        throw new NotFoundException('Solicitud no encontrada');
      }

      // Verificar que el aprobador existe
      const approver = await this.prisma.user.findUnique({
        where: { id: approverId },
      });

      if (!approver) {
        throw new NotFoundException('Aprobador no encontrado');
      }

      const expenseRequest = await this.prisma.expenseRequest.update({
        where: { id: requestId },
        data: {
          status: 'Aprobada',
          approverId,
          comment: comment || null,
        } as Prisma.ExpenseRequestUpdateInput,
        include: {
          user: {
            include: {
              company: true,
              branch: true,
              area: true,
              role: true,
            },
          },
          details: true,
        },
      });

      // Enviar correos de notificación
      await this.sendApprovalEmails(
        expenseRequest as ExpenseRequestWithRelations,
      );

      return expenseRequest as ExpenseRequestWithRelations;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al aprobar la solicitud');
    }
  }

  async rejectRequest(requestId: number, approverId: number, comment?: string) {
    try {
      // Verificar que la solicitud existe
      const existingRequest = await this.prisma.expenseRequest.findUnique({
        where: { id: requestId },
      });

      if (!existingRequest) {
        throw new NotFoundException('Solicitud no encontrada');
      }

      // Verificar que el aprobador existe
      const approver = await this.prisma.user.findUnique({
        where: { id: approverId },
      });

      if (!approver) {
        throw new NotFoundException('Aprobador no encontrado');
      }

      const expenseRequest = await this.prisma.expenseRequest.update({
        where: { id: requestId },
        data: {
          status: 'Rechazada',
          approverId,
          comment: comment || 'Rechazado sin comentarios',
        } as Prisma.ExpenseRequestUpdateInput,
        include: {
          user: {
            include: {
              company: true,
              branch: true,
              area: true,
              role: true,
            },
          },
          details: true,
        },
      });

      // Enviar correo de rechazo
      await this.sendRejectionEmail(
        expenseRequest as ExpenseRequestWithRelations,
      );

      return expenseRequest as ExpenseRequestWithRelations;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al rechazar la solicitud');
    }
  }

  private async sendApprovalEmails(
    expenseRequest: ExpenseRequestWithRelations,
  ) {
    try {
      const user = expenseRequest.user;
      const totalAmount = expenseRequest.totalAmount.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN',
      });

      // Obtener información del aprobador
      if (!expenseRequest.approverId) {
        throw new BadRequestException('No se encontró ID del aprobador');
      }

      const approver = await this.prisma.user.findUnique({
        where: { id: expenseRequest.approverId },
      });

      if (!approver) {
        throw new NotFoundException('No se encontró información del aprobador');
      }

      // Traducir conceptos de los detalles
      const translatedDetails = expenseRequest.details.map((detail) => ({
        ...detail,
        concept: this.translateConcept(detail.concept),
      }));

      // Enviar correo al solicitante
      await this.mailService.enviarCorreo({
        to: user.email,
        subject: 'Solicitud de Viáticos Aprobada',
        template: 'approved',
        context: {
          userName: user.name,
          travelReason: expenseRequest.travelReason,
          departureDate:
            expenseRequest.departureDate.toLocaleDateString('es-MX'),
          returnDate: expenseRequest.returnDate.toLocaleDateString('es-MX'),
          totalAmount,
          comment: expenseRequest.comment || 'Aprobado sin comentarios',
          details: translatedDetails,
        },
      });

      // Enviar correo al tesorero
      await this.mailService.enviarCorreo({
        to: 'angel.pichardo@alianzaelectrica.com',
        subject: 'Nueva Solicitud de Viáticos Aprobada',
        template: 'treasurer',
        context: {
          userName: user.name,
          company: user.company?.name || '',
          branch: user.branch?.name || '',
          area: user.area?.name || '',
          approverName: approver.name,
          travelReason: expenseRequest.travelReason,
          departureDate:
            expenseRequest.departureDate.toLocaleDateString('es-MX'),
          returnDate: expenseRequest.returnDate.toLocaleDateString('es-MX'),
          disbursementDate:
            expenseRequest.disbursementDate.toLocaleDateString('es-MX'),
          totalAmount,
          details: translatedDetails,
          comment: expenseRequest.comment || 'Aprobado sin comentarios',
        },
      });
    } catch (error) {
      console.error('Error al enviar correos de aprobación:', error);
      throw new InternalServerErrorException(
        'Error al enviar las notificaciones de aprobación',
      );
    }
  }

  private async sendRejectionEmail(
    expenseRequest: ExpenseRequestWithRelations,
  ) {
    try {
      const user = expenseRequest.user;
      const totalAmount = expenseRequest.totalAmount.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN',
      });

      // Traducir conceptos de los detalles
      const translatedDetails = expenseRequest.details.map((detail) => ({
        ...detail,
        concept: this.translateConcept(detail.concept),
      }));

      await this.mailService.enviarCorreo({
        to: user.email,
        subject: 'Solicitud de Viáticos Rechazada',
        template: 'rejected',
        context: {
          userName: user.name,
          travelReason: expenseRequest.travelReason,
          departureDate:
            expenseRequest.departureDate.toLocaleDateString('es-MX'),
          returnDate: expenseRequest.returnDate.toLocaleDateString('es-MX'),
          totalAmount,
          comment: expenseRequest.comment || 'Rechazado sin comentarios',
          details: translatedDetails,
        },
      });
    } catch (error) {
      console.error('Error al enviar correo de rechazo:', error);
      throw new InternalServerErrorException(
        'Error al enviar la notificación de rechazo',
      );
    }
  }

  async findAll(): Promise<ExpenseRequestWithRelations[]> {
    try {
      return await this.prisma.expenseRequest.findMany({
        include: {
          user: {
            include: {
              company: true,
              branch: true,
              area: true,
              role: true,
            },
          },
          details: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al obtener las solicitudes de gastos',
      );
    }
  }

  async findByEmail(email: string): Promise<ExpenseRequestWithRelations[]> {
    try {
      return await this.prisma.expenseRequest.findMany({
        where: {
          user: {
            email: email,
          },
        },
        include: {
          user: {
            include: {
              company: true,
              branch: true,
              area: true,
              role: true,
            },
          },
          details: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al buscar las solicitudes por correo electrónico',
      );
    }
  }

  async findDispersedByEmail(
    email: string,
  ): Promise<ExpenseRequestWithRelations[]> {
    try {
      return await this.prisma.expenseRequest.findMany({
        where: {
          user: {
            email: email,
          },
          status: 'Dispersada',
        },
        include: {
          user: {
            include: {
              company: true,
              branch: true,
              area: true,
              role: true,
            },
          },
          details: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al buscar las solicitudes dispersadas por correo electrónico',
      );
    }
  }

  async updateStatus(
    id: number,
    status: string,
  ): Promise<ExpenseRequestWithRelations> {
    try {
      // Verificar que la solicitud existe
      const existingRequest = await this.prisma.expenseRequest.findUnique({
        where: { id },
      });

      if (!existingRequest) {
        throw new NotFoundException('Solicitud no encontrada');
      }

      // Validar el estado
      const validStatuses = [
        'Pendiente',
        'Aprobada',
        'Rechazada',
        'Dispersada',
      ];
      if (!validStatuses.includes(status)) {
        throw new BadRequestException('Estado no válido');
      }

      return await this.prisma.expenseRequest.update({
        where: { id },
        data: { status },
        include: {
          user: {
            include: {
              company: true,
              branch: true,
              area: true,
              role: true,
            },
          },
          details: true,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al actualizar el estado de la solicitud',
      );
    }
  }
}
