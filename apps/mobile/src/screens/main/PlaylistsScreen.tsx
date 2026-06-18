import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppButton } from "../../components/AppButton";
import { AppText } from "../../components/AppText";
import { Screen } from "../../components/Screen";
import { createPlaylist, deletePlaylist, getPlaylists, type PlaylistRecord } from "../../services/libraryService";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import type { MainTabParamList, RootStackParamList } from "../../types";

type PlaylistsNavigation = CompositeNavigationProp<BottomTabNavigationProp<MainTabParamList, "Playlists">, NativeStackNavigationProp<RootStackParamList>>;

export function PlaylistsScreen() {
  const navigation = useNavigation<PlaylistsNavigation>();
  const [playlists, setPlaylists] = useState<PlaylistRecord[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadPlaylists = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      setPlaylists(await getPlaylists());
    } catch (loadError) {
      setError(getPlaylistErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  async function handleCreatePlaylist() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Playlist name is required.");
      return;
    }

    setError("");
    setMessage("");
    setSaving(true);

    try {
      await createPlaylist(trimmedName, description.trim() || null);
      setName("");
      setDescription("");
      setMessage("Playlist created");
      await loadPlaylists();
    } catch (createError) {
      setError(getPlaylistErrorMessage(createError));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePlaylist(id: string) {
    setError("");
    setMessage("");
    setDeletingId(id);

    try {
      await deletePlaylist(id);
      setMessage("Playlist deleted");
      await loadPlaylists();
    } catch (deleteError) {
      setError(getPlaylistErrorMessage(deleteError));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppText variant="title">Playlists</AppText>
          <AppText muted>Create and manage your TB81TUBE playlists.</AppText>
        </View>

        <View style={styles.card}>
          <AppText variant="heading">Create playlist</AppText>
          <TextInput
            onChangeText={setName}
            placeholder="Playlist name"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            value={name}
          />
          <TextInput
            multiline
            onChangeText={setDescription}
            placeholder="Description"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, styles.descriptionInput]}
            value={description}
          />
          <AppButton title={saving ? "Creating..." : "Create"} disabled={saving} onPress={handleCreatePlaylist} />
        </View>

        {message ? <AppText style={styles.successText}>{message}</AppText> : null}
        {error ? (
          <View style={styles.errorBox}>
            <AppText style={styles.errorText}>{error}</AppText>
            <Pressable accessibilityRole="button" onPress={loadPlaylists} style={styles.errorAction}>
              <AppText style={styles.buttonText}>Retry</AppText>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <AppText variant="heading">Your playlists</AppText>
          <Pressable accessibilityRole="button" disabled={loading} onPress={loadPlaylists} style={styles.smallAction}>
            {loading ? <ActivityIndicator color={colors.white} size="small" /> : <AppText style={styles.smallActionText}>Refresh</AppText>}
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={colors.accent} />
            <AppText muted>Loading playlists...</AppText>
          </View>
        ) : null}

        {!loading && playlists.length === 0 ? (
          <View style={styles.stateBox}>
            <AppText muted>Create your first playlist.</AppText>
          </View>
        ) : null}

        {!loading && playlists.length > 0 ? (
          <View style={styles.list}>
            {playlists.map((playlist) => (
              <View key={playlist.id} style={styles.playlistCard}>
                <View style={styles.playlistText}>
                  <AppText style={styles.titleText}>{playlist.name}</AppText>
                  <AppText muted>{playlist.description ?? "No description"}</AppText>
                  <AppText muted variant="small">
                    {playlist.items?.length ?? 0} items
                  </AppText>
                </View>
                <View style={styles.rowActions}>
                  <AppButton title="Open" variant="secondary" onPress={() => navigation.navigate("PlaylistDetail", { playlistId: playlist.id })} style={styles.rowButton} />
                  <AppButton
                    title={deletingId === playlist.id ? "Deleting..." : "Delete"}
                    variant="secondary"
                    disabled={deletingId !== null}
                    onPress={() => handleDeletePlaylist(playlist.id)}
                    style={styles.rowButton}
                  />
                </View>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function getPlaylistErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Could not load playlists.";
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("cannot connect to backend") || lowerMessage.includes("network error") || lowerMessage.includes("timed out")) {
    return "Cannot connect to backend. Please check backend server.";
  }

  return message;
}

const styles = StyleSheet.create({
  screen: {
    padding: 0
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md
  },
  header: {
    gap: spacing.xs
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md
  },
  input: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
    paddingHorizontal: spacing.md,
    fontSize: 16
  },
  descriptionInput: {
    minHeight: 82,
    paddingTop: spacing.sm,
    textAlignVertical: "top"
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  smallAction: {
    minHeight: 36,
    minWidth: 82,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: spacing.sm
  },
  smallActionText: {
    fontWeight: "700"
  },
  buttonText: {
    fontWeight: "700"
  },
  list: {
    gap: spacing.sm
  },
  playlistCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md
  },
  playlistText: {
    gap: spacing.xs
  },
  rowActions: {
    flexDirection: "row",
    gap: spacing.sm
  },
  rowButton: {
    flex: 1
  },
  titleText: {
    fontWeight: "700"
  },
  stateBox: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface
  },
  successText: {
    color: "#3ddc84"
  },
  errorBox: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: "#2a0d14",
    padding: spacing.md,
    gap: spacing.sm
  },
  errorAction: {
    minHeight: 38,
    alignSelf: "flex-start",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md
  },
  errorText: {
    color: colors.white
  }
});
