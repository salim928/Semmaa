// app/marketplace/EditProductScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { apiService } from '../../config/api';
import { MARKET_UNITS } from '../../utils/constants';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface ProductData {
  id: string;
  name: string;
  category: 'produce' | 'inputs' | 'tools';
  price: string;
  unit: string;
  quantity: string;
  minimumOrder: string;
  description: string;
  harvestDate: string;
  quality: 'Grade A' | 'Grade B' | 'Grade C';
  deliveryAvailable: boolean;
  images: string[];
  status: 'active' | 'paused' | 'sold_out';
  location: string;
}

const EMPTY_PRODUCT: ProductData = {
  id: '',
  name: '',
  category: 'produce',
  price: '',
  unit: 'kg', // Changed to hardcoded default
  quantity: '',
  minimumOrder: '',
  description: '',
  harvestDate: '',
  quality: 'Grade A',
  deliveryAvailable: false,
  images: [],
  status: 'active',
  location: '',
};

// Hardcoded units if MARKET_UNITS is not available
const UNITS = ['kg', 'lb', 'bag', 'piece', 'dozen', 'crate', 'bundle'];

export default function EditProductScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const listingId = params.listingId as string | undefined;

  const isEditMode = !!listingId;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<ProductData>(EMPTY_PRODUCT);
  const [images, setImages] = useState<string[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);

  useEffect(() => {
    if (isEditMode && !listingId) {
      Alert.alert('Error', 'No product ID provided');
      router.back();
    }
  }, [isEditMode, listingId, router]);

  useEffect(() => {
    if (isEditMode && listingId) {
      loadProduct();
    }
  }, [isEditMode, listingId]);

  const loadProduct = async () => {
    if (!listingId) return;
    
    try {
      setLoading(true);
      const response = await apiService.getProduct(listingId);
      if (!response) {
        throw new Error('Product not found');
      }
      setProduct(response);
      setImages(response.images || []);
    } catch (error) {
      console.error('Load product error:', error);
      Alert.alert('Error', 'Failed to load product details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('Limit Reached', 'Maximum 5 images allowed');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setImages([...images, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    if (imageToRemove && !imageToRemove.startsWith('file://')) {
      setDeletedImages([...deletedImages, imageToRemove]);
    }
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    // Validation
    if (!product.name.trim()) {
      Alert.alert('Error', 'Product name is required');
      return;
    }
    if (!product.price || parseFloat(product.price) <= 0) {
      Alert.alert('Error', 'Valid price is required');
      return;
    }
    
    setSaving(true);
    try {
      const productData = {
        ...product,
        images,
        ...(isEditMode ? { deletedImages } : {}),
      };

      if (isEditMode && listingId) {
        await apiService.updateProduct(listingId, productData);
        Alert.alert('Success', 'Product updated successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        await apiService.createProduct(productData);
        Alert.alert('Success', 'Product posted successfully', [
          { text: 'OK', onPress: () => router.push('/marketplace/MyListings') }
        ]);
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', isEditMode ? 'Failed to update product' : 'Failed to post product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!listingId) return;

    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setSaving(true);
              await apiService.deleteProduct(listingId);
              Alert.alert('Success', 'Product deleted', [
                { text: 'OK', onPress: () => router.push('/marketplace/MyListings') }
              ]);
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Failed to delete product');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const toggleStatus = () => {
    if (!product) return;
    const newStatus = product.status === 'active' ? 'paused' : 'active';
    setProduct({ ...product, status: newStatus });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10b981" />
        <Text style={styles.loadingText}>
          {isEditMode ? 'Loading product...' : 'Preparing form...'}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status Bar (only for edit mode) */}
        {isEditMode && (
          <View style={[
            styles.statusBar,
            product.status === 'active'
              ? styles.statusActive
              : product.status === 'paused'
              ? styles.statusPaused
              : styles.statusError
          ]}>
            <View style={styles.statusRow}>
              <View style={styles.statusDotRow}>
                <View style={[
                  styles.statusDot,
                  product.status === 'active'
                    ? styles.dotActive
                    : product.status === 'paused'
                    ? styles.dotPaused
                    : styles.dotError
                ]} />
                <Text style={styles.statusText}>
                  Status: {product.status.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity
                onPress={toggleStatus}
                style={styles.statusButton}
              >
                <Text style={styles.statusButtonText}>
                  {product.status === 'active' ? 'Pause' : 'Activate'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.content}>
          {/* Product Images */}
          <View style={styles.imageSection}>
            <Text style={styles.sectionLabel}>PRODUCT IMAGES</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {images.map((uri, index) => (
                <View key={`img-${index}`} style={styles.imageContainer}>
                  <Image
                    source={{ uri }}
                    style={styles.productImage}
                  />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    style={styles.removeImageButton}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity
                  onPress={pickImage}
                  style={styles.addImageButton}
                >
                  <Ionicons name="add-circle" size={32} color="#10b981" />
                  <Text style={styles.addImageText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          {/* Product Name */}
          <Input
            label="Product Name"
            value={product.name}
            onChangeText={(text) => setProduct({ ...product, name: text })}
            required
          />

          {/* Price and Unit */}
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Input
                label="Price (GHS)"
                value={product.price}
                onChangeText={(text) => setProduct({ ...product, price: text })}
                keyboardType="decimal-pad"
                icon="cash"
                required
              />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.unitLabel}>Unit</Text>
              <TouchableOpacity
                onPress={() => {
                  const units = MARKET_UNITS || UNITS;
                  Alert.alert(
                    'Select Unit',
                    '',
                    units.map(unit => ({
                      text: unit,
                      onPress: () => setProduct({ ...product, unit }),
                    }))
                  );
                }}
                style={styles.unitPicker}
              >
                <Text style={styles.unitPickerText}>{product.unit}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quantity and Minimum Order */}
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Input
                label="Available Quantity"
                value={product.quantity}
                onChangeText={(text) => setProduct({ ...product, quantity: text })}
                keyboardType="numeric"
                required
              />
            </View>
            <View style={styles.flex1}>
              <Input
                label="Minimum Order"
                value={product.minimumOrder}
                onChangeText={(text) => setProduct({ ...product, minimumOrder: text })}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Description */}
          <Input
            label="Description"
            value={product.description}
            onChangeText={(text) => setProduct({ ...product, description: text })}
            multiline
            numberOfLines={4}
            inputStyle={{ height: 96, textAlignVertical: 'top' }}
          />

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <Button
              title={isEditMode ? "Save Changes" : "Post Product"}
              onPress={handleSave}
              loading={saving}
              disabled={saving}
              icon={isEditMode ? "checkmark-circle" : "add-circle"}
              fullWidth
            />

            {isEditMode && (
              <Button
                title="Delete Product"
                onPress={handleDelete}
                variant="danger"
                disabled={saving}
                icon="trash"
                fullWidth
                style={{ marginTop: 12 }}
              />
            )}
          </View>

          {/* Analytics (only for edit mode) */}
          {isEditMode && (
            <View style={styles.analyticsCard}>
              <Text style={styles.analyticsTitle}>
                Product Performance
              </Text>
              <View style={styles.analyticsContent}>
                <View style={styles.analyticsRow}>
                  <Text style={styles.analyticsLabel}>Total Views</Text>
                  <Text style={styles.analyticsValue}>234</Text>
                </View>
                <View style={styles.analyticsRow}>
                  <Text style={styles.analyticsLabel}>Inquiries</Text>
                  <Text style={styles.analyticsValue}>12</Text>
                </View>
                <View style={styles.analyticsRow}>
                  <Text style={styles.analyticsLabel}>Units Sold</Text>
                  <Text style={styles.analyticsValue}>35</Text>
                </View>
                <View style={styles.analyticsRow}>
                  <Text style={[styles.analyticsLabel, { color: '#10b981' }]}>Revenue</Text>
                  <Text style={[styles.analyticsValue, { color: '#10b981' }]}>GHS 192.50</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 8,
    color: '#6b7280',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statusBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusActive: { backgroundColor: '#dcfce7' },
  statusPaused: { backgroundColor: '#fef3c7' },
  statusError: { backgroundColor: '#fee2e2' },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  dotActive: { backgroundColor: '#10b981' },
  dotPaused: { backgroundColor: '#f59e0b' },
  dotError: { backgroundColor: '#ef4444' },
  statusText: {
    fontWeight: '500',
    color: '#111827',
    fontSize: 15,
  },
  statusButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  statusButtonText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  imageSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 10,
    letterSpacing: 1,
  },
  imageContainer: {
    marginRight: 12,
    position: 'relative',
  },
  productImage: {
    width: 96,
    height: 96,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 4,
    zIndex: 2,
  },
  addImageButton: {
    width: 96,
    height: 96,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  unitLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  unitPicker: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    height: 48,
    justifyContent: 'center',
  },
  unitPickerText: {
    fontSize: 16,
    color: '#111827',
  },
  buttonSection: {
    marginTop: 24,
  },
  analyticsCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
  },
  analyticsTitle: {
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    fontSize: 16,
  },
  analyticsContent: {
    gap: 8,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  analyticsLabel: {
    color: '#6b7280',
    fontSize: 13,
  },
  analyticsValue: {
    fontWeight: '600',
    fontSize: 13,
    color: '#111827',
  },
});