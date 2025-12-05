import { Module } from '@nestjs/common';
import { MarketingCmsController } from './marketing-cms.controller';
import { MarketingCmsService } from './marketing-cms.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [MarketingCmsController],
  providers: [MarketingCmsService, PrismaService],
  exports: [MarketingCmsService],
})
export class MarketingCmsModule {}
