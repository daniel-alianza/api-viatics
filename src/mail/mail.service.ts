import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

interface ResendError extends Error {
  response?: {
    data: any;
  };
}

@Injectable()
export class MailService {
  private resend: Resend;
  private templates: {
    request: HandlebarsTemplateDelegate;
    approved: HandlebarsTemplateDelegate;
    rejected: HandlebarsTemplateDelegate;
    treasurer: HandlebarsTemplateDelegate;
  };

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));

    // Cargar y compilar todas las plantillas
    const templatesPath = path.join(process.cwd(), 'src', 'mail', 'templates');

    this.templates = {
      request: this.compileTemplate(
        path.join(templatesPath, 'expense-request.hbs'),
      ),
      approved: this.compileTemplate(
        path.join(templatesPath, 'expense-request-approved.hbs'),
      ),
      rejected: this.compileTemplate(
        path.join(templatesPath, 'expense-request-rejected.hbs'),
      ),
      treasurer: this.compileTemplate(
        path.join(templatesPath, 'expense-request-treasurer.hbs'),
      ),
    };
  }

  private compileTemplate(templatePath: string): HandlebarsTemplateDelegate {
    console.log('Cargando plantilla:', templatePath);
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    return Handlebars.compile(templateContent);
  }

  async sendMail(options: {
    to: string;
    subject: string;
    context: Record<string, any>;
    template: 'request' | 'approved' | 'rejected' | 'treasurer';
  }) {
    const html = this.templates[options.template](options.context);

    try {
      // Temporalmente, todos los correos se envían a daniel.ortiz@alianzaelectrica.com
      const tempEmail = 'daniel.ortiz@alianzaelectrica.com';
      console.log(`Enviando correo ${options.template} a:`, tempEmail);
      console.log('Contexto:', options.context);

      const data = await this.resend.emails.send({
        from: 'Portal Viáticos <onboarding@resend.dev>',
        to: [tempEmail],
        subject: options.subject,
        html: html,
      });

      console.log('Correo enviado exitosamente:', data);
      return data;
    } catch (error) {
      console.error('Error al enviar correo:', error);
      const resendError = error as ResendError;
      if (resendError.response) {
        console.error('Detalles del error:', resendError.response.data);
      }
      throw error;
    }
  }
}
