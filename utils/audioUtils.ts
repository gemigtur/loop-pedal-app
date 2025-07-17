// Audio utilities - prepared for migration from expo-av to expo-audio
import { Audio } from "expo-av";

export interface AudioRecording {
  startAsync: () => Promise<any>;
  stopAndUnloadAsync: () => Promise<any>;
  getURI: () => string | null;
}

export interface AudioSound {
  playAsync: () => Promise<any>;
  stopAsync: () => Promise<any>;
  unloadAsync: () => Promise<any>;
}

export class AudioManager {
  // Request permissions for recording
  static async requestPermissions(): Promise<boolean> {
    const permission = await Audio.requestPermissionsAsync();
    return permission.granted;
  }

  // Set audio mode for recording
  static async setAudioMode(): Promise<void> {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
  }

  // Create a new recording
  static async createRecording(): Promise<AudioRecording> {
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    return recording;
  }

  // Create a sound from URI
  static async createSound(
    uri: string,
    isLooping: boolean = false
  ): Promise<AudioSound> {
    const { sound } = await Audio.Sound.createAsync({ uri }, { isLooping });
    return sound;
  }
}
