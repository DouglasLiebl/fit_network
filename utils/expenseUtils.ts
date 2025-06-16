import { format } from 'date-fns';
import { Expense, GroupedExpenses } from '@/@types/ExpenseTypes';

export const formatCurrency = (value: string | number): string => {
  if (typeof value === 'number') {
    return `R$ ${value.toFixed(2)}`;
  }
  
  const numericValue = value.replace(/[^0-9]/g, '');
  const floatValue = (parseInt(numericValue || '0') / 100).toFixed(2);
  return `R$ ${floatValue}`;
};

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace('R$ ', '').replace(',', '.'));
};

export const calculateSectionTotal = (expenses: Expense[]): string => {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  return formatCurrency(total);
};

export const calculateTotalExpenses = (expenses: Expense[]): number => {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};


export const groupExpensesByDate = (expenses: Expense[]): GroupedExpenses[] => {
  const groups: { [key: string]: Expense[] } = {};
  
  expenses.forEach(expense => {
    const dateKey = format(expense.date, 'dd/MM/yyyy');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(expense);
  });
  
  const groupedData: GroupedExpenses[] = Object.keys(groups).map(date => ({
    title: date,
    data: groups[date]
  }));
  
  groupedData.sort((a, b) => {
    const dateA = new Date(a.data[0].date);
    const dateB = new Date(b.data[0].date);
    return dateB.getTime() - dateA.getTime();
  });
  
  return groupedData;
};