import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
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
    this.sendNotificationEmail(expenseRequest).catch((error) => {
      console.error('Error al enviar el correo:', error);
    });

    return expenseRequest;
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

      console.log('Enviando correo al administrador:', areaAdmin.email);

      await this.mailService.sendMail({
        to: areaAdmin.email,
        subject: `Solicitud de Viáticos - ${user.name}`,
        context: {
          userName: user.name,
          company: user.company?.name,
          branch: user.branch?.name,
          area: user.area?.name,
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
        },
      });

      console.log('Correo enviado exitosamente');
    } catch (error) {
      console.error('Error en el proceso de envío de correo:', error);
      throw error;
    }
  }

  async findAll(): Promise<ExpenseRequestWithRelations[]> {
    return this.prisma.expenseRequest.findMany({
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
  }
}
