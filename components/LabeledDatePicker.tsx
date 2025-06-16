import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import Colors from '@/constants/Colors';
import DatePickerProps from '@/@types/DatePickerProps';

export default function LabeledDatePicker({
  date,
  onChange,
  label = 'Data',
  labelStyle,
  style,
  format: dateFormat = 'dd/MM/yyyy',
  locale = pt,
  disabled = false,
}: DatePickerProps): React.JSX.Element {
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const showDatepicker = () => {
    if (!disabled) {
      setShowDatePicker(true);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>{label}</Text>
        </View>
      )}
      
      <TouchableOpacity 
        style={[
          styles.dateSelector,
          disabled && styles.disabledSelector
        ]}
        onPress={showDatepicker}
        disabled={disabled}
      >
        <Text style={[styles.dateText, disabled && styles.disabledText]}>
          {format(date, dateFormat, { locale })}
        </Text>
      </TouchableOpacity>
      
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    marginTop: 20,
    width: '95%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  label: {
    textAlign: 'right',
    fontFamily: 'JetBrainsMono_500Medium',
    color: Colors.titleGrey,
    fontSize: 14,
    paddingLeft: 4,
  },
  dateSelector: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginTop: 4,
    width: '95%',
    borderWidth: 0.5,
    borderColor: Colors.borderGrey,
  },
  dateText: {
    fontSize: 16,
    fontFamily: 'JetBrainsMono_400Regular',
    color: Colors.titleGrey,
  },
  disabledSelector: {
    backgroundColor: '#f5f5f5',
    opacity: 0.8,
  },
  disabledText: {
    color: Colors.subtitleGrey,
  },
});