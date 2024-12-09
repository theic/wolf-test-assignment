import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AiConfig, ConfigName } from '../../../config';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import type { GenerateContentRequest } from '@google-cloud/vertexai';
import { RATE_LIMITS } from '../../../constants/rate-limits';
import { API_HEADERS, HTTP_STATUS } from '../../../constants/api';
import { createAnalysisPrompt, createGeminiRequest } from '../../../utils/api.utils';
import { parseAiResponse } from '../../../utils/parser.utils';

export interface AnalysisResponse {
  strengths: string[];
  weaknesses: string[];
  overallFit: number;
  explanation: string;
}

@Injectable()
export class AiService {
  private readonly apiEndpoint: string;
  private readonly authToken: string;
  private readonly minuteRateLimiter: RateLimiterMemory;
  private readonly hourRateLimiter: RateLimiterMemory;

  constructor(private readonly configService: ConfigService) {
    const aiConfig = this.configService.get<AiConfig>(ConfigName.AI);
    this.apiEndpoint = aiConfig.endpoint;
    this.authToken = aiConfig.authToken;

    this.minuteRateLimiter = new RateLimiterMemory({
      points: RATE_LIMITS.PER_MINUTE.POINTS,
      duration: RATE_LIMITS.PER_MINUTE.DURATION,
    });

    this.hourRateLimiter = new RateLimiterMemory({
      points: RATE_LIMITS.PER_HOUR.POINTS,
      duration: RATE_LIMITS.PER_HOUR.DURATION,
    });
  }

  async analyze(cvText: string, jobDescText: string): Promise<AnalysisResponse> {
    try {
      await Promise.all([
        this.minuteRateLimiter.consume(RATE_LIMITS.KEY),
        this.hourRateLimiter.consume(RATE_LIMITS.KEY)
      ]);
    } catch (error) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    const prompt = createAnalysisPrompt(cvText, jobDescText);
    const request = createGeminiRequest(prompt);
    const response = await this.callGeminiApi(request);
    return parseAiResponse(response);
  }

  private async callGeminiApi(request: GenerateContentRequest) {
    try {
      const response = await axios.post(
        this.apiEndpoint,
        request,
        {
          headers: {
            Authorization: this.authToken,
            'Content-Type': API_HEADERS.CONTENT_TYPE,
          },
        },
      );

      return response.data;
    } catch (error) {
      if (error.response?.status === HTTP_STATUS.RATE_LIMIT_EXCEEDED) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error(`AI API call failed: ${error.message}`);
    }
  }
} 