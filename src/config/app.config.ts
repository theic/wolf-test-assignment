import { registerAs } from '@nestjs/config';
import { ConfigName } from './config.enum';

export interface AppConfig {
  port: number;
}

export const AppConfig = registerAs(
  ConfigName.App,
  (): AppConfig => ({
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  }),
); 