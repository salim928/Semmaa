'use client'

// app/farmer/community/page.tsx – Full-featured community hub with real functionality

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

interface Comment {
  id: string
  author: string
  content: string
  timestamp: string
  likes: number
}

interface Community {
  id: string
  name: string
  description: string
  members: number
  category: string
  isJoined: boolean
  posts: number
  activeToday: number
  gradient: string
  icon: string
}

interface Post {
  id: string
  communityId: string
  communityName?: string
  author: string
  authorAvatar?: string
  content: string
  timestamp: string
  likes: number
  comments: Comment[]
  isLiked: boolean
  image?: string
}

const CATEGORIES = [
  { key: 'all', label: 'All', icon: '📱' },
  { key: 'crops', label: 'Crops', icon: '🌱' },
  { key: 'livestock', label: 'Livestock', icon: '🐄' },
  { key: 'techniques', label: 'Techniques', icon: '🔧' },
  { key: 'market', label: 'Market', icon: '💰' },
  { key: 'social', label: 'Social', icon: '👥' },
]

const INITIAL_COMMUNITIES: Community[] = [
  {
    id: '1',
    name: 'Maize Farmers Ghana',
    description: 'Connect with maize farmers across Ghana. Share tips, market prices, and experiences.',
    members: 2450,
    category: 'crops',
    isJoined: true,
    posts: 156,
    activeToday: 45,
    gradient: 'from-emerald-500 to-emerald-600',
    icon: '🌽',
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
    gradient: 'from-violet-500 to-violet-600',
    icon: '🌿',
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
    gradient: 'from-amber-500 to-amber-600',
    icon: '🐔',
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
    gradient: 'from-pink-500 to-pink-600',
    icon: '👩‍🌾',
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
    gradient: 'from-blue-500 to-blue-600',
    icon: '📈',
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
    gradient: 'from-cyan-500 to-cyan-600',
    icon: '💧',
  },
]

const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    communityId: '1',
    communityName: 'Maize Farmers Ghana',
    author: 'Kwame Mensah',
    content: 'Just harvested my maize crop! The yield this season is amazing thanks to the new fertilizer technique shared here. 🌽',
    timestamp: '2 hours ago',
    likes: 45,
    comments: [
      { id: 'c1', author: 'Ama Darko', content: 'Congratulations! What fertilizer did you use?', timestamp: '1 hour ago', likes: 5 },
      { id: 'c2', author: 'Kofi B.', content: 'Amazing yield! Keep it up 💪', timestamp: '30 min ago', likes: 2 },
    ],
    isLiked: false,
  },
  {
    id: '2',
    communityId: '2',
    communityName: 'Organic Farming Network',
    author: 'Ama Darko',
    content: 'Starting my organic tomato garden today. Any tips for pest control without chemicals? 🍅',
    timestamp: '5 hours ago',
    likes: 32,
    comments: [
      { id: 'c3', author: 'Nana Yaw', content: 'Try neem oil spray! Works wonders for me.', timestamp: '4 hours ago', likes: 8 },
    ],
    isLiked: true,
  },
  {
    id: '3',
    communityId: '1',
    communityName: 'Maize Farmers Ghana',
    author: 'Kofi Asante',
    content: 'The rain has been good this week. Perfect time for planting the second batch of maize.',
    timestamp: '1 day ago',
    likes: 28,
    comments: [],
    isLiked: false,
  },
]

export default function FarmerCommunityPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'discover' | 'joined' | 'feed'>('discover')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [communities, setCommunities] = useState<Community[]>(INITIAL_COMMUNITIES)
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS)
  const [newPostContent, setNewPostContent] = useState('')
  const [selectedCommunityForPost, setSelectedCommunityForPost] = useState('')
  
  // View states
  const [viewingCommunity, setViewingCommunity] = useState<Community | null>(null)
  const [viewingPost, setViewingPost] = useState<Post | null>(null)
  const [newComment, setNewComment] = useState('')
  const [isPosting, setIsPosting] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const savedCommunities = localStorage.getItem('semmaai_communities')
    const savedPosts = localStorage.getItem('semmaai_posts')
    
    if (savedCommunities) {
      try {
        setCommunities(JSON.parse(savedCommunities))
      } catch {
        // Use initial data
      }
    }
    
    if (savedPosts) {
      try {
        setPosts(JSON.parse(savedPosts))
      } catch {
        // Use initial data
      }
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('semmaai_communities', JSON.stringify(communities))
  }, [communities])

  useEffect(() => {
    localStorage.setItem('semmaai_posts', JSON.stringify(posts))
  }, [posts])

  const handleJoinCommunity = (communityId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCommunities(prev =>
      prev.map(c =>
        c.id === communityId
          ? { ...c, isJoined: !c.isJoined, members: c.isJoined ? c.members - 1 : c.members + 1 }
          : c
      )
    )
    // Update viewing community if active
    if (viewingCommunity?.id === communityId) {
      setViewingCommunity(prev => prev ? {
        ...prev,
        isJoined: !prev.isJoined,
        members: prev.isJoined ? prev.members - 1 : prev.members + 1
      } : null)
    }
  }

  const handleLikePost = (postId: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    )
    // Also update if viewing
    if (viewingPost?.id === postId) {
      setViewingPost(prev => prev ? { 
        ...prev, 
        isLiked: !prev.isLiked, 
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1 
      } : null)
    }
  }

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return
    setIsPosting(true)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const targetCommunity = communities.find(c => c.id === selectedCommunityForPost) || communities.find(c => c.isJoined)
    
    const newPost: Post = {
      id: Date.now().toString(),
      communityId: targetCommunity?.id || '1',
      communityName: targetCommunity?.name || 'General',
      author: user?.name || 'You',
      content: newPostContent,
      timestamp: 'Just now',
      likes: 0,
      comments: [],
      isLiked: false,
    }
    setPosts(prev => [newPost, ...prev])
    setNewPostContent('')
    setSelectedCommunityForPost('')
    setIsPosting(false)
  }

  const handleAddComment = () => {
    if (!newComment.trim() || !viewingPost) return
    
    const comment: Comment = {
      id: Date.now().toString(),
      author: user?.name || 'You',
      content: newComment,
      timestamp: 'Just now',
      likes: 0,
    }
    
    setPosts(prev =>
      prev.map(p =>
        p.id === viewingPost.id
          ? { ...p, comments: [...p.comments, comment] }
          : p
      )
    )
    
    setViewingPost(prev => prev ? { ...prev, comments: [...prev.comments, comment] } : null)
    setNewComment('')
  }

  const joinedCommunities = communities.filter(c => c.isJoined)
  
  const filteredCommunities = communities.filter((c) => {
    const q = search.trim().toLowerCase()
    const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    const matchesCategory = selectedCategory === 'all' || c.category === selectedCategory
    const matchesTab = activeTab === 'discover' ? !c.isJoined : c.isJoined
    return matchesSearch && matchesCategory && (activeTab === 'feed' ? c.isJoined : matchesTab)
  })

  // Get posts from joined communities for feed
  const feedPosts = posts.filter(p => {
    const community = communities.find(c => c.id === p.communityId)
    return community?.isJoined
  })

  // Get posts for a specific community
  const getCommunityPosts = (communityId: string) => posts.filter(p => p.communityId === communityId)

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <section>
        <h1 className="text-2xl font-bold text-emerald-950 sm:text-3xl">Community Hub</h1>
        <p className="mt-1 text-sm text-emerald-600">Connect with fellow farmers across Ghana</p>
      </section>

      {/* Stats Banner */}
      <section className="rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 p-4 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{joinedCommunities.length}</p>
            <p className="text-xs text-emerald-100">Communities Joined</p>
          </div>
          <div className="h-12 w-px bg-white/20" />
          <div>
            <p className="text-2xl font-bold">{feedPosts.length}</p>
            <p className="text-xs text-emerald-100">Posts in Feed</p>
          </div>
          <div className="h-12 w-px bg-white/20" />
          <div>
            <p className="text-2xl font-bold">{joinedCommunities.reduce((a, c) => a + c.members, 0).toLocaleString()}</p>
            <p className="text-xs text-emerald-100">Total Members</p>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="flex gap-2 overflow-x-auto pb-2">
        {(['discover', 'joined', 'feed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition ${
              activeTab === tab
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
            }`}
          >
            {tab === 'discover' && '🔍 '}
            {tab === 'joined' && '✓ '}
            {tab === 'feed' && '📰 '}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'joined' && ` (${joinedCommunities.length})`}
          </button>
        ))}
      </section>

      {/* Search */}
      {activeTab !== 'feed' && (
        <section className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search communities..."
            className="w-full rounded-2xl border border-emerald-100 bg-white py-3 pl-12 pr-4 text-sm text-emerald-900 placeholder:text-emerald-400 focus:border-emerald-300 focus:outline-none shadow-sm"
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-600"
            >
              ✕
            </button>
          )}
        </section>
      )}

      {/* Categories */}
      {activeTab !== 'feed' && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                selectedCategory === cat.key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Feed Tab Content */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          {/* Create Post */}
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-bold text-white">
                {user?.name?.charAt(0) || 'Y'}
              </div>
              <div className="flex-1">
                <select
                  value={selectedCommunityForPost}
                  onChange={(e) => setSelectedCommunityForPost(e.target.value)}
                  className="w-full rounded-lg border border-emerald-100 px-3 py-1.5 text-xs text-emerald-700 focus:border-emerald-300 focus:outline-none"
                >
                  <option value="">Select community...</option>
                  {joinedCommunities.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share something with the community..."
              className="w-full resize-none rounded-xl border border-emerald-100 p-3 text-sm text-emerald-950 placeholder:text-emerald-400 focus:border-emerald-300 focus:outline-none"
              rows={3}
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="flex gap-2">
                <button className="rounded-lg bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100 transition-colors">
                  📷
                </button>
                <button className="rounded-lg bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100 transition-colors">
                  📍
                </button>
              </div>
              <button
                onClick={handleCreatePost}
                disabled={!newPostContent.trim() || isPosting}
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300 transition-colors flex items-center gap-2"
              >
                {isPosting ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Posting...
                  </>
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </div>

          {/* Posts */}
          {feedPosts.length === 0 ? (
            <div className="rounded-2xl border border-emerald-100 bg-white p-8 text-center">
              <p className="text-4xl mb-2">👥</p>
              <p className="text-sm font-medium text-emerald-900">No posts yet</p>
              <p className="text-xs text-emerald-500 mt-1">Join communities to see posts in your feed</p>
              <button
                onClick={() => setActiveTab('discover')}
                className="mt-4 rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-200 transition-colors"
              >
                Discover Communities
              </button>
            </div>
          ) : (
            feedPosts.map((post) => (
              <article
                key={post.id}
                onClick={() => setViewingPost(post)}
                className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-bold text-white shrink-0">
                    {post.author.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-emerald-950">{post.author}</p>
                      <span className="text-xs text-emerald-400">•</span>
                      <span className="text-xs text-emerald-500">{post.timestamp}</span>
                    </div>
                    {post.communityName && (
                      <p className="text-xs text-emerald-500 mt-0.5">in {post.communityName}</p>
                    )}
                    <p className="mt-2 text-sm text-emerald-800">{post.content}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <button
                        onClick={(e) => handleLikePost(post.id, e)}
                        className={`flex items-center gap-1 text-sm transition-colors ${
                          post.isLiked ? 'text-rose-500' : 'text-emerald-500 hover:text-emerald-700'
                        }`}
                      >
                        {post.isLiked ? '❤️' : '🤍'} {post.likes}
                      </button>
                      <button className="flex items-center gap-1 text-sm text-emerald-500 hover:text-emerald-700">
                        💬 {post.comments.length}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          if (navigator.share) {
                            navigator.share({ text: post.content })
                          } else {
                            navigator.clipboard.writeText(post.content)
                          }
                        }}
                        className="flex items-center gap-1 text-sm text-emerald-500 hover:text-emerald-700"
                      >
                        🔗 Share
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* Communities Grid */}
      {activeTab !== 'feed' && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-emerald-900">
              {activeTab === 'discover' ? 'Discover communities' : 'Your communities'}
            </p>
            <span className="text-xs text-emerald-500">
              {filteredCommunities.length} communities
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredCommunities.map((c) => (
              <article
                key={c.id}
                onClick={() => setViewingCommunity(c)}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.gradient} p-4 text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-pointer`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl">
                    {c.icon}
                  </div>
                  <button
                    onClick={(e) => handleJoinCommunity(c.id, e)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      c.isJoined
                        ? 'bg-white/30 text-white hover:bg-white/40'
                        : 'bg-white text-emerald-800 hover:bg-emerald-50'
                    }`}
                  >
                    {c.isJoined ? '✓ Joined' : 'Join'}
                  </button>
                </div>
                <h2 className="mt-3 text-base font-bold">{c.name}</h2>
                <p className="mt-1 line-clamp-2 text-xs text-white/80">{c.description}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-white/90">
                  <span>👥 {c.members.toLocaleString()}</span>
                  <span>📝 {c.posts} posts</span>
                  <span>⚡ {c.activeToday} active</span>
                </div>
              </article>
            ))}
            {filteredCommunities.length === 0 && (
              <div className="col-span-2 rounded-2xl border border-emerald-100 bg-white p-8 text-center">
                <p className="text-4xl mb-2">🔍</p>
                <p className="text-sm font-medium text-emerald-900">No communities found</p>
                <p className="text-xs text-emerald-500 mt-1">Try a different search or category</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Community Detail Modal */}
      {viewingCommunity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className={`bg-gradient-to-br ${viewingCommunity.gradient} p-6 text-white`}>
              <div className="flex items-start justify-between mb-4">
                <button
                  onClick={() => setViewingCommunity(null)}
                  className="text-white/80 hover:text-white text-xl"
                >
                  ←
                </button>
                <button
                  onClick={() => handleJoinCommunity(viewingCommunity.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    viewingCommunity.isJoined
                      ? 'bg-white/30 text-white hover:bg-white/40'
                      : 'bg-white text-emerald-800 hover:bg-emerald-50'
                  }`}
                >
                  {viewingCommunity.isJoined ? '✓ Joined' : 'Join Community'}
                </button>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl">
                  {viewingCommunity.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{viewingCommunity.name}</h2>
                  <p className="text-sm text-white/80 mt-1">{viewingCommunity.members.toLocaleString()} members</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-white/90">{viewingCommunity.description}</p>
            </div>
            
            {/* Stats */}
            <div className="flex border-b border-emerald-100">
              <div className="flex-1 text-center py-3">
                <p className="text-lg font-bold text-emerald-900">{viewingCommunity.posts}</p>
                <p className="text-xs text-emerald-500">Posts</p>
              </div>
              <div className="w-px bg-emerald-100" />
              <div className="flex-1 text-center py-3">
                <p className="text-lg font-bold text-emerald-900">{viewingCommunity.activeToday}</p>
                <p className="text-xs text-emerald-500">Active Today</p>
              </div>
              <div className="w-px bg-emerald-100" />
              <div className="flex-1 text-center py-3">
                <p className="text-lg font-bold text-emerald-900">{CATEGORIES.find(c => c.key === viewingCommunity.category)?.icon}</p>
                <p className="text-xs text-emerald-500">{CATEGORIES.find(c => c.key === viewingCommunity.category)?.label}</p>
              </div>
            </div>
            
            {/* Posts */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <h3 className="text-sm font-semibold text-emerald-900">Recent Posts</h3>
              {getCommunityPosts(viewingCommunity.id).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-3xl mb-2">📝</p>
                  <p className="text-sm text-emerald-600">No posts yet</p>
                  {viewingCommunity.isJoined && (
                    <p className="text-xs text-emerald-500 mt-1">Be the first to post!</p>
                  )}
                </div>
              ) : (
                getCommunityPosts(viewingCommunity.id).map(post => (
                  <div
                    key={post.id}
                    onClick={() => {
                      setViewingCommunity(null)
                      setViewingPost(post)
                    }}
                    className="rounded-xl border border-emerald-100 p-3 hover:bg-emerald-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                        {post.author.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-emerald-900">{post.author}</span>
                      <span className="text-xs text-emerald-500">{post.timestamp}</span>
                    </div>
                    <p className="text-sm text-emerald-800 line-clamp-2">{post.content}</p>
                    <div className="flex gap-4 mt-2 text-xs text-emerald-500">
                      <span>{post.isLiked ? '❤️' : '🤍'} {post.likes}</span>
                      <span>💬 {post.comments.length}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal with Comments */}
      {viewingPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-emerald-100">
              <button
                onClick={() => setViewingPost(null)}
                className="text-emerald-600 hover:text-emerald-800 font-medium"
              >
                ← Back
              </button>
              <h3 className="text-sm font-semibold text-emerald-900">Post</h3>
              <div className="w-16" />
            </div>
            
            {/* Post Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 border-b border-emerald-100">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-lg font-bold text-white shrink-0">
                    {viewingPost.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-900">{viewingPost.author}</p>
                    <p className="text-xs text-emerald-500">{viewingPost.timestamp} {viewingPost.communityName && `• ${viewingPost.communityName}`}</p>
                  </div>
                </div>
                <p className="mt-4 text-emerald-800">{viewingPost.content}</p>
                <div className="flex gap-6 mt-4 pt-4 border-t border-emerald-100">
                  <button
                    onClick={() => handleLikePost(viewingPost.id)}
                    className={`flex items-center gap-2 ${viewingPost.isLiked ? 'text-rose-500' : 'text-emerald-600'}`}
                  >
                    {viewingPost.isLiked ? '❤️' : '🤍'} <span className="text-sm">{viewingPost.likes} Likes</span>
                  </button>
                  <span className="flex items-center gap-2 text-emerald-600">
                    💬 <span className="text-sm">{viewingPost.comments.length} Comments</span>
                  </span>
                </div>
              </div>
              
              {/* Comments */}
              <div className="p-4 space-y-4">
                <h4 className="text-sm font-semibold text-emerald-900">Comments</h4>
                {viewingPost.comments.length === 0 ? (
                  <p className="text-sm text-emerald-500 text-center py-4">No comments yet. Be the first!</p>
                ) : (
                  viewingPost.comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700 shrink-0">
                        {comment.author.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="bg-emerald-50 rounded-xl p-3">
                          <p className="text-xs font-semibold text-emerald-900">{comment.author}</p>
                          <p className="text-sm text-emerald-800 mt-1">{comment.content}</p>
                        </div>
                        <div className="flex gap-4 mt-1 px-3">
                          <span className="text-xs text-emerald-500">{comment.timestamp}</span>
                          <button className="text-xs text-emerald-500 hover:text-emerald-700">Like</button>
                          <button className="text-xs text-emerald-500 hover:text-emerald-700">Reply</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Comment Input */}
            <div className="p-4 border-t border-emerald-100 bg-white">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {user?.name?.charAt(0) || 'Y'}
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 rounded-full border border-emerald-200 px-4 py-2 text-sm text-emerald-900 placeholder:text-emerald-400 focus:border-emerald-400 focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


