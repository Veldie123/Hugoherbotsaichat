/**
 * Hugo Engine API Service
 * Connects frontend to the V2 backend
 */

const API_BASE = "/api";

export interface StartSessionRequest {
  techniqueId: string;
  mode?: "COACH_CHAT" | "ROLEPLAY";
  isExpert?: boolean;
  modality?: "chat" | "audio" | "video";
}

export interface StartSessionResponse {
  sessionId: string;
  phase: string;
  initialMessage: string;
}

export interface SendMessageRequest {
  sessionId: string;
  content: string;
  isExpert?: boolean;
}

export interface SendMessageResponse {
  response: string;
  phase: string;
  contextData?: {
    sector?: string;
    product?: string;
    klant_type?: string;
    verkoopkanaal?: string;
  };
  debug?: {
    phase?: string;
    signal?: string;
    detectedTechniques?: string[];
    evaluation?: string;
    contextComplete?: boolean;
    gatheredFields?: string[];
  };
}

export interface Technique {
  nummer: string;
  naam: string;
  fase: string;
  parent?: string;
  description?: string;
}

class HugoApiService {
  private currentSessionId: string | null = null;

  async startSession(request: StartSessionRequest): Promise<StartSessionResponse> {
    const response = await fetch(`${API_BASE}/v2/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to start session: ${response.statusText}`);
    }

    const data = await response.json();
    this.currentSessionId = data.sessionId;
    return data;
  }

  async sendMessage(content: string, isExpert = false): Promise<SendMessageResponse> {
    if (!this.currentSessionId) {
      throw new Error("No active session. Call startSession first.");
    }

    const response = await fetch(`${API_BASE}/v2/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: this.currentSessionId,
        content,
        isExpert,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    return response.json();
  }

  async getTechnieken(): Promise<Technique[]> {
    const response = await fetch(`${API_BASE}/technieken`);
    if (!response.ok) {
      throw new Error(`Failed to load techniques: ${response.statusText}`);
    }
    return response.json();
  }

  getSessionId(): string | null {
    return this.currentSessionId;
  }

  clearSession(): void {
    this.currentSessionId = null;
  }
}

export const hugoApi = new HugoApiService();
