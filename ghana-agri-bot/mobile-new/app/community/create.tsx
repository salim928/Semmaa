// app/community/create.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
// Optional: if you have a real service, import it. Otherwise it will fall back to a simulated request.
// import { apiService } from '../../config/api';

const CATEGORIES = [
  'Crops',
  'Livestock',
  'Techniques',
  'Market',
  'Irrigation',
  'Women in Ag',
  'Youth',
];

const CreateCommunityScreen = () => {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickCover = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow access to your photos to pick a cover image.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [16, 9],
    });
    if (!res.canceled) {
      setCoverUri(res.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow camera access to take a cover photo.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!res.canceled) {
      setCoverUri(res.assets[0].uri);
    }
  };

  const validate = (): boolean => {
    if (!name.trim() || name.trim().length < 3) {
      Alert.alert('Validation', 'Please enter a community name (at least 3 characters).');
      return false;
    }
    if (!description.trim() || description.trim().length < 10) {
      Alert.alert('Validation', 'Please describe the community (at least 10 characters).');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // If you have apiService.createCommunity use it here.
      // Example:
      // const payload = { name, description, category, privacy, coverUri };
      // const result = await apiService.createCommunity(payload);

      // Since the backend may not exist in this environment, we'll simulate:
      await new Promise((r) => setTimeout(r, 1200));

      // Simulated created community id / object
      const newCommunity = {
        id: `community_${Date.now()}`,
        name,
        description,
        category,
        privacy,
        coverUri,
      };

      Alert.alert('Community Created', `${name} has been created successfully.`, [
        {
          text: 'View Community',
          onPress: () => {
            // If you have a community detail screen route, navigate to it:
            // router.push(`/community/${newCommunity.id}`);
            // For now go back to community list
            router.replace('/community');
          },
        },
        { text: 'Done', onPress: () => router.replace('/community') },
      ]);
    } catch (err) {
      console.error('Create community failed', err);
      Alert.alert('Error', 'Failed to create community. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Community</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Cover preview */}
          <Text style={styles.label}>Cover Image</Text>
          <View style={styles.coverRow}>
            <TouchableOpacity style={styles.coverPicker} onPress={pickCover}>
              {coverUri ? (
                <Image source={{ uri: coverUri }} style={styles.coverImage} />
              ) : (
                <View style={styles.coverPlaceholder}>
                  <Ionicons name="image" size={36} color="#9ca3af" />
                  <Text style={styles.coverPlaceholderText}>Tap to choose</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.coverActions}>
              <TouchableOpacity style={styles.coverActionBtn} onPress={pickCover}>
                <Ionicons name="image" size={20} color="#006400" />
                <Text style={styles.coverActionText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.coverActionBtn} onPress={takePhoto}>
                <Ionicons name="camera" size={20} color="#006400" />
                <Text style={styles.coverActionText}>Camera</Text>
              </TouchableOpacity>
              {coverUri && (
                <TouchableOpacity
                  style={[styles.coverActionBtn, { backgroundColor: '#fee2e2' }]}
                  onPress={() => setCoverUri(null)}
                >
                  <Ionicons name="close" size={18} color="#b91c1c" />
                  <Text style={[styles.coverActionText, { color: '#b91c1c' }]}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Name */}
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Community name (e.g., Maize Farmers - Ashanti)"
            style={styles.input}
            returnKeyType="done"
          />

          {/* Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="What is this community about?"
            style={[styles.input, styles.multiline]}
            multiline
          />

          {/* Category */}
          <Text style={styles.label}>Category</Text>
          <View style={styles.chipsRow}>
            {CATEGORIES.map((c) => {
              const active = c === category;
              return (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setCategory(c)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Privacy */}
          <Text style={styles.label}>Privacy</Text>
          <View style={styles.privacyRow}>
            <TouchableOpacity
              style={[styles.privacyBtn, privacy === 'public' && styles.privacyBtnActive]}
              onPress={() => setPrivacy('public')}
            >
              <Text style={[styles.privacyText, privacy === 'public' && styles.privacyTextActive]}>Public</Text>
              <Text style={styles.privacySubtitle}>Anyone can join</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.privacyBtn, privacy === 'private' && styles.privacyBtnActive]}
              onPress={() => setPrivacy('private')}
            >
              <Text style={[styles.privacyText, privacy === 'private' && styles.privacyTextActive]}>Private</Text>
              <Text style={styles.privacySubtitle}>Join by approval</Text>
            </TouchableOpacity>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Create Community</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateCommunityScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  container: { flex: 1 },
  header: {
    backgroundColor: '#10b981',
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 12,
    padding: 6,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  content: {
    padding: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    marginTop: 12,
  },

  coverRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  coverPicker: {
    width: 160,
    height: 90,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e6e6e6',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverPlaceholderText: {
    marginTop: 6,
    fontSize: 12,
    color: '#9ca3af',
  },
  coverActions: {
    flex: 1,
    justifyContent: 'space-between',
  },
  coverActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  coverActionText: {
    color: '#006400',
    fontWeight: '600',
  },

  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    fontSize: 14,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    marginRight: 8,
    marginBottom: 8,
  },
  chipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  chipText: {
    color: '#111827',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },

  privacyRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  privacyBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    backgroundColor: '#fff',
  },
  privacyBtnActive: {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16,185,129,0.08)',
  },
  privacyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  privacyTextActive: {
    color: '#10b981',
  },
  privacySubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },

  submitBtn: {
    marginTop: 20,
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
