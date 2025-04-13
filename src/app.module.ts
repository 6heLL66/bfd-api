import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskService } from './Task/task.service';
import { TaskModule } from './Task/task.module';
import { FBGTModule } from './FBGT/FBGT.module';
import { FBGTService } from './FBGT/FBGT.service';
@Module({
  imports: [TaskModule, FBGTModule],
  controllers: [AppController],
  providers: [AppService, TaskService, FBGTService],
})
export class AppModule {}
