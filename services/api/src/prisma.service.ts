import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma Service extends PrismaClient with all generated models.
 * If VS Code shows type errors, restart the TypeScript server:
 * Cmd/Ctrl+Shift+P > "TypeScript: Restart TS Server"
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
