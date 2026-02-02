/**
 * Speech Humanizer Service
 * 
 * Post-processor that transforms clean AI text into more natural-sounding speech
 * for audio/video modes. Adds pauses, hesitations, breathing marks, and SSML tags.
 * 
 * NOTE: This is ONLY used for audio/video output, not chat mode.
 * 
 * Features:
 * - Natural pauses at punctuation
 * - Strategic hesitations ("euh", "hmm", "nou")
 * - Breathing marks between longer sentences
 * - SSML tags for ElevenLabs TTS
 * - Emphasis on key coaching phrases
 */

// Configuration for humanization intensity
interface HumanizerConfig {
  // Probability of adding hesitation (0-1)
  hesitationRate: number;
  // Minimum sentence length before adding breathing
  breathingThreshold: number;
  // Enable SSML output (for ElevenLabs)
  useSSML: boolean;
  // Language for hesitation words
  language: 'nl' | 'en';
}

const DEFAULT_CONFIG: HumanizerConfig = {
  hesitationRate: 0.15, // 15% chance per sentence
  breathingThreshold: 80, // characters
  useSSML: true,
  language: 'nl'
};

// Dutch hesitation/filler words for natural speech
const DUTCH_HESITATIONS = [
  'euh',
  'uhm',
  'nou',
  'even kijken',
  'laat me even denken',
  'hmm',
];

// English equivalents
const ENGLISH_HESITATIONS = [
  'uh',
  'um',
  'well',
  'let me think',
  'hmm',
];

// Pause durations in milliseconds
const PAUSE_DURATIONS = {
  comma: 200,      // Short pause after comma
  period: 400,     // Medium pause after period
  question: 500,   // Slightly longer after question
  exclamation: 400,
  colon: 300,
  semicolon: 300,
  breathing: 600,  // Natural breathing pause
  hesitation: 300, // Before hesitation word
};

// Key phrases that should be emphasized
const EMPHASIS_PHRASES = [
  'heel belangrijk',
  'let op',
  'cruciaal',
  'de sleutel is',
  'onthoud',
  'het belangrijkste',
  'de kern is',
  'essentieel',
];

/**
 * Main humanizer function - transforms clean text to natural speech
 */
export function humanizeSpeech(
  text: string, 
  config: Partial<HumanizerConfig> = {}
): string {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  if (!text || text.trim().length === 0) {
    return text;
  }
  
  let result = text;
  
  // Step 1: Add strategic hesitations
  result = addHesitations(result, cfg);
  
  // Step 2: Add breathing marks for long sentences
  result = addBreathingMarks(result, cfg);
  
  // Step 3: Add emphasis on key phrases
  result = addEmphasis(result, cfg);
  
  // Step 4: Convert to SSML if enabled
  if (cfg.useSSML) {
    result = convertToSSML(result, cfg);
  }
  
  return result;
}

/**
 * Add hesitation words at natural points
 */
function addHesitations(text: string, cfg: HumanizerConfig): string {
  const hesitations = cfg.language === 'nl' ? DUTCH_HESITATIONS : ENGLISH_HESITATIONS;
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  return sentences.map((sentence, index) => {
    // Skip first sentence and very short sentences
    if (index === 0 || sentence.length < 30) {
      return sentence;
    }
    
    // Random chance to add hesitation
    if (Math.random() < cfg.hesitationRate) {
      const hesitation = hesitations[Math.floor(Math.random() * hesitations.length)];
      // Add hesitation at the start of the sentence
      return `${hesitation}... ${sentence}`;
    }
    
    return sentence;
  }).join(' ');
}

/**
 * Add breathing marks (represented as longer pauses) for long sentences
 */
function addBreathingMarks(text: string, cfg: HumanizerConfig): string {
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  return sentences.map(sentence => {
    if (sentence.length > cfg.breathingThreshold) {
      // Find a natural breaking point (comma, 'en', 'maar', 'of')
      const breakPoints = [', ', ' en ', ' maar ', ' of ', ' want '];
      
      for (const bp of breakPoints) {
        const idx = sentence.indexOf(bp);
        if (idx > 20 && idx < sentence.length - 20) {
          // Insert breathing marker
          return sentence.slice(0, idx + bp.length) + '[breath] ' + sentence.slice(idx + bp.length);
        }
      }
    }
    return sentence;
  }).join(' ');
}

/**
 * Add emphasis markers on key coaching phrases
 */
function addEmphasis(text: string, cfg: HumanizerConfig): string {
  let result = text;
  
  for (const phrase of EMPHASIS_PHRASES) {
    const regex = new RegExp(`(${phrase})`, 'gi');
    result = result.replace(regex, '[emphasis]$1[/emphasis]');
  }
  
  return result;
}

/**
 * Convert marked-up text to ElevenLabs SSML format
 */
function convertToSSML(text: string, cfg: HumanizerConfig): string {
  let result = text;
  
  // Replace breathing markers with SSML breaks
  result = result.replace(/\[breath\]\s*/g, `<break time="${PAUSE_DURATIONS.breathing}ms"/>`);
  
  // Replace emphasis markers with SSML emphasis
  result = result.replace(/\[emphasis\]/g, '<emphasis level="strong">');
  result = result.replace(/\[\/emphasis\]/g, '</emphasis>');
  
  // Add natural pauses after punctuation (not already handled by TTS)
  // Most TTS engines handle basic punctuation, but we can enhance key pauses
  
  // Wrap in speak tags for full SSML
  result = `<speak>${result}</speak>`;
  
  return result;
}

/**
 * Light humanization - just adds natural pauses, no hesitations
 * Good for more formal/professional contexts
 */
export function humanizeSpeechLight(text: string): string {
  return humanizeSpeech(text, {
    hesitationRate: 0,
    useSSML: true
  });
}

/**
 * Heavy humanization - more hesitations and breathing
 * Good for casual coaching conversations
 */
export function humanizeSpeechNatural(text: string): string {
  return humanizeSpeech(text, {
    hesitationRate: 0.25,
    breathingThreshold: 60,
    useSSML: true
  });
}

/**
 * Plain text humanization - no SSML, just text modifications
 * For TTS engines that don't support SSML or when SSML gets stripped (e.g., LiveKit)
 * 
 * Uses:
 * - Ellipsis "..." for pauses (ElevenLabs interprets as hesitation)
 * - Em-dash "—" for longer pauses
 * - Natural Dutch filler words
 */
export function humanizeSpeechPlainText(text: string): string {
  let result = humanizeSpeech(text, {
    hesitationRate: 0.12, // Slightly lower for natural feel
    useSSML: false
  });
  
  // Convert markers to natural text pauses
  result = result.replace(/\[breath\]\s*/g, '... ');
  result = result.replace(/\[emphasis\]/g, '');
  result = result.replace(/\[\/emphasis\]/g, '');
  
  // Add subtle pauses at strategic points using em-dash
  // This makes the speech feel more thoughtful
  result = result.replace(/\. ([A-Z])/g, (match, letter) => {
    // Random chance to add a longer pause between sentences
    if (Math.random() < 0.1) {
      return `. — ${letter}`;
    }
    return match;
  });
  
  return result;
}

/**
 * Check if ElevenLabs supports SSML for the given model
 * Note: Not all ElevenLabs models support full SSML
 */
export function supportsSSML(model: string): boolean {
  // ElevenLabs Turbo v2 and v2.5 have limited SSML support
  // Multilingual v2 has better SSML support
  const ssmlSupportedModels = [
    'eleven_multilingual_v2',
    'eleven_monolingual_v1',
  ];
  
  return ssmlSupportedModels.includes(model);
}

/**
 * Get appropriate humanizer for the TTS model
 */
export function getHumanizerForModel(model: string): (text: string) => string {
  if (supportsSSML(model)) {
    return humanizeSpeech;
  }
  return humanizeSpeechPlainText;
}
