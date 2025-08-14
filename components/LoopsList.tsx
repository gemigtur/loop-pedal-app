import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
} from "react-native";
import { LoopStorage, SavedLoop } from "../utils/loopStorage";

interface LoopsListProps {
  onClose: () => void;
  onLoadLoop: (loop: SavedLoop) => void;
  onDeleteLoop?: (loop: SavedLoop) => void;
}

export const LoopsList: React.FC<LoopsListProps> = ({
  onClose,
  onLoadLoop,
  onDeleteLoop,
}) => {
  const [loops, setLoops] = useState<SavedLoop[]>([]);
  const [editingLoop, setEditingLoop] = useState<SavedLoop | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deletingLoop, setDeletingLoop] = useState<SavedLoop | null>(null);

  useEffect(() => {
    loadLoops();
  }, []);

  const loadLoops = async () => {
    const savedLoops = await LoopStorage.getAllLoops();
    // Sort by creation date, newest first
    setLoops(
      savedLoops.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    );
  };

  const handleDeleteLoop = (loop: SavedLoop) => {
    setDeletingLoop(loop);
  };

  const confirmDeleteLoop = async () => {
    if (deletingLoop) {
      await LoopStorage.deleteLoop(deletingLoop.id);
      onDeleteLoop?.(deletingLoop); // Notify parent about deletion
      setDeletingLoop(null);
      loadLoops();
    }
  };

  const handleEditLoop = (loop: SavedLoop) => {
    setEditingLoop(loop);
    setEditTitle(loop.title);
  };

  const handleSaveEdit = async () => {
    if (editingLoop && editTitle.trim()) {
      await LoopStorage.updateLoopTitle(editingLoop.id, editTitle.trim());
      setEditingLoop(null);
      setEditTitle("");
      loadLoops();
    }
  };

  const handleLoadLoop = (loop: SavedLoop) => {
    onLoadLoop(loop);
    onClose();
  };

  const formatDate = (date: Date) => {
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const renderLoopItem = ({ item }: { item: SavedLoop }) => (
    <View style={styles.loopItem}>
      <TouchableOpacity
        style={styles.loopContent}
        onPress={() => handleLoadLoop(item)}
      >
        <Text style={styles.loopTitle}>{item.title}</Text>
        <View style={styles.loopInfo}>
          <Text style={styles.loopDetails}>
            {item.bpm} BPM • {item.beats} beats
          </Text>
          <Text style={styles.loopDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.loopActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditLoop(item)}
        >
          <Text style={styles.actionIcon}>✏️</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteLoop(item)}
        >
          <Text style={styles.actionIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Loops</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {loops.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No saved loops yet</Text>
          <Text style={styles.emptySubtext}>
            Record a loop and save it to see it here
          </Text>
        </View>
      ) : (
        <FlatList
          data={loops}
          renderItem={renderLoopItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Edit Modal */}
      <Modal
        visible={editingLoop !== null}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editDialog}>
            <Text style={styles.editTitle}>Edit Loop Title</Text>

            <TextInput
              style={styles.editInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Enter new title..."
              placeholderTextColor="#888"
              maxLength={50}
              autoFocus={true}
            />

            <View style={styles.editButtons}>
              <TouchableOpacity
                style={styles.editCancelButton}
                onPress={() => {
                  setEditingLoop(null);
                  setEditTitle("");
                }}
              >
                <Text style={styles.editCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editSaveButton}
                onPress={handleSaveEdit}
              >
                <Text style={styles.editSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deletingLoop !== null}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteDialog}>
            <Text style={styles.deleteTitle}>Delete Loop</Text>

            <Text style={styles.deleteMessage}>
              Are you sure you want to delete "{deletingLoop?.title}"?
            </Text>
            <Text style={styles.deleteSubMessage}>
              This action cannot be undone.
            </Text>

            <View style={styles.deleteButtons}>
              <TouchableOpacity
                style={styles.deleteCancelButton}
                onPress={() => setDeletingLoop(null)}
              >
                <Text style={styles.deleteCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={confirmDeleteLoop}
              >
                <Text style={styles.deleteConfirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1c1c",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    paddingTop: 60,
    backgroundColor: "#2c2c2c",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#666666",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  list: {
    flex: 1,
    padding: 16,
  },
  loopItem: {
    backgroundColor: "#2c2c2c",
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  loopContent: {
    flex: 1,
    padding: 16,
  },
  loopTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  loopInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  loopDetails: {
    fontSize: 14,
    color: "#4a90e2",
    fontWeight: "500",
  },
  loopDate: {
    fontSize: 12,
    color: "#888888",
  },
  loopActions: {
    flexDirection: "row",
    paddingRight: 16,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#4a90e2",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: "#ff4444",
  },
  actionIcon: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#888888",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  editDialog: {
    backgroundColor: "#2c2c2c",
    borderRadius: 20,
    padding: 30,
    width: "100%",
    maxWidth: 400,
  },
  editTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 20,
    textAlign: "center",
  },
  editInput: {
    height: 50,
    backgroundColor: "#1c1c1c",
    borderRadius: 10,
    paddingHorizontal: 15,
    color: "#ffffff",
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#4a90e2",
  },
  editButtons: {
    flexDirection: "row",
    gap: 15,
  },
  editCancelButton: {
    flex: 1,
    height: 45,
    backgroundColor: "#666666",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  editSaveButton: {
    flex: 1,
    height: 45,
    backgroundColor: "#4a90e2",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  editCancelText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  editSaveText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteDialog: {
    backgroundColor: "#2c2c2c",
    borderRadius: 20,
    padding: 30,
    width: "100%",
    maxWidth: 400,
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#ff4444",
    marginBottom: 20,
    textAlign: "center",
  },
  deleteMessage: {
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  deleteSubMessage: {
    fontSize: 14,
    color: "#888888",
    textAlign: "center",
    marginBottom: 25,
  },
  deleteButtons: {
    flexDirection: "row",
    gap: 15,
  },
  deleteCancelButton: {
    flex: 1,
    height: 45,
    backgroundColor: "#666666",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteConfirmButton: {
    flex: 1,
    height: 45,
    backgroundColor: "#ff4444",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteCancelText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteConfirmText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});
