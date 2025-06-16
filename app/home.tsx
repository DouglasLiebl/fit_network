import React, { useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import Colors from "@/constants/Colors";
import { useUser } from "@/context/user_provider";
import { collection, addDoc, getFirestore, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"; 
import { Expense } from "@/@types/ExpenseTypes";
import { groupExpensesByDate, calculateTotalExpenses } from "@/utils/expenseUtils";
import { Alert } from "@/utils/alertUtils";
import ExpenseSummary from "@/components/ExpenseSummary";
import ExpenseList from "@/components/ExpenseList";
import ExpenseForm from "@/components/ExpenseForm";
import ActionModal from "@/components/ActionModal";

export default function Home(): React.JSX.Element {
  const [modalVisible, setModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [groupedExpenses, setGroupedExpenses] = useState<any[]>([]);
  const [fetchingData, setFetchingData] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useUser();
  const db = getFirestore();

  useEffect(() => {
    if (user && user.uid) {
      fetchUserExpenses();
    } else {
      setFetchingData(false);
    }
  }, [user]);

  const fetchUserExpenses = async () => {
    try {
      setFetchingData(true);
      const q = query(
        collection(db, "data"),
        where("userId", "==", user?.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedExpenses: Expense[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedExpenses.push({
          id: doc.id,
          date: data.date.toDate(),
          amount: data.amount,
          description: data.description,
          createdAt: data.createdAt.toDate(),
        });
      });
      
      fetchedExpenses.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      setExpenses(fetchedExpenses);
      
      const grouped = groupExpensesByDate(fetchedExpenses);
      setGroupedExpenses(grouped);
      
      setFetchingData(false);
    } catch (error) {
      setFetchingData(false);
      Alert.error("Erro", "Não foi possível carregar suas despesas.");
    }
  };

  const handleLongPress = (expense: Expense) => {
    setSelectedExpense(expense);
    setActionModalVisible(true);
  };

  const handleEditExpense = () => {
    if (!selectedExpense) return;
    
    setActionModalVisible(false);
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;
    
    const confirmed = await Alert.confirm(
      "Confirmação",
      "Tem certeza que deseja excluir esta despesa?"
    );
    
    if (confirmed) {
      deleteExpense();
    } else {
      setActionModalVisible(false);
    }
  };

  const deleteExpense = async () => {
    if (!selectedExpense) return;
    
    try {
      setActionModalVisible(false);
      setLoading(true);
      
      await deleteDoc(doc(db, "data", selectedExpense.id));
      
      const updatedExpenses = expenses.filter(e => e.id !== selectedExpense.id);
      setExpenses(updatedExpenses);
      
      const updatedGrouped = groupExpensesByDate(updatedExpenses);
      setGroupedExpenses(updatedGrouped);
      
      setLoading(false);
      setSelectedExpense(null);
      
      Alert.success("Sucesso", "Despesa excluída com sucesso!");
    } catch (error: any) {
      setLoading(false);
      Alert.error("Erro", "Não foi possível excluir a despesa: " + error.message);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedExpense(null);
    setModalVisible(true);
  };

  const handleSave = async (date: Date, amount: number, description: string) => {
    if (!amount || amount <= 0) {
      Alert.warning('Atenção', 'Por favor, informe um valor válido');
      return;
    }
  
    if (!user || !user.uid) {
      Alert.error('Erro', 'Usuário não autenticado. Por favor, faça login novamente.');
      return;
    }
  
    try {
      setLoading(true);
      
      if (isEditing && selectedExpense) {
        await updateDoc(doc(db, "data", selectedExpense.id), {
          date: date,
          amount: amount,
          description: description || 'Despesa sem descrição',
        });
        
        Alert.success('Sucesso', 'Despesa atualizada com sucesso!');
      } else {
        await addDoc(collection(db, "data"), {
          userId: user.uid,
          date: date,
          amount: amount,
          description: description || 'Despesa sem descrição',
          createdAt: new Date()
        });
        
        Alert.success('Sucesso', 'Despesa registrada com sucesso!');
      }
  
      setLoading(false);
      setModalVisible(false);
      setIsEditing(false);
      setSelectedExpense(null);
      
      fetchUserExpenses();
    } catch (error: any) {
      setLoading(false);
      Alert.error('Erro', `Erro ao ${isEditing ? 'atualizar' : 'registrar'} despesa: ` + error.message);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setIsEditing(false);
    setSelectedExpense(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ExpenseSummary totalAmount={calculateTotalExpenses(expenses)} />
        <ExpenseList 
          groupedExpenses={groupedExpenses} 
          expenses={expenses} 
          onItemLongPress={handleLongPress}
          loading={fetchingData}
        />
      </View>
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={openAddModal}
      >
        <Text style={styles.addButtonText}>
          +
        </Text>
      </TouchableOpacity>
      <ExpenseForm 
        visible={modalVisible}
        isEditing={isEditing}
        selectedExpense={selectedExpense}
        onClose={closeModal}
        onSave={handleSave}
        loading={loading}
      />
      <ActionModal 
        visible={actionModalVisible}
        onClose={() => setActionModalVisible(false)}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGrey,
    paddingTop: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  addButton: {
    backgroundColor: Colors.titleGrey,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 8,
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 25,
    lineHeight: 30,
    fontWeight: 'bold',
    fontFamily: 'JetBrainsMono_500Medium',
    includeFontPadding: false,
  }
});