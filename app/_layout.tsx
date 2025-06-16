import Colors from '@/constants/Colors';
import { UserProvider } from '@/context/user_provider';
import { JetBrainsMono_100Thin, JetBrainsMono_100Thin_Italic, JetBrainsMono_200ExtraLight, JetBrainsMono_200ExtraLight_Italic, JetBrainsMono_300Light, JetBrainsMono_300Light_Italic, JetBrainsMono_400Regular, JetBrainsMono_400Regular_Italic, JetBrainsMono_500Medium, JetBrainsMono_500Medium_Italic, JetBrainsMono_600SemiBold, JetBrainsMono_600SemiBold_Italic, JetBrainsMono_700Bold, JetBrainsMono_700Bold_Italic, JetBrainsMono_800ExtraBold, JetBrainsMono_800ExtraBold_Italic } from '@expo-google-fonts/jetbrains-mono';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import 'react-native-reanimated';
import AlertModal from '@/components/AlertModal';

declare global {
  var showAlert: (
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' | 'warning',
    buttons?: Array<{
      text: string;
      onPress: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>,
    onDismiss?: () => void
  ) => void;
}

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: "index",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    JetBrainsMono_100Thin, 
    JetBrainsMono_200ExtraLight, 
    JetBrainsMono_300Light, 
    JetBrainsMono_400Regular, 
    JetBrainsMono_500Medium, 
    JetBrainsMono_600SemiBold, 
    JetBrainsMono_700Bold, 
    JetBrainsMono_800ExtraBold, 
    JetBrainsMono_100Thin_Italic, 
    JetBrainsMono_200ExtraLight_Italic, 
    JetBrainsMono_300Light_Italic, 
    JetBrainsMono_400Regular_Italic, 
    JetBrainsMono_500Medium_Italic, 
    JetBrainsMono_600SemiBold_Italic, 
    JetBrainsMono_700Bold_Italic, 
    JetBrainsMono_800ExtraBold_Italic
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const router = useRouter();
  
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info' | 'warning',
    buttons: [] as Array<{
      text: string;
      onPress: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>,
    onClose: () => {},
  });

  useEffect(() => {
    global.showAlert = (title, message, type, buttons = [{ text: 'OK', onPress: () => {}, style: 'default' }], onDismiss) => {
      setAlertConfig({
        title,
        message,
        type,
        buttons,
        onClose: () => {
          setAlertVisible(false);
          if (onDismiss) onDismiss();
        },
      });
      setAlertVisible(true);
    };
  }, []);
  
  const ProfileButton = () => (
    <TouchableOpacity 
      onPress={() => router.push('/profile')}
      style={{
        marginRight: 15,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.backgroundGrey,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Ionicons name="person-circle-outline" size={32} color={Colors.titleGrey} />
    </TouchableOpacity>
  );

  return (
    <UserProvider>
      <Stack screenOptions={{
        headerBackVisible: false,
      }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name='register' options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ 
          headerShown: false,
          presentation: "card",
        }} />
        <Stack.Screen 
          name="home" 
          options={{
            headerTitle: 'Minhas Despesas',
            headerTitleStyle: {
              fontFamily: 'JetBrainsMono_600SemiBold',
              fontSize: 20,
              color: Colors.titleGrey,
            },
            headerStyle: {
              backgroundColor: Colors.backgroundGrey,
            },
            headerShadowVisible: false,
            headerRight: () => <ProfileButton />,
            headerBackVisible: false,
            headerLeft: () => null,
          }} 
        />
        <Stack.Screen 
          name="profile" 
          options={{
            headerTitle: 'Meu Perfil',
            headerTitleStyle: {
              fontFamily: 'JetBrainsMono_600SemiBold',
              fontSize: 18,
              color: Colors.titleGrey,
            },
            headerStyle: {
              backgroundColor: Colors.backgroundGrey,
            },
            headerShadowVisible: false,
            headerTintColor: Colors.titleGrey,
          }} 
        />
      </Stack>
      
      <AlertModal 
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={alertConfig.onClose}
        buttons={alertConfig.buttons}
      />
    </UserProvider>
  );
}