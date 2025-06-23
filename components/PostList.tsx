import React, { useState, useEffect, useRef } from 'react';
import { FlatList, StyleSheet, View, Text, Image, TouchableOpacity, ActivityIndicator, Animated, RefreshControl } from 'react-native';
import { Post } from '@/@types/Post';
import Colors from '@/constants/Colors';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@/context/user_provider';
import { getFirestore, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import ImageModal from './ImageModal';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textGrey,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textGrey,
    marginTop: 8,
  },
  list: {
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    overflow: 'hidden'
  },
  postContent: {
    padding: 16,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  userAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEEEEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionsButton: {
    paddingVertical: 4,
    marginLeft: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.titleGrey,
  },
  date: {
    fontSize: 12,
    color: Colors.textGrey,
  },
  editedText: {
    fontSize: 10,
    color: Colors.textGrey,
    fontStyle: 'italic',
    textAlign: 'right'
  },
  description: {
    fontSize: 14,
    color: Colors.textGrey,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginVertical: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textGrey,
    marginLeft: 4,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    padding: 12,
  },
  likeButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    padding: 5,
  },
  likeCount: {
    marginLeft: 6,
    fontSize: 14,
    color: Colors.textGrey,
  },
  likeCountActive: {
    color: '#E53935',
    fontWeight: '500',
  }
});

interface PostListProps {
  posts: Post[];
  onItemLongPress: (post: Post) => void;
  loading: boolean;
  refreshPosts?: () => void;
  onLikeUpdate?: (totalLikes: number) => void;
}

function LikeButton({ 
  isLiked,
  likesCount,
  onPress 
}: { 
  isLiked: boolean, 
  likesCount: number,
  onPress: () => void 
}) {
  const heartScale = useRef(new Animated.Value(1)).current;

  const animateHeart = () => {
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true
      })
    ]).start();
  };

  const handlePress = () => {
    animateHeart();
    onPress();
  };


  return (
    <View style={styles.likeButtonContainer}>
      <TouchableOpacity
        style={styles.likeButton}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Animated.View style={{ transform: [{ scale: heartScale }] }}>
          <Text>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? "#E53935" : Colors.textGrey}
            />
          </Text>
        </Animated.View>
      </TouchableOpacity>
      
      {likesCount > 0 && (
        <Text style={[
          styles.likeCount,
          isLiked && styles.likeCountActive
        ]}>
          {likesCount.toString()}
        </Text>
      )}
    </View>
  );
}

export default function PostList({ posts, onItemLongPress, loading, refreshPosts, onLikeUpdate }: PostListProps) {
  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalImgUrl, setModalImgUrl] = useState<string|null>(null);
  
  const { user, trackLikedPost, isPostLikedLocally } = useUser();
  const router = useRouter();
  const db = getFirestore();

  useEffect(() => {
    setLocalPosts(posts);
    if (refreshing) {
      setRefreshing(false);
    }
  }, [posts, refreshing]);

  function navigateToUserProfile(userId: string) {
    if (userId === user?.uid) {
      router.push('/profile');
    } else {
      router.push({
        pathname: '/profile',
        params: { userId }
      });
    }
  }

  async function handleLike(post: Post, index: number) {
    if (!user || !user.uid) return;
    
    try {
      const postRef = doc(db, "posts", post.id);
      const isLiked = post.likedBy?.includes(user.uid);
      
      const updatedPost = { ...post };
      
      if (isLiked) {
        trackLikedPost(post.id, false);
        updatedPost.likes = (updatedPost.likes || 1) - 1;
        updatedPost.likedBy = updatedPost.likedBy?.filter((id: string) => id !== user.uid) || [];
        
        await updateDoc(postRef, {
          likes: updatedPost.likes,
          likedBy: arrayRemove(user.uid)
        });
      } else {
        trackLikedPost(post.id, true);
        updatedPost.likes = (updatedPost.likes || 0) + 1;
        updatedPost.likedBy = [...(updatedPost.likedBy || []), user.uid];
        
        await updateDoc(postRef, {
          likes: updatedPost.likes,
          likedBy: arrayUnion(user.uid)
        });
      }
      
      const updatedPosts = [...localPosts];
      if (index < updatedPosts.length) {
        updatedPosts[index] = updatedPost;
        setLocalPosts(updatedPosts);
      }

      if (onLikeUpdate) {
        onLikeUpdate(updatedPost.likes);
      }
    } catch (error) {
      trackLikedPost(post.id, !isLikedByUser(post));
      console.error("Error updating like status:", error);
    }
  }

  function isLikedByUser(post: Post): boolean {
    if (isPostLikedLocally(post.id)) {
      return true;
    }
    return !!(user && user.uid && post.likedBy?.includes(user.uid));
  }

  function onRefresh() {
    if (refreshPosts) {
      setRefreshing(true);
      refreshPosts();
    }
  }

  function renderPostItem({ item, index }: { item: Post; index: number }) {
    const isOwnPost = user?.uid && item.userId === user.uid;



    const postDateFormatting = (date: Date | string): string => {
      if (!date) return '';
      const parsedDate = typeof date === 'string' ? new Date(date) : date;
      const now = new Date();

      const diffMs = now.getTime() - parsedDate.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays < 1) {
        if (diffHours >= 1) {
          return `${diffHours} h`;
        } else if (diffMin >= 1) {
          return `${diffMin} min`;
        } else {
          return `${diffSec} s`;
        }
      } else if (diffDays < 7) {
        return `${diffDays} d`;
      }

      const day = parsedDate.getDate().toString().padStart(2, '0');
      const month = format(parsedDate, 'MMMM', { locale: ptBR });
      const year = parsedDate.getFullYear();

      return `${day} de ${month} de ${year}`;
    };
    
    return (
      <View style={styles.postCard}>
        <View
          style={styles.postContent}
        >
          <View style={styles.postHeader}>
            <TouchableOpacity 
              style={styles.userContainer}
              onPress={() => navigateToUserProfile(item.userId)}
              activeOpacity={0.7}
            >
              {item.userProfileImage ? (
                  <Image source={{ uri: item.userProfileImage }} style={styles.userAvatar} />
              ) : (
                <View style={styles.userAvatarPlaceholder}>
                  <Text style={{ textAlign: 'center' }}>
                    <Ionicons name="person" size={16} color="#CCCCCC" />
                  </Text>
                </View>
              )}
              <Text style={styles.username}>{item.username}</Text>
            </TouchableOpacity>
            <View style={styles.postHeaderRight}>
              <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                <Text style={styles.date}>
                  {postDateFormatting(item.createdAt)}
                </Text>
                {item.updatedAt && (
                  <Text style={styles.editedText}>(editado)</Text>
                )}
              </View>

              {isOwnPost && (
                <TouchableOpacity 
                  style={styles.optionsButton}
                  onPress={() => onItemLongPress(item)}
                  activeOpacity={0.7}
                >
                  <Text>
                    <Ionicons name="ellipsis-vertical" size={20} color={Colors.textGrey} />
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {item.description ? (
            <Text style={styles.description}>{item.description}</Text>
          ) : null}
          
          {item.imageUrl ? (
            <TouchableOpacity 
              onPress={() => setModalImgUrl(item.imageUrl)}
              activeOpacity={0.7}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
            </TouchableOpacity>
          ) : null}



          {item.location ? (
            <View style={styles.locationContainer}>
              <Text style={{ color: Colors.textGrey }}>
                <Ionicons name="location" size={16} color={Colors.textGrey} />
              </Text>
              <Text style={styles.locationText}>
                {item.location.address || `${item.location.latitude.toFixed(4)}, ${item.location.longitude.toFixed(4)}`}
              </Text>
            </View>
          ) : null}
        </View>
        
        <View style={styles.postActions}>
          <LikeButton
            isLiked={isLikedByUser(item)}
            likesCount={item.likes || 0}
            onPress={() => handleLike(item, index)}
          />
        </View>

        <ImageModal
          visible={!!modalImgUrl}
          onClose={() => setModalImgUrl(null)}
          imageUrl={modalImgUrl || ''}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={localPosts}
      renderItem={renderPostItem}
      keyExtractor={(item: Post) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.list,
        localPosts.length === 0 ? { flex: 1, justifyContent: 'center' } : null
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Colors.titleGrey]}
          tintColor={Colors.titleGrey}
        />
      }
      ListEmptyComponent={
        loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={Colors.titleGrey} />
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum post encontrado</Text>
            <Text style={styles.emptySubtext}>Seja o primeiro a compartilhar algo!</Text>
          </View>
        )
      }
    />
  );
}
