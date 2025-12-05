import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Stripe price ID' })
  @IsString()
  @IsNotEmpty()
  priceId: string;

  @ApiProperty({ description: 'Stripe customer ID' })
  @IsString()
  @IsNotEmpty()
  customerId: string;

  @ApiPropertyOptional({ description: 'Trial period in days' })
  @IsOptional()
  trialPeriodDays?: number;

  @ApiPropertyOptional({ description: 'Payment method ID' })
  @IsString()
  @IsOptional()
  paymentMethodId?: string;
}
