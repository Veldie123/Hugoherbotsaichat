export interface LastActivity {
  type: 'technique' | 'video' | 'webinar';
  id: string;
  name: string;
  phase?: number;
  timestamp: number;
}

const STORAGE_KEY = 'hugo_last_activity';

export const lastActivityService = {
  save(activity: Omit<LastActivity, 'timestamp'>): void {
    const data: LastActivity = {
      ...activity,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[LastActivity] Failed to save:', e);
    }
  },

  get(): LastActivity | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      return JSON.parse(stored) as LastActivity;
    } catch (e) {
      console.warn('[LastActivity] Failed to get:', e);
      return null;
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('[LastActivity] Failed to clear:', e);
    }
  },

  getWelcomeMessage(activity: LastActivity | null): string {
    if (!activity) {
      return "Welkom! Ik ben Hugo, jouw persoonlijke sales coach. Waar wil je vandaag aan werken? Je kunt een techniek kiezen uit de E.P.I.C. Sales Flow, of vraag me gewoon waar je mee zit.";
    }

    const timeAgo = Date.now() - activity.timestamp;
    const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60));
    const daysAgo = Math.floor(hoursAgo / 24);

    let timePhrase = "";
    if (daysAgo > 0) {
      timePhrase = daysAgo === 1 ? "gisteren" : `${daysAgo} dagen geleden`;
    } else if (hoursAgo > 0) {
      timePhrase = hoursAgo === 1 ? "een uur geleden" : `${hoursAgo} uur geleden`;
    } else {
      timePhrase = "net";
    }

    switch (activity.type) {
      case 'technique':
        return `Welkom terug! ${timePhrase} werkten we aan "${activity.name}". Wil je daar verder mee, of heb je vragen over wat we besproken hebben? Je kunt ook een nieuwe techniek kiezen als je ergens anders aan wilt werken.`;
      case 'video':
        return `Welkom terug! ${timePhrase} keek je de video over "${activity.name}". Heb je daar nog vragen over, of wil je oefenen met deze techniek in een roleplay?`;
      case 'webinar':
        return `Welkom terug! ${timePhrase} volgde je het webinar "${activity.name}". Wat vond je ervan? Zullen we de besproken technieken samen oefenen?`;
      default:
        return "Welkom terug! Waar wil je vandaag aan werken?";
    }
  },

  getQuickActions(activity: LastActivity | null): Array<{ label: string; action: string; techniqueId?: string }> {
    if (!activity) {
      return [
        { label: "Laat me de E.P.I.C. technieken zien", action: "show_sidebar" },
        { label: "Wat raad je me aan?", action: "recommend" },
      ];
    }

    const actions = [];
    
    if (activity.type === 'technique') {
      actions.push({ 
        label: `Verder met ${activity.name}`, 
        action: "continue_technique", 
        techniqueId: activity.id 
      });
    }
    
    actions.push({ label: "Iets anders oefenen", action: "show_sidebar" });
    actions.push({ label: "Ik heb een vraag", action: "ask_question" });
    
    return actions;
  }
};
