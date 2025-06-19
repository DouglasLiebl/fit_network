import React from 'react';
import { Modal, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { ActionModalProps } from '@/@types/ExpenseTypes';

export default function ActionModal({ 
  visible, 
  onClose, 
  onEdit, 
  onDelete 
}: ActionModalProps): React.JSX.Element {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.actionModalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.actionModalView}>
          <Text style={styles.actionModalTitle}>Opções</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
            <Text style={styles.actionButtonText}>Editar Post</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Excluir Post</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelActionButton]} 
            onPress={onClose}
          >
            <Text style={styles.actionButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionModalView: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  actionModalTitle: {
    fontSize: 18,
    fontFamily: 'JetBrainsMono_600SemiBold',
    marginBottom: 16,
    textAlign: 'center',
    color: Colors.titleGrey,
  },
  actionButton: {
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginVertical: 6,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'JetBrainsMono_500Medium',
    textAlign: 'center',
    color: Colors.titleGrey,
  },
  deleteButtonText: {
    color: '#E53935',
  },
  cancelActionButton: {
    marginTop: 6,
    backgroundColor: '#e0e0e0',
  }
});