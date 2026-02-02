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

  getWelcomeMessage(activity: LastActivity | null): string | null {
    if (!activity) {
      return null;
    }

    const timeAgo = Date.now() - activity.timestamp;
    const hoursAgo = Math.floor(timeAgo / (1000 * 60 * 60));
    const daysAgo = Math.floor(hoursAgo / 24);

    let timePhrase = "";
    if (daysAgo > 0) {
      timePhrase = daysAgo === 1 ? "Gisteren" : `${daysAgo} dagen geleden`;
    } else if (hoursAgo > 0) {
      timePhrase = hoursAgo === 1 ? "Een uur geleden" : `${hoursAgo} uur geleden`;
    } else {
      timePhrase = "Net";
    }

    switch (activity.type) {
      case 'technique':
        return `${timePhrase} hadden we het over "${activity.name}". Wil je daar verder mee, of zit je ergens anders mee?`;
      case 'video':
        return `${timePhrase} keek je de video over "${activity.name}". Heb je daar nog vragen over?`;
      case 'webinar':
        return `${timePhrase} volgde je het webinar "${activity.name}". Zullen we de besproken technieken oefenen?`;
      default:
        return null;
    }
  },

  getQuickActions(activity: LastActivity | null): Array<{ label: string; action: string; techniqueId?: string }> {
    if (!activity) {
      return [];
    }

    const actions = [];
    
    if (activity.type === 'technique') {
      actions.push({ 
        label: `Verder met ${activity.name}`, 
        action: "continue_technique", 
        techniqueId: activity.id 
      });
    }
    
    actions.push({ label: "Iets anders", action: "show_sidebar" });
    
    return actions;
  }
};
