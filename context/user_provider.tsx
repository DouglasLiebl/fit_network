import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserContextType = {
  user: User | null,
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  trackLikedPost: (postId: string, liked: boolean) => void;
  isPostLikedLocally: (postId: string) => boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
  trackLikedPost: () => {},
  isPostLikedLocally: () => false,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const trackLikedPost = (postId: string, liked: boolean) => {
    setLikedPosts((prev: Record<string, boolean>) => ({
      ...prev,
      [postId]: liked,
    }));
  };
  
  const isPostLikedLocally = (postId: string): boolean => {
    return !!likedPosts[postId];
  };

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
          setLikedPosts({});
          
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
      trackLikedPost,
      isPostLikedLocally 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};
