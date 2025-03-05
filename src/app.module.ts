import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskService } from './Task/task.service';
import { TaskModule } from './Task/task.module';

@Module({
  imports: [TaskModule],
  controllers: [AppController],
  providers: [AppService, TaskService],
})
export class AppModule {}
