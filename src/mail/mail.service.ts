import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private templates: {
    request: HandlebarsTemplateDelegate;
    approved: HandlebarsTemplateDelegate;
    rejected: HandlebarsTemplateDelegate;
    treasurer: HandlebarsTemplateDelegate;
    approvalConfirmation: HandlebarsTemplateDelegate;
  };

  private transporter: nodemailer.Transporter;

  constructor() {
    // Configuración del transporter de nodemailer
    this.transporter = nodemailer.createTransport({
      host: 'mail.grupo-fg.com',
      port: 587,
      secure: false, // SSL deshabilitado
      auth: {
        user: 'viaticos@grupo-fg.com',
        pass: 'ViTic2024$',
      },
    });

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
      approvalConfirmation: this.compileTemplate(
        path.join(templatesPath, 'approval-confirmation.hbs'),
      ),
    };
  }

  private compileTemplate(templatePath: string): HandlebarsTemplateDelegate {
    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    return Handlebars.compile(templateContent);
  }

  async enviarCorreo(options: {
    to: string | string[];
    subject: string;
    context: Record<string, any>;
    template:
      | 'request'
      | 'approved'
      | 'rejected'
      | 'treasurer'
      | 'approvalConfirmation';
    bcc?: string[];
  }): Promise<boolean> {
    const html = this.templates[options.template](options.context);
    try {
      console.log('[MailService] Intentando enviar correo:', {
        to: options.to,
        bcc: options.bcc,
        subject: options.subject,
        template: options.template,
      });
      await this.transporter.sendMail({
        from: 'viaticos@grupo-fg.com',
        to: options.to,
        bcc: options.bcc,
        subject: options.subject,
        html: html,
        priority: 'normal',
      });
      console.log(
        '[MailService] Correo enviado exitosamente a:',
        options.to,
        'bcc:',
        options.bcc,
      );
      return true;
    } catch (error) {
      console.error('[MailService] Error al enviar correo:', error);
      return false;
    }
  }
}
