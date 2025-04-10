import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';
import { CreateExpenseRequestDto, ExpenseRequestWithRelations } from './types';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ExpenseRequestsService {
  constructor(
    private prisma: PrismaClient,
    private mailService: MailService,
  ) {}

  async create(
    data: CreateExpenseRequestDto,
  ): Promise<ExpenseRequestWithRelations> {
    // Crear la solicitud de viáticos
    const expenseRequest = await this.prisma.expenseRequest.create({
      data: {
        userId: data.userId,
        totalAmount: data.totalAmount,
        status: 'Pendiente',
        travelReason: data.travelReason,
        departureDate: new Date(data.departureDate),
        returnDate: new Date(data.returnDate),
        disbursementDate: new Date(data.disbursementDate),
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
  }

  private async sendNotificationEmail(
    expenseRequest: ExpenseRequestWithRelations,
  ) {
    const user = expenseRequest.user;
    const totalAmount = expenseRequest.totalAmount.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
    });

    try {
      // Buscar al administrador del área
      const areaAdmin = await this.prisma.user.findFirst({
        where: {
          companyId: user.companyId,
          branchId: user.branchId,
          areaId: user.areaId,
          roleId: 1, // Rol de administrador
        },
      });

      if (!areaAdmin) {
        throw new Error('No se encontró un administrador para esta área');
      }

      // Temporalmente no validamos el correo del administrador
      console.log('Enviando correo al administrador:', {
        name: areaAdmin.name,
        email: areaAdmin.email,
        role: areaAdmin.roleId,
      });

      await this.mailService.sendMail({
        to: areaAdmin.email || 'daniel.ortiz@alianzaelectrica.com', // Usar correo temporal si no hay uno
        subject: `Solicitud de Viáticos - ${user.name}`,
        template: 'request',
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
          details: expenseRequest.details,
          travelObjectives: expenseRequest.travelObjectives,
          requestedBy: user.name,
          requestId: expenseRequest.id,
          approverId: areaAdmin.id,
          apiUrl: process.env.API_URL || 'http://localhost:3000',
        },
      });

      console.log('Correo enviado exitosamente');
    } catch (error) {
      console.error('Error en el proceso de envío de correo:', error);
      throw error;
    }
  }

  async approveRequest(
    requestId: number,
    approverId: number,
    comment?: string,
  ) {
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
  }

  async rejectRequest(requestId: number, approverId: number, comment?: string) {
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
  }

  private async sendApprovalEmails(
    expenseRequest: ExpenseRequestWithRelations,
  ) {
    const user = expenseRequest.user;
    const totalAmount = expenseRequest.totalAmount.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
    });

    // Obtener información del aprobador
    if (!expenseRequest.approverId) {
      throw new Error('No se encontró ID del aprobador');
    }

    const approver = await this.prisma.user.findUnique({
      where: { id: expenseRequest.approverId },
    });

    if (!approver) {
      throw new Error('No se encontró información del aprobador');
    }

    // Enviar correo al solicitante
    await this.mailService.sendMail({
      to: user.email,
      subject: 'Solicitud de Viáticos Aprobada',
      template: 'approved',
      context: {
        userName: user.name,
        travelReason: expenseRequest.travelReason,
        departureDate: expenseRequest.departureDate.toLocaleDateString('es-MX'),
        returnDate: expenseRequest.returnDate.toLocaleDateString('es-MX'),
        totalAmount,
        comment: expenseRequest.comment || 'Aprobado sin comentarios',
      },
    });

    // Enviar correo al tesorero
    await this.mailService.sendMail({
      to: 'daniel.ortiz@alianzaelectrica.com', // Temporalmente al mismo correo
      subject: 'Nueva Solicitud de Viáticos Aprobada',
      template: 'treasurer',
      context: {
        userName: user.name,
        company: user.company?.name || '',
        branch: user.branch?.name || '',
        area: user.area?.name || '',
        approverName: approver.name,
        travelReason: expenseRequest.travelReason,
        departureDate: expenseRequest.departureDate.toLocaleDateString('es-MX'),
        returnDate: expenseRequest.returnDate.toLocaleDateString('es-MX'),
        disbursementDate:
          expenseRequest.disbursementDate.toLocaleDateString('es-MX'),
        totalAmount,
        details: expenseRequest.details,
        comment: expenseRequest.comment || 'Aprobado sin comentarios',
      },
    });
  }

  private async sendRejectionEmail(
    expenseRequest: ExpenseRequestWithRelations,
  ) {
    const user = expenseRequest.user;
    const totalAmount = expenseRequest.totalAmount.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
    });

    await this.mailService.sendMail({
      to: user.email,
      subject: 'Solicitud de Viáticos Rechazada',
      template: 'rejected',
      context: {
        userName: user.name,
        travelReason: expenseRequest.travelReason,
        departureDate: expenseRequest.departureDate.toLocaleDateString('es-MX'),
        returnDate: expenseRequest.returnDate.toLocaleDateString('es-MX'),
        totalAmount,
        comment: expenseRequest.comment || 'Rechazado sin comentarios',
      },
    });
  }

  async findAll(): Promise<ExpenseRequestWithRelations[]> {
    const requests = await this.prisma.expenseRequest.findMany({
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

    return requests as ExpenseRequestWithRelations[];
  }
}
