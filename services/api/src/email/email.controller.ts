import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailService, WelcomeEmailData, PasswordResetEmailData, TournamentNotificationData, PaymentReceiptData } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { SendEmailDto } from './dto';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send a custom email' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendEmail(@Body() dto: SendEmailDto) {
    await this.emailService.sendEmail(dto);
    return { success: true, message: 'Email sent successfully' };
  }

  @Post('welcome')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send welcome email to new user' })
  @ApiResponse({ status: 200, description: 'Welcome email sent' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendWelcomeEmail(
    @Body() body: { to: string; data: WelcomeEmailData },
  ) {
    await this.emailService.sendWelcomeEmail(body.to, body.data);
    return { success: true, message: 'Welcome email sent' };
  }

  @Post('password-reset')
  @ApiOperation({ summary: 'Send password reset email (no auth required)' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async sendPasswordResetEmail(
    @Body() body: { to: string; data: PasswordResetEmailData },
  ) {
    await this.emailService.sendPasswordResetEmail(body.to, body.data);
    return { success: true, message: 'Password reset email sent' };
  }

  @Post('tournament-notification')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send tournament notification email' })
  @ApiResponse({ status: 200, description: 'Tournament notification sent' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendTournamentNotification(
    @Body() body: { to: string; data: TournamentNotificationData },
  ) {
    await this.emailService.sendTournamentNotification(body.to, body.data);
    return { success: true, message: 'Tournament notification sent' };
  }

  @Post('payment-receipt')
  @UseGuards(JwtAuthGuard, TenantGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send payment receipt email' })
  @ApiResponse({ status: 200, description: 'Payment receipt sent' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sendPaymentReceipt(
    @Body() body: { to: string; data: PaymentReceiptData },
  ) {
    await this.emailService.sendPaymentReceipt(body.to, body.data);
    return { success: true, message: 'Payment receipt sent' };
  }
}
