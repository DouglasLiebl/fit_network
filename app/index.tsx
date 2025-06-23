import { Redirect } from 'expo-router';
import { auth } from "@/context/firebase";
import { useState, useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import Colors from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@/context/user_provider';

export default function Index() {
  console.log('[Index] Component initializing');
  const [initializing, setInitializing] = useState(true);
  const { user, loading } = useUser();

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        console.log('[Index] Auth state check completed', { hasStoredData: !!userData });
        setInitializing(false);
      } catch (error) {
        console.error('[Index] Error checking auth state:', error);
        setInitializing(false);
      }
    };


    if (!loading || user) {
      setInitializing(false);
    } else {
      checkAuthState();
    }
    
    const timeoutId = setTimeout(() => {
      if (initializing) {
        console.log('[Index] Safety timeout triggered - forcing initialization complete');
        setInitializing(false);
      }
    }, 3000);
    
    return () => clearTimeout(timeoutId);
  }, [loading, user]);

  if (initializing || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.backgroundGrey }}>
        <ActivityIndicator size="large" color={Colors.titleGrey} />
        <Text style={{ marginTop: 10, color: Colors.titleGrey, fontFamily: 'JetBrainsMono_400Regular' }}>
          Carregando, por favor aguarde...
        </Text>
      </View>
    );
  }

  if (user) {
    return <Redirect href="/home" />;
  } else {
    return <Redirect href="/login" />;
  }
}