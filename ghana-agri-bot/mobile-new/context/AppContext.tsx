//AppContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppContextType {
  language: string;
  setLanguage: (lang: string) => Promise<void>;
  selectedCrops: string[];
  setSelectedCrops: (crops: string[]) => void;
  location: string;
  setLocation: (location: string) => void;
  coordinates: { lat: number; lon: number } | null;
  setCoordinates: (coords: { lat: number; lon: number } | null) => void;
  chatHistory: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChatHistory: () => void;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  saved?: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState('en');
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['Maize']);
  const [location, setLocation] = useState('Ghana');
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Load saved preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const [savedLang, savedCrops, savedLocation, savedHistory] = await Promise.all([
        AsyncStorage.getItem('language'),
        AsyncStorage.getItem('selectedCrops'),
        AsyncStorage.getItem('location'),
        AsyncStorage.getItem('chatHistory'),
      ]);

      if (savedLang) setLanguageState(savedLang);
      if (savedCrops) setSelectedCrops(JSON.parse(savedCrops));
      if (savedLocation) setLocation(savedLocation);
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        setChatHistory(history.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })));
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const setLanguage = async (lang: string) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem('language', lang);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  };

  const addChatMessage = (message: ChatMessage) => {
    setChatHistory(prev => {
      const updated = [...prev, message];
      // Keep only last 50 messages
      const trimmed = updated.slice(-50);
      // Save to AsyncStorage
      AsyncStorage.setItem('chatHistory', JSON.stringify(trimmed)).catch(console.error);
      return trimmed;
    });
  };

  const clearChatHistory = () => {
    setChatHistory([]);
    AsyncStorage.removeItem('chatHistory').catch(console.error);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        selectedCrops,
        setSelectedCrops,
        location,
        setLocation,
        coordinates,
        setCoordinates,
        chatHistory,
        addChatMessage,
        clearChatHistory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};