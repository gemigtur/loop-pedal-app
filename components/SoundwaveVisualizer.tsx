import React, { useRef, useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";

interface SoundwaveVisualizerProps {
  isPlaying: boolean;
  bpm: string;
}

export const SoundwaveVisualizer: React.FC<SoundwaveVisualizerProps> = ({
  isPlaying,
  bpm,
}) => {
  // Animated values for soundwave effect
  const soundwaveAnim1 = useRef(new Animated.Value(0.3)).current;
  const soundwaveAnim2 = useRef(new Animated.Value(0.6)).current;
  const soundwaveAnim3 = useRef(new Animated.Value(0.9)).current;
  const soundwaveAnim4 = useRef(new Animated.Value(0.4)).current;
  const soundwaveAnim5 = useRef(new Animated.Value(0.7)).current;

  // Soundwave animation effect
  useEffect(() => {
    if (isPlaying) {
      const numericBpm = parseInt(bpm) || 120;
      // Calculate beat duration in milliseconds
      const beatDurationMs = (60 / numericBpm) * 1000;
      // Use full beat duration for each animation cycle
      const animationDuration = beatDurationMs / 2; // Half beat up, half beat down

      const createSoundwaveAnimation = (animValue: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: animationDuration,
              useNativeDriver: false,
            }),
            Animated.timing(animValue, {
              toValue: 0.2 + Math.random() * 0.3,
              duration: animationDuration,
              useNativeDriver: false,
            }),
          ]),
          { iterations: -1 }
        );
      };

      // Start all soundwave animations with different delays based on beat timing
      const animations = [
        createSoundwaveAnimation(soundwaveAnim1, 0),
        createSoundwaveAnimation(soundwaveAnim2, beatDurationMs * 0.1),
        createSoundwaveAnimation(soundwaveAnim3, beatDurationMs * 0.2),
        createSoundwaveAnimation(soundwaveAnim4, beatDurationMs * 0.05),
        createSoundwaveAnimation(soundwaveAnim5, beatDurationMs * 0.15),
      ];

      // Delay the start of each animation to create a wave effect
      animations.forEach((anim, index) => {
        setTimeout(() => anim.start(), index * (beatDurationMs * 0.05));
      });

      return () => {
        animations.forEach(anim => anim.stop());
      };
    } else {
      // Reset to static state when not playing
      Animated.parallel([
        Animated.timing(soundwaveAnim1, { toValue: 0.3, duration: 300, useNativeDriver: false }),
        Animated.timing(soundwaveAnim2, { toValue: 0.6, duration: 300, useNativeDriver: false }),
        Animated.timing(soundwaveAnim3, { toValue: 0.9, duration: 300, useNativeDriver: false }),
        Animated.timing(soundwaveAnim4, { toValue: 0.4, duration: 300, useNativeDriver: false }),
        Animated.timing(soundwaveAnim5, { toValue: 0.7, duration: 300, useNativeDriver: false }),
      ]).start();
    }
  }, [isPlaying, bpm]);

  return (
    <View style={styles.soundwaveContainer}>
      <Animated.View 
        style={[
          styles.soundwaveBar,
          { 
            height: soundwaveAnim1.interpolate({
              inputRange: [0, 1],
              outputRange: [2, 20],
            }),
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.soundwaveBar,
          { 
            height: soundwaveAnim2.interpolate({
              inputRange: [0, 1],
              outputRange: [2, 16],
            }),
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.soundwaveBar,
          { 
            height: soundwaveAnim3.interpolate({
              inputRange: [0, 1],
              outputRange: [2, 24],
            }),
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.soundwaveBar,
          { 
            height: soundwaveAnim4.interpolate({
              inputRange: [0, 1],
              outputRange: [2, 14],
            }),
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.soundwaveBar,
          { 
            height: soundwaveAnim5.interpolate({
              inputRange: [0, 1],
              outputRange: [2, 18],
            }),
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.soundwaveBar,
          { 
            height: soundwaveAnim3.interpolate({
              inputRange: [0, 1],
              outputRange: [2, 22],
            }),
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.soundwaveBar,
          { 
            height: soundwaveAnim1.interpolate({
              inputRange: [0, 1],
              outputRange: [2, 12],
            }),
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  soundwaveContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    height: 30,
    marginTop: 15,
    paddingHorizontal: 20,
  },
  soundwaveBar: {
    width: 4,
    backgroundColor: "#4a90e2",
    marginHorizontal: 2,
    borderRadius: 2,
    shadowColor: "#4a90e2",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});
