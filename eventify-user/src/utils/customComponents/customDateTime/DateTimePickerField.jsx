import React from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {theme} from '../../../styles/theme';

export const DateTimePickerField = ({
  label,
  value,
  placeholder = 'Select date & time',
  show,
  onPress,
  onChange,
  mode = 'datetime',
  minimumDate,
  error,
}) => {
  // Safe date formatting with fallback
  const formatDate = date => {
    if (!date || isNaN(date.getTime())) {
      return '';
    }
    try {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (err) {
      console.error('Date formatting error:', err);
      return '';
    }
  };

  const formatted = formatDate(value);

  // Safe minimum date handling
  const safeMinimumDate =
    minimumDate && !isNaN(minimumDate.getTime()) ? minimumDate : new Date();

  // Safe value handling - ensure it's always a valid Date object
  const safeValue = value && !isNaN(value.getTime()) ? value : new Date();

  const handleChange = (event, selectedDate) => {
    if (onChange) {
      onChange(event, selectedDate);
    }
  };

  // For Android, we need to split datetime into separate date and time pickers
  const getAndroidMode = () => {
    if (mode === 'datetime') return 'date';
    return mode;
  };

  return (
    <>
      <TouchableWithoutFeedback onPress={onPress}>
        <View style={[styles.container, error && styles.errorContainer]}>
          <View style={styles.left}>
            <Text style={styles.label}>{label}</Text>
          </View>
          <View style={styles.right}>
            <Text style={[styles.value, !formatted && styles.placeholder]}>
              {formatted || placeholder}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>

      {show && Platform.OS === 'ios' && (
        <DateTimePicker
          value={safeValue}
          mode={mode}
          display="spinner"
          onChange={handleChange}
          minimumDate={safeMinimumDate}
          accentColor={theme.colors.primary}
        />
      )}

      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={safeValue}
          mode={getAndroidMode()}
          display="default"
          onChange={handleChange}
          minimumDate={safeMinimumDate}
          accentColor={theme.colors.primary}
          positiveButton={{label: 'OK', textColor: theme.colors.primary}}
          negativeButton={{label: 'Cancel', textColor: theme.colors.error}}
        />
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(1.8),
    marginBottom: theme.spacing(1.5),
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...theme.elevation.depth1,
  },
  errorContainer: {
    borderColor: theme.colors.error,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  label: {
    marginLeft: theme.spacing(1.5),
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamilyMedium,
    color: theme.colors.dark,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    marginRight: theme.spacing(1),
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamilyMedium,
    color: theme.colors.primary,
  },
  placeholder: {
    color: theme.colors.gray,
  },
  errorText: {
    marginLeft: theme.spacing(2),
    color: theme.colors.error,
    fontSize: theme.typography.fontSize.xs,
    marginBottom: theme.spacing(1),
  },
});
