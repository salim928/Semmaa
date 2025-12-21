// User Types
export interface User {
  id?: string;
  phone: string;
  name: string;
  location?: string;
  crops?: string[];
  language?: string;
  farmSize?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Chat Types
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
  saved?: boolean;
  metadata?: {
    confidence?: number;
    sources?: string[];
    imageUrl?: string;
    audioUrl?: string;
  };
}

// Market Types
export interface Product {
  id: string;
  name: string;
  price: string;
  unit: string;
  quantity?: number;
  seller: string;
  sellerId?: string;
  location: string;
  distance?: string;
  image?: string;
  category: 'produce' | 'inputs' | 'tools';
  quality?: 'Grade A' | 'Grade B' | 'Grade C';
  harvestDate?: Date;
  availableQuantity?: number;
  minimumOrder?: number;
  description?: string;
  rating?: number;
  reviews?: number;
}

export interface MarketPrice {
  crop: string;
  city: string;
  price: string;
  unit: string;
  date: string;
  trend?: 'up' | 'down' | 'stable';
  percentageChange?: number;
}

// Weather Types
export interface Weather {
  current: {
    temperature: number;
    description: string;
    humidity?: number;
    windSpeed?: number;
    pressure?: number;
  };
  forecast: WeatherDay[];
  alerts?: WeatherAlert[];
}

export interface WeatherDay {
  day: string;
  date?: Date;
  tempHigh: number;
  tempLow: number;
  condition: string;
  icon: string;
  rainProbability?: number;
}

export interface WeatherAlert {
  type: 'rain' | 'drought' | 'storm' | 'heat' | 'cold';
  severity: 'low' | 'medium' | 'high';
  message: string;
  startDate?: Date;
  endDate?: Date;
}

// Wallet/Finance Types
export interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'transfer';
  amount: number;
  currency: 'GHS' | 'USD';
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
  category?: 'sale' | 'purchase' | 'loan' | 'transfer' | 'other';
  relatedId?: string; // Product ID or User ID
}

export interface Wallet {
  balance: number;
  currency: 'GHS' | 'USD';
  transactions: Transaction[];
  creditLimit?: number;
  loanEligible?: boolean;
}

// Advisory Types
export interface AdvisoryQuery {
  question: string;
  location?: string;
  crop?: string;
  context?: {
    season?: string;
    farmSize?: string;
    soilType?: string;
    irrigationType?: string;
  };
}

export interface AdvisoryResponse {
  answer: string;
  confidence: number;
  sources?: string[];
  relatedTopics?: string[];
  followUpQuestions?: string[];
  duration_ms?: number;
  kb_hits?: number;
}

// Farm Types
export interface Farm {
  id: string;
  name: string;
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lon: number;
    };
  };
  size: number;
  sizeUnit: 'acres' | 'hectares';
  crops: CropField[];
  soilType?: string;
  irrigationType?: string;
}

export interface CropField {
  id: string;
  cropType: string;
  plantingDate: Date;
  expectedHarvestDate: Date;
  area: number;
  areaUnit: 'acres' | 'hectares';
  status: 'planted' | 'growing' | 'flowering' | 'ready' | 'harvested';
  healthStatus?: 'healthy' | 'warning' | 'critical';
  lastInspection?: Date;
  notes?: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'alert' | 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// Settings Types
export interface AppSettings {
  language: 'en' | 'tw' | 'ga' | 'ee';
  notifications: {
    push: boolean;
    sms: boolean;
    email: boolean;
    marketAlerts: boolean;
    weatherAlerts: boolean;
    advisoryTips: boolean;
  };
  units: {
    temperature: 'celsius' | 'fahrenheit';
    distance: 'km' | 'miles';
    area: 'acres' | 'hectares';
  };
  privacy: {
    shareLocation: boolean;
    shareData: boolean;
    analytics: boolean;
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    timestamp: Date;
    version: string;
  };
}

// Crop Information Types
export interface CropInfo {
  name: string;
  scientificName?: string;
  category: 'cereal' | 'legume' | 'vegetable' | 'fruit' | 'tuber' | 'cash';
  growthCycle: number; // days
  optimalTemperature: {
    min: number;
    max: number;
  };
  waterRequirement: 'low' | 'medium' | 'high';
  soilType: string[];
  commonDiseases: Disease[];
  commonPests: Pest[];
}

export interface Disease {
  name: string;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface Pest {
  name: string;
  identification: string[];
  damage: string[];
  control: string[];
  severity: 'low' | 'medium' | 'high';
}

// Language Types
export interface Translation {
  en: string;
  tw?: string;
  ga?: string;
  ee?: string;
}

export interface LocalizedContent {
  key: string;
  translations: Translation;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
}