import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { apiService } from '../../config/api';
import { useApp } from '../../context/AppContext';

interface DetectionResult {
  disease: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  crop: string;
  symptoms: string[];
  treatment: string[];
  prevention: string[];
  organicTreatment?: string[];
  estimatedYieldLoss?: string;
  affectedArea?: string;
}

const DiseaseDetectionScreen = () => {
  const navigation = useNavigation();
  const { selectedCrops, location } = useApp();
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [recentDetections, setRecentDetections] = useState<DetectionResult[]>([]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Needed', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select or take a photo first');
      return;
    }

    setAnalyzing(true);
    try {
      // Convert image to base64 for API
      const base64 = await FileSystem.readAsStringAsync(selectedImage, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await apiService.detectDisease({
        image: base64,
        crop: selectedCrops[0],
        location,
      });

      const detection: DetectionResult = {
        disease: response.disease,
        confidence: response.confidence,
        severity: response.severity as DetectionResult['severity'],
        crop: response.crop,
        symptoms: response.symptoms,
        treatment: response.treatment,
        prevention: response.prevention,
        organicTreatment: response.organicTreatment,
        estimatedYieldLoss: response.estimatedYieldLoss,
        affectedArea: response.affectedArea,
      };

      setResult(detection);
      setRecentDetections(prev => [detection, ...prev.slice(0, 4)]);
    } catch (error) {
      Alert.alert('Analysis Failed', 'Could not analyze the image. Please check your connection and try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const saveToAdvice = () => {
    if (!result) return;
    
    // Save the detection result as advice
    const advice = `
Disease Detected: ${result.disease}
Crop: ${result.crop}
Severity: ${result.severity.toUpperCase()}

Treatment:
${result.treatment.map(t => `• ${t}`).join('\n')}

Prevention:
${result.prevention.map(p => `• ${p}`).join('\n')}
    `.trim();

    // TODO: Save to saved advice
    Alert.alert('Saved', 'Detection results saved to your advice library');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return '#28a745';
      case 'medium': return '#ffc107';
      case 'high': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="bg-primary px-4 py-4">
        <Text className="text-white text-lg font-semibold">
          Crop Disease Detection
        </Text>
        <Text className="text-white/80 text-sm">
          AI-powered disease identification from photos
        </Text>
      </View>

      <View className="px-4 py-4">
        {/* Image Selection */}
        {!selectedImage ? (
          <Card className="mb-4">
            <Text className="text-center text-textSecondary mb-4">
              Take or select a photo of the affected crop
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={takePhoto}
                className="flex-1 bg-primary/10 py-8 rounded-xl items-center"
              >
                <Ionicons name="camera" size={48} color="#006400" />
                <Text className="text-primary mt-2">Take Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={pickImage}
                className="flex-1 bg-secondary/10 py-8 rounded-xl items-center"
              >
                <Ionicons name="image" size={48} color="#8b4513" />
                <Text className="text-secondary mt-2">Choose Photo</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ) : (
          <Card className="mb-4">
            <View className="relative">
              <Image
                source={{ uri: selectedImage }}
                className="w-full h-64 rounded-lg"
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => {
                  setSelectedImage(null);
                  setResult(null);
                }}
                className="absolute top-2 right-2 bg-black/50 rounded-full p-2"
              >
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {!result && (
              <Button
                title={analyzing ? 'Analyzing...' : 'Analyze Image'}
                onPress={analyzeImage}
                loading={analyzing}
                disabled={analyzing}
                icon="scan"
                fullWidth
                className="mt-4"
              />
            )}
          </Card>
        )}

        {/* Analysis Result */}
        {result && (
          <Card className="mb-4">
            {/* Disease Header */}
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1">
                <Text className="text-xl font-bold text-textPrimary">
                  {result.disease}
                </Text>
                <Text className="text-sm text-textSecondary">
                  Detected in {result.crop}
                </Text>
              </View>
              <View className="items-end">
                <View 
                  className="px-3 py-1 rounded-full mb-1"
                  style={{ backgroundColor: getSeverityColor(result.severity) + '20' }}
                >
                  <Text 
                    className="text-sm font-medium"
                    style={{ color: getSeverityColor(result.severity) }}
                  >
                    {result.severity.toUpperCase()} SEVERITY
                  </Text>
                </View>
                <Text className="text-xs text-textMuted">
                  {(result.confidence * 100).toFixed(0)}% confidence
                </Text>
              </View>
            </View>

            {/* Impact Assessment */}
            {(result.estimatedYieldLoss || result.affectedArea) && (
              <View className="bg-error/10 p-3 rounded-lg mb-4">
                <View className="flex-row items-start">
                  <Ionicons name="warning" size={20} color="#dc3545" />
                  <View className="ml-2 flex-1">
                    {result.estimatedYieldLoss && (
                      <Text className="text-sm text-error font-medium">
                        Potential yield loss: {result.estimatedYieldLoss}
                      </Text>
                    )}
                    {result.affectedArea && (
                      <Text className="text-xs text-error mt-1">
                        Affected area: {result.affectedArea}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Symptoms */}
            <View className="mb-4">
              <Text className="font-semibold text-textPrimary mb-2">
                Symptoms Identified
              </Text>
              {result.symptoms.map((symptom, index) => (
                <View key={index} className="flex-row items-start mb-1">
                  <Text className="text-primary mr-2">•</Text>
                  <Text className="text-sm text-textSecondary flex-1">
                    {symptom}
                  </Text>
                </View>
              ))}
            </View>

            {/* Treatment */}
            <View className="mb-4">
              <Text className="font-semibold text-textPrimary mb-2">
                Immediate Treatment
              </Text>
              {result.treatment.map((treatment, index) => (
                <View key={index} className="flex-row items-start mb-2">
                  <View className="w-6 h-6 bg-success/20 rounded-full justify-center items-center mr-2">
                    <Text className="text-xs text-success font-bold">
                      {index + 1}
                    </Text>
                  </View>
                  <Text className="text-sm text-textSecondary flex-1">
                    {treatment}
                  </Text>
                </View>
              ))}
            </View>

            {/* Organic Treatment Option */}
            {result.organicTreatment && (
              <View className="mb-4 bg-green-50 p-3 rounded-lg">
                <View className="flex-row items-center mb-2">
                  <Ionicons name="leaf" size={16} color="#006400" />
                  <Text className="font-semibold text-primary ml-1">
                    Organic Alternatives
                  </Text>
                </View>
                {result.organicTreatment.map((treatment, index) => (
                  <View key={index} className="flex-row items-start mb-1">
                    <Text className="text-primary mr-2">•</Text>
                    <Text className="text-sm text-textSecondary flex-1">
                      {treatment}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Prevention */}
            <View className="mb-4">
              <Text className="font-semibold text-textPrimary mb-2">
                Prevention Measures
              </Text>
              {result.prevention.map((measure, index) => (
                <View key={index} className="flex-row items-start mb-1">
                  <Ionicons name="shield-checkmark" size={14} color="#17a2b8" />
                  <Text className="text-sm text-textSecondary ml-2 flex-1">
                    {measure}
                  </Text>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <Button
                title="Get More Advice"
                onPress={() => navigation.navigate('ChatScreen' as any)}
                variant="outline"
                size="sm"
                className="flex-1"
              />
              <Button
                title="Save Results"
                onPress={saveToAdvice}
                variant="primary"
                size="sm"
                icon="bookmark"
                className="flex-1"
              />
            </View>
          </Card>
        )}

        {/* Tips */}
        <Card className="mb-4 bg-info/5 border-l-4 border-info">
          <View className="flex-row items-start">
            <Ionicons name="bulb" size={20} color="#17a2b8" />
            <View className="ml-2 flex-1">
              <Text className="font-semibold text-textPrimary mb-1">
                Tips for Better Detection
              </Text>
              <Text className="text-xs text-textSecondary">
                • Take photos in good lighting{'\n'}
                • Focus on affected areas clearly{'\n'}
                • Include both damaged and healthy parts{'\n'}
                • Take multiple angles if possible
              </Text>
            </View>
          </View>
        </Card>

        {/* Recent Detections */}
        {recentDetections.length > 0 && (
          <View className="mb-4">
            <Text className="text-lg font-semibold text-textPrimary mb-3">
              Recent Detections
            </Text>
            {recentDetections.map((detection, index) => (
              <TouchableOpacity
                key={index}
                className="bg-white rounded-lg p-3 mb-2 flex-row items-center"
              >
                <View 
                  className="w-10 h-10 rounded-full justify-center items-center mr-3"
                  style={{ backgroundColor: getSeverityColor(detection.severity) + '20' }}
                >
                  <Ionicons name="bug" size={20} color={getSeverityColor(detection.severity)} />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-textPrimary">
                    {detection.disease}
                  </Text>
                  <Text className="text-xs text-textSecondary">
                    {detection.crop} • {detection.severity} severity
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default DiseaseDetectionScreen;
