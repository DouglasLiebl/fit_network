import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserContextType = {
  user: User | null,
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      
      try {
        if (currentUser) {
          setUser(currentUser as User);
          
          const userData = JSON.stringify({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          });
          await AsyncStorage.setItem('userData', userData);
        } else {
          setUser(null);
          
          await AsyncStorage.removeItem('userData');
        }
      } catch (e) {
        console.error('[AuthStateChanged] Error handling user data', e);
      } finally {
        setLoading(false);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  console.log('[UserProvider] Current state', { hasUser: !!user, loading });
  
  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      loading, 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};