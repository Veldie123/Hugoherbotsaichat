const HUGO_AI_API_URL = import.meta.env.VITE_HUGO_AI_API_URL || 'https://hugoherbots-ai-chat.replit.app';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  technique?: string;
  sources?: Array<{
    title: string;
    videoId?: string;
    chunk?: string;
  }>;
}

export interface ActivitySummary {
  videos_watched: number;
  videos_completed: number;
  webinars_attended: number;
  chat_sessions: number;
  total_activities: number;
  last_activity: string | null;
  welcomeMessage?: string;
}

const CHAT_ENDPOINTS = [
  '/api/v2/chat',
  '/api/chat',
  '/api/chat/message',
];

const ACTIVITY_ENDPOINTS = [
  '/api/v2/user/activity-summary',
  '/api/user/activity-summary',
  '/api/activity-summary',
];

async function tryEndpoints(endpoints: string[], options: RequestInit): Promise<Response | null> {
  for (const endpoint of endpoints) {
    try {
      const url = `${HUGO_AI_API_URL}${endpoint}`;
      console.log(`[HugoAI] Trying endpoint: ${url}`);
      const response = await fetch(url, options);
      if (response.ok) {
        console.log(`[HugoAI] Success with endpoint: ${endpoint}`);
        return response;
      }
      console.log(`[HugoAI] Endpoint ${endpoint} returned ${response.status}`);
    } catch (error) {
      console.log(`[HugoAI] Endpoint ${endpoint} failed:`, error);
    }
  }
  return null;
}

export const hugoAiApi = {
  async sendMessage(
    message: string,
    userId?: string,
    conversationHistory?: ChatMessage[],
    techniqueContext?: string
  ): Promise<ChatResponse> {
    const payload = {
      message,
      userId,
      conversationHistory: conversationHistory || [],
      techniqueContext,
      sourceApp: 'com',
      messages: conversationHistory?.map(m => ({
        role: m.role,
        content: m.content,
      })) || [],
    };

    try {
      const response = await tryEndpoints(CHAT_ENDPOINTS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response) {
        console.error('[HugoAI] All chat endpoints failed');
        throw new Error('Could not reach AI service');
      }

      const data = await response.json();
      console.log('[HugoAI] Response data:', data);
      
      return {
        message: data.message || data.response || data.content || data.text || 'Sorry, ik kon geen antwoord genereren.',
        technique: data.technique || data.techniek,
        sources: data.sources || data.bronnen,
      };
    } catch (error) {
      console.error('[HugoAI] Failed to send message:', error);
      throw error;
    }
  },

  async getActivitySummary(userId: string): Promise<ActivitySummary | null> {
    try {
      const response = await tryEndpoints(
        ACTIVITY_ENDPOINTS.map(ep => `${ep}?userId=${userId}`),
        { method: 'GET' }
      );
      
      if (!response) {
        console.log('[HugoAI] Activity summary endpoints not available');
        return null;
      }

      const data = await response.json();
      return data.summary || data;
    } catch (error) {
      console.error('[HugoAI] Error getting activity summary:', error);
      return null;
    }
  },

  async getWelcomeMessage(userId?: string): Promise<string> {
    if (!userId) {
      return 'Hallo! Ik ben Hugo, je persoonlijke sales coach. Waar kan ik je vandaag mee helpen?';
    }

    try {
      const summary = await this.getActivitySummary(userId);
      
      if (summary?.welcomeMessage) {
        return summary.welcomeMessage;
      }

      if (summary && summary.total_activities > 0) {
        const parts = [];
        if (summary.videos_watched > 0) {
          parts.push(`${summary.videos_watched} video's bekeken`);
        }
        if (summary.webinars_attended > 0) {
          parts.push(`${summary.webinars_attended} webinars bijgewoond`);
        }
        
        if (parts.length > 0) {
          return `Welkom terug! Je hebt al ${parts.join(' en ')}. Waar kan ik je vandaag mee helpen?`;
        }
      }

      return 'Hallo! Waar kan ik je vandaag mee helpen?';
    } catch {
      return 'Hallo! Waar kan ik je vandaag mee helpen?';
    }
  },

  async checkConnection(): Promise<{ connected: boolean; endpoints: string[] }> {
    const workingEndpoints: string[] = [];
    
    try {
      const healthResponse = await fetch(`${HUGO_AI_API_URL}/api/health`);
      if (healthResponse.ok) {
        workingEndpoints.push('/api/health');
      }
    } catch {}

    for (const endpoint of CHAT_ENDPOINTS) {
      try {
        const response = await fetch(`${HUGO_AI_API_URL}${endpoint}`, {
          method: 'OPTIONS',
        });
        if (response.ok || response.status === 405) {
          workingEndpoints.push(endpoint);
        }
      } catch {}
    }

    return {
      connected: workingEndpoints.length > 0,
      endpoints: workingEndpoints,
    };
  },
};
