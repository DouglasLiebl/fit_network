import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, User, updateProfile } from 'firebase/auth';
import { getFirestore, doc, getDoc, deleteField, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CacheUtils } from '@/utils/cacheUtils';
import { applyAuthOverrides, forceNullPhotoURL } from '@/utils/authOverride';

type UserContextType = {
  user: User | null,
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  trackLikedPost: (postId: string, liked: boolean) => void;
  isPostLikedLocally: (postId: string) => boolean;
  refreshUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
  trackLikedPost: () => {},
  isPostLikedLocally: () => false,
  refreshUser: async () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  const trackLikedPost = (postId: string, liked: boolean) => {
    setLikedPosts((prev: Record<string, boolean>) => ({
      ...prev,
      [postId]: liked,
    }));
  };
  
  const isPostLikedLocally = (postId: string): boolean => {
    return !!likedPosts[postId];
  };
  
  const refreshUser = async (): Promise<void> => {
    if (auth.currentUser) {
      try {
        await CacheUtils.clearAllCache();
        
        const db = getFirestore();
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        const firestoreData = userDoc.data();
        const hasPhotoInFirestore = userDoc.exists() && 
                                    firestoreData && 
                                    firestoreData.hasOwnProperty('photoURL') && 
                                    firestoreData.photoURL;
        
        const currentUser = auth.currentUser;
        await currentUser.reload();
        
        if (!hasPhotoInFirestore && currentUser.photoURL) {
          await updateProfile(currentUser, { photoURL: null });
          
          try {
            await updateProfile(currentUser, { photoURL: null });
            await updateProfile(currentUser, { photoURL: "" });
            
            await currentUser.getIdToken(true);
          } catch (e) {
            console.error("[USER_PROVIDER] Direct Auth API error:", e);
          }
          
          await currentUser.getIdToken(true);
          await currentUser.reload();
        } else if (hasPhotoInFirestore && !currentUser.photoURL) {
          await updateProfile(currentUser, { photoURL: firestoreData.photoURL });
        }
        
        const freshUser = {...currentUser};
        
        if (!hasPhotoInFirestore) {
          freshUser.photoURL = null;
          await forceNullPhotoURL();
        }
        
        const overriddenUser = await applyAuthOverrides(freshUser);
        
        setUser(overriddenUser);
        setRefreshKey(Date.now()); 
        
        const userDataToStore = {
          uid: overriddenUser.uid,
          email: overriddenUser.email,
          displayName: overriddenUser.displayName,
          photoURL: overriddenUser.photoURL,
          lastRefresh: Date.now(),
        };
        
        await AsyncStorage.removeItem('userData');
        await AsyncStorage.setItem('userData', JSON.stringify(userDataToStore));
        
        setTimeout(async () => {
          if (auth.currentUser?.photoURL && !hasPhotoInFirestore) {
            try {
              await updateDoc(userDocRef, {
                photoURL: deleteField()
              });
            } catch (e) {
            }
            
            setUser(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                photoURL: null
              };
            });
          }
        }, 1000);
        
      } catch (error) {
        console.error('[USER_PROVIDER] Error in nuclear refreshUser:', error);
      } finally {
        await CacheUtils.clearAllCache();
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      
      try {
        if (currentUser) {
          const overriddenUser = await applyAuthOverrides(currentUser);
          setUser(overriddenUser as User);
          
          if (!currentUser.displayName) {
            try {
              const db = getFirestore();
              const userDoc = await getDoc(doc(db, "users", currentUser.uid));
              if (userDoc.exists() && userDoc.data().displayName) {
                await updateProfile(currentUser, {
                  displayName: userDoc.data().displayName
                });
              }
            } catch (err) {
              console.error('[AuthStateChanged] Error fetching user data from Firestore', err);
            }
          }
          
          try {
            const db = getFirestore();
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            
            if (currentUser.photoURL && (!userDoc.exists() || !userDoc.data().photoURL)) {
              await forceNullPhotoURL();
            }
          } catch (err) {
            console.error('[AuthStateChanged] Error checking Firestore photoURL', err);
          }
          
          const userData = JSON.stringify({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: overriddenUser.photoURL,
            lastUpdated: Date.now(),
          });
          await AsyncStorage.setItem('userData', userData);
        } else {
          setUser(null);
          await AsyncStorage.removeItem('userData');
        }
      } catch (err) {
        console.error('[AuthStateChanged]', err);
      } finally {
        setLoading(false);
      }
    });

    const checkStoredUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData && !user) {
          const parsedUser = JSON.parse(userData);
        }
      } catch (err) {
        console.error('[CheckStoredUser]', err);
      }
    };

    checkStoredUser();

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      loading,
      trackLikedPost,
      isPostLikedLocally,
      refreshUser,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
