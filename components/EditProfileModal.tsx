import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  TouchableOpacity, 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ActivityIndicator, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import UserUtils from '@/utils/userUtils';
import { Alert } from '@/utils/alertUtils';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdate: () => void;
  userData: {
    displayName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
  };
}

export default function EditProfileModal({ 
  visible, 
  onClose,
  onUpdate,
  userData
}: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [originalEmail, setOriginalEmail] = useState('');

  useEffect(() => {
    if (visible) {
      setDisplayName(userData.displayName || '');
      setEmail(userData.email || '');
      setPhoneNumber(userData.phoneNumber || '');
      setOriginalEmail(userData.email || '');
      setCurrentPassword('');
      setShowPasswordField(false);
    }
  }, [visible, userData]);

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setShowPasswordField(text !== originalEmail && text.trim() !== '');
  };

  const handleSave = async () => {
    // Validate inputs
    if (!displayName.trim()) {
      Alert.error('Erro', 'O nome não pode estar vazio');
      return;
    }

    if (email.trim() && !email.includes('@')) {
      Alert.error('Erro', 'Por favor, insira um email válido');
      return;
    }

    try {
      setLoading(true);

      const updateData: {
        displayName: string;
        email?: string;
        phoneNumber?: string;
        currentPassword?: string;
      } = {
        displayName: displayName.trim()
      };

      if (email.trim() && email !== originalEmail) {
        updateData.email = email.trim();

        if (!currentPassword) {
          Alert.error('Erro', 'É necessário informar a senha atual para alterar o email');
          setLoading(false);
          return;
        }
        
        updateData.currentPassword = currentPassword;
      }

      if (phoneNumber.trim()) {
        updateData.phoneNumber = phoneNumber.trim();
      } else {
        updateData.phoneNumber = '';
      }

      const result = await UserUtils.updateUserProfile(updateData);

      if (result.success) {
        Alert.success('Sucesso', 'Perfil atualizado com sucesso');
        onUpdate();
        onClose();
      } else {
        if (result.requiresReauth) {
          Alert.error('Erro', 'Sua sessão expirou. Por favor, faça login novamente para alterar seu email.');
        } else {
          Alert.error('Erro', result.error || 'Não foi possível atualizar o perfil');
        }
      }
    } catch (error: any) {
      Alert.error('Erro', error.message || 'Ocorreu um erro ao atualizar o perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.textGrey} />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Editar Perfil</Text>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Seu nome"
                placeholderTextColor="#999"
                autoCapitalize="words"
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={handleEmailChange}
                placeholder="Seu email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {showPasswordField && (
                <>
                  <Text style={styles.label}>Senha atual (necessária para alterar o email)</Text>
                  <TextInput
                    style={styles.input}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Sua senha atual"
                    placeholderTextColor="#999"
                    secureTextEntry
                  />
                </>
              )}

              <Text style={styles.label}>Telefone</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Seu telefone"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />

              <View style={styles.buttonContainer}>
                {loading ? (
                  <ActivityIndicator size="large" color={Colors.titleGrey} />
                ) : (
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                  >
                    <Text style={styles.saveButtonText}>Salvar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: '80%',
    maxWidth: 400,
    padding: 20,
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
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.titleGrey,
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxHeight: '100%',
  },
  label: {
    fontSize: 14,
    color: Colors.textGrey,
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: Colors.titleGrey,
    width: '100%',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: Colors.titleGrey,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
});
