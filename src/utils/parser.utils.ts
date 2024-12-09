import { AnalysisResponse } from '../modules/analysis/services/ai.service';

export function parseAiResponse(response: any): AnalysisResponse {
  const content = response.candidates[0].content;
  const analysisText = content.parts[0].text;
  
  const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }
  
  const jsonStr = jsonMatch[1];
  return JSON.parse(jsonStr);
} 