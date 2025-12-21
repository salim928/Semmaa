// app/community/[id].tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

type Post = {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  pinned?: boolean;
};

type Member = {
  id: string;
  name: string;
  avatar?: string;
  role?: 'admin' | 'member' | 'moderator';
};

const MOCK_COMMUNITIES: Record<
  string,
  {
    id: string;
    name: string;
    description: string;
    membersCount: number;
    joined: boolean;
    cover?: string;
    isPrivate?: boolean;
  }
> = {
  '1': {
    id: '1',
    name: 'Maize Farmers Ghana',
    description: 'Connect with maize farmers across Ghana. Share tips, market prices, and experiences.',
    membersCount: 2450,
    joined: true,
    cover: undefined,
    isPrivate: false,
  },
  '2': {
    id: '2',
    name: 'Organic Farming Network',
    description: 'Learn and share organic farming techniques for sustainable agriculture.',
    membersCount: 1823,
    joined: false,
    cover: undefined,
    isPrivate: false,
  },
};

const MOCK_POSTS: Post[] = [
  {
    id: 'pinned_1',
    author: 'Admin (Pinned)',
    authorAvatar: undefined,
    content: 'Welcome to the community! Please follow the pinned rules and share helpful posts only.',
    timestamp: '2d',
    likes: 120,
    comments: 20,
    pinned: true,
  },
  {
    id: 'post_1',
    author: 'Kwame Mensah',
    content: "Harvest update — maize yield improved by 30% after switching fertilizer. Details inside.",
    timestamp: '6h',
    likes: 45,
    comments: 12,
  },
  {
    id: 'post_2',
    author: 'Ama Darko',
    content: 'Starting a new trial with organic manure. Anyone tried this before?',
    timestamp: '12h',
    likes: 32,
    comments: 8,
  },
];

const MOCK_MEMBERS: Member[] = [
  { id: 'm1', name: 'Kwame Mensah', role: 'admin' },
  { id: 'm2', name: 'Ama Darko', role: 'member' },
  { id: 'm3', name: 'John Doe', role: 'moderator' },
  { id: 'm4', name: 'Mary Addo', role: 'member' },
];

export default function CommunityDetailScreen(): JSX.Element {
  const params = useLocalSearchParams();
  const router = useRouter();
  const communityId = (params.id as string) || '1';

  // Load community (simulate)
  const community = useMemo(() => {
    return MOCK_COMMUNITIES[communityId] ?? {
      id: communityId,
      name: 'Community',
      description: 'No description available.',
      membersCount: 0,
      joined: false,
    };
  }, [communityId]);

  const [joined, setJoined] = useState<boolean>(community.joined);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [composerText, setComposerText] = useState('');
  const [composerImage, setComposerImage] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // In a real app you'd fetch community, posts, members here.
    // Simulating a short load.
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, [communityId]);

  const pinnedPosts = posts.filter(p => p.pinned);
  const feedPosts = posts.filter(p => !p.pinned).sort((a, b) => {
    // keep order as is — could sort by timestamp
    return 0;
  });

  const toggleJoin = () => {
    if (community.isPrivate && !joined) {
      // Simulate request required
      Alert.alert('Request Sent', 'A request to join this private community has been sent to the admins.');
      // Optionally show a pending state; keep joined false.
      return;
    }
    setJoined(prev => !prev);
  };

  const pickComposerImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please grant photo library permission to attach images.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!res.canceled) {
      setComposerImage(res.assets[0].uri);
    }
  };

  const removeComposerImage = () => setComposerImage(undefined);

  const createPost = async () => {
    if (!joined) {
      Alert.alert('Join First', 'You must join the community before posting.');
      return;
    }
    if (!composerText.trim() && !composerImage) {
      Alert.alert('Empty Post', 'Please write something or attach an image.');
      return;
    }
    setCreating(true);
    // Simulate server delay
    setTimeout(() => {
      const newPost: Post = {
        id: `post_${Date.now()}`,
        author: 'You',
        authorAvatar: undefined,
        content: composerText.trim(),
        image: composerImage,
        timestamp: 'now',
        likes: 0,
        comments: 0,
      };
      setPosts(prev => [newPost, ...prev]);
      setComposerText('');
      setComposerImage(undefined);
      setCreating(false);
      // scroll to top happens because FlatList is inverted? we keep default
    }, 700);
  };

  const toggleLike = (postId: string) => {
    setPosts(prev => prev.map(p => (p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p)));
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postAvatar}>
          <Text style={styles.postAvatarText}>{item.author?.charAt(0) ?? '?'}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.postAuthor}>{item.author}</Text>
          <Text style={styles.postTime}>{item.timestamp}</Text>
        </View>
        {item.pinned && (
          <View style={styles.pinnedBadge}>
            <Ionicons name="pin" size={12} color="#fff" />
            <Text style={styles.pinnedText}>Pinned</Text>
          </View>
        )}
      </View>

      <Text style={styles.postContent}>{item.content}</Text>

      {item.image && (
        <Image source={{ uri: item.image }} style={styles.postImage} resizeMode="cover" />
      )}

      <View style={styles.postActions}>
        <TouchableOpacity style={styles.postAction} onPress={() => toggleLike(item.id)}>
          <Ionicons name={item.isLiked ? 'heart' : 'heart-outline'} size={18} color={item.isLiked ? '#ef4444' : '#374151'} />
          <Text style={styles.postActionText}>{item.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.postAction} onPress={() => Alert.alert('Comments', 'Comments not implemented in this demo.')}>
          <Ionicons name="chatbubble-outline" size={18} color="#374151" />
          <Text style={styles.postActionText}>{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.postAction} onPress={() => Alert.alert('Share', 'Share functionality not implemented in this demo.')}>
          <Ionicons name="share-social-outline" size={18} color="#374151" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const openMembers = () => setShowMembersModal(true);

  const renderMember = ({ item }: { item: Member }) => (
    <View style={styles.memberRow}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberRole}>{item.role ?? 'member'}</Text>
      </View>
      <TouchableOpacity style={styles.messageBtn} onPress={() => Alert.alert('Message', `Open DM with ${item.name}`)}>
        <Ionicons name="chatbubble-ellipses" size={18} color="#10b981" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerLeft}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerMiddle}>
            <Text style={styles.headerTitle}>{community.name}</Text>
            <Text style={styles.headerSubtitle}>{community.membersCount.toLocaleString()} members</Text>
          </View>

          <TouchableOpacity onPress={openMembers} style={styles.headerRight}>
            <Ionicons name="people" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Composer */}
        <View style={styles.composer}>
          <View style={{ flex: 1 }}>
            <TextInput
              placeholder={joined ? "Share an update with the community..." : "Join the community to post"}
              editable={joined}
              multiline
              value={composerText}
              onChangeText={setComposerText}
              style={[styles.input, !joined && styles.inputDisabled]}
            />
            {composerImage && (
              <View style={styles.composeImageRow}>
                <Image source={{ uri: composerImage }} style={styles.composeImage} />
                <TouchableOpacity style={styles.removeImageBtn} onPress={removeComposerImage}>
                  <Ionicons name="close" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.composerActions}>
            <TouchableOpacity onPress={pickComposerImage} disabled={!joined} style={styles.iconBtn}>
              <Ionicons name="image" size={22} color={joined ? '#10b981' : '#94a3b8'} />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleJoin} style={[styles.joinBtn, joined ? styles.joinBtnJoined : styles.joinBtnNotJoined]}>
              <Text style={[styles.joinBtnText, joined && styles.joinBtnTextJoined]}>{joined ? 'Joined' : community.isPrivate ? 'Request' : 'Join'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={createPost} style={styles.postBtn} disabled={!joined || creating}>
              {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.postBtnText}>Post</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Pinned Posts */}
        {pinnedPosts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pinned</Text>
            <FlatList
              data={pinnedPosts}
              keyExtractor={p => p.id}
              renderItem={renderPost}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
          </View>
        )}

        {/* Feed */}
        <View style={styles.sectionFeed}>
          <Text style={styles.sectionTitle}>Feed</Text>
          <FlatList
            data={feedPosts}
            keyExtractor={p => p.id}
            renderItem={renderPost}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        </View>

        {/* Members Modal */}
        <Modal visible={showMembersModal} animationType="slide" onRequestClose={() => setShowMembersModal(false)}>
          <SafeAreaView style={styles.modalSafe}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowMembersModal(false)}>
                <Ionicons name="close" size={22} color="#111827" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Members</Text>
              <View style={{ width: 22 }} />
            </View>

            <FlatList
              data={members}
              keyExtractor={m => m.id}
              renderItem={renderMember}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              contentContainerStyle={{ padding: 16 }}
            />
          </SafeAreaView>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  container: { flex: 1 },

  header: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLeft: { padding: 6 },
  headerMiddle: { flex: 1, alignItems: 'center' },
  headerRight: { padding: 6 },
  headerTitle: { color: '#fff', fontWeight: '700', fontSize: 16 },
  headerSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },

  composer: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomColor: '#eef2f1',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
    maxHeight: 120,
    fontSize: 14,
    color: '#111827',
  },
  inputDisabled: { opacity: 0.7 },
  composerActions: {
    marginLeft: 8,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 90,
  },
  iconBtn: {
    padding: 6,
  },
  joinBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  joinBtnJoined: {
    backgroundColor: '#fff',
    borderColor: '#10b981',
  },
  joinBtnNotJoined: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  joinBtnText: { color: '#fff', fontWeight: '700' },
  joinBtnTextJoined: { color: '#10b981' },
  postBtn: {
    marginTop: 6,
    backgroundColor: '#006400',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  postBtnText: { color: '#fff', fontWeight: '700' },

  composeImageRow: {
    marginTop: 8,
    width: width - 160,
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  composeImage: { width: '100%', height: '100%' },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 6,
    borderRadius: 16,
  },

  section: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  sectionFeed: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 6,
  },

  postCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  postAvatarText: { color: '#fff', fontWeight: '700' },
  postAuthor: { fontWeight: '700', color: '#111827' },
  postTime: { color: '#6b7280', fontSize: 12 },
  pinnedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  pinnedText: { color: '#fff', fontSize: 12, marginLeft: 6 },

  postContent: { color: '#111827', marginBottom: 8, lineHeight: 20 },
  postImage: { height: 180, borderRadius: 10, width: '100%', marginBottom: 8 },

  postActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 12 },
  postAction: { flexDirection: 'row', alignItems: 'center', marginRight: 18, gap: 6 },
  postActionText: { color: '#6b7280' },

  // Modal (members)
  modalSafe: { flex: 1, backgroundColor: '#fff' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomColor: '#eef2f1',
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', flex: 1, textAlign: 'center' },

  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberAvatarText: { color: '#fff', fontWeight: '700' },
  memberName: { fontWeight: '700', color: '#111827' },
  memberRole: { color: '#6b7280', fontSize: 12 },
  messageBtn: {
    padding: 8,
    borderRadius: 8,
  },

  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
