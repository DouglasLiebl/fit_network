import React, { useEffect, useState } from 'react';
import { 
  Modal, 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  Image, 
  Dimensions, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ImageModalProps {
    visible: boolean;
    onClose: () => void;
    imageUrl: string;
}

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

export default function ImageModal({ 
  visible, 
  onClose,
  imageUrl
}: ImageModalProps) {
  const [imageDimensions, setImageDimensions] = useState<{ width: number, height: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (imageUrl) {
      Image.getSize(
        imageUrl,
        (width, height) => {
          setImageDimensions({ width, height });
          setLoading(false);
        },
        (error) => {
          console.error('Failed to get image dimensions', error);
          setLoading(false);
        }
      );
    }
  }, [imageUrl]);

  const getScaledDimensions = () => {
    if (!imageDimensions) return { width: 0, height: 0 };

    const maxWidth = screenWidth * 0.9;
    const maxHeight = screenHeight * 0.9;

    const widthRatio = maxWidth / imageDimensions.width;
    const heightRatio = maxHeight / imageDimensions.height;
    const scaleFactor = Math.min(widthRatio, heightRatio, 1); // prevent upscaling

    return {
      width: imageDimensions.width * scaleFactor,
      height: imageDimensions.height * scaleFactor,
    };
  };

  const { width, height } = getScaledDimensions();

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1}>
          <View style={styles.modalView}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>

            {loading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <Image
                source={{ uri: imageUrl }}
                style={{ width, height, borderRadius: 12 }}
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
});
