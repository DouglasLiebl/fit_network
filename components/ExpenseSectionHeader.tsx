import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { ExpenseSectionHeaderProps } from '@/@types/ExpenseTypes';
import { calculateSectionTotal } from '@/utils/expenseUtils';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export default function ExpenseSectionHeader({ section }: ExpenseSectionHeaderProps): React.JSX.Element {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        <Text style={styles.sectionDate}>{section.title}</Text>
        <Text style={styles.sectionDay}>
          {format(section.data[0].date, 'EEEE', { locale: pt })}
        </Text>
      </View>
      <View style={styles.sectionHeaderRight}>
        <Text style={styles.sectionTotal}>{calculateSectionTotal(section.data)}</Text>
        <Text style={styles.sectionCount}>{section.data.length} itens</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    marginTop: 8,
  },
  sectionHeaderLeft: {
    flexDirection: 'column',
  },
  sectionHeaderRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  sectionDate: {
    fontSize: 16,
    fontFamily: 'JetBrainsMono_600SemiBold',
    color: Colors.titleGrey,
  },
  sectionDay: {
    fontSize: 12,
    fontFamily: 'JetBrainsMono_400Regular',
    color: Colors.subtitleGrey,
    textTransform: 'capitalize',
  },
  sectionTotal: {
    fontSize: 16,
    fontFamily: 'JetBrainsMono_600SemiBold',
    color: Colors.titleGrey,
  },
  sectionCount: {
    fontSize: 12,
    fontFamily: 'JetBrainsMono_400Regular',
    color: Colors.subtitleGrey,
  },
});