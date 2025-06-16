import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';
import { ExpenseItemProps } from '@/@types/ExpenseTypes';
import { formatCurrency } from '@/utils/expenseUtils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function ExpenseItem({ expense, onLongPress }: ExpenseItemProps): React.JSX.Element {
  return (
    <TouchableOpacity 
      style={styles.expenseItem}
      onLongPress={() => onLongPress(expense)}
      delayLongPress={500}
    >
      <View style={styles.expenseHeader}>
        <Text style={styles.expenseTime}>
          {format(expense.date, 'HH:mm', { locale: pt })}
        </Text>
        <Text style={styles.expenseAmount}>
          {formatCurrency(expense.amount)}
        </Text>
      </View>
      <Text style={styles.expenseDescription}>{expense.description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  expenseItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    marginLeft: 8,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  expenseTime: {
    fontSize: 14,
    fontFamily: 'JetBrainsMono_500Medium',
    color: Colors.subtitleGrey,
  },
  expenseAmount: {
    fontSize: 16,
    fontFamily: 'JetBrainsMono_700Bold',
    color: Colors.titleGrey,
  },
  expenseDescription: {
    fontSize: 14,
    fontFamily: 'JetBrainsMono_400Regular',
    color: '#333',
  },
});