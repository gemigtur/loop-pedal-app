import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

interface SaveDialogProps {
  isVisible: boolean;
  onSave: (title: string) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  bpm: string;
  beats: number;
}

type DialogState = "input" | "saving" | "success" | "error";

export const SaveDialog: React.FC<SaveDialogProps> = ({
  isVisible,
  onSave,
  onCancel,
  bpm,
  beats,
}) => {
  const [title, setTitle] = useState("");
  const [state, setState] = useState<DialogState>("input");
  const [errorMessage, setErrorMessage] = useState("");

  // Reset state when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      setState("input");
      setTitle("");
      setErrorMessage("");
    }
  }, [isVisible]);

  const handleSave = async () => {
    if (title.trim() === "") {
      setState("error");
      setErrorMessage("Please enter a title for your loop");
      return;
    }

    setState("saving");

    try {
      const result = await onSave(title.trim());
      if (result.success) {
        setState("success");
        // Auto close after 1.5 seconds
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setState("error");
        setErrorMessage(result.error || "Failed to save loop");
      }
    } catch (error) {
      setState("error");
      setErrorMessage("An unexpected error occurred");
    }
  };

  const handleClose = () => {
    setTitle("");
    setState("input");
    setErrorMessage("");
    onCancel();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {state === "input" && (
            <>
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
                  onPress={handleClose}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {state === "saving" && (
            <>
              <Text style={styles.title}>Saving...</Text>
              <Text style={styles.savingText}>Please wait</Text>
            </>
          )}

          {state === "success" && (
            <>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successTitle}>Loop Saved!</Text>
              <Text style={styles.successMessage}>
                "{title}" has been saved successfully
              </Text>
            </>
          )}

          {state === "error" && (
            <>
              <Text style={styles.errorIcon}>❌</Text>
              <Text style={styles.errorTitle}>Error</Text>
              <Text style={styles.errorMessage}>{errorMessage}</Text>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => setState("input")}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </>
          )}
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
  savingText: {
    color: "#888888",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
  },
  successIcon: {
    fontSize: 60,
    textAlign: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4CAF50",
    marginBottom: 10,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 20,
  },
  errorIcon: {
    fontSize: 60,
    textAlign: "center",
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ff4444",
    marginBottom: 10,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 25,
  },
  retryButton: {
    height: 45,
    backgroundColor: "#4a90e2",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
