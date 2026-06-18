import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppText } from "../../components/AppText";
import { Screen } from "../../components/Screen";
import { getPlaylistById, removeItemFromPlaylist, type PlaylistRecord } from "../../services/libraryService";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import type { RootStackParamList } from "../../types";
import type { ContentItem } from "../../types/content";

type Props = NativeStackScreenProps<RootStackParamList, "PlaylistDetail">;

export function PlaylistDetailScreen({ navigation, route }: Props) {
  const { playlistId } = route.params;
  const [playlist, setPlaylist] = useState<PlaylistRecord | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const loadPlaylist = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      setPlaylist(await getPlaylistById(playlistId));
    } catch (loadError) {
      setError(getPlaylistDetailErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [playlistId]);

  useEffect(() => {
    loadPlaylist();
  }, [loadPlaylist]);

  async function handleRemoveItem(contentItemId: string) {
    setError("");
    setRemovingId(contentItemId);

    try {
      await removeItemFromPlaylist(playlistId, contentItemId);
      await loadPlaylist();
    } catch (removeError) {
      setError(getPlaylistDetailErrorMessage(removeError));
    } finally {
      setRemovingId(null);
    }
  }

  function handleBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("Main", { screen: "Playlists" });
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" onPress={handleBack} style={styles.backButton}>
          <AppText style={styles.buttonText}>Back</AppText>
        </Pressable>

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator color={colors.accent} />
            <AppText muted>Loading playlist...</AppText>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBox}>
            <AppText style={styles.errorText}>{error}</AppText>
            <Pressable accessibilityRole="button" onPress={loadPlaylist} style={styles.errorAction}>
              <AppText style={styles.buttonText}>Retry</AppText>
            </Pressable>
          </View>
        ) : null}

        {playlist && !loading ? (
          <>
            <View style={styles.header}>
              <AppText variant="title">{playlist.name}</AppText>
              <AppText muted>{playlist.description ?? "No description"}</AppText>
            </View>

            {!playlist.items?.length ? (
              <View style={styles.stateBox}>
                <AppText muted>No videos in this playlist yet.</AppText>
              </View>
            ) : (
              <View style={styles.list}>
                {playlist.items.map((item) => (
                  <PlaylistVideoCard
                    contentItem={item.contentItem}
                    key={item.id}
                    onOpen={() => navigation.navigate("Player", { contentItem: item.contentItem })}
                    onRemove={() => handleRemoveItem(item.contentItemId)}
                    removing={removingId === item.contentItemId}
                  />
                ))}
              </View>
            )}
          </>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function PlaylistVideoCard({
  contentItem,
  onOpen,
  onRemove,
  removing
}: {
  contentItem: ContentItem;
  onOpen: () => void;
  onRemove: () => void;
  removing: boolean;
}) {
  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="button" onPress={onOpen} style={styles.cardMain}>
        <View style={styles.thumbnail}>
          {contentItem.thumbnailUrl ? <Image source={{ uri: contentItem.thumbnailUrl }} style={styles.thumbnailImage} /> : <AppText muted>No thumbnail</AppText>}
        </View>
        <View style={styles.cardText}>
          <AppText style={styles.titleText}>{contentItem.title}</AppText>
          <AppText muted variant="small">
            {contentItem.creatorName ?? "Unknown creator"}
          </AppText>
        </View>
      </Pressable>
      <Pressable accessibilityRole="button" disabled={removing} onPress={onRemove} style={styles.removeButton}>
        <AppText style={styles.buttonText}>{removing ? "Removing..." : "Remove"}</AppText>
      </Pressable>
    </View>
  );
}

function getPlaylistDetailErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Could not load playlist.";
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
  backButton: {
    minHeight: 40,
    alignSelf: "flex-start",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md
  },
  buttonText: {
    fontWeight: "700"
  },
  header: {
    gap: spacing.sm
  },
  list: {
    gap: spacing.sm
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    gap: spacing.sm
  },
  cardMain: {
    flexDirection: "row",
    gap: spacing.md
  },
  thumbnail: {
    width: 112,
    aspectRatio: 16 / 9,
    borderRadius: 8,
    backgroundColor: colors.black,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center"
  },
  thumbnailImage: {
    width: "100%",
    height: "100%"
  },
  cardText: {
    flex: 1,
    gap: 6
  },
  titleText: {
    fontWeight: "700"
  },
  removeButton: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border
  },
  stateBox: {
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surface
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
