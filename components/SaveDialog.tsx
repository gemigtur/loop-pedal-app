import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

interface SaveDialogProps {
  isVisible: boolean;
  onSave: (title: string) => void;
  onCancel: () => void;
  bpm: string;
  beats: number;
}

export const SaveDialog: React.FC<SaveDialogProps> = ({
  isVisible,
  onSave,
  onCancel,
  bpm,
  beats,
}) => {
  const [title, setTitle] = useState("");

  const handleSave = () => {
    if (title.trim() === "") {
      Alert.alert("Error", "Please enter a title for your loop");
      return;
    }
    onSave(title.trim());
    setTitle("");
  };

  const handleCancel = () => {
    setTitle("");
    onCancel();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Save Loop</Text>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>BPM: {bpm}</Text>
            <Text style={styles.infoText}>Beats: {beats}</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Enter loop title..."
            placeholderTextColor="#888"
            value={title}
            onChangeText={setTitle}
            maxLength={50}
            autoFocus={true}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dialog: {
    backgroundColor: "#2c2c2c",
    borderRadius: 20,
    padding: 30,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 20,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  infoText: {
    fontSize: 16,
    color: "#4a90e2",
    fontWeight: "600",
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "#1c1c1c",
    borderRadius: 10,
    paddingHorizontal: 15,
    color: "#ffffff",
    fontSize: 16,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: "#4a90e2",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    height: 45,
    backgroundColor: "#666666",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    flex: 1,
    height: 45,
    backgroundColor: "#4a90e2",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
