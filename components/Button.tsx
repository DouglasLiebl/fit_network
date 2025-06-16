import ButtomProps from "@/@types/ButtomProps";
import Colors from "@/constants/Colors";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";

export default function Button({
  value,
  onPress,
  loading = false,
  disabled = false,
  style,
  textStyle,
  variant = 'primary',
  size = 'medium',
  fullWidth = true
}: ButtomProps): React.JSX.Element {
  
  const getButtonStyle = () => {
    let buttonStyle = [styles.button];
    
    if (variant === 'primary') buttonStyle.push(styles.primaryButton);
    if (variant === 'secondary') buttonStyle.push(styles.secondaryButton);
    if (variant === 'cancel') buttonStyle.push(styles.cancelButton);
    if (variant === 'save') buttonStyle.push(styles.saveButton);
    

    if (size === 'small') buttonStyle.push(styles.smallButton);
    if (size === 'large') buttonStyle.push(styles.largeButton);
    
    if (!fullWidth) buttonStyle.push({ width: 'auto', paddingHorizontal: 20 });
    
    if (disabled || loading) buttonStyle.push(styles.disabledButton);
    
    if (style) buttonStyle.push(style);
    
    return buttonStyle;
  };
  
  const getTextStyle = () => {
    let labelStyle = [styles.label];
    
    if (variant === 'secondary' || variant === 'cancel') {
      labelStyle.push(styles.secondaryLabel);
    }
    
    if (size === 'small') labelStyle.push(styles.smallLabel);
    if (size === 'large') labelStyle.push(styles.largeLabel);
    
    if (disabled || loading) labelStyle.push(styles.disabledLabel);
    
    if (textStyle) labelStyle.push(textStyle);
    
    return labelStyle;
  };
  
  return (
    <TouchableOpacity
      style={getButtonStyle()}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {
        loading
        ? <ActivityIndicator color={variant === 'primary' || variant === 'save' ? "#FFFFFF" : Colors.titleGrey} size={size === 'small' ? 20 : 30} />
        : <Text style={getTextStyle()}>{value}</Text>
      }
    </TouchableOpacity>
  );
}

const styles: any = StyleSheet.create({
  button: {
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 8,
    width: "95%",
    height: 50,
    alignItems: "center",
    justifyContent: "center"
  },
  primaryButton: {
    backgroundColor: Colors.titleGrey,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.titleGrey,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  smallButton: {
    height: 40,
    marginTop: 5,
    marginBottom: 2,
  },
  largeButton: {
    height: 60,
  },
  disabledButton: {
    opacity: 0.6,
  },
  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "JetBrainsMono_500Medium",
  },
  secondaryLabel: {
    color: Colors.titleGrey,
    fontSize: 16,
    fontFamily: "JetBrainsMono_500Medium",
  },
  smallLabel: {
    fontSize: 14,
  },
  largeLabel: {
    fontSize: 18,
  },
  disabledLabel: {
    opacity: 0.8,
  },
})