import React, { useState, useRef } from "react";
import { StyleSheet, View, Text, Button, TextInput, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AudioManager, AudioRecording, AudioSound } from "./utils/audioUtils";

export default function App() {
  const [bpm, setBpm] = useState("120");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [sound, setSound] = useState<AudioSound | null>(null);
  const recordingRef = useRef<AudioRecording | null>(null);

  const beats = 4; // Fixed for now

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

      const recording = await AudioManager.createRecording();
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);

      // Stop after x beats
      const durationMs = (60 / numericBpm) * beats * 1000;
      setTimeout(() => stopRecording(), durationMs);
    } catch (error) {
      console.error("Recording failed:", error);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    try {
      const recording = recordingRef.current;
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordingUri(uri);
      recordingRef.current = null;

      console.log("Recorded URI:", uri);
    } catch (error) {
      console.error("Stop recording failed:", error);
    }
  };

  const startLoop = async () => {
    if (!recordingUri) return;

    try {
      const newSound = await AudioManager.createSound(recordingUri, true);
      setSound(newSound);
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
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🎵 Loop Pedal Starter</Text>

      <TextInput
        style={styles.input}
        value={bpm}
        onChangeText={setBpm}
        keyboardType="numeric"
        placeholder="Enter BPM"
      />

      <Button
        title={isRecording ? "Recording..." : "Record 4-beat loop"}
        onPress={startRecording}
        disabled={isRecording}
      />

      <View style={styles.spacer} />

      <Button title="Play Loop" onPress={startLoop} disabled={!recordingUri} />
      <Button title="Stop Loop" onPress={stopLoop} disabled={!sound} />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1c1c",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  header: {
    color: "#fff",
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    width: "100%",
    marginBottom: 20,
    borderRadius: 6,
  },
  spacer: {
    height: 20,
  },
});
