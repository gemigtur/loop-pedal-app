import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Animated, Text } from "react-native";

interface TempoLightProps {
  bpm: number;
  isActive: boolean;
  mode: "recording" | "playing" | "idle";
  isCountdownVisible?: boolean;
}

export const TempoLight: React.FC<TempoLightProps> = ({
  bpm,
  isActive,
  mode,
  isCountdownVisible = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0.6)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentBeat, setCurrentBeat] = useState(1);

  useEffect(() => {
    if (isActive && bpm > 0) {
      // Calculate the duration for one beat in milliseconds
      const beatDuration = (60 / bpm) * 1000;

      const startBlinking = () => {
        // Reset to beat 0 so first increment makes it 1
        setCurrentBeat(0);

        // Create a dramatic pulse animation with beat counting
        const pulse = () => {
          // Update beat counter FIRST (0->1, 1->2, 2->3, 3->4, 4->1)
          setCurrentBeat((prev) => (prev % 4) + 1);

          // Dramatic scale and fade animation
          Animated.parallel([
            // Scale animation - big pulse
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 1.3,
                duration: 150,
                useNativeDriver: false,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: beatDuration - 150,
                useNativeDriver: false,
              }),
            ]),
            // Opacity animation - bright flash
            Animated.sequence([
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: false,
              }),
              Animated.timing(fadeAnim, {
                toValue: 0.6,
                duration: beatDuration - 200,
                useNativeDriver: false,
              }),
            ]),
          ]).start();
        };

        // Start immediately with beat 1 (0 -> 1)
        pulse();

        // Set interval for subsequent beats
        intervalRef.current = setInterval(pulse, beatDuration);
      };

      startBlinking();
    } else {
      // Stop blinking and reset
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      setCurrentBeat(1);
      
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [bpm, isActive, scaleAnim, fadeAnim]);

  const getLightColor = () => {
    switch (mode) {
      case "recording":
        return "#ff4444"; // Red for recording
      case "playing":
        return "#44ff44"; // Green for playing
      default:
        return "#666666"; // Gray for idle
    }
  };

  return (
    <View style={[styles.container, { opacity: isCountdownVisible ? 0 : 1 }]}>
      <Animated.View
        style={[
          styles.light,
          {
            backgroundColor: getLightColor(),
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.beatNumber}>{currentBeat}</Text>
      </Animated.View>
      <View style={[styles.lightRing, { borderColor: getLightColor() }]} />
      <View style={[styles.outerRing, { borderColor: getLightColor() }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: 140,
    height: 140,
    marginVertical: 20,
  },
  light: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  beatNumber: {
    color: "#ffffff",
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  lightRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    opacity: 0.6,
    position: "absolute",
  },
  outerRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    opacity: 0.3,
    position: "absolute",
  },
});
