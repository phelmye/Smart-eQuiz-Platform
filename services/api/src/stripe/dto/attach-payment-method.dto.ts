import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AttachPaymentMethodDto {
  @ApiProperty({ description: 'Stripe payment method ID' })
  @IsString()
  @IsNotEmpty()
  paymentMethodId: string;

  @ApiProperty({ description: 'Stripe customer ID' })
  @IsString()
  @IsNotEmpty()
  customerId: string;
}
