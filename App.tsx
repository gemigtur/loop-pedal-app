import React, { useState, useRef } from "react";
import { StyleSheet, View, Text, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AudioManager, AudioRecording, AudioSound } from "./utils/audioUtils";
import {
  TempoLight,
  ControlButtons,
  BPMInput,
  CountdownOverlay,
  BeatsSelector,
  BigRecordButton,
} from "./components";

export default function App() {
  const [bpm, setBpm] = useState("120");
  const [beats, setBeats] = useState(4);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [sound, setSound] = useState<AudioSound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const recordingRef = useRef<AudioRecording | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const numericBpm = parseInt(bpm);
      if (isNaN(numericBpm) || numericBpm < 20 || numericBpm > 300) {
        Alert.alert("Invalid BPM", "Please enter a value between 20 and 300");
        return;
      }

      const hasPermission = await AudioManager.requestPermissions();
      if (!hasPermission) {
        Alert.alert("Permission required", "Please allow microphone access.");
        return;
      }

      await AudioManager.setAudioMode();

      // Start countdown
      setShowCountdown(true);
    } catch (error) {
      console.error("Recording setup failed:", error);
    }
  };

  const onCountdownComplete = async () => {
    try {
      const numericBpm = parseInt(bpm);

      // Start actual recording after countdown
      const recording = await AudioManager.createRecording();
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      setShowCountdown(false);

      // Stop after x beats (add small buffer to ensure full duration)
      const beatDurationMs = (60 / numericBpm) * 1000;
      const durationMs = beatDurationMs * beats + 50; // Add 50ms buffer
      console.log(
        `Recording for ${beats} beats at ${numericBpm} BPM = ${durationMs}ms`
      );
      recordingTimeoutRef.current = setTimeout(
        () => stopRecording(),
        durationMs
      );
    } catch (error) {
      console.error("Recording failed:", error);
      setShowCountdown(false);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    try {
      const recording = recordingRef.current;
      if (!recording) return;

      // Clear the timeout if it exists
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      recordingRef.current = null;

      console.log("Recorded URI:", uri);
    } catch (error) {
      console.error("Stop recording failed:", error);
    }
  };

  const cancelRecording = async () => {
    setIsRecording(false);
    try {
      const recording = recordingRef.current;
      if (!recording) return;

      // Clear the timeout
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current);
        recordingTimeoutRef.current = null;
      }

      await recording.stopAndUnloadAsync();
      recordingRef.current = null;

      // Don't set recordingUri - this discards the recording
      console.log("Recording cancelled");
    } catch (error) {
      console.error("Cancel recording failed:", error);
    }
  };

  const startLoop = async () => {
    if (!recordingUri) return;

    try {
      const newSound = await AudioManager.createSound(recordingUri, true);
      setSound(newSound);
      setIsPlaying(true);
      await newSound.playAsync();
    } catch (error) {
      console.error("Playback error:", error);
    }
  };

  const stopLoop = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  const getTempoLightMode = () => {
    if (isRecording) return "recording";
    if (isPlaying) return "playing";
    return "idle";
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContent}>
        <View style={styles.titleContainer}>
          {/* <Text style={styles.titleIcon}>⚡</Text> */}
          <Text style={styles.title}>LOOP</Text>
          <Text style={styles.titleAccent}>PEDAL</Text>
        </View>

        <TempoLight
          bpm={parseInt(bpm) || 120}
          isActive={isRecording || isPlaying}
          mode={getTempoLightMode()}
          isCountdownVisible={showCountdown}
        />

        <BPMInput bpm={bpm} onBpmChange={setBpm} />

        <BeatsSelector beats={beats} onBeatsChange={setBeats} />

        <ControlButtons
          isRecording={isRecording}
          hasRecording={!!recordingUri}
          isPlaying={isPlaying}
          onStartRecording={startRecording}
          onStartLoop={startLoop}
          onStopLoop={stopLoop}
          onCancelRecording={cancelRecording}
          isCountingDown={showCountdown}
          beats={beats}
        />
      </View>

      <View style={styles.bottomButton}>
        <BigRecordButton
          isRecording={isRecording}
          isCountingDown={showCountdown}
          beats={beats}
          onStartRecording={startRecording}
          onCancelRecording={cancelRecording}
        />
      </View>

      <CountdownOverlay
        isVisible={showCountdown}
        bpm={parseInt(bpm) || 120}
        beats={beats}
        onCountdownComplete={onCountdownComplete}
      />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1c1c",
  },
  topContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    paddingBottom: 120, // Space for the bottom button
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 30,
    paddingVertical: 20,
  },
  titleIcon: {
    fontSize: 48,
    marginBottom: 10,
    textAlign: "center",
  },
  title: {
    color: "#ffffff",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 8,
    textAlign: "center",
    textShadowColor: "#4a90e2",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 5,
  },
  titleAccent: {
    color: "#4a90e2",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 8,
    textAlign: "center",
    textShadowColor: "#41bcd1ff",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  header: {
    color: "#fff",
    fontSize: 24,
    marginBottom: 20,
  },
  bottomButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    backgroundColor: "rgba(28, 28, 28, 0.95)",
    alignItems: "center",
  },
});
