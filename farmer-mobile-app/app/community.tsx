import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';

export default function CommunityScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const communityTabs = [
    { id: 'all', name: 'All', icon: '🏠' },
    { id: 'questions', name: 'Questions', icon: '❓' },
    { id: 'tips', name: 'Tips', icon: '💡' },
    { id: 'market', name: 'Market', icon: '📈' },
  ];

  const posts = [
    {
      id: 1,
      author: 'Rajesh Kumar',
      time: '2 hours ago',
      content: 'Looking for organic pest control methods for tomatoes. Any suggestions from experienced farmers?',
      likes: 12,
      comments: 5,
      shares: 2,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Character Illustration */}
      <View style={styles.illustrationContainer}>
        <View style={styles.illustrationBackground}>
          <Text style={styles.illustrationEmoji}>👩‍💻</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search community posts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Community Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabs}>
            {communityTabs.map((tab) => (
              <TouchableOpacity key={tab.id} style={styles.tab}>
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={styles.tabText}>{tab.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Posts Feed */}
      <ScrollView style={styles.feedContainer} showsVerticalScrollIndicator={false}>
        {posts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.authorInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>R</Text>
                </View>
                <View>
                  <Text style={styles.authorName}>{post.author}</Text>
                  <Text style={styles.postTime}>{post.time}</Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.postContent}>{post.content}</Text>
            
            <View style={styles.postActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>👍</Text>
                <Text style={styles.actionText}>{post.likes}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>💬</Text>
                <Text style={styles.actionText}>{post.comments}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionIcon}>📤</Text>
                <Text style={styles.actionText}>{post.shares}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Bottom Message */}
      <View style={styles.bottomMessage}>
        <Text style={styles.bottomMessageText}>
          Join discussions and get answers from fellow farmers and experts!
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  placeholder: {
    width: 40,
  },
  illustrationContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  illustrationBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationEmoji: {
    fontSize: 60,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabs: {
    flexDirection: 'row',
    gap: 12,
  },
  tab: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    minWidth: 80,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  feedContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  postTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  postContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  bottomMessage: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  bottomMessageText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});