import { Injectable } from '@nestjs/common';
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { AnalysisService } from './services/analysis.service';

const t = initTRPC.create();

@Injectable()
export class AnalysisRouter {
  constructor(private readonly analysisService: AnalysisService) {}

  public router = t.router({
    uploadFile: t.procedure
      .input(
        z.object({
          file: z.array(z.number()),
          type: z.enum(['cv', 'jobDescription']),
          filename: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.file);
        return await this.analysisService.uploadFile(
          buffer,
          input.type,
          input.filename,
        );
      }),

    analyze: t.procedure
      .input(
        z.object({
          cvId: z.string(),
          jobDescriptionId: z.string(),
        }),
      )
      .mutation(async ({ input }) => {
        return await this.analysisService.analyze(
          input.cvId,
          input.jobDescriptionId,
        );
      }),
  });
}

export type AppRouter = typeof AnalysisRouter.prototype.router;
