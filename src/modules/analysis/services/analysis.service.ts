import { Injectable } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { AiService, AnalysisResponse } from './ai.service';
import { FileStoreService } from './file-store.service';

@Injectable()
export class AnalysisService {
  constructor(
    private readonly pdfService: PdfService,
    private readonly aiService: AiService,
    private readonly fileStore: FileStoreService,
  ) {}

  async uploadFile(
    buffer: Buffer,
    type: 'cv' | 'jobDescription',
    filename: string,
  ) {
    try {
      const text = await this.pdfService.parsePdf(buffer);
      const fileId = await this.fileStore.storeFile(buffer, text);
      return { fileId, type, filename };
    } catch (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  async analyze(cvId: string, jobDescriptionId: string): Promise<AnalysisResponse> {
    try {
      const cv = this.fileStore.getFile(cvId);
      const jobDesc = this.fileStore.getFile(jobDescriptionId);

      if (!cv || !jobDesc) {
        throw new Error('Files not found');
      }

      return await this.aiService.analyze(cv.text, jobDesc.text);
    } catch (error) {
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }
} 