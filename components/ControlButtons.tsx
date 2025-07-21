import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";

interface ControlButtonsProps {
  isRecording: boolean;
  hasRecording: boolean;
  isPlaying: boolean;
  onStartRecording: () => void;
  onStartLoop: () => void;
  onStopLoop: () => void;
  onCancelRecording?: () => void;
  isCountingDown?: boolean;
  beats?: number;
}

export const ControlButtons: React.FC<ControlButtonsProps> = ({
  isRecording,
  hasRecording,
  isPlaying,
  onStartRecording,
  onStartLoop,
  onStopLoop,
  onCancelRecording,
  isCountingDown = false,
  beats = 4,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.playbackControls}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.playButton,
            (!hasRecording || isRecording) && styles.disabledButton,
          ]}
          onPress={onStartLoop}
          disabled={!hasRecording || isPlaying || isRecording}
        >
          <Text
            style={[
              styles.buttonText,
              (!hasRecording || isRecording) && styles.disabledText,
            ]}
          >
            ▶️ Play Loop
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.stopButton,
            !isPlaying && styles.disabledButton,
          ]}
          onPress={onStopLoop}
          disabled={!isPlaying}
        >
          <Text style={[styles.buttonText, !isPlaying && styles.disabledText]}>
            ⏹️ Stop Loop
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 20,
  },
  playbackControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  button: {
    backgroundColor: "#333333",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  playButton: {
    backgroundColor: "#2d5a2d",
    flex: 1,
  },
  stopButton: {
    backgroundColor: "#5a2d2d",
    flex: 1,
  },
  disabledButton: {
    backgroundColor: "#1a1a1a",
    opacity: 0.5,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledText: {
    color: "#666666",
  },
});
