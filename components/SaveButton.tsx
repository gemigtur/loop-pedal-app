import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface SaveButtonProps {
  onPress: () => void;
  hasRecording: boolean;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  onPress,
  hasRecording,
}) => {
  return (
    <TouchableOpacity
      style={[styles.saveButton, !hasRecording && styles.disabled]}
      onPress={hasRecording ? onPress : undefined}
      disabled={!hasRecording}
    >
      <Text style={[styles.saveIcon, !hasRecording && styles.disabledText]}>
        💾
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  saveButton: {
    position: "absolute",
    top: 50,
    right: 24,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4a90e2",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  disabled: {
    backgroundColor: "#666666",
    opacity: 0.5,
  },
  saveIcon: {
    fontSize: 24,
    color: "#ffffff",
  },
  disabledText: {
    color: "#cccccc",
  },
});
