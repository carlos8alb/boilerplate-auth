import nodemailer from 'nodemailer';
import { config } from '../config/env';

const transporter = config.ethereal.auth.user
  ? nodemailer.createTransport({
      host: config.ethereal.host,
      port: config.ethereal.port,
      secure: config.ethereal.secure,
      auth: {
        user: config.ethereal.auth.user,
        pass: config.ethereal.auth.pass,
      },
    })
  : null;

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!transporter) {
      console.warn('SMTP not configured. Email not sent.');
      return false;
    }

    const { to, subject, html } = options;

    try {
      const info = await transporter.sendMail({
        from: '"Boilerplate Auth" <noreply@boilerplate.com>',
        to,
        subject,
        html,
      });

      console.log('Email sent:', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const verificationUrl = `${config.clientUrl}/auth/verify-email?token=${token}`;

    return this.sendEmail({
      to: email,
      subject: 'Verifica tu correo electrónico',
      html: `
        <h1>Verifica tu correo electrónico</h1>
        <p>Haz clic en el siguiente enlace para verificar tu correo:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>Este enlace expira en 24 horas.</p>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const resetUrl = `${config.clientUrl}/auth/reset-password?token=${token}`;

    return this.sendEmail({
      to: email,
      subject: 'Restablece tu contraseña',
      html: `
        <h1>Restablece tu contraseña</h1>
        <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Este enlace expira en 1 hora.</p>
      `,
    });
  }
}

export const emailService = new EmailService();