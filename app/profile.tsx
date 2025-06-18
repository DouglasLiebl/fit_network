import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useUser } from "@/context/user_provider";
import Colors from "@/constants/Colors";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, orderBy, deleteDoc, updateDoc } from "firebase/firestore";
import { Alert } from "@/utils/alertUtils";
import { Post } from "@/@types/Post";
import PostList from "@/components/PostList";
import ActionModal from "@/components/ActionModal";
import PostForm from "@/components/PostForm";

export default function Profile(): React.JSX.Element {
  const { user, setUser } = useUser();
  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore();
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [postsCount, setPostsCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [savingPost, setSavingPost] = useState(false);

  useEffect(() => {
    if (user && user.uid) {
      fetchUserPosts();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserPosts = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      
      const postsRef = collection(db, "posts");
      const userPostsQuery = query(
        postsRef, 
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(userPostsQuery);
      const posts: Post[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          userId: data.userId,
          username: data.username,
          description: data.description,
          imageUrl: data.imageUrl,
          location: data.location,
          createdAt: data.createdAt.toDate(),
        });
      });
      
      setUserPosts(posts);
      setPostsCount(posts.length);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      Alert.error("Erro", "Falha ao carregar seus posts.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.confirm(
      "Confirmação",
      "Tem certeza que deseja sair da sua conta?",
    ).then(async (confirmed) => {
      if (confirmed) {
        try {
          setLoading(true);
          await signOut(auth);
          await AsyncStorage.removeItem('userData');
          setUser(null);
          router.replace("/login");
        } catch (error) {
          console.error("Error signing out:", error);
          Alert.error("Erro", "Não foi possível sair da conta.");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleLongPress = (post: Post) => {
    setSelectedPost(post);
    setActionModalVisible(true);
  };

  const handleEditPost = () => {
    if (!selectedPost) return;
    
    setActionModalVisible(false);
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;
    
    const confirmed = await Alert.confirm(
      "Confirmação",
      "Tem certeza que deseja excluir este post?"
    );
    
    if (confirmed) {
      try {
        setActionModalVisible(false);
        setSavingPost(true);
        
        await deleteDoc(doc(db, "posts", selectedPost.id));
        
        // Update state
        const updatedPosts = userPosts.filter(post => post.id !== selectedPost.id);
        setUserPosts(updatedPosts);
        setPostsCount(updatedPosts.length);
        
        setSavingPost(false);
        Alert.success("Sucesso", "Post excluído com sucesso!");
      } catch (error: any) {
        setSavingPost(false);
        Alert.error("Erro", "Não foi possível excluir o post: " + error.message);
      }
    } else {
      setActionModalVisible(false);
    }
  };

  const handleSave = async (description: string, imageUrl: string, location: any) => {
    if (!user || !user.uid) {
      Alert.error("Erro", "Usuário não autenticado");
      return;
    }

    if (isEditing && selectedPost) {
      try {
        setSavingPost(true);
        
        await updateDoc(doc(db, "posts", selectedPost.id), {
          description,
          imageUrl,
          location,
        });
        
        // Refresh the posts list
        await fetchUserPosts();
        
        setSavingPost(false);
        setModalVisible(false);
        setIsEditing(false);
        setSelectedPost(null);
        
        Alert.success("Sucesso", "Post atualizado com sucesso!");
      } catch (error: any) {
        setSavingPost(false);
        Alert.error("Erro", "Ocorreu um erro ao atualizar o post: " + error.message);
      }
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setIsEditing(false);
    setSelectedPost(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.titleGrey} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileInfo}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person" size={40} color="#CCCCCC" />
            </View>
          )}
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.displayName || 'Usuário'}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statCount}>{postsCount}</Text>
                <Text style={styles.statLabel}>
                  {postsCount === 1 ? 'post' : 'posts'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={18} color="#E53935" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.separator} />

      {/* User Posts */}
      <View style={styles.postsContainer}>
        <Text style={styles.sectionTitle}>Meus Posts</Text>
        
        {userPosts.length === 0 ? (
          <View style={styles.emptyPosts}>
            <Ionicons name="images-outline" size={48} color={Colors.textGrey} />
            <Text style={styles.emptyPostsText}>
              Você ainda não publicou nada
            </Text>
            <TouchableOpacity 
              style={styles.createPostButton}
              onPress={() => router.push('/home')}
            >
              <Text style={styles.createPostText}>Criar Post</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <PostList 
            posts={userPosts}
            onItemLongPress={handleLongPress}
            loading={false}
          />
        )}
      </View>
      
      <ActionModal 
        visible={actionModalVisible}
        onClose={() => setActionModalVisible(false)}
        onEdit={handleEditPost}
        onDelete={handleDeletePost}
      />

      <PostForm 
        visible={modalVisible}
        isEditing={isEditing}
        selectedPost={selectedPost}
        onClose={closeModal}
        onSave={handleSave}
        loading={savingPost}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGrey,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.subtitleGrey,
  },
  profileHeader: {
    backgroundColor: "white",
    padding: 20,
    paddingTop: 60,
  },
  profileInfo: {
    flexDirection: "row",
    marginBottom: 15,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EEEEEE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.titleGrey,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textGrey,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "baseline",
    marginRight: 20,
  },
  statCount: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.titleGrey,
    marginRight: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textGrey,
  },
  separator: {
    height: 1,
    backgroundColor: "#EEEEEE",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 10,
  },
  logoutText: {
    color: "#E53935",
    marginLeft: 4,
    fontWeight: "500",
  },
  postsContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.titleGrey,
    marginBottom: 12,
  },
  emptyPosts: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  emptyPostsText: {
    color: Colors.textGrey,
    marginTop: 10,
    marginBottom: 20,
  },
  createPostButton: {
    backgroundColor: Colors.titleGrey,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createPostText: {
    color: "white",
    fontWeight: "500",
  }
});