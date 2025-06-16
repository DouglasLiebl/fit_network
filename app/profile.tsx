import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from "react-native";
import { useUser } from "@/context/user_provider";
import Colors from "@/constants/Colors";
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import InfoItem from "@/components/InfoItem";

interface UserData {
  userId: string;
  displayName: string | null;
  email: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: any;
  lastLogin: any;
  phoneNumber: string | null;
  photoURL: string | null;
}

export default function Profile(): React.JSX.Element {
  const { user, setUser } = useUser();
  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userStats, setUserStats] = useState({
    totalExpenses: 0,
    expenseCount: 0,
  });

  useEffect(() => {
    if (user && user.uid) {
      fetchUserData();
      fetchUserStats();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      const userDocRef = doc(db, "users", user!.uid);
      const userDocSnapshot = await getDoc(userDocRef);
      
      if (userDocSnapshot.exists()) {
        const data = userDocSnapshot.data() as UserData;
        setUserData(data);
      } else {
        setUserData({
          userId: user!.uid,
          displayName: user?.displayName || null,
          email: user?.email || "",
          emailVerified: user?.emailVerified || false,
          isActive: true,
          createdAt: new Date(),
          lastLogin: new Date(),
          phoneNumber: null,
          photoURL: user?.photoURL || null,
        });
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao carregar dados do usuário.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      if (!user?.uid) return;
      
      const expensesRef = collection(db, "data");
      const userExpensesQuery = query(expensesRef, where("userId", "==", user.uid));
      
      const querySnapshot = await getDocs(userExpensesQuery);
      let totalAmount = 0;
      let count = 0;
      
      querySnapshot.forEach((doc) => {
        const expenseData = doc.data();
        totalAmount += expenseData.amount || 0;
        count++;
      });
      
      setUserStats({
        totalExpenses: totalAmount,
        expenseCount: count,
      });
      
    } catch (error) {
      console.error("Error fetching user stats:", error);
      setUserStats({
        totalExpenses: 0,
        expenseCount: 0,
      });
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Confirmação",
      "Tem certeza que deseja sair da sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          onPress: async () => {
            try {
              setLoading(true);
              await signOut(auth);
              await AsyncStorage.removeItem('userData');
              setUser(null);
              router.replace("/login");
            } catch (error) {
              console.error("Error signing out:", error);
              Alert.alert("Erro", "Não foi possível sair da conta.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatFirestoreTimestamp = (timestamp: any): string => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      
      return new Intl.DateTimeFormat('pt-BR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }).format(date);
    } catch (error) {
      console.warn('Error formatting date, using fallback format', error);
      return 'Data não disponível';
    }
  };

  const formatCurrency = (value: number): string => {
    return `R$ ${value.toFixed(2)}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.titleGrey} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
    
      <View style={styles.section}>
        <InfoItem label={"Email"} value={userData?.email} />
        <InfoItem label={"Telefone"} value={userData?.phoneNumber || undefined} />
        <InfoItem label={"Email verificado"} value={userData?.emailVerified ? "Sim" : "Não"} />
        <InfoItem label={"Último acesso"} value={userData?.lastLogin ? formatFirestoreTimestamp(userData.lastLogin) : undefined} />
      
      </View>


      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatCurrency(userStats.totalExpenses)}</Text>
          <Text style={styles.statLabel}>Total de despesas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userStats.expenseCount}</Text>
          <Text style={styles.statLabel}>Registros</Text>
        </View>
      </View>


      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutItem]} 
          onPress={handleLogout}
        >
          <View style={styles.menuItemLeft}>
            <MaterialIcons name="logout" size={22} color="#E53935" />
            <Text style={[styles.menuItemText, styles.logoutText]}>Sair</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundGrey,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: "JetBrainsMono_400Regular",
    color: Colors.subtitleGrey,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontFamily: "JetBrainsMono_600SemiBold",
    color: "white",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    fontFamily: "JetBrainsMono_400Regular",
    color: Colors.backgroundGrey,
    opacity: 0.8,
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
    fontFamily: "JetBrainsMono_400Regular",
    color: Colors.backgroundGrey,
    opacity: 0.7,
  },
  verificatonStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundGrey,
    borderRadius: 8,
    margin: 16,
    padding: 16
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontFamily: "JetBrainsMono_700Bold",
    color: Colors.titleGrey,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "JetBrainsMono_400Regular",
    color: Colors.subtitleGrey,
  },
  section: {
    backgroundColor: Colors.backgroundGrey,
    borderRadius: 8,
    margin: 16,
    marginTop: 0,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "JetBrainsMono_600SemiBold",
    color: Colors.titleGrey,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingLabel: {
    fontSize: 14,
    fontFamily: "JetBrainsMono_400Regular",
    color: Colors.titleGrey,
    marginLeft: 12,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    fontSize: 14,
    fontFamily: "JetBrainsMono_400Regular",
    color: Colors.titleGrey,
    marginLeft: 12,
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: "#E53935",
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    fontFamily: "JetBrainsMono_400Regular",
    color: Colors.subtitleGrey,
    marginBottom: 4,
  },
});