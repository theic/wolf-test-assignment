import { Module } from '@nestjs/common';
import { AnalysisService } from './services/analysis.service';
import { PdfService } from './services/pdf.service';
import { AiService } from './services/ai.service';
import { FileStoreService } from './services/file-store.service';
import { AnalysisRouter } from './analysis.router';

@Module({
  providers: [
    AnalysisService,
    PdfService,
    AiService,
    FileStoreService,
    AnalysisRouter,
  ],
  exports: [AnalysisService, AnalysisRouter],
})
export class AnalysisModule {} 