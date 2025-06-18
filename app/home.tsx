import React, { useState, useEffect } from "react";
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

  const fetchPosts = async () => {
    try {
      setFetchingData(true);
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
          description: data.description,
          imageUrl: data.imageUrl,
          location: data.location,
          createdAt: data.createdAt.toDate(),
        });
      });
      
      setPosts(fetchedPosts);
      setFetchingData(false);
    } catch (error) {
      setFetchingData(false);
      Alert.error("Erro", "Não foi possível carregar os posts.");
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
        await updateDoc(doc(db, "posts", selectedPost.id), {
          description: description,
          imageUrl: imageUrl,
          location: location,
        });
        
        Alert.success('Sucesso', 'Post atualizado com sucesso!');
      } else {
        await addDoc(collection(db, "posts"), {
          userId: user.uid,
          username: user.displayName || 'Usuário',
          description: description,
          imageUrl: imageUrl,
          location: location,
          createdAt: new Date()
        });
        
        Alert.success('Sucesso', 'Post publicado com sucesso!');
      }
  
      setLoading(false);
      setModalVisible(false);
      setIsEditing(false);
      setSelectedPost(null);
      
      fetchPosts();
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
        />
      </View>
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={openAddModal}
      >
        <Ionicons name="camera" size={24} color="white" />
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