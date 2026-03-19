import type { SurveyData } from "./types";

export interface Submission {
  id: string;
  createdAt: string; // ISO timestamp
  surveyData: SurveyData;
  prompt: string;
  // Denormalized fields for listing convenience
  city: string;
  dateRange: string;
  companionSummary: string;
}
