import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Alert,
  TouchableOpacity,
  Modal,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useKeepAwake } from "expo-keep-awake";
import { AudioManager, AudioRecording, AudioSound } from "./utils/audioUtils";
import { LoopStorage, SavedLoop } from "./utils/loopStorage";
import {
  TempoLight,
  ControlButtons,
  BPMInput,
  CountdownOverlay,
  BeatsSelector,
  BigRecordButton,
  SaveButton,
  SaveDialog,
  LoopsList,
  SoundwaveVisualizer,
} from "./components";

export default function App() {
  const [bpm, setBpm] = useState("120");
  const [beats, setBeats] = useState(4);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [sound, setSound] = useState<AudioSound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoopsList, setShowLoopsList] = useState(false);
  const [currentLoopName, setCurrentLoopName] = useState<string | null>(null);
  const [showLoadedToast, setShowLoadedToast] = useState(false);
  const [loadedLoopTitle, setLoadedLoopTitle] = useState("");
  const recordingRef = useRef<AudioRecording | null>(null);
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep screen awake when playing loops
  useKeepAwake(isPlaying ? "playing-loop" : undefined);

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
      setCurrentLoopName(null); // Clear loop name for new recordings
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

  const handleSaveLoop = async (
    title: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!recordingUri) {
      return { success: false, error: "No recording to save" };
    }

    try {
      await LoopStorage.saveLoop(title, bpm, beats, recordingUri);
      return { success: true };
    } catch (error) {
      console.error("Error saving loop:", error);
      return { success: false, error: "Failed to save loop" };
    }
  };

  const handleLoadLoop = async (loop: SavedLoop) => {
    try {
      // Stop any current playback
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }

      // Load the saved loop
      setBpm(loop.bpm);
      setBeats(loop.beats);
      setRecordingUri(loop.filePath);
      setCurrentLoopName(loop.title);

      // Show toast notification
      setLoadedLoopTitle(loop.title);
      setShowLoadedToast(true);

      // Auto hide after 1.5 seconds
      setTimeout(() => {
        setShowLoadedToast(false);
      }, 1500);
    } catch (error) {
      console.error("Error loading loop:", error);
      Alert.alert("Error", "Failed to load loop");
    }
  };

  const handleDeleteLoop = async (deletedLoop: SavedLoop) => {
    // If the currently loaded recording is the one being deleted, clear it
    if (recordingUri === deletedLoop.filePath) {
      // Stop any current playback first
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }

      // Clear the recording
      setRecordingUri(null);
      setCurrentLoopName(null);
    }
  };

  return (
    <View style={styles.container}>
      {showLoopsList ? (
        <LoopsList
          onClose={() => setShowLoopsList(false)}
          onLoadLoop={handleLoadLoop}
          onDeleteLoop={handleDeleteLoop}
        />
      ) : (
        <>
          <View style={styles.topContent}>
            <View style={styles.titleContainer}>
              <View style={styles.titleWrapper}>
                <View style={styles.titleGlow} />
                <Text style={styles.title}>LOOP</Text>
                <Text style={styles.titleAccent}>PEDAL</Text>
              </View>
              <SoundwaveVisualizer isPlaying={isPlaying} bpm={bpm} />
            </View>

            {/* Current Loop Display - Always present to maintain consistent spacing */}
            <View style={styles.currentLoopContainer}>
              {currentLoopName ? (
                <>
                  <Text style={styles.currentLoopLabel}>Now Playing:</Text>
                  <Text style={styles.currentLoopName}>{currentLoopName}</Text>
                </>
              ) : recordingUri ? (
                <>
                  <Text style={styles.currentLoopLabel}>Unsaved Loop</Text>
                  <Text style={styles.currentLoopUnsaved}>
                    Ready to save or play
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.currentLoopLabel}>Ready</Text>
                  <Text style={styles.currentLoopEmpty}>
                    Tap record to start
                  </Text>
                </>
              )}
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

          {/* Save Button */}
          <SaveButton
            onPress={() => setShowSaveDialog(true)}
            hasRecording={!!recordingUri}
          />

          {/* Loops Button */}
          <TouchableOpacity
            style={styles.loopsButton}
            onPress={async () => {
              // Stop any current playback before opening loops list
              if (sound) {
                await sound.stopAsync();
                await sound.unloadAsync();
                setSound(null);
                setIsPlaying(false);
              }
              setShowLoopsList(true);
            }}
          >
            <Text style={styles.loopsButtonText}>📁 Loops</Text>
          </TouchableOpacity>

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

          <SaveDialog
            isVisible={showSaveDialog}
            onSave={handleSaveLoop}
            onCancel={() => setShowSaveDialog(false)}
            bpm={bpm}
            beats={beats}
          />

          {/* Loop Loaded Toast */}
          <Modal
            visible={showLoadedToast}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowLoadedToast(false)}
          >
            <View style={styles.toastOverlay}>
              <View style={styles.toast}>
                <Text style={styles.toastIcon}>🎵</Text>
                <Text style={styles.toastTitle}>Loop Loaded!</Text>
                <Text style={styles.toastMessage}>
                  "{loadedLoopTitle}" is ready to play
                </Text>
              </View>
            </View>
          </Modal>
        </>
      )}

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
  titleWrapper: {
    position: "relative",
    alignItems: "center",
  },
  title: {
    color: "#ffffff",
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: 10,
    textAlign: "center",
    marginBottom: 2,
  },
  titleAccent: {
    color: "#4a90e2",
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: 10,
    textAlign: "center",
  },
  titleGlow: {
    position: "absolute",
    top: -15,
    left: -40,
    right: -40,
    bottom: -15,
    backgroundColor: "rgba(74, 144, 226, 0.08)",
    borderRadius: 20,
    zIndex: -1,
  },
  titleUnderline: {
    width: 140,
    height: 4,
    backgroundColor: "#4a90e2",
    marginTop: 15,
    borderRadius: 2,
    shadowColor: "#4a90e2",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  currentLoopContainer: {
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(74, 144, 226, 0.05)",
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "rgba(74, 144, 226, 0.2)",
    minHeight: 36, // Fixed height to prevent layout shifts
  },
  currentLoopLabel: {
    color: "#808080",
    fontSize: 10,
    fontWeight: "400",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  currentLoopName: {
    color: "#4a90e2",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  currentLoopUnsaved: {
    color: "#ffa500",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  currentLoopEmpty: {
    color: "#666666",
    fontSize: 14,
    fontWeight: "400",
    textAlign: "center",
    fontStyle: "italic",
  },
  currentLoopPlaceholder: {
    fontSize: 14,
    height: 18, // Maintain height when empty
  },
  header: {
    color: "#fff",
    fontSize: 24,
    marginBottom: 20,
  },
  loopsButton: {
    position: "absolute",
    top: 50,
    left: 24,
    backgroundColor: "#4a90e2",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  loopsButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
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
  toastOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  toast: {
    backgroundColor: "#2c2c2c",
    borderRadius: 16,
    padding: 20,
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
  toastIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  toastTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4CAF50",
    marginBottom: 4,
    textAlign: "center",
  },
  toastMessage: {
    fontSize: 14,
    color: "#ffffff",
    textAlign: "center",
  },
});
