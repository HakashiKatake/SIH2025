import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  showMicIcon?: boolean;
  style?: any;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  value,
  onChangeText,
  onSubmit,
  showMicIcon = false,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="search" size={20} color="#6b7280" style={styles.searchIcon} />
      
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        placeholderTextColor="#9ca3af"
      />
      
      {showMicIcon && (
        <TouchableOpacity style={styles.micButton} activeOpacity={0.7}>
          <Ionicons name="mic" size={20} color="#6b7280" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 4,
  },
  micButton: {
    padding: 4,
    marginLeft: 8,
  },
});