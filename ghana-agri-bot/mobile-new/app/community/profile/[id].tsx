import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { apiService } from '../../../config/api';
import { useAuth } from '../../../context/AuthContext';

/**
 * Member Profile screen
 * Route: /profile/[id]
 *
 * Shows: basic profile (avatar, name, bio), member's communities (horizontal list),
 * member's recent posts (feed), and contact actions (if public).
 *
 * The component attempts to call apiService.getMember(memberId),
 * apiService.getMemberCommunities(memberId), apiService.getMemberPosts(memberId).
 * If those endpoints don't exist yet the screen falls back to mocked sample data.
 */

type Member = {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
  contactPublic?: boolean;
  memberSince?: string;
};

type Community = {
  id: string;
  name: string;
  members?: number;
  gradient?: string[];
};

type Post = {
  id: string;
  authorId: string;
  author: string;
  content: string;
  image?: string;
  likes?: number;
  comments?: number;
  timestamp?: string;
};

export default function MemberProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const memberId = (params?.id as string) || (params?.memberId as string) || '';

  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<Member | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        // Try to fetch real data from apiService (if implemented)
        let fetchedMember: any = null;
        let fetchedCommunities: any = null;
        let fetchedPosts: any = null;

        try {
          if (apiService?.getMember) fetchedMember = await apiService.getMember(memberId);
        } catch (err) {
          console.warn('getMember failed', err);
        }

        try {
          if (apiService?.getMemberCommunities) fetchedCommunities = await apiService.getMemberCommunities(memberId);
        } catch (err) {
          console.warn('getMemberCommunities failed', err);
        }

        try {
          if (apiService?.getMemberPosts) fetchedPosts = await apiService.getMemberPosts(memberId);
        } catch (err) {
          console.warn('getMemberPosts failed', err);
        }

        // Fallbacks: use fetched results when available else mocks
        const memberData: Member = fetchedMember
          ? {
              id: fetchedMember.id || memberId,
              name: fetchedMember.name || 'Farmer',
              avatar: fetchedMember.avatar,
              bio: fetchedMember.bio,
              location: fetchedMember.location,
              phone: fetchedMember.phone,
              contactPublic: fetchedMember.contactPublic ?? false,
              memberSince: fetchedMember.memberSince,
            }
          : {
              id: memberId || '123',
              name: 'Ama Owusu',
              avatar: undefined,
              bio: 'Farmer and agro-entrepreneur. Passionate about sustainable farming and market access.',
              location: 'Kumasi, Ghana',
              phone: '+233240000000',
              contactPublic: true,
              memberSince: '2022',
            };

        const communitiesData: Community[] = (fetchedCommunities && Array.isArray(fetchedCommunities))
          ? fetchedCommunities
          : [
              { id: 'c1', name: 'Maize Farmers Ghana', members: 2450, gradient: ['#10b981', '#059669'] },
              { id: 'c2', name: 'Organic Farming Network', members: 1823, gradient: ['#8b5cf6', '#7c3aed'] },
            ];

        const postsData: Post[] = (fetchedPosts && Array.isArray(fetchedPosts))
          ? fetchedPosts
          : [
              { id: 'p1', authorId: memberData.id, author: memberData.name, content: "Harvested 2 tons of maize today — great season!", likes: 24, comments: 6, timestamp: '2h' },
              { id: 'p2', authorId: memberData.id, author: memberData.name, content: 'Using organic mulch improved moisture retention — highly recommend it.', likes: 15, comments: 3, timestamp: '1d' },
            ];

        if (!mounted) return;
        setMember(memberData);
        setCommunities(communitiesData);
        setPosts(postsData);

        // If the logged-in user already follows this member (example check)
        if (user && user.following && Array.isArray(user.following)) {
          setIsFollowing(user.following.includes(memberData.id));
        }
      } catch (err) {
        console.error('Failed to load member profile', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [memberId]);

  const handleFollowToggle = () => {
    // optimistic UI update
    setIsFollowing(prev => !prev);

    // call API (if available)
    (async () => {
      try {
        if (apiService?.toggleFollowMember) {
          await apiService.toggleFollowMember(memberId, !isFollowing);
        }
      } catch (err) {
        console.warn('toggleFollowMember failed', err);
        setIsFollowing(prev => !prev); // revert
      }
    })();
  };

  const handleMessage = () => {
    // Navigate to direct message / chat screen
    router.push({ pathname: '/chat/[id]', params: { id: member?.id } });
  };

  const handleCall = () => {
    if (!member?.phone) return;
    Linking.openURL(`tel:${member.phone}`).catch(() => {});
  };

  const renderCommunity = ({ item }: { item: Community }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.communityPill}
      onPress={() => router.push({ pathname: `/community/${item.id}` })}
    >
      <Text style={styles.communityPillText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard} key={item.id}>
      <View style={styles.postHeaderRow}>
        <View style={styles.postAvatar}>
          {member?.avatar ? (
            <Image source={{ uri: member.avatar }} style={styles.postAvatarImg} />
          ) : (
            <Text style={styles.postAvatarInitial}>{member?.name?.charAt(0)}</Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.postAuthor}>{item.author}</Text>
          <Text style={styles.postTimestamp}>{item.timestamp}</Text>
        </View>
      </View>

      <Text style={styles.postContent}>{item.content}</Text>

      <View style={styles.postActionsRow}>
        <TouchableOpacity style={styles.postAction}>
          <Ionicons name="heart-outline" size={18} color="#6b7280" />
          <Text style={styles.postActionText}>{item.likes || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postAction}>
          <Ionicons name="chatbubble-outline" size={18} color="#6b7280" />
          <Text style={styles.postActionText}>{item.comments || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postAction}>
          <Ionicons name="share-social-outline" size={18} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#10b981" />
      </SafeAreaView>
    );
  }

  if (!member) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ margin: 20 }}>Member not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#10b981", "#059669"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.avatarWrap}>
            {member.avatar ? (
              <Image source={{ uri: member.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{member.name?.charAt(0)}</Text>
              </View>
            )}
          </View>
          <Text style={styles.name}>{member.name}</Text>
          {member.location ? <Text style={styles.location}>{member.location}</Text> : null}
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleFollowToggle} style={styles.headerActionBtn}>
            <Text style={styles.followText}>{isFollowing ? 'Following' : 'Follow'}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Bio / quick info */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{member.bio}</Text>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={16} color="#6b7280" />
            <Text style={styles.infoText}>Member since {member.memberSince || '—'}</Text>
          </View>
        </View>

        {/* Contact actions */}
        {member.contactPublic && (
          <View style={[styles.sectionCard, styles.actionsRow]}>
            <TouchableOpacity style={styles.contactBtn} onPress={handleMessage}>
              <Ionicons name="chatbubbles" size={18} color="#fff" />
              <Text style={styles.contactBtnText}>Message</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.contactBtn, styles.contactBtnOutline]} onPress={handleCall}>
              <Ionicons name="call" size={18} color="#006400" />
              <Text style={[styles.contactBtnText, { color: '#006400' }]}>Call</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Communities */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Communities</Text>
          <FlatList
            data={communities}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(c) => c.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.communityCardSmall}
                onPress={() => router.push(`/community/${item.id}`)}
              >
                <Text style={styles.communityCardSmallText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Recent posts */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Posts</Text>
            <TouchableOpacity onPress={() => { /* could navigate to full posts list */ }}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={posts}
            keyExtractor={(p) => p.id}
            renderItem={renderPost}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            scrollEnabled={false}
          />
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 12 },
  backBtn: { padding: 8 },
  headerCenter: { flex: 1, alignItems: 'center' },
  avatarWrap: { marginBottom: 8 },
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  avatarPlaceholder: { width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: '#fff', fontSize: 32, fontWeight: '700' },
  name: { color: '#fff', fontSize: 18, fontWeight: '700' },
  location: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 4 },
  headerActions: { position: 'absolute', right: 12, top: 14 },
  headerActionBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  followText: { color: '#fff', fontWeight: '600' },

  body: { paddingHorizontal: 16, marginTop: 12 },
  sectionCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  bioText: { color: '#374151', fontSize: 14, lineHeight: 20, marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  infoText: { marginLeft: 8, color: '#6b7280' },

  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contactBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10b981', paddingVertical: 12, borderRadius: 10, marginRight: 8 },
  contactBtnOutline: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#10b981', marginRight: 0, marginLeft: 8 },
  contactBtnText: { color: '#fff', marginLeft: 8, fontWeight: '700' },

  communityPill: { backgroundColor: '#f3f4f6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  communityPillText: { color: '#111827', fontWeight: '600' },
  communityCardSmall: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, marginRight: 8, borderWidth: 1, borderColor: '#e5e7eb' },
  communityCardSmallText: { color: '#111827', fontWeight: '600' },

  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seeAll: { color: '#10b981', fontWeight: '700' },

  postCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  postHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  postAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#10b981', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  postAvatarImg: { width: 40, height: 40, borderRadius: 20 },
  postAvatarInitial: { color: '#fff', fontSize: 16, fontWeight: '700' },
  postAuthor: { fontWeight: '700', color: '#111827' },
  postTimestamp: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  postContent: { color: '#374151', fontSize: 14, marginTop: 6 },
  postActionsRow: { flexDirection: 'row', marginTop: 10 },
  postAction: { flexDirection: 'row', alignItems: 'center', marginRight: 18 },
  postActionText: { marginLeft: 6, color: '#6b7280' },
});