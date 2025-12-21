import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { MARKET_UNITS } from '../../utils/constants';

interface ProductForm {
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
}

const MAX_IMAGES = 5;

const AddProductScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { location } = useApp();

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState<ProductForm>({
    name: '',
    category: 'produce',
    price: '',
    unit: 'kg',
    quantity: '',
    minimumOrder: '1',
    description: '',
    harvestDate: new Date().toISOString().split('T')[0],
    quality: 'Grade A',
    deliveryAvailable: false,
    images: [],
  });

  // Defensive units fallback
  const units = Array.isArray(MARKET_UNITS) && MARKET_UNITS.length > 0
    ? MARKET_UNITS
    : ['kg', 'bag', 'piece', 'ltr'];

  // Safe image picker helpers
  const pickImage = async () => {
    try {
      if (images.length >= MAX_IMAGES) {
        Alert.alert('Limit Reached', `Maximum ${MAX_IMAGES} images allowed`);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      const uri = result?.assets?.[0]?.uri;
      if (!result.canceled && uri) {
        setImages(prev => [...prev, uri]);
      }
    } catch (err) {
      console.error('pickImage error', err);
      Alert.alert('Error', 'Could not pick image.');
    }
  };

  const takePhoto = async () => {
    try {
      if (images.length >= MAX_IMAGES) {
        Alert.alert('Limit Reached', `Maximum ${MAX_IMAGES} images allowed`);
        return;
      }
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission needed', 'Camera permission is required');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      const uri = result?.assets?.[0]?.uri;
      if (!result.canceled && uri) {
        setImages(prev => [...prev, uri]);
      }
    } catch (err) {
      console.error('takePhoto error', err);
      Alert.alert('Error', 'Could not take photo.');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'Please enter product name');
      return false;
    }
    if (!form.price || Number.isNaN(Number(form.price)) || parseFloat(form.price) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return false;
    }
    if (!form.quantity || Number.isNaN(Number(form.quantity)) || parseFloat(form.quantity) <= 0) {
      Alert.alert('Error', 'Please enter available quantity');
      return false;
    }
    if (images.length === 0) {
      Alert.alert('Error', 'Please add at least one product image');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Upload images and call API
      await new Promise(resolve => setTimeout(resolve, 1200));

      Alert.alert(
        'Success!',
        'Your product has been listed successfully.',
        [
          { text: 'View Listing', onPress: () => router.push('/marketplace/MyListings') },
          {
            text: 'Add Another',
            onPress: () => {
              setForm(prev => ({
                ...prev,
                name: '',
                price: '',
                quantity: '',
                minimumOrder: '1',
                description: '',
                images: [],
              }));
              setImages([]);
            },
          },
        ],
      );
    } catch (err) {
      console.error('handleSubmit error', err);
      Alert.alert('Error', 'Failed to list product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Small helpers for controlled updates
  const updateField = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const CategoryButton = ({ value, label, icon }: { value: ProductForm['category']; label: string; icon: string }) => {
    const selected = form.category === value;
    return (
      <TouchableOpacity
        onPress={() => updateField('category', value)}
        style={[styles.categoryBtn, selected ? styles.categoryBtnActive : styles.categoryBtnIdle]}
        activeOpacity={0.8}
      >
        <Ionicons name={icon as any} size={20} color={selected ? '#05603a' : '#6b7280'} />
        <Text style={[styles.categoryLabel, selected ? styles.categoryLabelActive : null]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  const QualityButton = ({ grade }: { grade: ProductForm['quality'] }) => {
    const selected = form.quality === grade;
    return (
      <TouchableOpacity
        onPress={() => updateField('quality', grade)}
        style={[styles.qualityBtn, selected ? styles.qualityBtnActive : styles.qualityBtnIdle]}
        activeOpacity={0.8}
      >
        <Text style={[styles.qualityLabel, selected ? styles.qualityLabelActive : null]}>{grade}</Text>
      </TouchableOpacity>
    );
  };

  const openUnitPicker = () => {
    const buttons = units.map(u => ({ text: u, onPress: () => updateField('unit', u) }));
    buttons.push({ text: 'Cancel', style: 'cancel' as const });
    Alert.alert('Select Unit', undefined, buttons);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={22} color="#0f766e" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.title}>List Your Product</Text>
            <Text style={styles.subtitle}>Reach buyers across your region</Text>
          </View>
        </View>

        <View style={styles.section}>
          {/* Images */}
          <Text style={styles.sectionTitle}>Product Images (max {MAX_IMAGES})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroller}>
            {images.map((uri, idx) => (
              <View key={idx} style={styles.imageThumbWrap}>
                <Image source={{ uri }} style={styles.imageThumb} />
                <TouchableOpacity onPress={() => removeImage(idx)} style={styles.imageRemoveBtn}>
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}

            {images.length < MAX_IMAGES && (
              <>
                <TouchableOpacity style={styles.addImageBtn} onPress={pickImage} activeOpacity={0.8}>
                  <Ionicons name="image" size={26} color="#6b7280" />
                  <Text style={styles.addImageText}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addImageBtn} onPress={takePhoto} activeOpacity={0.8}>
                  <Ionicons name="camera" size={26} color="#6b7280" />
                  <Text style={styles.addImageText}>Camera</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>

        <View style={styles.section}>
          {/* Category */}
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.row}>
            <CategoryButton value="produce" label="Produce" icon="basket" />
            <CategoryButton value="inputs" label="Inputs" icon="color-fill" />
            <CategoryButton value="tools" label="Tools" icon="hammer" />
          </View>
        </View>

        <View style={styles.section}>
          <Input
            label="Product Name"
            placeholder="e.g., Fresh Tomatoes"
            value={form.name}
            onChangeText={text => updateField('name', text)}
            required
          />
        </View>

        <View style={[styles.row, { paddingHorizontal: 16 }]}>
          <View style={{ flex: 1 }}>
            <Input
              label="Price (GHS)"
              placeholder="0.00"
              value={form.price}
              onChangeText={text => updateField('price', text)}
              keyboardType="decimal-pad"
              icon="cash"
              required
            />
          </View>

          <View style={{ width: 120, marginLeft: 12 }}>
            <Text style={styles.fieldLabel}>Unit</Text>
            <TouchableOpacity onPress={openUnitPicker} style={styles.unitPicker}>
              <Text style={styles.unitText}>{form.unit}</Text>
              <Ionicons name="chevron-down" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.row, { paddingHorizontal: 16 }]}>
          <View style={{ flex: 1 }}>
            <Input
              label="Available Quantity"
              placeholder="100"
              value={form.quantity}
              onChangeText={text => updateField('quantity', text)}
              keyboardType="numeric"
              required
            />
          </View>
          <View style={{ width: 140, marginLeft: 12 }}>
            <Input
              label="Minimum Order"
              placeholder="1"
              value={form.minimumOrder}
              onChangeText={text => updateField('minimumOrder', text)}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quality Grade</Text>
          <View style={styles.row}>
            <QualityButton grade="Grade A" />
            <QualityButton grade="Grade B" />
            <QualityButton grade="Grade C" />
          </View>
        </View>

        <View style={styles.section}>
          <Input
            label="Harvest/Production Date"
            placeholder="YYYY-MM-DD"
            value={form.harvestDate}
            onChangeText={text => updateField('harvestDate', text)}
            icon="calendar"
          />
        </View>

        <View style={styles.section}>
          <Input
            label="Description"
            placeholder="Describe your product quality, features, etc."
            value={form.description}
            onChangeText={text => updateField('description', text)}
            multiline
            numberOfLines={4}
            inputClassName="h-24"
          />
        </View>

        <View style={[styles.row, styles.section, { alignItems: 'center' }]}>
          <TouchableOpacity
            style={[styles.toggleBox, form.deliveryAvailable ? styles.toggleBoxOn : styles.toggleBoxOff]}
            onPress={() => updateField('deliveryAvailable', !form.deliveryAvailable)}
            activeOpacity={0.8}
          >
            {form.deliveryAvailable ? (
              <Ionicons name="checkmark" size={18} color="#fff" />
            ) : (
              <View style={styles.togglePlaceholder} />
            )}
          </TouchableOpacity>
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.fieldLabel}>I can deliver this product</Text>
            <Text style={styles.fieldSub}>Buyers can choose delivery at checkout</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.locationBox}>
            <Ionicons name="location" size={20} color="#0f766e" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.fieldLabel}>Product Location</Text>
              <Text style={styles.fieldSub}>{location || 'Ghana'}</Text>
            </View>
            <TouchableOpacity onPress={() => Alert.alert('Change location', 'Location change not implemented')}>
              <Text style={styles.changeText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Button
            title="List Product"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            icon="checkmark-circle"
            fullWidth
            size="lg"
          />
        </View>

        <View style={[styles.section, { marginBottom: 40 }]}>
          <View style={styles.tipsBox}>
            <Text style={styles.tipsTitle}>Tips for Better Sales</Text>
            <Text style={styles.tipsText}>
              • Use clear, well-lit photos{'\n'}
              • Set competitive prices{'\n'}
              • Provide accurate descriptions{'\n'}
              • Respond quickly to buyers
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AddProductScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { flex: 1 },
  content: { paddingBottom: 40 },
  header: {
    paddingTop: 18,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: '#ecfdf5',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 12,
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  headerText: { flex: 1 },
  title: { fontSize: 18, fontWeight: '700', color: '#064e3b' },
  subtitle: { fontSize: 13, color: '#065f46', marginTop: 2 },

  section: { marginTop: 12, paddingHorizontal: 16 },

  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#064e3b', marginBottom: 8 },

  imageScroller: { flexDirection: 'row' },
  imageThumbWrap: { marginRight: 12, position: 'relative' },
  imageThumb: { width: 96, height: 96, borderRadius: 8, backgroundColor: '#f3f4f6' },
  imageRemoveBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  addImageBtn: {
    width: 96,
    height: 96,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addImageText: { fontSize: 11, color: '#6b7280', marginTop: 6 },

  row: { flexDirection: 'row', alignItems: 'center' },

  categoryBtn: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e6f0ec',
    backgroundColor: '#fff',
  },
  categoryBtnActive: { backgroundColor: 'rgba(16,185,129,0.08)', borderColor: '#10b981' },
  categoryBtnIdle: { backgroundColor: '#fff' },
  categoryLabel: { marginTop: 6, fontSize: 12, color: '#6b7280' },
  categoryLabelActive: { color: '#065f46', fontWeight: '700' },

  fieldLabel: { fontSize: 12, color: '#374151', marginBottom: 6 },
  fieldSub: { fontSize: 12, color: '#6b7280' },

  unitPicker: {
    borderWidth: 1,
    borderColor: '#e6e6e6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unitText: { fontSize: 16, color: '#111' },

  qualityBtn: {
    flex: 1,
    paddingVertical: 10,
    marginRight: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eef2f1',
    backgroundColor: '#f8faf8',
  },
  qualityBtnActive: { backgroundColor: '#10b981', borderColor: '#10b981' },
  qualityBtnIdle: { backgroundColor: '#f8faf8' },
  qualityLabel: { fontSize: 13, color: '#374151' },
  qualityLabelActive: { color: '#fff', fontWeight: '700' },

  toggleBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBoxOn: { backgroundColor: '#10b981' },
  toggleBoxOff: { backgroundColor: '#f3f4f6' },
  togglePlaceholder: { width: 18, height: 18, borderRadius: 4 },

  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8faf8',
    padding: 12,
    borderRadius: 10,
  },
  changeText: { color: '#0f766e', fontWeight: '600' },

  tipsBox: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    padding: 12,
    borderRadius: 8,
  },
  tipsTitle: { fontWeight: '700', color: '#064e3b', marginBottom: 6 },
  tipsText: { color: '#4b5563', fontSize: 13 },
});
