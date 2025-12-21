import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import BackButton from '../../components/BackButton';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { ALL_CROPS } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';

interface CropField {
  id: string;
  cropType: string;
  plantingDate: Date;
  expectedHarvestDate: Date;
  area: number;
  areaUnit: 'acres' | 'hectares';
  status: 'preparation' | 'planted' | 'growing' | 'flowering' | 'ready' | 'harvested';
  notes: string;
  fertilizerApplied: boolean;
  pesticideApplied: boolean;
  irrigationType: 'rainfed' | 'drip' | 'sprinkler' | 'manual';
}

interface FarmData {
  name: string;
  location: string;
  coordinates?: { lat: number; lon: number };
  totalArea: number;
  areaUnit: 'acres' | 'hectares';
  soilType: string;
  waterSource: string[];
  ownership: 'owned' | 'leased' | 'family' | 'communal';
  yearsInOperation: number;
  fields: CropField[];
}

const FarmDetailsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { location, setLocation, setCoordinates } = useApp();
  
  const [editMode, setEditMode] = useState(false);
  const [farmData, setFarmData] = useState<FarmData>({
    name: "My Farm",
    location: location || "Ghana",
    totalArea: 5,
    areaUnit: 'acres',
    soilType: 'loamy',
    waterSource: ['rainfall', 'well'],
    ownership: 'owned',
    yearsInOperation: 5,
    fields: [
      {
        id: '1',
        cropType: 'Maize',
        plantingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        expectedHarvestDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        area: 2,
        areaUnit: 'acres',
        status: 'growing',
        notes: '',
        fertilizerApplied: true,
        pesticideApplied: false,
        irrigationType: 'rainfed',
      },
      {
        id: '2',
        cropType: 'Tomatoes',
        plantingDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        expectedHarvestDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        area: 1,
        areaUnit: 'acres',
        status: 'flowering',
        notes: 'Need to apply pesticide',
        fertilizerApplied: true,
        pesticideApplied: false,
        irrigationType: 'drip',
      },
    ],
  });

  const [newField, setNewField] = useState<Partial<CropField>>({
    cropType: '',
    area: 0,
    areaUnit: 'acres',
    status: 'preparation',
    irrigationType: 'rainfed',
  });

  const [showAddField, setShowAddField] = useState(false);

  const getLocationCoordinates = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      const geocode = await Location.reverseGeocodeAsync({ 
        latitude, 
        longitude 
      });
      
      if (geocode.length > 0) {
        const place = geocode[0];
        const locationName = place.city || place.region || 'Ghana';
        setFarmData(prev => ({
          ...prev,
          location: locationName,
          coordinates: { lat: latitude, lon: longitude },
        }));
        setLocation(locationName);
        setCoordinates({ lat: latitude, lon: longitude });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const addField = () => {
    if (!newField.cropType || !newField.area) {
      Alert.alert('Error', 'Please fill in crop type and area');
      return;
    }

    const field: CropField = {
      id: Date.now().toString(),
      cropType: newField.cropType,
      plantingDate: new Date(),
      expectedHarvestDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      area: newField.area,
      areaUnit: newField.areaUnit || 'acres',
      status: 'preparation',
      notes: '',
      fertilizerApplied: false,
      pesticideApplied: false,
      irrigationType: newField.irrigationType || 'rainfed',
    };

    setFarmData(prev => ({
      ...prev,
      fields: [...prev.fields, field],
    }));

    setNewField({
      cropType: '',
      area: 0,
      areaUnit: 'acres',
      status: 'preparation',
      irrigationType: 'rainfed',
    });
    setShowAddField(false);
  };

  const deleteField = (fieldId: string) => {
    Alert.alert(
      'Delete Field',
      'Are you sure you want to delete this field?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setFarmData(prev => ({
              ...prev,
              fields: prev.fields.filter(f => f.id !== fieldId),
            }));
          },
        },
      ]
    );
  };

  const updateFieldStatus = (fieldId: string, newStatus: CropField['status']) => {
    setFarmData(prev => ({
      ...prev,
      fields: prev.fields.map(f =>
        f.id === fieldId ? { ...f, status: newStatus } : f
      ),
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparation': return '#6c757d';
      case 'planted': return '#17a2b8';
      case 'growing': return '#28a745';
      case 'flowering': return '#ffc107';
      case 'ready': return '#fd7e14';
      case 'harvested': return '#6f42c1';
      default: return '#6c757d';
    }
  };

  const calculateTotalArea = () => {
    return farmData.fields.reduce((sum, field) => sum + field.area, 0);
  };

  const getActiveFields = () => {
    return farmData.fields.filter(f => 
      ['planted', 'growing', 'flowering', 'ready'].includes(f.status)
    ).length;
  };

  const saveFarmData = async () => {
    try {
      // TODO: Save to backend
      Alert.alert('Success', 'Farm details saved successfully');
      setEditMode(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to save farm details');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f7f7f7' }}>
      <BackButton />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 32, paddingBottom: 72 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Farm Overview Card */}
        <Card className="mx-4 mt-4 mb-4">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-textPrimary">
                {farmData.name}
              </Text>
              <View className="flex-row items-center mt-1">
                <Ionicons name="location" size={16} color="#666" />
                <Text className="text-sm text-textSecondary ml-1">
                  {farmData.location}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setEditMode(!editMode)}
              className="p-2 bg-primary/10 rounded-lg"
            >
              <Ionicons 
                name={editMode ? 'checkmark' : 'create'} 
                size={20} 
                color="#006400" 
              />
            </TouchableOpacity>
          </View>

          {/* Farm Stats */}
          <View className="flex-row justify-between p-3 bg-gray-50 rounded-lg">
            <View className="items-center">
              <Text className="text-lg font-bold text-primary">
                {farmData.totalArea}
              </Text>
              <Text className="text-xs text-textMuted">{farmData.areaUnit}</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-success">
                {getActiveFields()}
              </Text>
              <Text className="text-xs text-textMuted">Active Fields</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-info">
                {farmData.fields.length}
              </Text>
              <Text className="text-xs text-textMuted">Total Fields</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold text-warning">
                {farmData.yearsInOperation}
              </Text>
              <Text className="text-xs text-textMuted">Years</Text>
            </View>
          </View>

          {editMode && (
            <View className="mt-4 space-y-3">
              <Input
                label="Farm Name"
                value={farmData.name}
                onChangeText={(text) => setFarmData({ ...farmData, name: text })}
              />
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input
                    label="Total Area"
                    value={farmData.totalArea.toString()}
                    onChangeText={(text) => setFarmData({ 
                      ...farmData, 
                      totalArea: parseFloat(text) || 0 
                    })}
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm text-textSecondary mb-2">Unit</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setFarmData({
                        ...farmData,
                        areaUnit: farmData.areaUnit === 'acres' ? 'hectares' : 'acres'
                      });
                    }}
                    className="border-2 border-borderColor rounded-xl px-4 py-3"
                  >
                    <Text className="text-base">{farmData.areaUnit}</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <TouchableOpacity
                onPress={getLocationCoordinates}
                className="flex-row items-center justify-center bg-primary/10 py-3 rounded-xl"
              >
                <Ionicons name="location" size={20} color="#006400" />
                <Text className="ml-2 text-primary">Update GPS Location</Text>
              </TouchableOpacity>
              
              <Button
                title="Save Changes"
                onPress={saveFarmData}
                icon="checkmark-circle"
                fullWidth
              />
            </View>
          )}
        </Card>

        {/* Field Management */}
        <View className="px-4 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-textPrimary">
              Crop Fields
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddField(true)}
              className="flex-row items-center bg-primary/10 px-3 py-2 rounded-lg"
            >
              <Ionicons name="add-circle" size={20} color="#006400" />
              <Text className="ml-1 text-primary text-sm">Add Field</Text>
            </TouchableOpacity>
          </View>

          {/* Add Field Form */}
          {showAddField && (
            <Card className="mb-4 border-2 border-primary">
              <Text className="font-semibold text-textPrimary mb-3">
                Add New Field
              </Text>
              <View className="space-y-3">
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert(
                      'Select Crop',
                      '',
                      ALL_CROPS.slice(0, 10).map(crop => ({
                        text: crop,
                        onPress: () => setNewField({ ...newField, cropType: crop }),
                      }))
                    );
                  }}
                  className="border-2 border-borderColor rounded-xl px-4 py-3"
                >
                  <Text className={newField.cropType ? 'text-textPrimary' : 'text-textMuted'}>
                    {newField.cropType || 'Select Crop Type'}
                  </Text>
                </TouchableOpacity>
                
                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <Input
                      label="Area Size"
                      value={newField.area?.toString() || ''}
                      onChangeText={(text) => setNewField({ 
                        ...newField, 
                        area: parseFloat(text) || 0 
                      })}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-textSecondary mb-2">Unit</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setNewField({
                          ...newField,
                          areaUnit: newField.areaUnit === 'acres' ? 'hectares' : 'acres'
                        });
                      }}
                      className="border-2 border-borderColor rounded-xl px-4 py-3"
                    >
                      <Text className="text-base">{newField.areaUnit || 'acres'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View className="flex-row gap-3">
                  <Button
                    title="Cancel"
                    onPress={() => setShowAddField(false)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  />
                  <Button
                    title="Add Field"
                    onPress={addField}
                    size="sm"
                    className="flex-1"
                  />
                </View>
              </View>
            </Card>
          )}

          {/* Fields List */}
          {farmData.fields.map((field) => (
            <Card key={field.id} className="mb-3">
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="font-semibold text-lg text-textPrimary">
                    {field.cropType}
                  </Text>
                  <Text className="text-sm text-textSecondary">
                    {field.area} {field.areaUnit}
                  </Text>
                </View>
                <View 
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: getStatusColor(field.status) + '20' }}
                >
                  <Text 
                    className="text-xs font-medium capitalize"
                    style={{ color: getStatusColor(field.status) }}
                  >
                    {field.status}
                  </Text>
                </View>
              </View>

              {/* Field Details */}
              <View className="space-y-2 mb-3">
                <View className="flex-row justify-between">
                  <Text className="text-xs text-textMuted">Planted:</Text>
                  <Text className="text-xs text-textSecondary">
                    {formatDate(field.plantingDate)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-textMuted">Expected Harvest:</Text>
                  <Text className="text-xs text-textSecondary">
                    {formatDate(field.expectedHarvestDate)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-textMuted">Irrigation:</Text>
                  <Text className="text-xs text-textSecondary capitalize">
                    {field.irrigationType}
                  </Text>
                </View>
              </View>

              {/* Field Status Indicators */}
              <View className="flex-row gap-2 mb-3">
                <View className={`flex-row items-center px-2 py-1 rounded-full ${
                  field.fertilizerApplied ? 'bg-success/10' : 'bg-gray-100'
                }`}>
                  <Ionicons 
                    name={field.fertilizerApplied ? 'checkmark-circle' : 'close-circle'} 
                    size={14} 
                    color={field.fertilizerApplied ? '#28a745' : '#999'} 
                  />
                  <Text className={`text-xs ml-1 ${
                    field.fertilizerApplied ? 'text-success' : 'text-textMuted'
                  }`}>
                    Fertilizer
                  </Text>
                </View>
                
                <View className={`flex-row items-center px-2 py-1 rounded-full ${
                  field.pesticideApplied ? 'bg-success/10' : 'bg-gray-100'
                }`}>
                  <Ionicons 
                    name={field.pesticideApplied ? 'checkmark-circle' : 'close-circle'} 
                    size={14} 
                    color={field.pesticideApplied ? '#28a745' : '#999'} 
                  />
                  <Text className={`text-xs ml-1 ${
                    field.pesticideApplied ? 'text-success' : 'text-textMuted'
                  }`}>
                    Pesticide
                  </Text>
                </View>
              </View>

              {field.notes && (
                <View className="bg-warning/10 p-2 rounded-lg mb-3">
                  <Text className="text-xs text-warning">📝 {field.notes}</Text>
                </View>
              )}

              {/* Field Actions */}
              <View className="flex-row gap-2 pt-3 border-t border-borderColor">
                <TouchableOpacity
                  onPress={() => navigation.navigate('CropMonitoring' as any, { fieldId: field.id })}
                  className="flex-1 py-2 bg-primary/10 rounded-lg"
                >
                  <Text className="text-xs text-primary text-center">Monitor</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => {
                    const statuses: CropField['status'][] = [
                      'preparation', 'planted', 'growing', 'flowering', 'ready', 'harvested'
                    ];
                    const currentIndex = statuses.indexOf(field.status);
                    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                    updateFieldStatus(field.id, nextStatus);
                  }}
                  className="flex-1 py-2 bg-info/10 rounded-lg"
                >
                  <Text className="text-xs text-info text-center">Update Status</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => deleteField(field.id)}
                  className="flex-1 py-2 bg-error/10 rounded-lg"
                >
                  <Text className="text-xs text-error text-center">Delete</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>

        {/* Farm Information */}
        <Card className="mx-4 mb-8">
          <Text className="font-semibold text-textPrimary mb-3">
            Farm Information
          </Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-textMuted">Soil Type:</Text>
              <Text className="text-sm text-textSecondary capitalize">{farmData.soilType}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-textMuted">Water Source:</Text>
              <Text className="text-sm text-textSecondary">
                {farmData.waterSource.join(', ')}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-textMuted">Ownership:</Text>
              <Text className="text-sm text-textSecondary capitalize">{farmData.ownership}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-textMuted">Active Area:</Text>
              <Text className="text-sm font-medium text-primary">
                {calculateTotalArea()} {farmData.areaUnit} in use
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FarmDetailsScreen;
