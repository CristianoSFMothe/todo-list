import { Module } from '@nestjs/common';

import { PrismaModule } from './database/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [PrismaModule, UsersModule, TasksModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
