import { Global, Module } from '@nestjs/common';

import { PrismaService } from './service.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
