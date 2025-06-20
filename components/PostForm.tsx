import React, { useState, useEffect } from 'react';
import { Modal, View, TextInput, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Image, Platform } from 'react-native';
import Colors from '@/constants/Colors';
import { Post } from '@/@types/Post';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Alert } from '@/utils/alertUtils';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import CameraUtils from '@/utils/cameraUtils';

interface PostFormProps {
  visible: boolean;
  isEditing: boolean;
  selectedPost: Post | null;
  onClose: () => void;
  onSave: (description: string, imageUrl: string, location: any) => void;
  loading: boolean;
}

export default function PostForm({ 
  visible, 
  isEditing, 
  selectedPost, 
  onClose, 
  onSave, 
  loading 
}: PostFormProps) {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<any>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (visible && isEditing && selectedPost) {
      setDescription(selectedPost.description || '');
      setImage(selectedPost.imageUrl || null);
      setLocation(selectedPost.location || null);
    } else if (visible && !isEditing) {
      setDescription('');
      setImage(null);
      setLocation(null);
    }
  }, [visible, isEditing, selectedPost]);

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== Location.PermissionStatus.GRANTED) {
        Alert.error('Permissão necessária', 'Precisamos de permissão para acessar sua localização');
        setLocationLoading(false);
        return;
      }
      
      const currentLocation = await Location.getCurrentPositionAsync({});
      
      // Try to get the address from the coordinates
      try {
        const geocode = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude
        });
        
        if (geocode && geocode.length > 0) {
          const address = geocode[0];
          const formattedAddress = [
            address.street, 
            address.city, 
            address.region
          ].filter(Boolean).join(', ');
          
          setLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            address: formattedAddress
          });
        } else {
          setLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude
          });
        }
      } catch (error) {
        // If geocoding fails, just use coordinates
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude
        });
      }
      
      setLocationLoading(false);
    } catch (error) {
      setLocationLoading(false);
      Alert.error('Erro', 'Não foi possível obter sua localização');
    }
  };

  const removeLocation = () => {
    setLocation(null);
  };

  const handleSubmit = async () => {
    let finalImageUrl = image;
    
    // If it's a new post and we have a local image URI (not already uploaded)
    if (!isEditing && image && !image.startsWith('http')) {
      setUploadingImage(true);
      finalImageUrl = await CameraUtils.uploadImage(image, setImage);
      setUploadingImage(false);
    }
    
    onSave(description, finalImageUrl || '', location);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Editar Post' : 'Novo Post'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.titleGrey} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="O que você está pensando?"
            value={description}
            onChangeText={setDescription}
            multiline={true}
            numberOfLines={4}
            placeholderTextColor={Colors.textGrey}
          />

          {image ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: image }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.removeImageButton} 
                onPress={() => setImage(null)}
              >
                <Ionicons name="close-circle" size={24} color="white" />
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.actions}>
            <View style={styles.mediaButtons}>
              <TouchableOpacity 
                style={styles.mediaButton} 
                onPress={async () => await CameraUtils.takePicture(setImage, 'posts', isEditing)}
                disabled={uploadingImage}
              >
                <Ionicons name="camera" size={24} color={Colors.titleGrey} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.mediaButton} 
                onPress={async () => await CameraUtils.pickImage(setImage, 'posts', isEditing)}
                disabled={uploadingImage}
              >
                <Ionicons name="images" size={24} color={Colors.titleGrey} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.mediaButton, 
                  location ? styles.mediaButtonActive : null
                ]} 
                onPress={location ? removeLocation : getCurrentLocation}
                disabled={locationLoading}
              >
                <Ionicons 
                  name={location ? "location" : "location-outline"} 
                  size={24} 
                  color={location ? "white" : Colors.titleGrey} 
                />
              </TouchableOpacity>
            </View>

            {(uploadingImage || locationLoading) && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.titleGrey} />
                <Text style={styles.loadingText}>
                  {uploadingImage ? 'Enviando imagem...' : 'Obtendo localização...'}
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={[
                styles.submitButton,
                loading || uploadingImage ? styles.disabledButton : null
              ]}
              onPress={handleSubmit}
              disabled={loading || uploadingImage}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditing ? 'Atualizar' : 'Publicar'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          
          {location && (
            <View style={styles.locationInfo}>
              <Ionicons name="location" size={16} color={Colors.textGrey} />
              <Text style={styles.locationText}>
                {location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.titleGrey,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    color: Colors.textGrey,
    marginBottom: 16,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
  },
  actions: {
    marginTop: 8,
  },
  mediaButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  mediaButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mediaButtonActive: {
    backgroundColor: Colors.titleGrey,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.textGrey,
  },
  submitButton: {
    backgroundColor: Colors.titleGrey,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: Colors.textGrey,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
    color: Colors.textGrey,
    flex: 1,
  },
});