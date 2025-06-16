import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: AlertType;
  onClose: () => void;
  buttons?: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

export default function AlertModal({
  visible,
  title,
  message,
  type = 'info',
  onClose,
  buttons = [{ text: 'OK', onPress: () => {}, style: 'default' }],
}: AlertModalProps): React.JSX.Element {
  
  const getIconName = (): string => {
    switch (type) {
      case 'success':
        return 'checkmark-circle-outline';
      case 'error':
        return 'alert-circle-outline';
      case 'warning':
        return 'warning-outline';
      case 'info':
      default:
        return 'information-circle-outline';
    }
  };

  const getIconColor = (): string => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      case 'info':
      default:
        return Colors.titleGrey;
    }
  };

  const handleButtonPress = (onPress: () => void) => {
    return () => {
      if (onPress) {
        onPress();
      }
      
      onClose();
    };
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.alertContainer}>
              <View style={styles.iconContainer}>
                <Ionicons name={getIconName() as keyof typeof Ionicons.glyphMap} size={48} color={getIconColor()} />
              </View>
              
              <Text style={styles.title}>{title}</Text>
              
              <Text style={styles.message}>{message}</Text>
              
              <View style={[
                styles.buttonContainer, 
                buttons.length > 1 && styles.multipleButtonContainer
              ]}>
                {buttons.map((button, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button,
                      button.style === 'destructive' && styles.destructiveButton,
                      button.style === 'cancel' && styles.cancelButton,
                      buttons.length > 1 && { flex: 1 }
                    ]}
                    onPress={handleButtonPress(button.onPress)}
                  >
                    <Text style={[
                      styles.buttonText,
                      button.style === 'destructive' && styles.destructiveButtonText,
                      button.style === 'cancel' && styles.cancelButtonText
                    ]}>
                      {button.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontFamily: 'JetBrainsMono_600SemiBold',
    color: Colors.titleGrey,
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    fontFamily: 'JetBrainsMono_400Regular',
    color: Colors.subtitleGrey,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },
  multipleButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    backgroundColor: Colors.titleGrey,
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'JetBrainsMono_500Medium',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  destructiveButton: {
    backgroundColor: '#F44336',
  },
  destructiveButtonText: {
    color: 'white',
  },
  cancelButtonText: {
    color: Colors.titleGrey,
  },
});