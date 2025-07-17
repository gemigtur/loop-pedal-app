import React, { useState, useRef } from "react";
import { StyleSheet, View, Text, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AudioManager, AudioRecording, AudioSound } from "./utils/audioUtils";
import { TempoLight, ControlButtons, BPMInput, CountdownOverlay, BeatsSelector } from "./components";

export default function App() {
  const [bpm, setBpm] = useState("120");
  const [beats, setBeats] = useState(4);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [sound, setSound] = useState<AudioSound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const recordingRef = useRef<AudioRecording | null>(null);

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

      // Stop after x beats
      const durationMs = (60 / numericBpm) * beats * 1000;
      setTimeout(() => stopRecording(), durationMs);
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
    if (isRecording) return 'recording';
    if (isPlaying) return 'playing';
    return 'idle';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🎵 Loop Pedal</Text>

      <TempoLight
        bpm={parseInt(bpm) || 120}
        isActive={isRecording || isPlaying}
        mode={getTempoLightMode()}
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
        isCountingDown={showCountdown}
        beats={beats}
      />

      <CountdownOverlay
        isVisible={showCountdown}
        bpm={parseInt(bpm) || 120}
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
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  header: {
    color: "#fff",
    fontSize: 24,
    marginBottom: 20,
  },
});
