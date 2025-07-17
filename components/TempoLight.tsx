import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface TempoLightProps {
  bpm: number;
  isActive: boolean;
  mode: 'recording' | 'playing' | 'idle';
}

export const TempoLight: React.FC<TempoLightProps> = ({ bpm, isActive, mode }) => {
  const fadeAnim = useRef(new Animated.Value(0.3)).current;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive && bpm > 0) {
      // Calculate the duration for one beat in milliseconds
      const beatDuration = (60 / bpm) * 1000;
      
      const startBlinking = () => {
        // Create a pulse animation
        const pulse = () => {
          Animated.sequence([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 100, // Quick flash
              useNativeDriver: false,
            }),
            Animated.timing(fadeAnim, {
              toValue: 0.3,
              duration: beatDuration - 100, // Rest of the beat
              useNativeDriver: false,
            }),
          ]).start();
        };

        // Start immediately
        pulse();
        
        // Set interval for subsequent beats
        intervalRef.current = setInterval(pulse, beatDuration);
      };

      startBlinking();
    } else {
      // Stop blinking and fade out
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [bpm, isActive, fadeAnim]);

  const getLightColor = () => {
    switch (mode) {
      case 'recording':
        return '#ff4444'; // Red for recording
      case 'playing':
        return '#44ff44'; // Green for playing
      default:
        return '#666666'; // Gray for idle
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.light,
          {
            backgroundColor: getLightColor(),
            opacity: fadeAnim,
          },
        ]}
      />
      <View style={[styles.lightRing, { borderColor: getLightColor() }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  light: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: 'absolute',
  },
  lightRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    opacity: 0.5,
  },
});
