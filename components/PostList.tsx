import React from 'react';
import { FlatList, StyleSheet, View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Post } from '@/@types/Post';
import Colors from '@/constants/Colors';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';

interface PostListProps {
  posts: Post[];
  onItemLongPress: (post: Post) => void;
  loading: boolean;
}

export default function PostList({ posts, onItemLongPress, loading }: PostListProps) {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.titleGrey} />
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhum post encontrado</Text>
        <Text style={styles.emptySubtext}>Seja o primeiro a compartilhar algo!</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: Post }) => (
    <View
      style={styles.postCard}
     
    >
      <View style={styles.postHeader}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.date}>
          {format(item.createdAt, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
        </Text>
      </View>
      
      {item.location ? (
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={16} color={Colors.textGrey} />
          <Text style={styles.locationText}>
            {item.location.address || `${item.location.latitude.toFixed(4)}, ${item.location.longitude.toFixed(4)}`}
          </Text>
        </View>
      ) : null}

      {item.description ? (
        <Text style={styles.description}>{item.description}</Text>
      ) : null}
      
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      ) : null}
      
      <TouchableOpacity>
        <Ionicons name="heart" size={26} color={"#e02c1f"} />
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={posts}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
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
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderGrey
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
});