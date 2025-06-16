import React from 'react';
import { SectionList, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Colors from '@/constants/Colors';
import { ExpenseListProps } from '@/@types/ExpenseTypes';
import ExpenseItem from './ExpenseItem';
import ExpenseSectionHeader from './ExpenseSectionHeader';

export default function ExpenseList({ 
  groupedExpenses, 
  expenses, 
  onItemLongPress, 
  loading 
}: ExpenseListProps): React.JSX.Element {
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.titleGrey} />
        <Text style={styles.loadingText}>Carregando despesas...</Text>
      </View>
    );
  }

  if (expenses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Você ainda não tem despesas registradas.</Text>
        <Text style={styles.emptySubText}>Toque no botão abaixo para adicionar uma.</Text>
      </View>
    );
  }
  
  return (
    <SectionList
      sections={groupedExpenses}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ExpenseItem expense={item} onLongPress={onItemLongPress} />
      )}
      renderSectionHeader={({ section }) => (
        <ExpenseSectionHeader section={section} />
      )}
      stickySectionHeadersEnabled={true}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'JetBrainsMono_400Regular',
    color: Colors.subtitleGrey,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'JetBrainsMono_400Regular',
    color: Colors.subtitleGrey,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 12,
    fontFamily: 'JetBrainsMono_400Regular',
    color: Colors.subtitleGrey,
    textAlign: 'center',
    marginTop: 8,
  },
});