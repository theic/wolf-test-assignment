import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { ConfigModule } from '@nestjs/config';
import { AppConfig, AiConfig } from './config';
import { AnalysisRouter } from './modules/analysis/analysis.router';
import { initTRPC } from '@trpc/server';
import { AiService } from './modules/analysis/services/ai.service';
import { PdfService } from './modules/analysis/services/pdf.service';

const mockAnalysisResponse = {
  data: {
    analysis: {
      strengths: ['Strong technical skills', 'Good communication'],
      weaknesses: ['Limited experience'],
      overallFit: 'Good match',
    },
  },
};

const mockAiService = {
  analyze: jest.fn().mockResolvedValue(mockAnalysisResponse),
};

const mockPdfService = {
  parsePdf: jest.fn()
    .mockImplementation((buffer) => {
      if (buffer.toString() === 'Invalid PDF') {
        throw new Error('PDF parsing failed');
      }
      return Promise.resolve('Mocked PDF content');
    }),
};

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('should return health status', () => {
      const result = appController.health();
      
      expect(result).toBeDefined();
      expect(result.status).toBe('ok');
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp).getTime()).not.toBeNaN();
    });
  });
});

describe('API Integration Tests', () => {
  let app: TestingModule;
  let analysisRouter: AnalysisRouter;
  let caller: ReturnType<typeof analysisRouter.router.createCaller>;
  const t = initTRPC.create();

  beforeEach(async () => {
    app = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [AppConfig, AiConfig],
        }),
        AnalysisModule,
      ],
      controllers: [AppController],
    })
      .overrideProvider(AiService)
      .useValue(mockAiService)
      .overrideProvider(PdfService)
      .useValue(mockPdfService)
      .compile();

    analysisRouter = app.get<AnalysisRouter>(AnalysisRouter);
    const callerFactory = t.createCallerFactory(analysisRouter.router);
    caller = callerFactory({});
  });

  describe('File Upload and Analysis', () => {
    const mockCvBuffer = Buffer.from('Mock CV content');
    const mockJobDescBuffer = Buffer.from('Mock Job Description content');

    beforeEach(() => {
      mockAiService.analyze.mockClear();
      mockPdfService.parsePdf.mockClear();
    });

    it('should upload files and perform analysis', async () => {
      const cvUpload = await caller.uploadFile({
        file: Array.from(mockCvBuffer),
        type: 'cv',
        filename: 'test-cv.pdf',
      });

      expect(cvUpload).toBeDefined();
      expect(cvUpload.fileId).toBeDefined();
      expect(cvUpload.type).toBe('cv');

      const jobDescUpload = await caller.uploadFile({
        file: Array.from(mockJobDescBuffer),
        type: 'jobDescription',
        filename: 'test-job.pdf',
      });

      expect(jobDescUpload).toBeDefined();
      expect(jobDescUpload.fileId).toBeDefined();
      expect(jobDescUpload.type).toBe('jobDescription');

      mockAiService.analyze.mockResolvedValue({
        strengths: ['Technical skills', 'Experience'],
        weaknesses: ['Communication'],
        overallFit: 8,
        explanation: 'Strong technical background with some areas for improvement',
      });

      const analysis = await caller.analyze({
        cvId: cvUpload.fileId,
        jobDescriptionId: jobDescUpload.fileId,
      });

      expect(analysis).toBeDefined();
      expect(analysis).toEqual({
        strengths: expect.arrayContaining(['Technical skills', 'Experience']),
        weaknesses: expect.arrayContaining(['Communication']),
        overallFit: expect.any(Number),
        explanation: expect.any(String),
      });

      expect(mockAiService.analyze).toHaveBeenCalled();
    });

    it('should handle invalid file uploads', async () => {
      await expect(
        caller.uploadFile({
          file: Array.from(Buffer.from('Invalid PDF')),
          type: 'cv',
          filename: 'invalid.pdf',
        }),
      ).rejects.toThrow('PDF parsing failed');

      expect(mockPdfService.parsePdf).toHaveBeenCalled();
    });

    it('should handle analysis with invalid file IDs', async () => {
      await expect(
        caller.analyze({
          cvId: 'invalid-id',
          jobDescriptionId: 'invalid-id',
        }),
      ).rejects.toThrow('Files not found');
    });
  });
});
