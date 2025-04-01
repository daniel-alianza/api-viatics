import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class MailService {
  private resend: Resend;
  private template: HandlebarsTemplateDelegate;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));

    // Cargar y compilar la plantilla usando una ruta relativa al proyecto
    const templatePath = path.join(
      process.cwd(),
      'src',
      'mail',
      'templates',
      'expense-request.hbs',
    );
    console.log('Buscando plantilla en:', templatePath);
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    this.template = Handlebars.compile(templateContent);
  }

  async sendMail(options: {
    to: string;
    subject: string;
    context: Record<string, any>;
  }) {
    // Usar la plantilla compilada
    const html = this.template(options.context);

    try {
      // Temporalmente enviamos todos los correos a daniel.ortiz@alianzaelectrica.com
      const data = await this.resend.emails.send({
        from: 'Portal Viáticos <onboarding@resend.dev>',
        to: ['daniel.ortiz@alianzaelectrica.com'], // Dirección fija para pruebas
        subject: `[PRUEBA] ${options.subject}`,
        html: html,
      });
      console.log('Correo enviado exitosamente:', data);
      console.log('Destinatario original:', options.to);
      return data;
    } catch (error) {
      console.error('Error al enviar correo:', error);
      throw error;
    }
  }
}
