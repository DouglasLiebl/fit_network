import { Timestamp } from "firebase/firestore";

export type Expense = {
  id: string;
  date: Date;
  amount: number;
  description: string;
  createdAt: Date;
};

export type GroupedExpenses = {
  title: string;
  data: Expense[];
}

export type ExpenseModalProps = {
  visible: boolean;
  isEditing: boolean;
  selectedExpense: Expense | null;
  onClose: () => void;
  onSave: (date: Date, amount: number, description: string) => Promise<void>;
  loading: boolean;
};

export type ActionModalProps = {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export type ExpenseItemProps = {
  expense: Expense;
  onLongPress: (expense: Expense) => void;
};

export type ExpenseSectionHeaderProps = {
  section: GroupedExpenses;
};

export type ExpenseListProps = {
  groupedExpenses: GroupedExpenses[];
  expenses: Expense[];
  onItemLongPress: (expense: Expense) => void;
  loading: boolean;
};

export type ExpenseSummaryProps = {
  totalAmount: number;
};