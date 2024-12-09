import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AiConfig, ConfigName } from '../../../config';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import type { GenerateContentRequest } from '@google-cloud/vertexai';

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

    // 20 requests per minute
    this.minuteRateLimiter = new RateLimiterMemory({
      points: 20,
      duration: 60,
    });

    // 300 requests per hour
    this.hourRateLimiter = new RateLimiterMemory({
      points: 300,
      duration: 3600,
    });
  }

  async analyze(cvText: string, jobDescText: string): Promise<AnalysisResponse> {
    const prompt = `
      Please analyze the following CV and job description. Provide a structured response with the following:
      1. List the candidate's key strengths relevant to this role
      2. List potential weaknesses or gaps
      3. Rate the overall fit on a scale of 1-10
      4. Provide a brief explanation of the rating
      
      Format the response in JSON with the following structure:
      {
        "strengths": string[],
        "weaknesses": string[],
        "overallFit": number,
        "explanation": string
      }

      CV:
      ${cvText}
      
      Job Description:
      ${jobDescText}
    `;

    try {
      // Check both rate limits
      await Promise.all([
        this.minuteRateLimiter.consume('ai-analysis'),
        this.hourRateLimiter.consume('ai-analysis')
      ]);
    } catch (error) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    const request: GenerateContentRequest = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    };

    const response = await this.callGeminiApi(request);
    return this.parseResponse(response);
  }

  private async callGeminiApi(request: GenerateContentRequest) {
    try {
      const response = await axios.post(
        this.apiEndpoint,
        request,
        {
          headers: {
            Authorization: this.authToken,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error(`AI API call failed: ${error.message}`);
    }
  }

  private parseResponse(response: any): AnalysisResponse {
    try {
      const content = response.candidates[0].content;
      const analysisText = content.parts[0].text;
      
      // Extract the JSON part from the response
      const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const jsonStr = jsonMatch[1];
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Parse error:', error);
      console.error('Raw response:', JSON.stringify(response, null, 2));
      throw new Error('Failed to parse AI response');
    }
  }
} 