import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import Colors from "@/constants/Colors";
import { useUser } from "@/context/user_provider";
import { collection, addDoc, getFirestore, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"; 
import { Post } from "@/@types/Post";
import { Alert } from "@/utils/alertUtils";
import PostList from "@/components/PostList";
import PostForm from "@/components/PostForm";
import ActionModal from "@/components/ActionModal";
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from "expo-router";
import UserUtils from "@/utils/userUtils";

export default function Home(): React.JSX.Element {
  const [modalVisible, setModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [fetchingData, setFetchingData] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useUser();
  const db = getFirestore();

  useEffect(() => {
    if (user && user.uid) {
      fetchPosts();
    } else {
      setFetchingData(false);
    }
  }, [user]);
  
  useFocusEffect(
    useCallback(() => {
      if (user && user.uid) {
        fetchPosts(true);
      }
      return () => {};
    }, [user])
  );

  const fetchPosts = async (silentRefresh = false) => {
    try {
      if (!silentRefresh) {
        setFetchingData(true);
      }
      
      const q = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedPosts: Post[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedPosts.push({
          id: doc.id,
          userId: data.userId,
          username: data.username,
          userProfileImage: data.userProfileImage || null,
          description: data.description,
          imageUrl: data.imageUrl,
          location: data.location,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt ? data.updatedAt.toDate() : null,
          likes: data.likes || 0,
          likedBy: data.likedBy || [],
        });
      });
      
      setPosts(fetchedPosts);
      if (!silentRefresh) {
        setFetchingData(false);
      }
    } catch (error) {
      if (!silentRefresh) {
        setFetchingData(false);
        Alert.error("Erro", "Não foi possível carregar os posts.");
      } else {
        console.error("Silent refresh failed:", error);
      }
    }
  };

  const handleLongPress = (post: Post) => {
    if (post.userId === user?.uid) {
      setSelectedPost(post);
      setActionModalVisible(true);
    }
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
      deletePost();
    } else {
      setActionModalVisible(false);
    }
  };

  const deletePost = async () => {
    if (!selectedPost) return;
    
    try {
      setActionModalVisible(false);
      setLoading(true);
      
      await deleteDoc(doc(db, "posts", selectedPost.id));
      
      const updatedPosts = posts.filter(p => p.id !== selectedPost.id);
      setPosts(updatedPosts);
      
      setLoading(false);
      setSelectedPost(null);
      
      Alert.success("Sucesso", "Post excluído com sucesso!");
    } catch (error: any) {
      setLoading(false);
      Alert.error("Erro", "Não foi possível excluir o post: " + error.message);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedPost(null);
    setModalVisible(true);
  };

  const handleSave = async (description: string, imageUrl: string, location: any) => {
    if (!description && !imageUrl) {
      Alert.warning('Atenção', 'Seu post precisa de uma descrição ou imagem');
      return;
    }
  
    if (!user || !user.uid) {
      Alert.error('Erro', 'Usuário não autenticado. Por favor, faça login novamente.');
      return;
    }
  
    try {
      setLoading(true);
      
      if (isEditing && selectedPost) {
        const postRef = doc(db, "posts", selectedPost.id);
        const updatedAt = new Date();
        
        await updateDoc(postRef, {
          description: description,
          imageUrl: imageUrl,
          location: location,
          updatedAt: updatedAt
        });
        
        const updatedPosts = posts.map(post => {
          if (post.id === selectedPost.id) {
            return {
              ...post,
              description,
              imageUrl,
              location,
              updatedAt
            };
          }
          return post;
        });
        
        setPosts(updatedPosts);
        Alert.success('Sucesso', 'Post atualizado com sucesso!');
      } else {
        const currentUser = await UserUtils.ensureUserProfile();
        const displayName = UserUtils.getUserDisplayName(currentUser || user);
        
        const newPostData = {
          userId: user.uid,
          username: displayName,
          userProfileImage: (currentUser || user).photoURL || null,
          description: description,
          imageUrl: imageUrl,
          location: location,
          createdAt: new Date(),
          likes: 0,
          likedBy: [],
          updatedAt: null
        };
        
        const docRef = await addDoc(collection(db, "posts"), newPostData);
        
        const newPost: Post = {
          ...newPostData,
          id: docRef.id,
          createdAt: newPostData.createdAt
        };
        
        setPosts([newPost, ...posts]);
        
        Alert.success('Sucesso', 'Post publicado com sucesso!');
      }
  
      setLoading(false);
      setModalVisible(false);
      setIsEditing(false);
      setSelectedPost(null);
    } catch (error: any) {
      setLoading(false);
      Alert.error('Erro', `Erro ao ${isEditing ? 'atualizar' : 'publicar'} post: ` + error.message);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setIsEditing(false);
    setSelectedPost(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <PostList 
          posts={posts}
          onItemLongPress={handleLongPress}
          loading={fetchingData}
          refreshPosts={fetchPosts}
        />
      </View>
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={openAddModal}
      >
        <Text>
          <Ionicons name="camera" size={24} color="white" />
        </Text>
      </TouchableOpacity>
      <PostForm 
        visible={modalVisible}
        isEditing={isEditing}
        selectedPost={selectedPost}
        onClose={closeModal}
        onSave={handleSave}
        loading={loading}
      />
      <ActionModal 
        visible={actionModalVisible}
        onClose={() => setActionModalVisible(false)}
        onEdit={handleEditPost}
        onDelete={handleDeletePost}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGrey,
    paddingTop: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  addButton: {
    backgroundColor: Colors.titleGrey,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    position: 'absolute',
    bottom: 20,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  }
});