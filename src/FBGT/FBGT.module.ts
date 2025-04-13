import { Module } from '@nestjs/common';
import { FBGTService } from './FBGT.service';
import { FBGTController } from './FBGT.controller';
@Module({
  providers: [FBGTService],
  controllers: [FBGTController],
  exports: [FBGTService],
})
export class FBGTModule {}
