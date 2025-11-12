import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com', // Reemplaza con tu servidor SMTP
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'hongovaginal@gmail.com', // Reemplaza con tu usuario de correo
        pass: 'wliv vqyb owfb juft', // Reemplaza con tu contraseña de correo
      },
    });
  }

  async sendCompanyApprovedEmail(email: string, name: string) {
    const mailOptions = {
      from: '"UfroJobs" <ufro.jobs@gmail.com>',
      to: email,
      subject: '¡Tu empresa ha sido aprobada!',
      text: `Hola ${name},\n\nTu empresa ha sido aprobada en UfroJobs.`,
      html: `<p>Hola ${name},</p><p>Tu empresa ha sido aprobada en UfroJobs.</p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendCompanyRejectedEmail(email: string, name: string) {
    const mailOptions = {
      from: '"UfroJobs" <ufro.jobs@gmail.com>',
      to: email,
      subject: 'Tu empresa ha sido rechazada',
      text: `Hola ${name},\n\nLamentamos informarte que tu empresa ha sido rechazada.`,
      html: `<p>Hola ${name},</p><p>Lamentamos informarte que tu empresa ha sido rechazada.</p>`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
