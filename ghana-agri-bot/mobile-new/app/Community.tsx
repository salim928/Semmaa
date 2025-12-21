// app/Community.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  StatusBar,
  Image,
  TextInput,
  Animated,
  FlatList,
  ScrollView, // <-- ADDED
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  category: string;
  isJoined: boolean;
  coverImage?: string;
  posts: number;
  activeToday: number;
  gradient: string[];
  icon: keyof typeof Ionicons.glyphMap;
}

interface Post {
  id: string;
  communityId: string;
  author: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  image?: string;
}

const CARD_HORIZONTAL_PADDING = 16;
const CARD_SPACING = 12;
const CARD_WIDTH = (width - CARD_HORIZONTAL_PADDING * 2 - CARD_SPACING) / 2; // two columns

const CommunityScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'discover' | 'joined' | 'create'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // useRef for animated values (prevents remount problems)
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const [communities, setCommunities] = useState<Community[]>([
    {
      id: '1',
      name: 'Maize Farmers Ghana',
      description: 'Connect with maize farmers across Ghana. Share tips, market prices, and experiences.',
      members: 2450,
      category: 'crops',
      isJoined: true,
      posts: 156,
      activeToday: 45,
      gradient: ['#10b981', '#059669'],
      icon: 'leaf',
    },
    {
      id: '2',
      name: 'Organic Farming Network',
      description: 'Learn and share organic farming techniques for sustainable agriculture.',
      members: 1823,
      category: 'techniques',
      isJoined: true,
      posts: 234,
      activeToday: 67,
      gradient: ['#8b5cf6', '#7c3aed'],
      icon: 'flower',
    },
    {
      id: '3',
      name: 'Poultry Farmers Association',
      description: 'Everything about poultry farming - from chicks to market.',
      members: 3200,
      category: 'livestock',
      isJoined: false,
      posts: 445,
      activeToday: 89,
      gradient: ['#f59e0b', '#d97706'],
      icon: 'egg',
    },
    {
      id: '4',
      name: 'Women in Agriculture',
      description: 'Empowering women farmers through knowledge sharing and support.',
      members: 4100,
      category: 'social',
      isJoined: false,
      posts: 567,
      activeToday: 123,
      gradient: ['#ec4899', '#db2777'],
      icon: 'people',
    },
    {
      id: '5',
      name: 'Market Price Updates',
      description: 'Real-time market prices and trading opportunities across Ghana.',
      members: 5600,
      category: 'market',
      isJoined: false,
      posts: 890,
      activeToday: 234,
      gradient: ['#3b82f6', '#2563eb'],
      icon: 'trending-up',
    },
    {
      id: '6',
      name: 'Irrigation & Water Management',
      description: 'Discuss irrigation techniques and water conservation methods.',
      members: 980,
      category: 'techniques',
      isJoined: false,
      posts: 78,
      activeToday: 12,
      gradient: ['#06b6d4', '#0891b2'],
      icon: 'water',
    },
  ]);

  const [recentPosts, setRecentPosts] = useState<Post[]>([
    {
      id: '1',
      communityId: '1',
      author: 'Kwame Mensah',
      content:
        'Just harvested my maize crop! The yield this season is amazing thanks to the new fertilizer technique shared here.',
      timestamp: '2 hours ago',
      likes: 45,
      comments: 12,
      isLiked: false,
    },
    {
      id: '2',
      communityId: '2',
      author: 'Ama Darko',
      content: 'Starting my organic tomato garden today. Any tips for pest control without chemicals?',
      timestamp: '5 hours ago',
      likes: 32,
      comments: 8,
      isLiked: true,
    },
  ]);

  const categories = [
    { key: 'all', label: 'All', icon: 'apps' },
    { key: 'crops', label: 'Crops', icon: 'leaf' },
    { key: 'livestock', label: 'Livestock', icon: 'paw' },
    { key: 'techniques', label: 'Techniques', icon: 'build' },
    { key: 'market', label: 'Market', icon: 'cash' },
    { key: 'social', label: 'Social', icon: 'people' },
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleJoinCommunity = (communityId: string) => {
    setCommunities(prev =>
      prev.map(c => (c.id === communityId ? { ...c, isJoined: !c.isJoined } : c))
    );
  };

  const filteredCommunities = communities.filter(c => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q.length === 0 ||
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory;
    const matchesTab = activeTab === 'discover' ? !c.isJoined : c.isJoined;
    return matchesSearch && matchesCategory && (activeTab === 'create' ? false : matchesTab);
  });

  const CommunityCard = ({ community }: { community: Community }) => {
    return (
      <TouchableOpacity
        style={[styles.communityCard, { width: CARD_WIDTH }]}
        activeOpacity={0.92}
        onPress={() => router.push(`/community/${community.id}`)}
      >
        <LinearGradient colors={community.gradient} style={styles.communityGradient}>
          <View style={styles.communityHeader}>
            <View style={styles.communityIcon}>
              <Ionicons name={community.icon} size={28} color="#fff" />
            </View>
            <TouchableOpacity
              style={[styles.joinButton, community.isJoined && styles.joinButtonJoined]}
              onPress={() => handleJoinCommunity(community.id)}
            >
              <Text style={[styles.joinButtonText, community.isJoined && styles.joinButtonTextJoined]}>
                {community.isJoined ? 'Joined' : 'Join'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.communityName} numberOfLines={2}>
            {community.name}
          </Text>
          <Text style={styles.communityDescription} numberOfLines={2}>
            {community.description}
          </Text>

          <View style={styles.communityStats}>
            <View style={styles.stat}>
              <Ionicons name="people" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statText}>{community.members.toLocaleString()}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="chatbubbles" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statText}>{community.posts}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="flash" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statText}>{community.activeToday} active</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const PostCard = ({ post }: { post: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.authorAvatar}>
          <Text style={styles.avatarText}>{post.author.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.postInfo}>
          <Text style={styles.authorName}>{post.author}</Text>
          <Text style={styles.timestamp}>{post.timestamp}</Text>
        </View>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name={post.isLiked ? 'heart' : 'heart-outline'} size={20} color={post.isLiked ? '#ef4444' : '#6b7280'} />
          <Text style={styles.actionText}>{post.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#10b981', '#059669']} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Farming Communities</Text>
            <Text style={styles.headerSubtitle}>Connect, share and grow together</Text>
          </View>

          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search communities..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9ca3af"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity onPress={() => setActiveTab('discover')} style={[styles.tab, activeTab === 'discover' && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === 'discover' && styles.tabTextActive]}>Discover</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveTab('joined')} style={[styles.tab, activeTab === 'joined' && styles.tabActive]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.tabText, activeTab === 'joined' && styles.tabTextActive]}>My Communities</Text>
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{communities.filter(c => c.isJoined).length}</Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveTab('create')} style={[styles.tab, activeTab === 'create' && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === 'create' && styles.tabTextActive]}>Create</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ListHeaderComponent={
            <>
              <View style={styles.categoryRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollContent}>
                  {categories.map(cat => {
                    const active = selectedCategory === cat.key;
                    return (
                      <TouchableOpacity
                        key={cat.key}
                        style={[styles.categoryChip, active && styles.categoryChipActive]}
                        onPress={() => setSelectedCategory(cat.key)}
                      >
                        <Ionicons name={cat.icon as any} size={14} color={active ? '#fff' : '#10b981'} />
                        <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{cat.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {activeTab === 'create' && (
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                  <LinearGradient colors={['#fef3c7', '#fde68a']} style={styles.createCard}>
                    <Ionicons name="add-circle" size={36} color="#f59e0b" />
                    <Text style={styles.createTitle}>Create Your Community</Text>
                    <Text style={styles.createDescription}>
                      Start a new farming community and connect with farmers who share your interests.
                    </Text>
                    <TouchableOpacity style={styles.createButton} onPress={() => router.push('/community/create')}>
                      <Text style={styles.createButtonText}>Get Started</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </Animated.View>
              )}

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{activeTab === 'joined' ? 'Your Communities' : 'Communities to Discover'}</Text>
                <TouchableOpacity onPress={() => { /* optional: open filter modal */ }}>
                  <Text style={styles.seeAllText}>Filter</Text>
                </TouchableOpacity>
              </View>
            </>
          }
          data={filteredCommunities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CommunityCard community={item} />}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No communities found</Text>
              <Text style={styles.emptySubtext}>Try a different filter or create a community</Text>
            </View>
          }
        />

        {activeTab === 'joined' && recentPosts.length > 0 && (
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            {recentPosts.map(p => (
              <PostCard key={p.id} post={p} />
            ))}
          </View>
        )}

        <View style={{ height: 60 }} />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 18,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 6,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  notificationButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fbbf24',
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#111827',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#10b981',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#10b981',
  },
  tabBadge: {
    backgroundColor: '#10b981',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    marginTop: -2,
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  // Categories (horizontal)
  categoryRow: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  categoryScrollContent: {
    alignItems: 'center',
    paddingRight: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1fae5',
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10b981',
    marginLeft: 6,
  },
  categoryTextActive: {
    color: '#fff',
  },

  // List content & columns
  listContent: {
    paddingHorizontal: CARD_HORIZONTAL_PADDING,
    paddingTop: 8,
    paddingBottom: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: CARD_SPACING,
  },

  // Community Card
  communityCard: {
    borderRadius: 14,
    overflow: 'hidden',
    // width set inline for two-column consistency
    // fixed height to keep consistent visuals
    height: 200,
    marginBottom: 8,
    elevation: 3,
  },
  communityGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  communityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  communityIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  joinButtonJoined: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  joinButtonText: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '700',
  },
  joinButtonTextJoined: {
    color: '#fff',
  },
  communityName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
  },
  communityDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
  },
  communityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },

  // Create card
  createCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  createTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#92400e',
    marginTop: 8,
  },
  createDescription: {
    fontSize: 13,
    color: '#78350f',
    textAlign: 'center',
    marginTop: 6,
  },
  createButton: {
    marginTop: 12,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '700',
  },

  // Section header (for list)
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  seeAllText: {
    color: '#10b981',
    fontWeight: '700',
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    padding: 28,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '700',
  },
  emptySubtext: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 6,
    textAlign: 'center',
  },

  // Activity / Posts
  activitySection: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
  },
  postInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  timestamp: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  postContent: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  actionText: {
    marginLeft: 6,
    color: '#6b7280',
    fontSize: 13,
  },
});

export default CommunityScreen;
