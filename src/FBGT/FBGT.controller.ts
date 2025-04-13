import { Controller, Get, Post} from '@nestjs/common';
import { FBGTService } from './FBGT.service';

@Controller('fbgt')
export class FBGTController {
  constructor(private readonly fbgtService: FBGTService) {}

  @Post('auto-mint')
  async autoMint() {
    await this.fbgtService.executeAutoMint();
  }

  @Get('subscriptions')
  async getSubscriptions() {
    return await this.fbgtService.getSubscriptions();
  }

  @Get('managers')
  async getManagers() {
    return await this.fbgtService.getManagers();
  }
}
