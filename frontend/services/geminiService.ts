import { apiClient } from './apiClient';
import { DocumentType, ChatMessage, GroundingSource } from '../types';

// Document Generation - now uses API
export const generateDocument = async (
  docType: DocumentType,
  sector: string,
  topic: string,
  goal: string,
  files: File[],
  useSearch: boolean,
  organization: string
): Promise<{ text: string; sources?: GroundingSource[] }> => {
  try {
    const response = await apiClient.generateDocument({
      docType,
      sector,
      topic,
      goal,
      useSearch,
      organization,
      files: Array.from(files)
    });

    if (!response.success) {
      throw new Error(response.error || 'Document generation failed');
    }

    return {
      text: response.text,
      sources: response.sources
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Document generation failed');
  }
};

// Refine Document - now uses API
export const refineDocument = async (
  originalHtml: string,
  instruction: string,
  additionalFiles: File[] = []
): Promise<string> => {
  try {
    const response = await apiClient.refineDocument({
      originalHtml,
      instruction,
      additionalFiles: Array.from(additionalFiles)
    });

    if (!response.success) {
      throw new Error(response.error || 'Document refinement failed');
    }

    return response.text;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Document refinement failed');
  }
};

// Chat Bot - now uses API
export const sendChatMessage = async (
  history: ChatMessage[],
  newMessage: string
): Promise<{ text: string; sources?: GroundingSource[] }> => {
  try {
    const response = await apiClient.sendChatMessage(
      history.map(h => ({ role: h.role, text: h.text })),
      newMessage
    );

    if (!response.success) {
      throw new Error(response.error || 'Chat failed');
    }

    return {
      text: response.text,
      sources: response.sources
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Chat failed');
  }
};

// Motivational Quote - now uses API
export const getMotivationalQuote = async (): Promise<string> => {
  try {
    const response = await apiClient.getMotivationalQuote();
    if (!response.success) {
      throw new Error(response.error || 'Failed to get quote');
    }
    return response.quote;
  } catch (error: any) {
    // Fallback quotes
    const FALLBACK_QUOTES = [
      "Muvaffaqiyat tasodif emas, u mashaqqatli mehnat, qat'iyat va o'rganish natijasidir.",
      "Har bir kun - yangi imkoniyat. Bugun kechagidan yaxshiroq bo'lishga intiling.",
      "Katta maqsadlarga erishish uchun kichik, ammo barqaror qadamlar tashlang.",
      "Intizom - bu siz xohlagan narsa va siz hozir xohlayotgan narsa o'rtasidagi tanlovdir.",
      "Haqiqiy liderlik bu buyruq berish emas, balki o'rnak bo'lishdir.",
    ];
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
  }
};

// Daily Briefing - now uses API
export const getDailyBriefing = async (organization: string): Promise<string> => {
  try {
    const response = await apiClient.getDailyBriefing();
    if (!response.success) {
      throw new Error(response.error || 'Failed to get briefing');
    }
    return Array.isArray(response.briefing) ? response.briefing.join('\n') : response.briefing;
  } catch (error: any) {
    return `- Bugungi kun uchun eng ustuvor vazifalarni belgilab oling va diqqatni jamlang.
- Jamoa bilan qisqa "status-meeting" o'tkazib, ish jarayonini muvofiqlashtiring.
- Ijro intizomi va hujjatlar aylanishini nazorat qilishni unutmang.`;
  }
};

// Image Analysis - now uses API
export const analyzeImage = async (file: File, prompt: string): Promise<string> => {
  try {
    const response = await apiClient.analyzeImage(file, prompt);
    if (!response.success) {
      throw new Error(response.error || 'Image analysis failed');
    }
    return response.text;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || error.message || 'Image analysis failed');
  }
};
