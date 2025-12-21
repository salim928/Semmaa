// utils/speechToText.ts
import * as Speech from 'expo-speech';

export interface VoiceRecognitionResult {
  success: boolean;
  text?: string;
  error?: string;
}

// Expo doesn't have built-in STT, so we'll use Web Speech API on web
// and recommend expo-speech-recognition for native apps
export const convertSpeechToText = async (audioUri: string): Promise<VoiceRecognitionResult> => {
  try {
    // For MVP, we'll return a placeholder
    // In production, integrate with:
    // - Google Cloud Speech-to-Text API
    // - Azure Speech Service
    // - AWS Transcribe
    // - expo-speech-recognition (community package)
    
    return {
      success: false,
      error: 'Speech-to-text service not configured. Please add API keys for Google/Azure/AWS speech services.',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to convert speech to text',
    };
  }
};

// Text-to-speech (already available via expo-speech)
export const speakText = async (text: string, language: string = 'en') => {
  try {
    await Speech.speak(text, {
      language,
      pitch: 1.0,
      rate: 0.9,
    });
  } catch (error) {
    console.error('Text-to-speech error:', error);
  }
};

export const stopSpeaking = () => {
  Speech.stop();
};

// Placeholder for when STT is configured
export const isSTTConfigured = (): boolean => {
  // Check if API keys are set in environment
  // For now, return false
  return false;
};
