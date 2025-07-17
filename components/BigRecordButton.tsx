import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';

interface BigRecordButtonProps {
  isRecording: boolean;
  isCountingDown: boolean;
  beats: number;
  onStartRecording: () => void;
  onCancelRecording: () => void;
}

const { width } = Dimensions.get('window');

export const BigRecordButton: React.FC<BigRecordButtonProps> = ({
  isRecording,
  isCountingDown,
  beats,
  onStartRecording,
  onCancelRecording,
}) => {
  const getButtonText = () => {
    if (isCountingDown) return "⏳ Get Ready...";
    if (isRecording) return "❌ Cancel Recording";
    return `🎤 Record ${beats}-beat loop`;
  };

  const getButtonStyle = () => {
    if (isRecording) return [styles.button, styles.cancelButton];
    if (isCountingDown) return [styles.button, styles.countdownButton];
    return [styles.button, styles.recordButton];
  };

  const handlePress = () => {
    if (isRecording) {
      onCancelRecording();
    } else if (!isCountingDown) {
      onStartRecording();
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={handlePress}
      disabled={isCountingDown}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>{getButtonText()}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: width - 48, // Full width minus padding
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButton: {
    backgroundColor: '#4a90e2',
  },
  countdownButton: {
    backgroundColor: '#ff9500',
  },
  cancelButton: {
    backgroundColor: '#ff4444',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
