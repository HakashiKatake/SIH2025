import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCommunityStore, PostCategory } from '../../store/communityStore';
import { LoadingSpinner } from '../LoadingSpinner';

interface ExpertAdviceProps {
  onPostPress: (postId: string) => void;
}

// Mock expert advice data
const expertAdviceCategories = [
  {
    id: 'crop-management',
    title: 'Crop Management',
    icon: 'leaf-outline',
    color: '#4CAF50',
    description: 'Best practices for growing healthy crops',
  },
  {
    id: 'pest-control',
    title: 'Pest Control',
    icon: 'bug-outline',
    color: '#FF9800',
    description: 'Effective pest management strategies',
  },
  {
    id: 'soil-health',
    title: 'Soil Health',
    icon: 'earth-outline',
    color: '#8BC34A',
    description: 'Maintaining and improving soil quality',
  },
  {
    id: 'weather-planning',
    title: 'Weather Planning',
    icon: 'cloud-outline',
    color: '#2196F3',
    description: 'Weather-based farming decisions',
  },
];

const featuredExperts = [
  {
    id: 'expert1',
    name: 'Dr. Suresh Patel',
    title: 'Agricultural Scientist',
    specialization: 'Crop Protection',
    avatar: 'https://via.placeholder.com/60',
    rating: 4.9,
    posts: 45,
    followers: 1200,
  },
  {
    id: 'expert2',
    name: 'Dr. Priya Sharma',
    title: 'Soil Scientist',
    specialization: 'Soil Health & Nutrition',
    avatar: 'https://via.placeholder.com/60',
    rating: 4.8,
    posts: 32,
    followers: 980,
  },
  {
    id: 'expert3',
    name: 'Prof. Rajesh Kumar',
    title: 'Entomologist',
    specialization: 'Integrated Pest Management',
    avatar: 'https://via.placeholder.com/60',
    rating: 4.9,
    posts: 28,
    followers: 850,
  },
];

export const ExpertAdvice: React.FC<ExpertAdviceProps> = ({ onPostPress }) => {
  const { posts, loading, fetchPosts } = useCommunityStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  // Filter expert-verified posts
  const expertPosts = posts.filter(post => 
    post.isExpertVerified || post.authorRole === 'expert'
  );

  const filteredPosts = selectedCategory
    ? expertPosts.filter(post => {
        // Simple category matching based on tags or content
        const categoryKeywords = {
          'crop-management': ['crop', 'farming', 'cultivation', 'growth'],
          'pest-control': ['pest', 'insect', 'disease', 'control'],
          'soil-health': ['soil', 'nutrition', 'fertilizer', 'compost'],
          'weather-planning': ['weather', 'rain', 'drought', 'season'],
        };
        
        const keywords = categoryKeywords[selectedCategory as keyof typeof categoryKeywords] || [];
        return keywords.some(keyword => 
          post.title.toLowerCase().includes(keyword) ||
          post.content.toLowerCase().includes(keyword) ||
          post.tags.some(tag => tag.toLowerCase().includes(keyword))
        );
      })
    : expertPosts;

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading && expertPosts.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="school-outline" size={24} color="#4CAF50" />
          <Text style={styles.headerTitle}>Expert Advice</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Verified agricultural knowledge from certified experts
        </Text>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse by Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoriesContainer}>
            <TouchableOpacity
              style={[
                styles.categoryCard,
                selectedCategory === null && styles.categoryCardActive,
              ]}
              onPress={() => setSelectedCategory(null)}
            >
              <Ionicons name="apps-outline" size={24} color="#666" />
              <Text style={styles.categoryCardTitle}>All</Text>
            </TouchableOpacity>
            {expertAdviceCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  selectedCategory === category.id && styles.categoryCardActive,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={24}
                  color={selectedCategory === category.id ? '#fff' : category.color}
                />
                <Text
                  style={[
                    styles.categoryCardTitle,
                    selectedCategory === category.id && styles.categoryCardTitleActive,
                  ]}
                >
                  {category.title}
                </Text>
                <Text
                  style={[
                    styles.categoryCardDescription,
                    selectedCategory === category.id && styles.categoryCardDescriptionActive,
                  ]}
                >
                  {category.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Featured Experts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Experts</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.expertsContainer}>
            {featuredExperts.map((expert) => (
              <View key={expert.id} style={styles.expertCard}>
                <Image source={{ uri: expert.avatar }} style={styles.expertAvatar} />
                <Text style={styles.expertName}>{expert.name}</Text>
                <Text style={styles.expertTitle}>{expert.title}</Text>
                <Text style={styles.expertSpecialization}>{expert.specialization}</Text>
                <View style={styles.expertStats}>
                  <View style={styles.expertStat}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.expertStatText}>{expert.rating}</Text>
                  </View>
                  <View style={styles.expertStat}>
                    <Ionicons name="document-text-outline" size={12} color="#666" />
                    <Text style={styles.expertStatText}>{expert.posts}</Text>
                  </View>
                  <View style={styles.expertStat}>
                    <Ionicons name="people-outline" size={12} color="#666" />
                    <Text style={styles.expertStatText}>{expert.followers}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Expert Posts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {selectedCategory 
            ? `${expertAdviceCategories.find(c => c.id === selectedCategory)?.title} Advice`
            : 'Latest Expert Advice'
          }
        </Text>
        
        {filteredPosts.map((post) => (
          <TouchableOpacity
            key={post.id}
            style={styles.postCard}
            onPress={() => onPostPress(post.id)}
          >
            <View style={styles.postHeader}>
              <View style={styles.postAuthorInfo}>
                <Image
                  source={{ uri: post.authorAvatar || 'https://via.placeholder.com/40' }}
                  style={styles.postAuthorAvatar}
                />
                <View style={styles.postAuthorDetails}>
                  <View style={styles.postAuthorNameRow}>
                    <Text style={styles.postAuthorName}>{post.authorName}</Text>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <View style={styles.expertBadge}>
                      <Text style={styles.expertBadgeText}>Expert</Text>
                    </View>
                  </View>
                  <Text style={styles.postTime}>{formatTimeAgo(post.createdAt)}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent} numberOfLines={3}>
              {post.content}
            </Text>

            {post.photos.length > 0 && (
              <Image
                source={{ uri: post.photos[0] }}
                style={styles.postImage}
              />
            )}

            {post.tags.length > 0 && (
              <View style={styles.postTags}>
                {post.tags.slice(0, 3).map((tag, index) => (
                  <View key={index} style={styles.postTag}>
                    <Text style={styles.postTagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.postStats}>
              <View style={styles.postStat}>
                <Ionicons name="heart-outline" size={16} color="#666" />
                <Text style={styles.postStatText}>{post.likes}</Text>
              </View>
              <View style={styles.postStat}>
                <Ionicons name="chatbubble-outline" size={16} color="#666" />
                <Text style={styles.postStatText}>{post.comments.length}</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
                <Text style={styles.verifiedBadgeText}>Verified</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredPosts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="school-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>
              No expert advice found in this category
            </Text>
            <Text style={styles.emptyStateSubtext}>
              Try selecting a different category or check back later
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  categoryCard: {
    width: 140,
    padding: 16,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryCardActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  categoryCardTitleActive: {
    color: '#fff',
  },
  categoryCardDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 16,
  },
  categoryCardDescriptionActive: {
    color: '#fff',
  },
  expertsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  expertCard: {
    width: 160,
    padding: 16,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expertAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  expertName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  expertTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  expertSpecialization: {
    fontSize: 11,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  expertStats: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-between',
    width: '100%',
  },
  expertStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expertStatText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 2,
  },
  postCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    marginBottom: 12,
  },
  postAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAuthorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postAuthorDetails: {
    flex: 1,
  },
  postAuthorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAuthorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 4,
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
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  postTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  postTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  postTagText: {
    fontSize: 12,
    color: '#666',
  },
  postStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postStatText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedBadgeText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});