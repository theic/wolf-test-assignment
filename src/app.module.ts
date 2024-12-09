import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { AppConfig, AiConfig } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfig, AiConfig],
    }),
    AnalysisModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
