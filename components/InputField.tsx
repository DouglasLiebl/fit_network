import InputFieldProps from "@/@types/InputFieldProps";
import Colors from "@/constants/Colors";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function InputField({
  value,
  onChange,
  label,
  secure = false,
  placeholder,
  multiline = false,
  keyboardType = 'default',
  style,
  inputStyle,
  labelStyle,
  numberOfLines,
  height,
  disabled = false
}: InputFieldProps): React.JSX.Element {
  const [onFocus, setOnFocus] = useState<boolean>(false);

  return (
    <View style={[styles.container, style]} >
      <View style={styles.labelContainer} > 
        <Text style={[styles.label, labelStyle]} >{label}</Text>
      </View>
      <TextInput 
        value={value} 
        onChangeText={onChange}
        style={[
          styles.input,
          onFocus && styles.onFocus,
          multiline && { height: height || 80, textAlignVertical: 'top' },
          inputStyle,
          disabled && styles.disabled
        ]}
        secureTextEntry={secure}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        onFocus={() => setOnFocus(true)}
        onBlur={() => setOnFocus(false)}
        editable={!disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  labelContainer: {
    marginTop: 20,
    width: "95%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start"
  },
  label: {
    textAlign: "right",
    fontFamily: "JetBrainsMono_500Medium",
    color: Colors.titleGrey,
    fontSize: 14,
    paddingLeft: 4
  },
  input: {
    paddingLeft: 10,
    paddingRight: 10,
    width: "95%",
    borderWidth: 0.5,
    borderRadius: 5,
    marginTop: 4,
    borderColor: Colors.borderGrey,
    height: 50,
    fontSize: 16,
    fontFamily: "JetBrainsMono_400Regular",
    color: Colors.titleGrey
  },
  onFocus: {
    borderColor: Colors.titleGrey,
    borderWidth: 2
  },
  disabled: {
    backgroundColor: '#f5f5f5',
    color: Colors.subtitleGrey
  }
});