import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Slider from "@react-native-community/slider";

interface BPMInputProps {
  bpm: string;
  onBpmChange: (bpm: string) => void;
}

export const BPMInput: React.FC<BPMInputProps> = ({ bpm, onBpmChange }) => {
  const numericBpm = parseInt(bpm) || 120;

  const adjustBpm = (change: number) => {
    const newBpm = Math.max(60, Math.min(200, numericBpm + change));
    onBpmChange(newBpm.toString());
  };

  const handleSliderChange = (value: number) => {
    onBpmChange(Math.round(value).toString());
  };

  const getBpmDescription = (bpm: number) => {
    if (bpm < 60) return "Very Slow";
    if (bpm < 80) return "Slow";
    if (bpm < 100) return "Moderate";
    if (bpm < 120) return "Medium";
    if (bpm < 140) return "Fast";
    if (bpm < 180) return "Very Fast";
    return "Extremely Fast";
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>Tempo</Text>
        <Text style={styles.bpmValue}>{numericBpm} BPM</Text>
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => adjustBpm(-10)}
        >
          <Text style={styles.adjustButtonText}>-10</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => adjustBpm(-1)}
        >
          <Text style={styles.adjustButtonText}>-1</Text>
        </TouchableOpacity>

        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={60}
            maximumValue={200}
            value={numericBpm}
            onValueChange={handleSliderChange}
            step={1}
            minimumTrackTintColor="#4a90e2"
            maximumTrackTintColor="#333333"
            thumbTintColor="#4a90e2"
          />
        </View>

        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => adjustBpm(1)}
        >
          <Text style={styles.adjustButtonText}>+1</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => adjustBpm(10)}
        >
          <Text style={styles.adjustButtonText}>+10</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rangeContainer}>
        <Text style={styles.rangeText}>60</Text>
        <Text style={styles.description}>{getBpmDescription(numericBpm)}</Text>
        <Text style={styles.rangeText}>200</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  bpmValue: {
    color: "#4a90e2",
    fontSize: 20,
    fontWeight: "700",
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  adjustButton: {
    backgroundColor: "#333333",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 40,
    alignItems: "center",
  },
  adjustButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  sliderContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  rangeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  rangeText: {
    color: "#999999",
    fontSize: 12,
    fontWeight: "500",
  },
  description: {
    color: "#cccccc",
    fontSize: 14,
    fontWeight: "500",
    fontStyle: "italic",
  },
});
