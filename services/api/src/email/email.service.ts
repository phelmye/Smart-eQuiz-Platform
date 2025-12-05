import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import { SendEmailDto } from './dto';

export interface WelcomeEmailData {
  userName: string;
  tenantName: string;
  loginUrl: string;
}

export interface PasswordResetEmailData {
  userName: string;
  resetUrl: string;
  expiresIn: string;
}

export interface TournamentNotificationData {
  userName: string;
  tournamentName: string;
  tournamentDate: string;
  tournamentUrl: string;
}

export interface PaymentReceiptData {
  userName: string;
  amount: string;
  currency: string;
  planName: string;
  invoiceUrl: string;
  date: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly isConfigured: boolean;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    this.fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@smartequiz.com';

    if (!apiKey) {
      this.logger.warn('SENDGRID_API_KEY not configured - email features disabled');
      this.isConfigured = false;
    } else {
      sgMail.setApiKey(apiKey);
      this.isConfigured = true;
      this.logger.log('SendGrid configured successfully');
    }
  }

  /**
   * Send a custom email
   */
  async sendEmail(dto: SendEmailDto): Promise<void> {
    if (!this.isConfigured) {
      this.logger.warn('SendGrid not configured - email not sent');
      return;
    }

    try {
      await sgMail.send({
        to: dto.to,
        from: dto.from || this.fromEmail,
        replyTo: dto.replyTo,
        subject: dto.subject,
        text: dto.text,
        html: dto.html,
      });

      this.logger.log(`Email sent successfully to ${dto.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(to: string, data: WelcomeEmailData): Promise<void> {
    const html = this.generateWelcomeEmailTemplate(data);
    const text = `Welcome to ${data.tenantName}, ${data.userName}! Login at: ${data.loginUrl}`;

    await this.sendEmail({
      to,
      subject: `Welcome to ${data.tenantName}!`,
      html,
      text,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, data: PasswordResetEmailData): Promise<void> {
    const html = this.generatePasswordResetTemplate(data);
    const text = `Hi ${data.userName}, reset your password here: ${data.resetUrl}. Link expires in ${data.expiresIn}.`;

    await this.sendEmail({
      to,
      subject: 'Reset Your Password',
      html,
      text,
    });
  }

  /**
   * Send tournament notification email
   */
  async sendTournamentNotification(to: string, data: TournamentNotificationData): Promise<void> {
    const html = this.generateTournamentNotificationTemplate(data);
    const text = `Hi ${data.userName}, ${data.tournamentName} is scheduled for ${data.tournamentDate}. View details: ${data.tournamentUrl}`;

    await this.sendEmail({
      to,
      subject: `Tournament Alert: ${data.tournamentName}`,
      html,
      text,
    });
  }

  /**
   * Send payment receipt email
   */
  async sendPaymentReceipt(to: string, data: PaymentReceiptData): Promise<void> {
    const html = this.generatePaymentReceiptTemplate(data);
    const text = `Hi ${data.userName}, your payment of ${data.amount} ${data.currency} for ${data.planName} was successful. Invoice: ${data.invoiceUrl}`;

    await this.sendEmail({
      to,
      subject: 'Payment Receipt',
      html,
      text,
    });
  }

  /**
   * Generate welcome email HTML template
   */
  private generateWelcomeEmailTemplate(data: WelcomeEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${data.tenantName}!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Welcome to the Smart eQuiz Platform! Your account has been successfully created.</p>
              <p>You can now access all the features of our Bible quiz competition platform:</p>
              <ul>
                <li>Create and manage tournaments</li>
                <li>Practice with our extensive question bank</li>
                <li>Track your progress and earn badges</li>
                <li>Compete with other participants</li>
              </ul>
              <p style="text-align: center;">
                <a href="${data.loginUrl}" class="button">Get Started</a>
              </p>
              <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
              <p>Best regards,<br>The Smart eQuiz Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Smart eQuiz Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate password reset email HTML template
   */
  private generatePasswordResetTemplate(data: PasswordResetEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <p style="text-align: center;">
                <a href="${data.resetUrl}" class="button">Reset Password</a>
              </p>
              <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in ${data.expiresIn}. If you didn't request this reset, please ignore this email.
              </div>
              <p>For security reasons, the link can only be used once.</p>
              <p>Best regards,<br>The Smart eQuiz Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Smart eQuiz Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate tournament notification email HTML template
   */
  private generateTournamentNotificationTemplate(data: TournamentNotificationData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .highlight { background: #d1fae5; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏆 Tournament Alert</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>This is a reminder about an upcoming tournament:</p>
              <div class="highlight">
                <h2 style="margin: 0 0 10px 0;">${data.tournamentName}</h2>
                <p style="margin: 0; font-size: 18px;">📅 ${data.tournamentDate}</p>
              </div>
              <p>Make sure you're prepared and ready to compete!</p>
              <p style="text-align: center;">
                <a href="${data.tournamentUrl}" class="button">View Tournament Details</a>
              </p>
              <p>Good luck and may the best quizzer win!</p>
              <p>Best regards,<br>The Smart eQuiz Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Smart eQuiz Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Generate payment receipt email HTML template
   */
  private generatePaymentReceiptTemplate(data: PaymentReceiptData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .receipt { background: white; border: 1px solid #e5e7eb; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .receipt-row:last-child { border-bottom: none; font-weight: bold; font-size: 18px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Payment Successful</h1>
            </div>
            <div class="content">
              <p>Hi ${data.userName},</p>
              <p>Thank you for your payment! Your subscription has been updated.</p>
              <div class="receipt">
                <h3 style="margin: 0 0 15px 0;">Payment Details</h3>
                <div class="receipt-row">
                  <span>Plan</span>
                  <span>${data.planName}</span>
                </div>
                <div class="receipt-row">
                  <span>Date</span>
                  <span>${data.date}</span>
                </div>
                <div class="receipt-row">
                  <span>Amount</span>
                  <span>${data.amount} ${data.currency}</span>
                </div>
              </div>
              <p style="text-align: center;">
                <a href="${data.invoiceUrl}" class="button">Download Invoice</a>
              </p>
              <p>If you have any questions about this payment, please contact our support team.</p>
              <p>Best regards,<br>The Smart eQuiz Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Smart eQuiz Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
