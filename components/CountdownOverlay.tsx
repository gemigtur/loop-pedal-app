import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions } from "react-native";

interface CountdownOverlayProps {
  isVisible: boolean;
  bpm: number;
  beats: number;
  onCountdownComplete: () => void;
}

const { width, height } = Dimensions.get("window");

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({
  isVisible,
  bpm,
  beats,
  onCountdownComplete,
}) => {
  const [currentCount, setCurrentCount] = React.useState(1);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const beatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible) {
      setCurrentCount(1);

      // Show the overlay with dramatic entrance
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: false,
        }),
      ]).start();

      // Calculate beat duration
      const beatDuration = (60 / bpm) * 1000;
      let count = 1;

      // Animate the first count immediately
      animateCount();

      // Set up the count-up interval synced to BPM (always count to 4)
      beatIntervalRef.current = setInterval(() => {
        count += 1;
        if (count <= 4) {
          setCurrentCount(count);
          animateCount();
        } else {
          // Count complete - dramatic exit
          clearInterval(beatIntervalRef.current!);

          // Final pulse and fade out
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.5,
              duration: 200,
              useNativeDriver: false,
            }),
            Animated.parallel([
              Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: false,
              }),
              Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: false,
              }),
            ]),
          ]).start(() => {
            onCountdownComplete();
          });
        }
      }, beatDuration);
    } else {
      // Reset animations when not visible
      opacityAnim.setValue(0);
      scaleAnim.setValue(0);
      pulseAnim.setValue(1);
    }

    return () => {
      if (beatIntervalRef.current) {
        clearInterval(beatIntervalRef.current);
      }
    };
  }, [isVisible, bpm, beats]);

  const animateCount = () => {
    // Reset and create dramatic beat-synced animation
    pulseAnim.setValue(0.8);
    Animated.sequence([
      // Quick scale up with spring
      Animated.spring(pulseAnim, {
        toValue: 1.3,
        tension: 150,
        friction: 4,
        useNativeDriver: false,
      }),
      // Settle back to normal size
      Animated.spring(pulseAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: false,
      }),
    ]).start();
  };

  if (!isVisible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
      <Animated.View
        style={[styles.content, { transform: [{ scale: scaleAnim }] }]}
      >
        {/* Main countdown number */}
        <Animated.View
          style={[styles.countContainer, { transform: [{ scale: pulseAnim }] }]}
        >
          <Text style={styles.countText}>{currentCount}</Text>
        </Animated.View>

        {/* Instruction text */}
        <View style={styles.textContainer}>
          <Text style={styles.readyText}>Get Ready!</Text>
          <Text style={styles.instructionText}>
            Recording {beats} beats after count-in
          </Text>
          <Text style={styles.bpmText}>♪ {bpm} BPM ♪</Text>
        </View>

        {/* Visual beat indicators - always show 4 beats for count-in */}
        <View style={styles.beatIndicators}>
          {[1, 2, 3, 4].map((beat) => (
            <Animated.View
              key={beat}
              style={[
                styles.beatDot,
                {
                  backgroundColor: beat <= currentCount ? "#ff6b6b" : "#333",
                  transform: [{ scale: beat === currentCount ? pulseAnim : 1 }],
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  countContainer: {
    width: width * 0.6,
    height: width * 0.6,
    maxWidth: 300,
    maxHeight: 300,
    borderRadius: width * 0.3,
    backgroundColor: "#ff6b6b",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 8,
    borderColor: "#ffffff",
    shadowColor: "#ff6b6b",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 30,
  },
  countText: {
    color: "#ffffff",
    fontSize: Math.min(width * 0.25, 120),
    fontWeight: "900",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 8,
  },
  textContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  readyText: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  instructionText: {
    color: "#cccccc",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 8,
  },
  bpmText: {
    color: "#ff6b6b",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  beatIndicators: {
    flexDirection: "row",
    marginTop: 40,
    gap: 16,
  },
  beatDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ffffff",
  },
});
