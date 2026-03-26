import { Resend } from "resend";
import { config } from "../config/env";

const resend = new Resend(config.resend.apiKey);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const { to, subject, html } = options;

      await resend.emails.send({
        from: "onboarding@resend.dev",
        to,
        subject,
        html,
      });

      return true;
    } catch {
      return false;
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:4200"}/verify-email?token=${token}`;

    return this.sendEmail({
      to: email,
      subject: "Verifica tu correo electrónico",
      html: `
        <h1>Verifica tu correo electrónico</h1>
        <p>Haz clic en el siguiente enlace para verificar tu correo:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>Este enlace expira en 24 horas.</p>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:4200"}/reset-password?token=${token}`;

    return this.sendEmail({
      to: email,
      subject: "Restablece tu contraseña",
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
