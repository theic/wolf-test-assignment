import type { GenerateContentRequest } from '@google-cloud/vertexai';

export function createAnalysisPrompt(cvText: string, jobDescText: string): string {
  return `
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
}

export function createGeminiRequest(prompt: string): GenerateContentRequest {
  return {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
  };
} 