import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AiConfig, ConfigName } from '../../../config';

@Injectable()
export class AiService {
  private readonly apiEndpoint: string;
  private readonly authToken: string;

  constructor(private readonly configService: ConfigService) {
    const aiConfig = this.configService.get<AiConfig>(ConfigName.AI);
    this.apiEndpoint = aiConfig.endpoint;
    this.authToken = aiConfig.authToken;
  }

  async analyze(cvText: string, jobDescText: string) {
    const prompt = `
      Analyze the following CV and job description to identify the candidate's strengths, 
      weaknesses, and overall fit for the position. Provide a detailed assessment.
      
      CV:
      ${cvText}
      
      Job Description:
      ${jobDescText}
    `;

    return await this.callGeminiApi(prompt);
  }

  private async callGeminiApi(prompt: string) {
    try {
      const response = await axios.post(
        this.apiEndpoint,
        {
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
        },
        {
          headers: {
            Authorization: this.authToken,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new Error(`AI API call failed: ${error.message}`);
    }
  }
} 