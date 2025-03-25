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
    const aprs = await fetch('https://hub.berachain.com/api/validators/apr/', {
      headers: {
        accept: '*/*',
        'accept-language': 'en-US,en;q=0.9,ru;q=0.8',
        baggage:
          'sentry-environment=vercel-production,sentry-release=f3ceafe602b8307610c87549df21b6849980b27e,sentry-public_key=22333188526836c1863286ab0d15bca6,sentry-trace_id=e45516e820ac42149242c0e0e76959ae,sentry-sample_rate=0.1,sentry-sampled=false',
        priority: 'u=1, i',
        'sec-ch-ua':
          '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        origin: 'https://hub.berachain.com',
        'sentry-trace': 'e45516e820ac42149242c0e0e76959ae-a812854bd32275a4-0',
      },
      referrer:
        'https://hub.berachain.com/validators/0x89cbd542c737cca4bc33f1ea5084a857a7620042fe37fd326ecf5aeb61f2ce096043cd0ed57ba44693cf606978b566ba/',
      body: null,
      method: 'GET',
    }).then((res) => res.json());

    return aprs;
  }
}
