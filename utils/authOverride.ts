import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_OVERRIDE_KEY = 'auth_overrides';

type AuthOverrides = {
  forceNullPhotoURL?: boolean;
  lastUpdated?: number;
};

export const forceNullPhotoURL = async (): Promise<void> => {
  try {
    const overrideJson = await AsyncStorage.getItem(AUTH_OVERRIDE_KEY);
    const overrides: AuthOverrides = overrideJson ? JSON.parse(overrideJson) : {};
    
    overrides.forceNullPhotoURL = true;
    overrides.lastUpdated = Date.now();
    
    await AsyncStorage.setItem(AUTH_OVERRIDE_KEY, JSON.stringify(overrides));
  } catch (error) {
  }
};

export const shouldForceNullPhotoURL = async (): Promise<boolean> => {
  try {
    const overrideJson = await AsyncStorage.getItem(AUTH_OVERRIDE_KEY);
    if (!overrideJson) return false;
    
    const overrides: AuthOverrides = JSON.parse(overrideJson);
    return !!overrides.forceNullPhotoURL;
  } catch (error) {
    return false;
  }
};

export const clearAuthOverrides = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(AUTH_OVERRIDE_KEY);
  } catch (error) {
  }
};

export const applyAuthOverrides = async (user: any): Promise<any> => {
  if (!user) return user;
  
  try {
    const overriddenUser = { ...user };
    
    if (await shouldForceNullPhotoURL()) {
      overriddenUser.photoURL = null;
    }
    
    return overriddenUser;
  } catch (error) {
    return user;
  }
};
