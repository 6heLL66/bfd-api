import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { createClient } from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';

@Controller()
export class AppController {
  private supabase: SupabaseClient;
  constructor(private readonly appService: AppService) {
    this.supabase = createClient(
      `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`,
      process.env.SUPABASE_ANON_KEY!,
    );
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('history')
  async getHistory(): Promise<any> {
    return (await this.supabase.from('treasure_history').select('*')).data;
  }

  @Get('tokens')
  async getTokens(): Promise<any> {
    return (await this.supabase.from('tokens').select('*')).data;
  }

  @Get('apr')
  async getApr(): Promise<any> {
    console.log('Fetching APR data...');
    try {
      const response = await fetch(
        'https://hub.berachain.com/api/validators/apr/',
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const aprs = await response.json();
      return aprs;
    } catch (error) {
      console.error('Error fetching APR data:', error);
      // Возвращаем пустой объект или массив вместо ошибки
      return [];
    }
  }
}
