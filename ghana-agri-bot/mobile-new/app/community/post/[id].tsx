import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Share,
  Alert,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

/**
 * Post Detail screen
 * path: app/community/post/[id].tsx
 * Features:
 * - Load post by id (mocked here)
 * - Show post content + image
 * - Like / unlike post
 * - Comment list, add comment
 * - Like comments
 * - Share post
 * - Back button
 *
 * Replace the mocked data and handlers with your API calls when ready.
 */

type Comment = {
  id: string;
  author: string;
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
};

type Post = {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  comments: Comment[];
};

const MOCK_POSTS: Record<string, Post> = {
  'p1': {
    id: 'p1',
    author: 'Kwame Mensah',
    content: "Harvest update — maize yield improved by 30% after switching fertilizer. Here's a short report and some photos.",
    timestamp: '2d',
    likes: 45,
    isLiked: false,
    comments: [
      { id: 'c1', author: 'Ama', text: 'Amazing result! Congrats 🎉', timestamp: '1d', likes: 4 },
      { id: 'c2', author: 'John', text: 'Which fertilizer did you use?', timestamp: '12h', likes: 2 },
    ],
    image: undefined,
  },
  'p2': {
    id: 'p2',
    author: 'Ama Darko',
    content: 'Starting a new trial with organic manure. Anyone tried this before?',
    timestamp: '6h',
    likes: 32,
    isLiked: false,
    comments: [],
    image: undefined,
  },
};

export default function PostDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const postId = (params.id as string) || 'p1';

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState('');
  const commentInputRef = useRef<TextInput | null>(null);

  // load (mock) post
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const loaded = MOCK_POSTS[postId] ?? null;
      setPost(loaded);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [postId]);

  const handleToggleLikePost = () => {
    if (!post) return;
    setPost(prev => prev ? { ...prev, isLiked: !prev.isLiked, likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1 } : prev);
    // TODO: call API to persist like
  };

  const handleShare = async () => {
    if (!post) return;
    try {
      await Share.share({
        message: `${post.author}: ${post.content} \n\nOpen the app to read more.`,
      });
    } catch (error) {
      Alert.alert('Share failed', 'Could not share this post.');
    }
  };

  const addComment = () => {
    if (!post) return;
    const text = commentText.trim();
    if (!text) return;
    // optimistic update
    const newComment: Comment = {
      id: `c_${Date.now()}`,
      author: 'You',
      text,
      timestamp: 'now',
      likes: 0,
    };
    setPost(prev => prev ? { ...prev, comments: [newComment, ...prev.comments] } : prev);
    setCommentText('');
    Keyboard.dismiss();
    // TODO: call API to persist comment
  };

  const toggleLikeComment = (commentId: string) => {
    if (!post) return;
    setPost(prev => prev ? {
      ...prev,
      comments: prev.comments.map(c => c.id === commentId ? { ...c, isLiked: !c.isLiked, likes: c.isLiked ? c.likes - 1 : c.likes + 1 } : c)
    } : prev);
    // TODO: call API
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentRow}>
      <View style={styles.commentAvatar}><Text style={styles.commentAvatarText}>{item.author?.charAt(0) ?? '?'}</Text></View>
      <View style={{ flex: 1 }}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentAuthor}>{item.author}</Text>
          <Text style={styles.commentTime}>{item.timestamp}</Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity style={styles.commentAction} onPress={() => toggleLikeComment(item.id)}>
            <Ionicons name={item.isLiked ? 'heart' : 'heart-outline'} size={16} color={item.isLiked ? '#ef4444' : '#6b7280'} />
            <Text style={styles.commentActionText}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.commentAction} onPress={() => Alert.alert('Reply', 'Reply functionality not implemented in demo')}>
            <Ionicons name="chatbubble-outline" size={16} color="#6b7280" />
            <Text style={styles.commentActionText}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}><ActivityIndicator size="large" color="#10b981" /></View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={{ color: '#6b7280' }}>Post not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Ionicons name="arrow-back" size={20} color="#111" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Post</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Post Content */}
        <FlatList
          ListHeaderComponent={<>
            <View style={styles.postCard}>
              <View style={styles.postTop}>
                <View style={styles.postAvatar}><Text style={styles.postAvatarText}>{post.author?.charAt(0) ?? '?'}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.postAuthor}>{post.author}</Text>
                  <Text style={styles.postTime}>{post.timestamp}</Text>
                </View>
              </View>

              <Text style={styles.postContent}>{post.content}</Text>

              {post.image ? (
                <Image source={{ uri: post.image }} style={styles.postImage} />
              ) : null}

              <View style={styles.postMetaRow}>
                <TouchableOpacity style={styles.metaBtn} onPress={handleToggleLikePost}>
                  <Ionicons name={post.isLiked ? 'heart' : 'heart-outline'} size={18} color={post.isLiked ? '#ef4444' : '#374151'} />
                  <Text style={styles.metaText}>{post.likes}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.metaBtn} onPress={() => { commentInputRef.current?.focus(); }}>
                  <Ionicons name="chatbubble-outline" size={18} color="#374151" />
                  <Text style={styles.metaText}>{post.comments.length}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.metaBtn} onPress={handleShare}>
                  <Ionicons name="share-social-outline" size={18} color="#374151" />
                  <Text style={styles.metaText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Comments</Text>
          </>}
          data={post.comments}
          keyExtractor={(item) => item.id}
          renderItem={renderComment}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        />

        {/* Composer */}
        <View style={styles.composer}>
          <TextInput
            ref={commentInputRef}
            placeholder="Write a comment..."
            value={commentText}
            onChangeText={setCommentText}
            style={styles.commentInput}
            multiline
          />

          <TouchableOpacity onPress={addComment} style={[styles.sendBtn, !commentText.trim() && { opacity: 0.5 }]} disabled={!commentText.trim()}>
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomColor: '#eef2f1', borderBottomWidth: 1 },
  backBtn: { width: 44, alignItems: 'flex-start' },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '700', fontSize: 16, color: '#111' },

  postCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, margin: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  postTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  postAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  postAvatarText: { color: '#fff', fontWeight: '700' },
  postAuthor: { fontWeight: '700', color: '#111' },
  postTime: { color: '#6b7280', fontSize: 12 },
  postContent: { color: '#111', lineHeight: 20, marginBottom: 8 },
  postImage: { width: '100%', height: 180, borderRadius: 12, marginBottom: 8 },

  postMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 16, marginTop: 6 },
  metaBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginRight: 12 },
  metaText: { color: '#374151' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginLeft: 16, marginBottom: 8 },

  commentRow: { flexDirection: 'row', alignItems: 'flex-start' },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  commentAvatarText: { color: '#fff', fontWeight: '700' },
  commentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  commentAuthor: { fontWeight: '700', color: '#111' },
  commentTime: { color: '#6b7280', fontSize: 12 },
  commentText: { color: '#111', lineHeight: 18, marginBottom: 6 },
  commentActions: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  commentAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  commentActionText: { color: '#6b7280' },

  composer: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', padding: 8, backgroundColor: '#fff', borderTopColor: '#eef2f1', borderTopWidth: 1, alignItems: 'center' },
  commentInput: { flex: 1, backgroundColor: '#f3f4f6', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, maxHeight: 120 },
  sendBtn: { marginLeft: 8, backgroundColor: '#10b981', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
