// utils/imageAnalysis.ts
import * as FileSystem from 'expo-file-system';

export interface ImageAnalysisResult {
  success: boolean;
  analysis?: {
    disease?: string;
    pest?: string;
    health_status?: string;
    confidence?: number;
    recommendations?: string[];
    description?: string;
  };
  error?: string;
}

// Backend API endpoint for image analysis
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

export const analyzeImage = async (imageUri: string): Promise<ImageAnalysisResult> => {
  try {
    // Read image as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });

    // Send to backend API
    const response = await fetch(`${API_URL}/api/analyze-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64,
        analysis_type: 'crop_health', // or 'pest_detection', 'disease_detection'
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      analysis: {
        disease: data.disease,
        pest: data.pest,
        health_status: data.health_status || 'Unknown',
        confidence: data.confidence || 0,
        recommendations: data.recommendations || [],
        description: data.description || 'No analysis available',
      },
    };
  } catch (error: any) {
    console.error('Image analysis error:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze image',
    };
  }
};

// Analyze crop disease
export const analyzeCropDisease = async (imageUri: string): Promise<ImageAnalysisResult> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });

    const response = await fetch(`${API_URL}/api/detect-disease`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      analysis: {
        disease: data.disease_name,
        confidence: data.confidence,
        recommendations: data.treatment_recommendations || [],
        description: data.description,
      },
    };
  } catch (error: any) {
    console.error('Disease detection error:', error);
    return {
      success: false,
      error: error.message || 'Failed to detect disease',
    };
  }
};

// Analyze pest
export const analyzePest = async (imageUri: string): Promise<ImageAnalysisResult> => {
  try {
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64',
    });

    const response = await fetch(`${API_URL}/api/detect-pest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      analysis: {
        pest: data.pest_name,
        confidence: data.confidence,
        recommendations: data.control_measures || [],
        description: data.description,
      },
    };
  } catch (error: any) {
    console.error('Pest detection error:', error);
    return {
      success: false,
      error: error.message || 'Failed to detect pest',
    };
  }
};
