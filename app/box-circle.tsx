import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../hooks/useSubscription';
import { BackHeader } from '../components/BackHeader';

const themes = {
  light: {
    background: '#fefefe',
    cardBackground: '#ffffff',
    textPrimary: '#2d2d2d',
    textSecondary: '#666666',
    border: '#e0e0e0',
    accent: '#8B7355',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
  }
};

interface BoxCirclePost {
  _id: string;
  user_id: string;
  first_sip_notes: string;
  feelings: string[];
  best_time: string;
  tips: string;
  photo_url?: string;
  is_anonymous: boolean;
  leaf_rating?: number;
  created_at: string;
  reactions: {
    helpful: number;
    encouraging: number;
    little_win: number;
  };
  comments: BoxCircleComment[];
}

interface BoxCircleComment {
  _id: string;
  post_id: string;
  user_id: string;
  content: string;
  is_anonymous: boolean;
  created_at: string;
}

interface BoxCircleThread {
  month_year: string;
  title: string;
  intro: string;
  tea_name: string;
  tincture_name: string;
  created_at: string;
  post_count: number;
  average_rating: number;
}

export default function BoxCircleScreen() {
  const theme = themes.light;
  const router = useRouter();
  const { user, token } = useAuth();
  const { isPremium } = useSubscription();
  
  const [thread, setThread] = useState<BoxCircleThread | null>(null);
  const [posts, setPosts] = useState<BoxCirclePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  // Post form states
  const [firstSipNotes, setFirstSipNotes] = useState('');
  const [selectedFeelings, setSelectedFeelings] = useState<string[]>([]);
  const [bestTime, setBestTime] = useState('');
  const [tips, setTips] = useState('');
  const [leafRating, setLeafRating] = useState<number | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Comment modal states
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentAnonymous, setCommentAnonymous] = useState(false);
  
  const currentMonth = new Date().toISOString().slice(0, 7); // "2024-12"
  
  // Check admin access properly
  const isAdmin = user?.is_admin === true;
  const hasAccess = isPremium || isAdmin;
  
  const feelingOptions = [
    { id: 'calm', label: 'Calm', emoji: '😌' },
    { id: 'focused', label: 'Focused', emoji: '🎯' },
    { id: 'uplifted', label: 'Uplifted', emoji: '✨' },
    { id: 'soothed', label: 'Soothed', emoji: '🤗' },
    { id: 'unsettled', label: 'Unsettled', emoji: '😕' },
    { id: 'other', label: 'Other', emoji: '🤷' },
  ];
  
  const timeOptions = [
    { id: 'morning', label: 'Morning', emoji: '🌅' },
    { id: 'afternoon', label: 'Afternoon', emoji: '☀️' },
    { id: 'evening', label: 'Evening', emoji: '🌙' },
  ];

  const fetchBoxCircle = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/box-circle/${currentMonth}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setThread(data.thread);
        setPosts(data.posts || []);
      } else {
        Alert.alert('Error', 'Failed to load Box Circle');
      }
    } catch (error) {
      console.error('Error fetching Box Circle:', error);
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSortedPosts = async (sort: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/box-circle/${currentMonth}/posts?sort_by=${sort}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching sorted posts:', error);
    }
  };

  useEffect(() => {
    if (hasAccess && token) {
      fetchBoxCircle();
    }
  }, [isPremium, isAdmin, token]);

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    fetchSortedPosts(sort);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBoxCircle();
    setRefreshing(false);
  };

  const toggleFeeling = (feelingId: string) => {
    if (selectedFeelings.includes(feelingId)) {
      setSelectedFeelings(selectedFeelings.filter(f => f !== feelingId));
    } else if (selectedFeelings.length < 2) {
      setSelectedFeelings([...selectedFeelings, feelingId]);
    } else {
      Alert.alert('Limit Reached', 'You can select up to 2 feelings.');
    }
  };

  const handleSubmitPost = async () => {
    if (!firstSipNotes.trim() || selectedFeelings.length === 0 || !bestTime || !tips.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    
    if (firstSipNotes.length > 250) {
      Alert.alert('Too Long', 'First sip notes must be 250 characters or less.');
      return;
    }
    
    if (tips.length > 200) {
      Alert.alert('Too Long', 'Tips must be 200 characters or less.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      let photoUrl = null;
      
      // Upload image first if one is selected
      if (selectedImage) {
        setUploadingImage(true);
        
        const formData = new FormData();
        formData.append('file', {
          uri: selectedImage,
          type: 'image/jpeg',
          name: 'photo.jpg',
        } as any);

        const uploadResponse = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/box-circle/upload-photo`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        setUploadingImage(false);

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          photoUrl = uploadResult.photo_url;
        } else {
          Alert.alert('Upload Error', 'Failed to upload image. Posting without image.');
        }
      }
      
      // Create the post
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/box-circle/${currentMonth}/post`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_sip_notes: firstSipNotes.trim(),
          feelings: selectedFeelings,
          best_time: bestTime,
          tips: tips.trim(),
          is_anonymous: isAnonymous,
          leaf_rating: leafRating,
          photo_url: photoUrl,
        }),
      });
      
      if (response.ok) {
        Alert.alert('Success', 'Your tea story has been shared with the community!');
        setShowPostForm(false);
        resetPostForm();
        fetchBoxCircle();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to share experience');
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      Alert.alert('Error', 'Network error');
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  const resetPostForm = () => {
    setFirstSipNotes('');
    setSelectedFeelings([]);
    setBestTime('');
    setTips('');
    setLeafRating(null);
    setIsAnonymous(false);
    setSelectedImage(null);
  };

  const handleImagePicker = async () => {
    try {
      console.log('Image picker clicked!');
      
      // For web, use a simpler approach
      if (Platform.OS === 'web') {
        Alert.alert(
          'Photo Upload',
          'Photo upload is optimized for mobile devices. For the best experience, try the Expo Go app on your phone!',
          [
            { text: 'OK' },
            { 
              text: 'Try Anyway', 
              onPress: () => openImageLibrary() 
            }
          ]
        );
        return;
      }
      
      // Request permissions for mobile
      console.log('Requesting permissions...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'We need access to your photo library to share images.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Show options to user
      Alert.alert(
        'Add Photo',
        'Share your tea moment with the community',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: () => openCamera() },
          { text: 'Choose from Library', onPress: () => openImageLibrary() },
        ]
      );
    } catch (error) {
      console.error('Error with image picker:', error);
      Alert.alert('Error', 'Something went wrong with image selection.');
    }
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera access is needed to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Unable to access camera.');
    }
  };

  const openImageLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening image library:', error);
      Alert.alert('Error', 'Unable to access photo library.');
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
  };

  const handleReaction = async (postId: string, reactionType: string) => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/box-circle/react/${postId}?reaction_type=${reactionType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        fetchSortedPosts(sortBy);
      }
    } catch (error) {
      console.error('Error reacting to post:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || commentText.length > 200) {
      Alert.alert('Invalid Comment', 'Comment must be 1-200 characters.');
      return;
    }
    
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/box-circle/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: selectedPostId,
          content: commentText.trim(),
          is_anonymous: commentAnonymous,
        }),
      });
      
      if (response.ok) {
        Alert.alert('Success', 'Comment added!');
        setShowCommentModal(false);
        setCommentText('');
        setCommentAnonymous(false);
        fetchSortedPosts(sortBy);
      } else {
        const error = await response.json();
        Alert.alert('Error', error.detail || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('Error', 'Network error');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays === 0) {
      if (diffHours === 0) {
        return 'Just now';
      }
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!hasAccess) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <BackHeader title="Box Circle" />
        
        <View style={styles.centerContent}>
          <Ionicons name="lock-closed" size={64} color={theme.accent} />
          <Text style={[styles.lockedTitle, { color: theme.textPrimary }]}>
            Box Circle Access
          </Text>
          <Text style={[styles.lockedText, { color: theme.textSecondary }]}>
            Join the Rooted & Growing + community to share experiences and connect with other members.
          </Text>
          <TouchableOpacity 
            style={[styles.upgradeButton, { backgroundColor: theme.accent }]}
            onPress={() => router.push('/upgrade')}
          >
            <Text style={styles.upgradeButtonText}>Upgrade to Rooted & Growing +</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <BackHeader title="Box Circle" />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <BackHeader title="Box Circle" />
      
      <ScrollView 
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Welcome Banner */}
        <View style={[styles.welcomeBanner, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeHeader}>
              <Text style={styles.welcomeEmoji}>🌿✨</Text>
              <View style={styles.welcomeText}>
                <Text style={[styles.welcomeTitle, { color: theme.textPrimary }]}>
                  Welcome to the Circle
                </Text>
                <Text style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>
                  A cozy space to share your herbal journey
                </Text>
              </View>
            </View>
            
            {thread && (
              <>
                <View style={[styles.monthlyBlend, { backgroundColor: 'rgba(139, 115, 85, 0.1)' }]}>
                  <Text style={[styles.blendTitle, { color: theme.accent }]}>
                    This Month's Blend
                  </Text>
                  <Text style={[styles.blendName, { color: theme.textPrimary }]}>
                    {thread.tea_name} + {thread.tincture_name}
                  </Text>
                </View>
                
                <View style={styles.communityStats}>
                  <View style={styles.statBubble}>
                    <Text style={styles.statEmoji}>🌿</Text>
                    <Text style={[styles.statValue, { color: theme.accent }]}>
                      {thread.average_rating.toFixed(1)}/5
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                      Community Rating
                    </Text>
                  </View>
                  <View style={styles.statBubble}>
                    <Text style={styles.statEmoji}>💬</Text>
                    <Text style={[styles.statValue, { color: theme.accent }]}>
                      {thread.post_count}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                      Stories Shared
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Share Experience Button */}
        <View style={styles.shareSection}>
          <TouchableOpacity 
            style={[styles.shareButton, { backgroundColor: theme.accent }]}
            onPress={() => setShowPostForm(true)}
          >
            <View style={styles.shareButtonContent}>
              <Ionicons name="add-circle" size={24} color="#fff" />
              <View style={styles.shareButtonText}>
                <Text style={styles.shareButtonTitle}>Share Your Tea Story</Text>
                <Text style={styles.shareButtonSubtitle}>Join the conversation • Tell us how it felt</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Sort Tabs */}
        <View style={[styles.sortTabs, { backgroundColor: theme.cardBackground }]}>
          {[
            { id: 'newest', label: 'Latest Stories', emoji: '✨' },
            { id: 'most_helpful', label: 'Most Helpful', emoji: '🌿' },
            { id: 'with_photos', label: 'Tea Moments', emoji: '📸' },
            { id: 'tips', label: 'Brewing Tips', emoji: '💡' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.sortTab,
                sortBy === tab.id && { backgroundColor: theme.accent },
              ]}
              onPress={() => handleSortChange(tab.id)}
            >
              <Text
                style={[
                  styles.sortTabText,
                  { color: sortBy === tab.id ? '#fff' : theme.textSecondary },
                ]}
              >
                {tab.emoji} {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Posts Feed */}
        {posts.map((post) => (
          <View key={post._id} style={[styles.postCard, { backgroundColor: theme.cardBackground }]}>
            {/* Post Header */}
            <View style={styles.postHeader}>
              <View style={styles.postUser}>
                <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
                  <Text style={styles.avatarText}>
                    {post.is_anonymous ? '🌿' : post.user_id.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={[styles.userName, { color: theme.textPrimary }]}>
                    {post.is_anonymous ? 'Fellow Tea Lover' : 'Circle Member'}
                  </Text>
                  <Text style={[styles.postTime, { color: theme.textSecondary }]}>
                    {formatTimeAgo(post.created_at)} • {post.best_time} ritual
                  </Text>
                </View>
              </View>
              <View style={styles.postRating}>
                {post.leaf_rating && (
                  <View style={[styles.ratingBadge, { backgroundColor: 'rgba(139, 115, 85, 0.1)' }]}>
                    <Text style={[styles.ratingText, { color: theme.accent }]}>
                      {'🌿'.repeat(post.leaf_rating)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Post Content */}
            <View style={styles.postContent}>
              <Text style={[styles.postNotes, { color: theme.textPrimary }]}>
                {post.first_sip_notes}
              </Text>
              
              {/* Feelings & Time Chips */}
              <View style={styles.chips}>
                {post.feelings.map((feeling) => (
                  <View key={feeling} style={[styles.chip, { backgroundColor: theme.border }]}>
                    <Text style={[styles.chipText, { color: theme.textSecondary }]}>
                      {feelingOptions.find(f => f.id === feeling)?.emoji} {feeling}
                    </Text>
                  </View>
                ))}
                <View style={[styles.chip, { backgroundColor: theme.border }]}>
                  <Text style={[styles.chipText, { color: theme.textSecondary }]}>
                    {timeOptions.find(t => t.id === post.best_time)?.emoji} {post.best_time}
                  </Text>
                </View>
              </View>
              
              {post.tips && (
                <View style={styles.tipsSection}>
                  <Text style={[styles.tipsLabel, { color: theme.accent }]}>💡 Tips:</Text>
                  <Text style={[styles.tipsText, { color: theme.textPrimary }]}>
                    {post.tips}
                  </Text>
                </View>
              )}
              
              {post.photo_url && (
                <TouchableOpacity style={styles.photoContainer}>
                  <Image 
                    source={{ uri: `${process.env.EXPO_PUBLIC_BACKEND_URL}${post.photo_url}` }} 
                    style={styles.photo}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Reactions */}
            <View style={styles.reactions}>
              <TouchableOpacity 
                style={styles.reactionButton}
                onPress={() => handleReaction(post._id, 'helpful')}
              >
                <Text style={styles.reactionText}>🌿 {post.reactions.helpful}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.reactionButton}
                onPress={() => handleReaction(post._id, 'encouraging')}
              >
                <Text style={styles.reactionText}>🤍 {post.reactions.encouraging}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.reactionButton}
                onPress={() => handleReaction(post._id, 'little_win')}
              >
                <Text style={styles.reactionText}>✨ {post.reactions.little_win}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.commentButton}
                onPress={() => {
                  setSelectedPostId(post._id);
                  setShowCommentModal(true);
                }}
              >
                <Ionicons name="chatbubble-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.commentButtonText, { color: theme.textSecondary }]}>
                  {post.comments?.length || 0}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Comments */}
            {post.comments && post.comments.length > 0 && (
              <View style={[styles.comments, { borderTopColor: theme.border }]}>
                {post.comments.slice(0, 2).map((comment) => (
                  <View key={comment._id} style={styles.comment}>
                    <Text style={[styles.commentUser, { color: theme.textSecondary }]}>
                      {comment.is_anonymous ? 'Member (anonymous)' : 'Member'}
                    </Text>
                    <Text style={[styles.commentText, { color: theme.textPrimary }]}>
                      {comment.content}
                    </Text>
                    <Text style={[styles.commentTime, { color: theme.textSecondary }]}>
                      {formatTimeAgo(comment.created_at)}
                    </Text>
                  </View>
                ))}
                {post.comments.length > 2 && (
                  <TouchableOpacity style={styles.showMoreComments}>
                    <Text style={[styles.showMoreText, { color: theme.accent }]}>
                      Show {post.comments.length - 2} more comments
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Post Form Modal */}
      <Modal
        visible={showPostForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setShowPostForm(false)}>
              <Text style={[styles.modalCancel, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Share Your Experience
            </Text>
            <TouchableOpacity 
              onPress={handleSubmitPost}
              disabled={submitting}
            >
              <Text style={[styles.modalSave, { color: submitting ? theme.textSecondary : theme.accent }]}>
                {submitting ? 'Sharing...' : 'Share'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* First Sip Notes */}
            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: theme.textPrimary }]}>
                First sip notes *
              </Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.cardBackground, color: theme.textPrimary }]}
                value={firstSipNotes}
                onChangeText={setFirstSipNotes}
                placeholder="How did it taste? What did you notice?"
                placeholderTextColor={theme.textSecondary}
                multiline
                maxLength={250}
              />
              <Text style={[styles.charCount, { color: theme.textSecondary }]}>
                {firstSipNotes.length}/250
              </Text>
            </View>

            {/* Feelings */}
            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: theme.textPrimary }]}>
                How it made me feel (choose up to 2) *
              </Text>
              <View style={styles.feelingGrid}>
                {feelingOptions.map((feeling) => (
                  <TouchableOpacity
                    key={feeling.id}
                    style={[
                      styles.feelingChip,
                      { backgroundColor: theme.cardBackground },
                      selectedFeelings.includes(feeling.id) && { backgroundColor: theme.accent },
                    ]}
                    onPress={() => toggleFeeling(feeling.id)}
                  >
                    <Text
                      style={[
                        styles.feelingChipText,
                        { color: theme.textPrimary },
                        selectedFeelings.includes(feeling.id) && { color: '#fff' },
                      ]}
                    >
                      {feeling.emoji} {feeling.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Best Time */}
            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: theme.textPrimary }]}>
                Best time of day *
              </Text>
              <View style={styles.timeGrid}>
                {timeOptions.map((time) => (
                  <TouchableOpacity
                    key={time.id}
                    style={[
                      styles.timeChip,
                      { backgroundColor: theme.cardBackground },
                      bestTime === time.id && { backgroundColor: theme.accent },
                    ]}
                    onPress={() => setBestTime(time.id)}
                  >
                    <Text
                      style={[
                        styles.timeChipText,
                        { color: theme.textPrimary },
                        bestTime === time.id && { color: '#fff' },
                      ]}
                    >
                      {time.emoji} {time.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tips */}
            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: theme.textPrimary }]}>
                Tips that helped *
              </Text>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.cardBackground, color: theme.textPrimary }]}
                value={tips}
                onChangeText={setTips}
                placeholder="What preparation or timing worked well?"
                placeholderTextColor={theme.textSecondary}
                multiline
                maxLength={200}
              />
              <Text style={[styles.charCount, { color: theme.textSecondary }]}>
                {tips.length}/200
              </Text>
            </View>

            {/* Photo Upload */}
            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: theme.textPrimary }]}>
                Add a photo (optional)
              </Text>
              
              {selectedImage ? (
                <View style={styles.selectedImageContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                  <TouchableOpacity 
                    style={[styles.removeImageButton, { backgroundColor: theme.accent }]}
                    onPress={removeSelectedImage}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.changeImageButton, { backgroundColor: theme.cardBackground, borderColor: theme.accent }]}
                    onPress={handleImagePicker}
                  >
                    <Ionicons name="camera" size={16} color={theme.accent} />
                    <Text style={[styles.changeImageText, { color: theme.accent }]}>
                      Change Photo
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={[styles.photoUploadButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                  onPress={handleImagePicker}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <ActivityIndicator size="large" color={theme.accent} />
                  ) : (
                    <>
                      <Ionicons name="camera" size={32} color={theme.accent} />
                      <Text style={[styles.photoUploadText, { color: theme.textSecondary }]}>
                        Tap to add a photo
                      </Text>
                      <Text style={[styles.photoUploadSubtext, { color: theme.textSecondary }]}>
                        Share your tea moment (camera or library)
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>

            {/* Leaf Rating */}
            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: theme.textPrimary }]}>
                🌿 Leaf rating (optional)
              </Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    onPress={() => setLeafRating(rating === leafRating ? null : rating)}
                  >
                    <Text style={[styles.leafIcon, { opacity: leafRating && rating <= leafRating ? 1 : 0.3 }]}>
                      🌿
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Anonymous Toggle */}
            <View style={styles.formSection}>
              <TouchableOpacity 
                style={styles.anonymousToggle}
                onPress={() => setIsAnonymous(!isAnonymous)}
              >
                <View style={[
                  styles.checkbox,
                  { borderColor: theme.border },
                  isAnonymous && { backgroundColor: theme.accent, borderColor: theme.accent }
                ]}>
                  {isAnonymous && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={[styles.anonymousLabel, { color: theme.textPrimary }]}>
                  Post as anonymous
                </Text>
              </TouchableOpacity>
            </View>

            {/* Submit Button at Bottom */}
            <View style={styles.formSection}>
              <TouchableOpacity 
                style={[styles.submitButton, { backgroundColor: theme.accent }]}
                onPress={handleSubmitPost}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                )}
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Sharing Your Experience...' : 'Share Your Experience'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Comment Modal */}
      <Modal
        visible={showCommentModal}
        animationType="slide"
        presentationStyle="formSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setShowCommentModal(false)}>
              <Text style={[styles.modalCancel, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Add Comment
            </Text>
            <TouchableOpacity onPress={handleSubmitComment}>
              <Text style={[styles.modalSave, { color: theme.accent }]}>
                Post
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={[styles.commentInput, { backgroundColor: theme.cardBackground, color: theme.textPrimary }]}
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Share your thoughts..."
              placeholderTextColor={theme.textSecondary}
              multiline
              maxLength={200}
              autoFocus
            />
            <Text style={[styles.charCount, { color: theme.textSecondary }]}>
              {commentText.length}/200
            </Text>
            
            <TouchableOpacity 
              style={styles.anonymousToggle}
              onPress={() => setCommentAnonymous(!commentAnonymous)}
            >
              <View style={[
                styles.checkbox,
                { borderColor: theme.border },
                commentAnonymous && { backgroundColor: theme.accent, borderColor: theme.accent }
              ]}>
                {commentAnonymous && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
              <Text style={[styles.anonymousLabel, { color: theme.textPrimary }]}>
                Comment anonymously
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  
  // Locked state
  lockedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  lockedText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  upgradeButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Thread header
  threadHeader: {
    padding: 16,
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
  },
  threadTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  threadIntro: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  threadStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  
  // Share button
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Sort tabs
  sortTabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 4,
  },
  sortTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  sortTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Post cards
  postCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  postTime: {
    fontSize: 12,
    marginTop: 2,
  },
  rating: {
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
  },
  memberInfo: {
    flex: 1,
  },
  postRating: {
    alignItems: 'center',
  },
  ratingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  
  // Post content
  postContent: {
    marginBottom: 12,
  },
  postNotes: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tipsSection: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  tipsLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 18,
  },
  photoContainer: {
    marginTop: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  
  // Reactions
  reactions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  reactionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  reactionText: {
    fontSize: 14,
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 'auto',
  },
  commentButtonText: {
    fontSize: 14,
    marginLeft: 4,
  },
  
  // Comments
  comments: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  comment: {
    marginBottom: 8,
  },
  commentUser: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 2,
  },
  commentTime: {
    fontSize: 11,
  },
  showMoreComments: {
    marginTop: 4,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalCancel: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSave: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  
  // Form styles
  formSection: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  feelingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  feelingChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  feelingChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeGrid: {
    flexDirection: 'row',
  },
  timeChip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  timeChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leafIcon: {
    fontSize: 32,
    marginRight: 8,
  },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  anonymousLabel: {
    fontSize: 16,
  },
  commentInput: {
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  
  // Welcome Banner Styles
  welcomeBanner: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeContent: {
    gap: 16,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  welcomeEmoji: {
    fontSize: 40,
  },
  welcomeText: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  monthlyBlend: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  blendTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  blendName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  communityStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  statBubble: {
    alignItems: 'center',
    flex: 1,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  
  // Enhanced Share Button
  shareSection: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  shareButton: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  shareButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  shareButtonText: {
    flex: 1,
  },
  shareButtonTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  shareButtonSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  
  // Photo Upload Styles
  photoUploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  photoUploadText: {
    fontSize: 16,
    fontWeight: '600',
  },
  photoUploadSubtext: {
    fontSize: 13,
  },
  
  // Submit Button Styles
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Enhanced Post Card Styles
  memberInfo: {
    flex: 1,
  },
  postRating: {
    alignItems: 'center',
  },
  ratingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  
  // Image Selection Styles
  selectedImageContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 8,
    gap: 4,
  },
  changeImageText: {
    fontSize: 14,
    fontWeight: '500',
  },
});