import React, { useState } from 'react';
import { 
  Modal, 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  Image, 
  Text,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import CameraUtils from '@/utils/cameraUtils';
import UserUtils from '@/utils/userUtils';
import { Alert } from '@/utils/alertUtils';

interface ProfilePhotoModalProps {
    visible: boolean;
    onClose: () => void;
    photoURL: string | null;
    onPhotoUpdated: () => void;
}

export default function ProfilePhotoModal({ 
  visible, 
  onClose,
  photoURL,
  onPhotoUpdated
}: ProfilePhotoModalProps) {
  const [loading, setLoading] = useState(false);
  
  const handleTakePhoto = () => {
    CameraUtils.takePicture(handleImageSelect, 'pfp', true);
  };
  
  const handlePickPhoto = () => {
    CameraUtils.pickImage(handleImageSelect, 'pfp', true);
  };

  const handleRemovePhoto = async () => {
    try {
      setLoading(true);
      const success = await UserUtils.updateProfilePhoto(null);
      
      if (success) {
        Alert.success('Sucesso', 'Foto de perfil removida com sucesso');
        onPhotoUpdated();
      } else {
        Alert.error('Erro', 'Não foi possível remover a foto de perfil');
      }
    } catch (error) {
      Alert.error('Erro', 'Ocorreu um erro ao remover a foto de perfil');
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const handleImageSelect = async (imageUrl: string) => {
    try {
      setLoading(true);
      
      const timestampedUrl = `${imageUrl}?t=${new Date().getTime()}`;
      const success = await UserUtils.updateProfilePhoto(timestampedUrl);
      
      if (success) {
        Alert.success('Sucesso', 'Foto de perfil atualizada com sucesso');
        
        setTimeout(() => {
          onPhotoUpdated();
        }, 500);
      } else {
        Alert.error('Erro', 'Não foi possível atualizar a foto de perfil');
      }
    } catch (error) {
      Alert.error('Erro', 'Ocorreu um erro ao atualizar a foto de perfil');
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textGrey} />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Foto de Perfil</Text>

          {photoURL && (
            <Image
              source={{ 
                uri: photoURL,
                cache: 'reload'
              }}
              style={styles.profileImage}
              resizeMode="cover"
            />
          )}

          {loading ? (
            <ActivityIndicator size="large" color={Colors.titleGrey} style={styles.loading} />
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.optionButton} onPress={handleTakePhoto}>
                <Ionicons name="camera" size={24} color={Colors.titleGrey} />
                <Text style={styles.buttonText}>Tirar Foto</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.optionButton} onPress={handlePickPhoto}>
                <Ionicons name="images" size={24} color={Colors.titleGrey} />
                <Text style={styles.buttonText}>Escolher da Galeria</Text>
              </TouchableOpacity>
              
              {photoURL && (
                <TouchableOpacity style={styles.removeButton} onPress={handleRemovePhoto}>
                  <Ionicons name="trash" size={24} color="#E53935" />
                  <Text style={styles.removeButtonText}>Remover Foto</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.titleGrey,
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#F5F5F5',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    backgroundColor: '#FFEBEE',
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
    color: Colors.textGrey,
  },
  removeButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#E53935',
  },
  loading: {
    marginVertical: 20,
  },
});
