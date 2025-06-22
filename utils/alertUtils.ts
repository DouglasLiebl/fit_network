import React from 'react';
import { Alert as RNAlert } from 'react-native';

type AlertType = 'success' | 'error' | 'info' | 'warning';

type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

let alertState = {
  isShowing: false,
  resolve: null as ((value: number) => void) | null,
};

const resetAlertState = () => {
  alertState = {
    isShowing: false,
    resolve: null,
  };
};

export const Alert = {
  show: (
    title: string,
    message: string,
    buttons?: AlertButton[],
    type?: AlertType,
    useNativeAlert = false
  ) => {
    if (useNativeAlert) {
      RNAlert.alert(
        title,
        message,
        buttons?.map(b => ({
          text: b.text,
          onPress: b.onPress,
          style: b.style,
        }))
      );
      return;
    }
    
    if (global.showAlert) {
      const enhancedButtons = buttons ? buttons.map(button => ({
        ...button,
        onPress: button.onPress || (() => {})
      })) : [{ text: 'OK', onPress: () => {}, style: 'default' as const }];

      global.showAlert(title, message, type || 'info', enhancedButtons, () => {
        resetAlertState();
      });
    } else {
      RNAlert.alert(
        title,
        message,
        buttons?.map(b => ({
          text: b.text,
          onPress: b.onPress,
          style: b.style,
        }))
      );
    }
  },

  async showAsync(
    title: string,
    message: string,
    buttons?: AlertButton[],
    type?: AlertType,
    useNativeAlert = false
  ): Promise<number> {
    if (useNativeAlert) {
      return new Promise(resolve => {
        const mappedButtons = buttons?.map((b, index) => ({
          text: b.text,
          onPress: () => {
            if (b.onPress) b.onPress();
            resolve(index);
          },
          style: b.style,
        }));
        
        RNAlert.alert(title, message, mappedButtons);
      });
    }

    return new Promise(resolve => {
      if (global.showAlert) {
        alertState.isShowing = true;
        alertState.resolve = resolve;
        
        const mappedButtons = buttons?.map((b, index) => ({
          text: b.text,
          onPress: () => {
            if (b.onPress) b.onPress();
            if (alertState.resolve) alertState.resolve(index);
          },
          style: b.style,
        })) || [{ 
          text: 'OK', 
          onPress: () => {
            if (alertState.resolve) alertState.resolve(0);
          }, 
          style: 'default' as const 
        }];
        
        global.showAlert(title, message, type || 'info', mappedButtons, () => {
          if (alertState.resolve) alertState.resolve(-1);
          resetAlertState();
        });
      } else {
        const mappedButtons = buttons?.map((b, index) => ({
          text: b.text,
          onPress: () => {
            if (b.onPress) b.onPress();
            resolve(index);
          },
          style: b.style,
        }));
        
        RNAlert.alert(title, message, mappedButtons);
      }
    });
  },
  
  success: (title: string, message: string, buttons?: AlertButton[]) => 
    Alert.show(title, message, buttons, 'success'),
    
  error: (title: string, message: string, buttons?: AlertButton[]) => 
    Alert.show(title, message, buttons, 'error'),
    
  warning: (title: string, message: string, buttons?: AlertButton[]) => 
    Alert.show(title, message, buttons, 'warning'),
    
  info: (title: string, message: string, buttons?: AlertButton[]) => 
    Alert.show(title, message, buttons, 'info'),
    
  confirm: async (title: string, message: string): Promise<boolean> => {
    const buttonIndex = await Alert.showAsync(
      title,
      message,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', style: 'destructive' }
      ],
      'warning'
    );
    return buttonIndex === 1;
  }
};