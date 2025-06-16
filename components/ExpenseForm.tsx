import React, { useState, useEffect } from 'react';
import { View, Text, Modal, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import Colors from '@/constants/Colors';
import { ExpenseModalProps } from '@/@types/ExpenseTypes';
import { formatCurrency, parseCurrency } from '@/utils/expenseUtils';
import Button from './Button';
import InputField from './InputField';
import LabeledDatePicker from './LabeledDatePicker';

export default function ExpenseForm({
  visible,
  isEditing,
  selectedExpense,
  onClose,
  onSave,
  loading
}: ExpenseModalProps): React.JSX.Element {
  const [date, setDate] = useState(new Date());
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (visible) {
      if (isEditing && selectedExpense) {
        setDate(selectedExpense.date);
        setAmount(formatCurrency(selectedExpense.amount));
        setDescription(selectedExpense.description);
      } else {
        setDate(new Date());
        setAmount('');
        setDescription('');
      }
    }
  }, [visible, isEditing, selectedExpense]);

  const handleAmountChange = (text: string) => {
    const formatted = formatCurrency(text);
    setAmount(formatted);
  };

  const handleSavePress = async () => {
    const numericAmount = parseCurrency(amount);
    await onSave(date, numericAmount, description);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>
            {isEditing ? 'Editar Despesa' : 'Nova Despesa'}
          </Text>
          <LabeledDatePicker 
            date={date}
            onChange={setDate}
            disabled={loading}
          />
          <InputField
            label="Valor:"
            value={amount}
            onChange={handleAmountChange}
            placeholder="R$ 0.00"
            keyboardType="numeric"
            disabled={loading}
          />
          <InputField
            label="Descrição (opcional):"
            value={description}
            onChange={setDescription}
            placeholder="Descreva sua despesa"
            multiline={true}
            height={80}
            disabled={loading}
          />
          <View style={styles.buttonContainer}>
            <Button
              value="Cancelar"
              onPress={onClose}
              variant="cancel"
              disabled={loading}
              style={styles.buttonStyle}
            />
            <Button
              value={loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Salvar'}
              onPress={handleSavePress}
              variant="save"
              loading={loading}
              disabled={loading || !amount || amount === 'R$ 0.00'}
              style={styles.buttonStyle}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
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
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'JetBrainsMono_600SemiBold',
    color: Colors.titleGrey,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  buttonStyle: {
    flex: 1,
    marginHorizontal: 5,
  }
});