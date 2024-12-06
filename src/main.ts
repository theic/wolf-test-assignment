import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as trpcExpress from '@trpc/server/adapters/express';
import { AppModule } from './app.module';
import { AnalysisRouter } from './modules/analysis/analysis.router';
import { AppConfig, ConfigName } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  const { port } = configService.get<AppConfig>(ConfigName.App);
  
  const analysisRouter = app.get(AnalysisRouter);

  app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
      router: analysisRouter.router,
    }),
  );

  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}

bootstrap();
