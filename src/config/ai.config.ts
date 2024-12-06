import { registerAs } from '@nestjs/config';
import { ConfigName } from './config.enum';

export interface AiConfig {
  endpoint: string;
  authToken: string;
}

export const AiConfig = registerAs(
  ConfigName.AI,
  (): AiConfig => ({
    endpoint: process.env.API_ENDPOINT,
    authToken: process.env.AUTH_TOKEN,
  }),
); 