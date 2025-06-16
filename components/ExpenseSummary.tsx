import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { ExpenseSummaryProps } from '@/@types/ExpenseTypes';
import { formatCurrency } from '@/utils/expenseUtils';

export default function ExpenseSummary({ totalAmount }: ExpenseSummaryProps): React.JSX.Element {
  return (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryLabel}>Total:</Text>
      <Text style={styles.summaryValue}>{formatCurrency(totalAmount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryLabel: {
    fontSize: 16,
    fontFamily: 'JetBrainsMono_500Medium',
    color: Colors.subtitleGrey,
  },
  summaryValue: {
    fontSize: 20,
    fontFamily: 'JetBrainsMono_700Bold',
    color: Colors.titleGrey,
  },
});