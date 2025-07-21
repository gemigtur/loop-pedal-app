import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface BeatsSelectorProps {
  beats: number;
  onBeatsChange: (beats: number) => void;
}

const BEAT_OPTIONS = [4, 8, 16, 32, 64];

export const BeatsSelector: React.FC<BeatsSelectorProps> = ({
  beats,
  onBeatsChange,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Loop Length</Text>
      <View style={styles.optionsContainer}>
        {BEAT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.option, beats === option && styles.selectedOption]}
            onPress={() => onBeatsChange(option)}
          >
            <Text
              style={[
                styles.optionText,
                beats === option && styles.selectedOptionText,
              ]}
            >
              {option}
            </Text>
            <Text
              style={[
                styles.beatLabel,
                beats === option && styles.selectedBeatLabel,
              ]}
            >
              {option === 1 ? "beat" : "beats"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.hint}>Choose how many beats to record</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  option: {
    flex: 1,
    backgroundColor: "#333333",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
    minHeight: 60,
  },
  selectedOption: {
    backgroundColor: "#4a90e2",
    borderColor: "#ffffff",
  },
  optionText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 2,
  },
  selectedOptionText: {
    color: "#ffffff",
  },
  beatLabel: {
    color: "#cccccc",
    fontSize: 12,
    fontWeight: "500",
  },
  selectedBeatLabel: {
    color: "#ffffff",
  },
  hint: {
    color: "#cccccc",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
});
