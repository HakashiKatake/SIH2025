import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCommunityStore, Post, Comment } from '../../store/communityStore';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../LoadingSpinner';

interface PostDetailsProps {
  postId: string;
  onClose: () => void;
}

const categoryColors = {
  question: '#FF6B6B',
  tip: '#4ECDC4',
  success_story: '#45B7D1',
  problem: '#FFA07A',
  news: '#98D8C8',
};

const categoryLabels = {
  question: 'Question',
  tip: 'Tip',
  success_story: 'Success Story',
  problem: 'Problem',
  news: 'News',
};

export const PostDetails: React.FC<PostDetailsProps> = ({ postId, onClose }) => {
  const { posts, loading, likePost, addComment, likeComment } = useCommunityStore();
  const { user } = useAuthStore();
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const post = posts.find(p => p.id === postId);

  if (!post) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post Not Found</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Post not found</Text>
        </View>
      </View>
    );
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

  const handleLikePost = async () => {
    await likePost(post.id);
  };

  const handleLikeComment = async (commentId: string) => {
    await likeComment(post.id, commentId);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to comment');
      return;
    }

    setIsSubmittingComment(true);
    try {
      await addComment(post.id, {
        postId: post.id,
        authorId: user.id,
        authorName: user.profile?.name || 'Anonymous',
        authorAvatar: user.profile?.avatar,
        content: commentText.trim(),
      });
      setCommentText('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const renderComment = (comment: Comment) => (
    <View key={comment.id} style={styles.commentItem}>
      <Image
        source={{ uri: comment.authorAvatar || 'https://via.placeholder.com/32' }}
        style={styles.commentAvatar}
      />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentAuthor}>{comment.authorName}</Text>
          <Text style={styles.commentTime}>{formatTimeAgo(comment.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{comment.content}</Text>
        <TouchableOpacity
          style={styles.commentLikeButton}
          onPress={() => handleLikeComment(comment.id)}
        >
          <Ionicons name="heart-outline" size={16} color="#666" />
          <Text style={styles.commentLikeText}>{comment.likes}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Details</Text>
        <TouchableOpacity>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Post Content */}
        <View style={styles.postContainer}>
          {/* Post Header */}
          <View style={styles.postHeader}>
            <View style={styles.authorInfo}>
              <Image
                source={{ uri: post.authorAvatar || 'https://via.placeholder.com/48' }}
                style={styles.authorAvatar}
              />
              <View style={styles.authorDetails}>
                <View style={styles.authorNameRow}>
                  <Text style={styles.authorName}>{post.authorName}</Text>
                  {post.isExpertVerified && (
                    <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
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

          {/* Post Title and Content */}
          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postContent}>{post.content}</Text>

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
              onPress={handleLikePost}
            >
              <Ionicons name="heart-outline" size={24} color="#666" />
              <Text style={styles.actionText}>{post.likes}</Text>
            </TouchableOpacity>
            <View style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={24} color="#666" />
              <Text style={styles.actionText}>{post.comments.length}</Text>
            </View>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={24} color="#666" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>
            Comments ({post.comments.length})
          </Text>

          {/* Add Comment */}
          <View style={styles.addCommentContainer}>
            <Image
              source={{ uri: user?.profile?.avatar || 'https://via.placeholder.com/32' }}
              style={styles.commentAvatar}
            />
            <View style={styles.addCommentInputContainer}>
              <TextInput
                style={styles.addCommentInput}
                placeholder="Add a comment..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.submitCommentButton,
                  (!commentText.trim() || isSubmittingComment) && styles.submitCommentButtonDisabled,
                ]}
                onPress={handleSubmitComment}
                disabled={!commentText.trim() || isSubmittingComment}
              >
                {isSubmittingComment ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <Ionicons name="send" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Comments List */}
          <View style={styles.commentsList}>
            {post.comments.map(renderComment)}
            
            {post.comments.length === 0 && (
              <View style={styles.noCommentsContainer}>
                <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
                <Text style={styles.noCommentsText}>
                  No comments yet. Be the first to comment!
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  postContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 6,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  postTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    lineHeight: 28,
  },
  postContent: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  postImages: {
    marginBottom: 16,
  },
  postImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 6,
    fontSize: 16,
    color: '#666',
  },
  commentsSection: {
    backgroundColor: '#fff',
    padding: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  addCommentInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  addCommentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 8,
  },
  submitCommentButton: {
    backgroundColor: '#4CAF50',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitCommentButtonDisabled: {
    backgroundColor: '#ccc',
  },
  commentsList: {
    marginTop: 8,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#666',
  },
  commentText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentLikeText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  noCommentsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noCommentsText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
});