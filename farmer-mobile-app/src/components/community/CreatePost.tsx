import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCommunityStore, PostCategory } from '../../store/communityStore';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../LoadingSpinner';

interface CreatePostProps {
  onClose: () => void;
  onPostCreated: () => void;
}

const categoryOptions = [
  { value: PostCategory.QUESTION, label: 'Question', icon: 'help-circle-outline', color: '#FF6B6B' },
  { value: PostCategory.TIP, label: 'Tip', icon: 'bulb-outline', color: '#4ECDC4' },
  { value: PostCategory.SUCCESS_STORY, label: 'Success Story', icon: 'trophy-outline', color: '#45B7D1' },
  { value: PostCategory.PROBLEM, label: 'Problem', icon: 'warning-outline', color: '#FFA07A' },
  { value: PostCategory.NEWS, label: 'News', icon: 'newspaper-outline', color: '#98D8C8' },
];

export const CreatePost: React.FC<CreatePostProps> = ({ onClose, onPostCreated }) => {
  const { createPost, loading } = useCommunityStore();
  const { user } = useAuthStore();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>(PostCategory.QUESTION);
  const [tags, setTags] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const handleAddPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotos(prev => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Error', 'Please fill in title and content');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a post');
      return;
    }

    try {
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await createPost({
        authorId: user.id,
        authorName: user.profile?.name || 'Anonymous',
        authorAvatar: user.profile?.avatar,
        authorRole: user.role,
        title: title.trim(),
        content: content.trim(),
        category,
        tags: tagsArray,
        photos,
        isExpertVerified: user.role === 'expert',
      });

      onPostCreated();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to create post');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity
          style={[styles.postButton, (!title.trim() || !content.trim()) && styles.postButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading || !title.trim() || !content.trim()}
        >
          {loading ? (
            <LoadingSpinner size="small" />
          ) : (
            <Text style={styles.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryContainer}>
              {categoryOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.categoryOption,
                    category === option.value && { backgroundColor: option.color },
                  ]}
                  onPress={() => setCategory(option.value)}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={20}
                    color={category === option.value ? '#fff' : option.color}
                  />
                  <Text
                    style={[
                      styles.categoryOptionText,
                      category === option.value && styles.categoryOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="What's your post about?"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={styles.characterCount}>{title.length}/100</Text>
        </View>

        {/* Content Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="Share your knowledge, ask a question, or tell your story..."
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text style={styles.characterCount}>{content.length}/1000</Text>
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Photos (Optional)</Text>
            <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
              <Ionicons name="camera" size={20} color="#4CAF50" />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          </View>
          
          {photos.length > 0 && (
            <ScrollView horizontal style={styles.photosContainer}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoItem}>
                  <Image source={{ uri: photo }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => handleRemovePhoto(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Tags Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags (Optional)</Text>
          <TextInput
            style={styles.tagsInput}
            placeholder="Enter tags separated by commas (e.g., organic, tomatoes, farming)"
            value={tags}
            onChangeText={setTags}
          />
          <Text style={styles.helperText}>
            Tags help others find your post more easily
          </Text>
        </View>

        {/* Preview Tags */}
        {tags.trim() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tag Preview</Text>
            <View style={styles.tagsPreview}>
              {tags.split(',').map((tag, index) => {
                const trimmedTag = tag.trim();
                if (!trimmedTag) return null;
                return (
                  <View key={index} style={styles.tagPreview}>
                    <Text style={styles.tagPreviewText}>#{trimmedTag}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  postButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  postButtonDisabled: {
    backgroundColor: '#ccc',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryOptionText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryOptionTextActive: {
    color: '#fff',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    minHeight: 120,
  },
  tagsInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  addPhotoText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  photosContainer: {
    marginTop: 8,
  },
  photoItem: {
    position: 'relative',
    marginRight: 8,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  tagsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagPreview: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagPreviewText: {
    fontSize: 12,
    color: '#666',
  },
});