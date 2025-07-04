import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { useUser } from "@/context/user_provider";
import Colors from "@/constants/Colors";
import { getAuth, signOut } from "firebase/auth";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, orderBy, deleteDoc, updateDoc, addDoc } from "firebase/firestore";
import { Alert } from "@/utils/alertUtils";
import { Post } from "@/@types/Post";
import PostList from "@/components/PostList";
import ActionModal from "@/components/ActionModal";
import PostForm from "@/components/PostForm";
import ImageModal from "@/components/ImageModal";
import ProfilePhotoModal from "@/components/ProfilePhotoModal";
import EditProfileModal from "@/components/EditProfileModal";
import { CacheUtils } from "@/utils/cacheUtils";
import UserUtils from "@/utils/userUtils";

export default function Profile(): React.JSX.Element {
  const { user, setUser, refreshUser } = useUser();
  const router = useRouter();
  const params = useLocalSearchParams();
  const auth = getAuth();
  const db = getFirestore();
  
  const profileUserId = params.userId as string || (user?.uid || "");
  const isCurrentUser = !params.userId || profileUserId === user?.uid;
  
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<{
    displayName?: string;
    photoURL?: string | null;
    phoneNumber?: string | null;
  } | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [postsCount, setPostsCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [profilePhotoModalVisible, setProfilePhotoModalVisible] = useState(false);
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [savingPost, setSavingPost] = useState(false);

  useEffect(() => {
    if (profileUserId) {
      fetchProfileData();
      fetchUserPosts();
    } else {
      setLoading(false);
    }
  }, [profileUserId]);
  
  const fetchProfileData = async () => {
    if (!profileUserId) return;
    
    try {
      await CacheUtils.clearAllCache();
      
      if (isCurrentUser && user) {
        await refreshUser();
        
        const currentUser = auth.currentUser;
        if (currentUser) {
          await currentUser.reload();
          
          const db = getFirestore();
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let photoURL = null;
          if (userDoc.exists() && userDoc.data().photoURL) {
            photoURL = `${userDoc.data().photoURL}?t=${Date.now()}`;
          } else if (currentUser.photoURL) {
            photoURL = `${currentUser.photoURL}?t=${Date.now()}`;
          }
          
          setProfileData({
            displayName: currentUser.displayName || "Usuário",
            photoURL: photoURL,
            phoneNumber: userDoc.exists() ? userDoc.data().phoneNumber || null : null
          });
        } else {
          setProfileData({
            displayName: user.displayName || "Usuário",
            photoURL: user.photoURL ? `${user.photoURL}?t=${Date.now()}` : null,
            phoneNumber: null
          });
        }
        return;
      }
      
      const userDoc = await getDoc(doc(db, "users", profileUserId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const photoURL = userData.photoURL ? `${userData.photoURL}?t=${Date.now()}` : null;
        
        setProfileData({
          displayName: userData.displayName || "Usuário",
          photoURL: photoURL,
          phoneNumber: userData.phoneNumber || null
        });
      } else {
        Alert.error("Erro", "Perfil não encontrado.");
        router.back();
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
      Alert.error("Erro", "Falha ao carregar dados do perfil.");
    }
  };

  const fetchUserPosts = async () => {
    if (!profileUserId) return;
    
    try {
      setLoading(true);
      
      const postsRef = collection(db, "posts");
      const userPostsQuery = query(
        postsRef, 
        where("userId", "==", profileUserId),
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
          userProfileImage: data.userProfileImage || null,
          updatedAt: data.updatedAt ? data.updatedAt.toDate() : null,
          likes: data.likes || 0,
          likedBy: data.likedBy || [],
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
    if (!description && !imageUrl) {
      Alert.warning('Atenção', 'Seu post precisa de uma descrição ou imagem');
      return;
    }
    
    if (!user || !user.uid) {
      Alert.error("Erro", "Usuário não autenticado");
      return;
    }

    try {
      setSavingPost(true);
      
      if (isEditing && selectedPost) {
        await updateDoc(doc(db, "posts", selectedPost.id), {
          description,
          imageUrl,
          location,
          updatedAt: new Date()
        });
        
        Alert.success("Sucesso", "Post atualizado com sucesso!");
      } else {
        const currentUser = await UserUtils.ensureUserProfile();
        const displayName = UserUtils.getUserDisplayName(currentUser || user);
        
        const userDoc = await getDoc(doc(db, "users", user.uid));
        let profilePhotoURL = null;
        
        if (userDoc.exists() && userDoc.data().photoURL) {
          profilePhotoURL = userDoc.data().photoURL;
        } else if ((currentUser || user).photoURL) {
          profilePhotoURL = (currentUser || user).photoURL;
        }
        
        const newPost = {
          userId: user.uid,
          username: displayName,
          description,
          imageUrl,
          location,
          createdAt: new Date(),
          userProfileImage: profilePhotoURL,
          likes: 0,
          likedBy: [],
          updatedAt: null
        };
        
        await addDoc(collection(db, "posts"), newPost);
        
        Alert.success("Sucesso", "Post criado com sucesso!");
      }
      
      await fetchUserPosts();
      
      setSavingPost(false);
      setModalVisible(false);
      setIsEditing(false);
      setSelectedPost(null);
    } catch (error: any) {
      setSavingPost(false);
      Alert.error("Erro", "Ocorreu um erro ao " + (isEditing ? "atualizar" : "criar") + " o post: " + error.message);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setIsEditing(false);
    setSelectedPost(null);
  };

  const openAddModal = async () => {
    await fetchProfileData();
    
    setIsEditing(false);
    setSelectedPost(null);
    setModalVisible(true);
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
        {/* Top section with photo, name and stats */}
        <View style={styles.profileInfo}>
          <View style={styles.profileImageContainer}>
            <TouchableOpacity 
              onPress={() => {
                if (isCurrentUser) {
                  setProfilePhotoModalVisible(true);
                } else if (profileData?.photoURL) {
                  setImageModalVisible(true);
                }
              }}
              activeOpacity={0.7}
              style={styles.profileTouchable}
            >
              {profileData?.photoURL ? (
                <Image 
                  source={{ 
                    uri: profileData.photoURL,
                    cache: 'reload'
                  }} 
                  style={styles.profileImage} 
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Ionicons name="person" size={40} color="#CCCCCC" />
                </View>
              )}
              {isCurrentUser && (
                <View style={styles.editIconContainer}>
                  <Ionicons name="camera" size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {profileData?.displayName || 'Usuário'}
            </Text>
            {isCurrentUser && user && (
              <Text style={styles.userEmail}>
                {user.email}
              </Text>
            )}
            {profileData?.phoneNumber && (
              <Text style={styles.userPhone}>
                <Ionicons name="call-outline" size={14} color={Colors.textGrey} /> {profileData.phoneNumber}
              </Text>
            )}
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

        {/* Action buttons row */}
        {isCurrentUser && (
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={() => setEditProfileModalVisible(true)}
            >
              <Ionicons name="pencil" size={16} color="white" />
              <Text style={styles.editProfileText}>Editar Perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={18} color="#E53935" />
              <Text style={styles.logoutText}>Sair</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <View style={styles.separator} />

      {/* User Posts */}
      <View style={styles.postsContainer}>
        <Text style={styles.sectionTitle}>
          {isCurrentUser ? 'Meus Posts' : 'Posts'}
        </Text>
        
        {userPosts.length === 0 ? (
          <View style={styles.emptyPosts}>
            <Ionicons name="images-outline" size={48} color={Colors.textGrey} />
            <Text style={styles.emptyPostsText}>
              {isCurrentUser 
                ? 'Você ainda não publicou nada'
                : 'Este usuário ainda não publicou nada'
              }
            </Text>
            {isCurrentUser && (
              <TouchableOpacity 
                style={styles.createPostButton}
                onPress={openAddModal}
              >
                <Text style={styles.createPostText}>Criar Post</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <PostList 
            posts={userPosts}
            onItemLongPress={isCurrentUser ? handleLongPress : (() => {})}
            loading={false}
            refreshPosts={fetchUserPosts}
          />
        )}
      </View>
      
      <ActionModal 
        visible={actionModalVisible}
        onClose={() => setActionModalVisible(false)}
        onEdit={handleEditPost}
        onDelete={handleDeletePost}
      />

      {/* View Image Modal */}
      <ImageModal
        visible={imageModalVisible && !!profileData?.photoURL}
        imageUrl={profileData?.photoURL || ''}
        onClose={() => setImageModalVisible(false)}
      />

      <ProfilePhotoModal
        visible={profilePhotoModalVisible}
        photoURL={profileData?.photoURL || null}
        onClose={() => setProfilePhotoModalVisible(false)}
        onPhotoUpdated={() => {
          fetchProfileData();
          fetchUserPosts();
        }}
      />

      <PostForm 
        visible={modalVisible}
        isEditing={isEditing}
        selectedPost={selectedPost}
        onClose={closeModal}
        onSave={handleSave}
        loading={savingPost}
      />

      <EditProfileModal 
        visible={editProfileModalVisible}
        onClose={() => setEditProfileModalVisible(false)}
        onUpdate={() => {
          fetchProfileData();
          fetchUserPosts();
        }}
        userData={{
          displayName: profileData?.displayName,
          email: user?.email,
          phoneNumber: profileData?.phoneNumber
        }}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  profileInfo: {
    flexDirection: "row",
    marginBottom: 16,
  },
  profileImageContainer: {
    marginRight: 15,
    position: 'relative',
  },
  profileTouchable: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EEEEEE",
    justifyContent: "center",
    alignItems: "center",
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
  userPhone: {
    fontSize: 14,
    color: Colors.textGrey,
    marginBottom: 8,
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
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
  editProfileButton: {
    backgroundColor: Colors.titleGrey,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
  },
  editProfileText: {
    color: "white",
    fontWeight: "500",
    fontSize: 14,
    marginLeft: 6,
  },
  separator: {
    height: 1,
    backgroundColor: "#EEEEEE",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E53935",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
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
  },
  editIconContainer: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: Colors.titleGrey,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
});