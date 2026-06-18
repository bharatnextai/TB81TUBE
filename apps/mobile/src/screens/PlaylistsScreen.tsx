import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { ComponentType } from "react";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Dialog, IconButton, Portal, Text, TextInput as PaperTextInput } from "react-native-paper";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { Screen } from "../components/Screen";
import { getErrorMessage } from "../services/api";
import { createPlaylist, deletePlaylist, getPlaylists, updatePlaylist } from "../services/library.service";
import type { Playlist, RootStackParamList } from "../types";

type Navigation = NativeStackNavigationProp<RootStackParamList>;
const TextInput = PaperTextInput as unknown as ComponentType<any>;

export function PlaylistsScreen() {
  const navigation = useNavigation<Navigation>();
  const [name, setName] = useState("");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState<Playlist | null>(null);
  const [editName, setEditName] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setPlaylists(await getPlaylists());
    } catch (error) {
      Alert.alert("Playlists failed", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  async function submit() {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    try {
      setSubmitting(true);
      const playlist = await createPlaylist({ name: trimmedName });
      setPlaylists((current) => [playlist, ...current]);
      setName("");
    } catch (error) {
      Alert.alert("Could not create playlist", getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(playlist: Playlist) {
    setEditing(playlist);
    setEditName(playlist.name);
  }

  async function saveEdit() {
    if (!editing || !editName.trim()) return;

    try {
      const updated = await updatePlaylist(editing.id, { name: editName.trim() });
      setPlaylists((current) => current.map((playlist) => (playlist.id === updated.id ? { ...playlist, ...updated } : playlist)));
      setEditing(null);
      setEditName("");
    } catch (error) {
      Alert.alert("Could not update playlist", getErrorMessage(error));
    }
  }

  function confirmDelete(playlist: Playlist) {
    Alert.alert("Delete playlist?", `Delete "${playlist.name}" from your local playlists?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void removePlaylist(playlist);
        }
      }
    ]);
  }

  async function removePlaylist(playlist: Playlist) {
    try {
      await deletePlaylist(playlist.id);
      setPlaylists((current) => current.filter((item) => item.id !== playlist.id));
    } catch (error) {
      Alert.alert("Could not delete playlist", getErrorMessage(error));
    }
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <Text variant="headlineLarge" style={styles.title}>
          Playlists
        </Text>

        <Card mode="outlined" style={styles.createCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Create local playlist
            </Text>
            <View style={styles.createRow}>
              <TextInput
                label="Playlist name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                returnKeyType="done"
                onSubmitEditing={submit}
              />
              <Button mode="contained" icon="plus" onPress={submit} loading={submitting} disabled={!name.trim()}>
                Create
              </Button>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.listHeader}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Your Playlists
          </Text>
          <Button compact icon="refresh" onPress={load} loading={loading}>
            Refresh
          </Button>
        </View>

        {loading ? (
          <LoadingState message="Loading playlists" />
        ) : playlists.length === 0 ? (
          <EmptyState title="No playlists yet" message="Create a playlist, then add videos from the player screen." />
        ) : (
          <View style={styles.list}>
            {playlists.map((playlist) => (
              <Pressable
                key={playlist.id}
                style={styles.playlistCard}
                onPress={() => navigation.navigate("PlaylistDetails", { playlistId: playlist.id })}
              >
                <View style={styles.playlistContent}>
                  <Text variant="titleMedium" style={styles.cardTitle} numberOfLines={1}>
                    {playlist.name}
                  </Text>
                  <Text style={styles.meta}>{playlist.items?.length ?? 0} saved items</Text>
                </View>
                <View style={styles.actions}>
                  <IconButton icon="pencil-outline" accessibilityLabel="Edit playlist" onPress={() => openEdit(playlist)} />
                  <IconButton icon="delete-outline" accessibilityLabel="Delete playlist" iconColor="#b42318" onPress={() => confirmDelete(playlist)} />
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={Boolean(editing)} onDismiss={() => setEditing(null)}>
          <Dialog.Title>Edit playlist</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Playlist name" value={editName} onChangeText={setEditName} mode="outlined" />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditing(null)}>Cancel</Button>
            <Button mode="contained" onPress={saveEdit} disabled={!editName.trim()}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32
  },
  title: {
    color: "#111827",
    fontWeight: "800",
    marginBottom: 12,
    marginTop: 12
  },
  createCard: {
    borderColor: "#e4e7ec",
    borderRadius: 8
  },
  cardTitle: {
    color: "#111827",
    fontWeight: "800"
  },
  createRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 12
  },
  input: {
    flex: 1
  },
  listHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20
  },
  sectionTitle: {
    color: "#111827",
    fontWeight: "800"
  },
  list: {
    gap: 10,
    marginTop: 10
  },
  playlistCard: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#e4e7ec",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 82,
    padding: 14
  },
  playlistContent: {
    flex: 1,
    paddingRight: 8
  },
  meta: {
    color: "#667085",
    marginTop: 4
  },
  actions: {
    alignItems: "center",
    flexDirection: "row"
  }
});
