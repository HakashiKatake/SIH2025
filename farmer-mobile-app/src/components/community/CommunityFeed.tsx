import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  StyleSheet,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCommunityStore, PostCategory } from '../../store/communityStore';
import { LoadingSpinner } from '../LoadingSpinner';
import { ErrorMessage } from '../ErrorMessage';
import { IllustrationPlaceholder } from '../ui/IllustrationPlaceholder';
import { useTranslation } from '../../hooks/useTranslation';

const { width } = Dimensions.get('window');

interface CommunityFeedProps {
  onPostPress: (postId: string) => void;
  onCreatePost: () => void;
  activeTab?: string;
  searchQuery?: string;
  showHeader?: boolean;
  showSearch?: boolean;
}

const categoryLabels = {
  all: 'All Posts',
  [PostCategory.QUESTION]: 'Questions',
  [PostCategory.TIP]: 'Tips',
  [PostCategory.SUCCESS_STORY]: 'Success Stories',
  [PostCategory.PROBLEM]: 'Problems',
  [PostCategory.NEWS]: 'News',
};

const categoryColors = {
  [PostCategory.QUESTION]: '#FF6B6B',
  [PostCategory.TIP]: '#4ECDC4',
  [PostCategory.SUCCESS_STORY]: '#45B7D1',
  [PostCategory.PROBLEM]: '#FFA07A',
  [PostCategory.NEWS]: '#98D8C8',
};

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  onPostPress,
  onCreatePost,
  activeTab = 'Discussion',
  searchQuery: initialSearchQuery = '',
  showHeader = true,
  showSearch = true,
}) => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [activeTabState, setActiveTabState] = useState(activeTab);

  const tabs = [
    { key: "announcements", label: t('community.announcements') },
    { key: "showcase", label: t('community.showcase') },
    { key: "discussion", label: t('community.discussion') },
    { key: "tips", label: t('community.tipsAdvice') }
  ];
  
  // Sample post for UI display
  const samplePost = {
    id: "sample-1",
    author: "Mahesh Rajput",
    timeAgo: "2h ago",
    content: "Just tried drip irrigation for my pomegranates. Saved water and crops are looking healthier! Anyone else tried this??",
    likes: 12,
    shares: 3,
    comments: 8,
    avatar: "https://example.com/avatar.png",
    location: "Gampaha, Pomegranates",
  };

  const {
    posts,
    loading,
    error,
    selectedCategory,
    fetchPosts,
    likePost,
    setSelectedCategory,
    clearError,
  } = useCommunityStore();

  useEffect(() => {
    fetchPosts();
  }, []);

  // Filter posts based on active tab and search query
  let filteredPosts = posts;

  // Filter by tab
  if (activeTab !== 'all') {
    const tabCategoryMap = {
      questions: PostCategory.QUESTION,
      tips: PostCategory.TIP,
      market: PostCategory.SUCCESS_STORY, // Using success story for market posts
    };
    
    const categoryFilter = tabCategoryMap[activeTab as keyof typeof tabCategoryMap];
    if (categoryFilter) {
      filteredPosts = filteredPosts.filter(post => post.category === categoryFilter);
    }
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredPosts = filteredPosts.filter(post =>
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      post.authorName.toLowerCase().includes(query) ||
      post.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }

  // Apply category filter if selected
  if (selectedCategory !== 'all') {
    filteredPosts = filteredPosts.filter(post => post.category === selectedCategory);
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleLikePost = async (postId: string) => {
    await likePost(postId);
  };

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
  };

  const handleTabPress = (tab: string) => {
    setActiveTabState(tab);
  };

  if (loading && posts.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      {showHeader && (
        <View style={styles.header}>
          {/* <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#21825C" />
          </TouchableOpacity> */}
          <View style={styles.headerContent}>
            <Image 
              source={require("../../../assets/images/community.png")} 
              style={styles.communityImage}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>Community</Text>
          </View>
        </View>
      )}

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search discussions, tips and farmers"
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </View>
        </View>
      )}

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContainer}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, activeTabState === tab.key && styles.activeTabItem]}
              onPress={() => handleTabPress(tab.key)}
            >
              <Text style={[styles.tabText, activeTabState === tab.key && styles.activeTabText]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {error && (
        <ErrorMessage 
          message={error} 
          onDismiss={clearError}
        />
      )}

      {/* Posts List */}
      <ScrollView
        style={styles.postsList}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={() => fetchPosts('', 1)} />
        }
      >
        {/* Sample Post */}
        <View style={styles.postContainer}>
          <View style={styles.postHeader}>
            <View style={styles.authorInfo}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{ uri: samplePost.avatar }}
                  style={styles.avatar}
                  defaultSource={require("../../../assets/images/avatar-placeholder.png")}
                />
              </View>
              <View style={styles.authorDetails}>
                <Text style={styles.authorName}>{samplePost.author}</Text>
                <Text style={styles.authorLocation}>{samplePost.location}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.postContent}>{samplePost.content}</Text>

          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={20} color="#21825C" />
              <Text style={styles.actionText}>Like</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={20} color="#21825C" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={20} color="#21825C" />
              <Text style={styles.actionText}>Comment</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Store Posts */}
        {filteredPosts.map((post) => (
          <TouchableOpacity
            key={post.id}
            style={styles.postCard}
            onPress={() => onPostPress(post.id)}
          >
            {/* Post Header */}
            <View style={styles.postHeader}>
              <View style={styles.authorInfo}>
                <Image
                  source={{ uri: post.authorAvatar || 'https://via.placeholder.com/40' }}
                  style={styles.authorAvatar}
                />
                <View style={styles.authorDetails}>
                  <View style={styles.authorNameRow}>
                    <Text style={styles.authorName}>{post.authorName}</Text>
                    {post.isExpertVerified && (
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    )}
                    {post.authorRole === 'expert' && (
                      <View style={styles.expertBadge}>
                        <Text style={styles.expertBadgeText}>Expert</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.postTime}>{formatTimeAgo(post.createdAt)}</Text>
                </View>
              </View>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: categoryColors[post.category] },
                ]}
              >
                <Text style={styles.categoryBadgeText}>
                  {categoryLabels[post.category]}
                </Text>
              </View>
            </View>

            {/* Post Content */}
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent} numberOfLines={3}>
              {post.content}
            </Text>

            {/* Post Images */}
            {post.photos.length > 0 && (
              <ScrollView horizontal style={styles.postImages}>
                {post.photos.map((photo, index) => (
                  <Image
                    key={index}
                    source={{ uri: photo }}
                    style={styles.postImage}
                  />
                ))}
              </ScrollView>
            )}

            {/* Post Tags */}
            {post.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {post.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Post Actions */}
            <View style={styles.postActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleLikePost(post.id)}
              >
                <Ionicons name="heart-outline" size={20} color="#666" />
                <Text style={styles.actionText}>{post.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onPostPress(post.id)}
              >
                <Ionicons name="chatbubble-outline" size={20} color="#666" />
                <Text style={styles.actionText}>{post.comments.length}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={20} color="#666" />
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {filteredPosts.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>
              No posts found in this category
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={onCreatePost}>
              <Text style={styles.emptyStateButtonText}>Create First Post</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.floatingActionButton} onPress={onCreatePost}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Text */}
      <View style={styles.bottomTextContainer}>
        <Text style={styles.bottomText}>Join discussion and connect with farmers like you!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBFCE7',
  },
  // Header styles
  header: {
    backgroundColor: '#EBFCE7',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 20,
  },
  communityImage: {
    width: 200,
    height: 120,
    marginBottom: 12,
  },
  illustrationContainer: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#21825C',
  },
  // Search styles
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#EBFCE7',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  // Tab styles
  tabContainer: {
    backgroundColor: '#fff',
    paddingTop: 16,
  },
  tabScrollContainer: {
    paddingHorizontal: 16,
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 16,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: '#21825C',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#21825C',
    fontWeight: '600',
  },
  // Post container styles
  postContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  postHeader: {
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  authorLocation: {
    fontSize: 14,
    color: '#666',
  },
  postContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#21825C',
    marginLeft: 6,
    fontWeight: '500',
  },
  categoryFilterContent: {
    paddingHorizontal: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  createPostText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  postsList: {
    flex: 1,
  },
  postCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  // Additional post-related styles
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expertBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  expertBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  postTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  postImages: {
    marginBottom: 12,
  },
  postImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyStateButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Floating action button
  floatingActionButton: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#21825C',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  // Bottom text
  bottomTextContainer: {
    backgroundColor: '#EBFCE7',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 16,
    color: '#21825C',
    textAlign: 'center',
    fontWeight: '500',
  },
});