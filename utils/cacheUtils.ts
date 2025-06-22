import { Platform, Image } from 'react-native';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

/**
 * Utility functions for managing cache in the app
 */
export const CacheUtils = {  async clearImageCache(): Promise<void> {
    try {
      if (Image.queryCache) {
        await Image.queryCache([]);
      }
      
      if (Platform.OS !== 'web') {
        const cacheDir = FileSystem.cacheDirectory;
        if (cacheDir) {
          try {
            const cacheDirs = [
              'ImagePicker', 
              'ExponentImagePicker',
              'ImageManipulator',
              'Camera',
              'Photos'
            ];
            
            for (const dir of cacheDirs) {
              try {
                await FileSystem.deleteAsync(`${cacheDir}${dir}`, { idempotent: true });
              } catch (e) {
              }
            }
            
            try {
              const cacheContents = await FileSystem.readDirectoryAsync(cacheDir);
              const imageFiles = cacheContents.filter(filename => 
                /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(filename)
              );
              
              for (const file of imageFiles) {
                await FileSystem.deleteAsync(`${cacheDir}${file}`, { idempotent: true });
              }
            } catch (err) {
            }
          } catch (err) {
          }
        }
        try {
          await ImagePicker.getPendingResultAsync();
        } catch (e) {
    
        }
      }
      
      const keys = await AsyncStorage.getAllKeys();
      
      const imageCacheKeys = keys.filter(key => 
        key.startsWith('imageCache_') || 
        key.includes('photo') ||
        key.includes('image') ||
        key.includes('profile') ||
        key.includes('userData')
      );
      
      const userDataKey = keys.find(key => key === 'userData');
      if (userDataKey) {
        try {
          const userData = await AsyncStorage.getItem(userDataKey);
          if (userData) {
            const parsedData = JSON.parse(userData);
            if (parsedData.photoURL) {
              parsedData.photoURL = null;
              await AsyncStorage.setItem(userDataKey, JSON.stringify(parsedData));
            }
          }
        } catch (e) {
        }
      }
      
      const keysToRemove = imageCacheKeys.filter(key => key !== 'userData');
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }
    } catch (error) {
    }
  },

  getUncachedUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    
    let cleanUrl = url;
    if (cleanUrl.includes('cache=') || cleanUrl.includes('nocache=')) {
      cleanUrl = cleanUrl.replace(/[\?&](cache|nocache)=[^&]+/g, '');
      cleanUrl = cleanUrl.replace(/[?&]$/g, '');
    }
    
    const separator = cleanUrl.includes('?') ? '&' : '?';
    return `${cleanUrl}${separator}nocache=${new Date().getTime()}-${Math.random().toString(36).substring(2, 7)}`;
  },
  
  async clearAllCache(): Promise<void> {
    try {
      await this.clearImageCache();
      
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => 
        key.startsWith('cache_') || 
        key.startsWith('temp_') || 
        key.includes('image')
      );
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
      
    } catch (error) {
    }
  }
};
