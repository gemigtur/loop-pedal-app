import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface BPMInputProps {
  bpm: string;
  onBpmChange: (bpm: string) => void;
}

export const BPMInput: React.FC<BPMInputProps> = ({ bpm, onBpmChange }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tempo (BPM)</Text>
      <TextInput
        style={styles.input}
        value={bpm}
        onChangeText={onBpmChange}
        keyboardType="numeric"
        placeholder="Enter BPM (20-300)"
        placeholderTextColor="#999"
      />
      <Text style={styles.hint}>Enter a value between 20 and 300</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#ffffff',
    color: '#000000',
    padding: 15,
    width: '100%',
    borderRadius: 8,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  hint: {
    color: '#cccccc',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
});
