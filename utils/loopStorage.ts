import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

export interface SavedLoop {
  id: string;
  title: string;
  bpm: string;
  beats: number;
  filePath: string;
  createdAt: Date;
}

const LOOPS_STORAGE_KEY = "saved_loops";
const LOOPS_DIRECTORY = FileSystem.documentDirectory + "loops/";

export class LoopStorage {
  static async initializeDirectory() {
    const dirInfo = await FileSystem.getInfoAsync(LOOPS_DIRECTORY);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(LOOPS_DIRECTORY, {
        intermediates: true,
      });
    }
  }

  static async saveLoop(
    title: string,
    bpm: string,
    beats: number,
    recordingUri: string
  ): Promise<SavedLoop> {
    await this.initializeDirectory();

    const id = Date.now().toString();
    const fileName = `loop_${id}.m4a`;
    const filePath = LOOPS_DIRECTORY + fileName;

    // Copy the recording to our loops directory
    await FileSystem.copyAsync({
      from: recordingUri,
      to: filePath,
    });

    const loop: SavedLoop = {
      id,
      title,
      bpm,
      beats,
      filePath,
      createdAt: new Date(),
    };

    // Save loop metadata
    const existingLoops = await this.getAllLoops();
    const updatedLoops = [...existingLoops, loop];
    await AsyncStorage.setItem(LOOPS_STORAGE_KEY, JSON.stringify(updatedLoops));

    return loop;
  }

  static async getAllLoops(): Promise<SavedLoop[]> {
    try {
      const stored = await AsyncStorage.getItem(LOOPS_STORAGE_KEY);
      if (!stored) return [];

      const loops = JSON.parse(stored);
      // Convert createdAt back to Date objects
      return loops.map((loop: any) => ({
        ...loop,
        createdAt: new Date(loop.createdAt),
      }));
    } catch (error) {
      console.error("Error loading loops:", error);
      return [];
    }
  }

  static async deleteLoop(id: string): Promise<void> {
    const loops = await this.getAllLoops();
    const loopToDelete = loops.find((loop) => loop.id === id);

    if (loopToDelete) {
      // Delete the audio file
      try {
        await FileSystem.deleteAsync(loopToDelete.filePath);
      } catch (error) {
        console.log("File already deleted or not found:", error);
      }

      // Remove from metadata
      const updatedLoops = loops.filter((loop) => loop.id !== id);
      await AsyncStorage.setItem(
        LOOPS_STORAGE_KEY,
        JSON.stringify(updatedLoops)
      );
    }
  }

  static async updateLoopTitle(id: string, newTitle: string): Promise<void> {
    const loops = await this.getAllLoops();
    const updatedLoops = loops.map((loop) =>
      loop.id === id ? { ...loop, title: newTitle } : loop
    );
    await AsyncStorage.setItem(LOOPS_STORAGE_KEY, JSON.stringify(updatedLoops));
  }

  static async getLoop(id: string): Promise<SavedLoop | null> {
    const loops = await this.getAllLoops();
    return loops.find((loop) => loop.id === id) || null;
  }
}
