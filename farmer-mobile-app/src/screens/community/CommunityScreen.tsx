import React, { useState } from "react"
import { Modal } from "react-native"
import { CommunityFeed } from "../../components/community/CommunityFeed"
import { CreatePost } from "../../components/community/CreatePost"
import { PostDetails } from "../../components/community/PostDetails"
import { SafeAreaContainer } from "../../components/ui/SafeAreaContainer"

export const CommunityScreen: React.FC = () => {
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)

  const handlePostPress = (postId: string) => {
    setSelectedPostId(postId)
  }

  const handleCreatePost = () => {
    setShowCreatePost(true)
  }

  const handleCloseCreatePost = () => {
    setShowCreatePost(false)
  }

  const handlePostCreated = () => {
    console.log("Post created successfully")
    setShowCreatePost(false)
  }

  const handleClosePostDetails = () => {
    setSelectedPostId(null)
  }

  return (
    <SafeAreaContainer>
      <CommunityFeed
        onPostPress={handlePostPress}
        onCreatePost={handleCreatePost}
        activeTab="Discussion"
        searchQuery=""
        showHeader={true}
        showSearch={true}
      />

      {/* Create Post Modal */}
      <Modal visible={showCreatePost} animationType="slide" presentationStyle="pageSheet">
        <CreatePost onClose={handleCloseCreatePost} onPostCreated={handlePostCreated} />
      </Modal>

      {/* Post Details Modal */}
      <Modal visible={selectedPostId !== null} animationType="slide" presentationStyle="pageSheet">
        {selectedPostId && <PostDetails postId={selectedPostId} onClose={handleClosePostDetails} />}
      </Modal>
    </SafeAreaContainer>
  )
}

// No styles needed - using CommunityFeed component
