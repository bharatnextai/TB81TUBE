import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Modal, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import YoutubePlayer from "react-native-youtube-iframe";
import { AppButton } from "../../components/AppButton";
import { AppText } from "../../components/AppText";
import { Screen } from "../../components/Screen";
import { addItemToPlaylist, addToFavorites, addToHistory, getPlaylists, type PlaylistRecord } from "../../services/libraryService";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import type { RootStackParamList } from "../../types";

type Props = NativeStackScreenProps<RootStackParamList, "Player">;

export function PlayerScreen({ navigation, route }: Props) {
  const { contentItem } = route.params;
  const canEmbedYouTube = contentItem.platform === "YOUTUBE" && isValidYouTubeVideoId(contentItem.externalContentId);
  const { width: windowWidth } = useWindowDimensions();
  const playerWidth = Math.max(280, Math.min(windowWidth - spacing.md * 2, 960));
  const playerHeight = playerWidth * (9 / 16);
  const [message, setMessage] = useState("");
  const [playerError, setPlayerError] = useState("");
  const [historyMessage, setHistoryMessage] = useState("");
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteAdded, setFavoriteAdded] = useState(false);
  const [playlistPickerVisible, setPlaylistPickerVisible] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistRecord[]>([]);
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [playlistError, setPlaylistError] = useState("");
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<string[]>([]);

  useEffect(() => {
    async function saveWatchHistory() {
      try {
        await addToHistory(contentItem, 0);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Could not save watch history.";
        setHistoryMessage(errorMessage);
      }
    }

    saveWatchHistory();
  }, [contentItem]);

  async function handleAddFavorite() {
    setMessage("");

    if (favoriteAdded) {
      setMessage("Already in favorites");
      return;
    }

    setFavoriteLoading(true);

    try {
      await addToFavorites(contentItem);
      setFavoriteAdded(true);
      setMessage("Added to favorites");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Could not add favorite.";
      setMessage(errorMessage.toLowerCase().includes("unique") || errorMessage.toLowerCase().includes("duplicate") ? "Already in favorites" : errorMessage);
    } finally {
      setFavoriteLoading(false);
    }
  }

  async function handleOpenSource() {
    if (!contentItem.sourceUrl) {
      setMessage("No source URL available.");
      return;
    }

    await Linking.openURL(contentItem.sourceUrl);
  }

  async function handleShowPlaylistPicker() {
    if (process.env.NODE_ENV !== "production") {
      console.log("Add to Playlist clicked");
    }

    setMessage("");
    setPlaylistError("");
    setPlaylistPickerVisible(true);
    setPlaylistLoading(true);

    try {
      const items = await getPlaylists();
      setPlaylists(items);

      if (!items.length) {
        setMessage("Create a playlist first from Playlists tab.");
      }
    } catch (error) {
      const errorMessage = getPlaylistErrorMessage(error);
      setPlaylistError(errorMessage);
      setMessage(errorMessage);
    } finally {
      setPlaylistLoading(false);
    }
  }

  async function handleAddToPlaylist(playlistId: string) {
    setMessage("");

    if (selectedPlaylistIds.includes(playlistId)) {
      setMessage("Already in this playlist");
      return;
    }

    setPlaylistLoading(true);

    try {
      await addItemToPlaylist(playlistId, contentItem);
      setSelectedPlaylistIds((currentIds) => [...currentIds, playlistId]);
      setMessage("Added to playlist");
      setPlaylistPickerVisible(false);
    } catch (error) {
      const errorMessage = getPlaylistErrorMessage(error);
      const displayMessage = errorMessage.toLowerCase().includes("unique") || errorMessage.toLowerCase().includes("duplicate") ? "Already in this playlist" : errorMessage;
      setPlaylistError(displayMessage);
      setMessage(displayMessage);
    } finally {
      setPlaylistLoading(false);
    }
  }

  function handleGoToPlaylists() {
    setPlaylistPickerVisible(false);
    navigation.navigate("Main", { screen: "Playlists" });
  }

  function handleBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("Main");
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" onPress={handleBack} style={styles.backButton}>
          <AppText style={styles.buttonText}>Back</AppText>
        </Pressable>

        <View style={styles.playerShell}>
          <View style={[styles.playerFrame, { width: playerWidth, height: playerHeight }]}>
            {canEmbedYouTube ? (
              <YoutubePlayer
                height={playerHeight}
                width={playerWidth}
                play={false}
                videoId={contentItem.externalContentId}
                webViewStyle={styles.youtubeWebView}
                onError={() => setPlayerError("Could not load YouTube player. Try opening on YouTube.")}
              />
            ) : (
              <View style={styles.placeholderContent}>
                <AppText variant="heading">Mock video preview</AppText>
                <AppText muted style={styles.centerText}>
                  Real YouTube playback will appear when a valid YouTube video ID is available.
                </AppText>
              </View>
            )}
          </View>
          {playerError ? <AppText style={styles.errorText}>{playerError}</AppText> : null}
        </View>

        <View style={styles.meta}>
          <AppText variant="heading">{contentItem.title}</AppText>
          <AppText muted>{contentItem.creatorName ?? "Unknown creator"}</AppText>

          <View style={styles.badgeRow}>
            <View style={styles.platformBadge}>
              <AppText style={styles.badgeText}>{contentItem.platform}</AppText>
            </View>
            <View style={styles.typeBadge}>
              <AppText style={styles.badgeText}>{contentItem.contentType}</AppText>
            </View>
          </View>

          {contentItem.description ? <AppText>{contentItem.description}</AppText> : <AppText muted>No description available.</AppText>}

          {contentItem.sourceUrl ? (
            <View style={styles.sourceBox}>
              <AppText variant="small" muted>
                Source URL
              </AppText>
              <AppText variant="small">{contentItem.sourceUrl}</AppText>
            </View>
          ) : null}
        </View>

        {message ? <AppText style={isSuccessMessage(message) ? styles.successText : styles.errorText}>{message}</AppText> : null}
        {historyMessage ? <AppText muted>Watch history note: {historyMessage}</AppText> : null}

        <View style={styles.actions}>
          <AppButton title={favoriteLoading ? "Adding..." : "Add to Favorites"} disabled={favoriteLoading} onPress={handleAddFavorite} />
          <AppButton title={playlistLoading ? "Loading playlists..." : "Add to Playlist"} variant="secondary" disabled={playlistLoading} onPress={handleShowPlaylistPicker} />
          {contentItem.sourceUrl ? <AppButton title="Open on YouTube" variant="secondary" onPress={handleOpenSource} /> : null}
          <AppButton title="Back" variant="secondary" onPress={handleBack} />
        </View>

        <Modal animationType="fade" transparent visible={playlistPickerVisible} onRequestClose={() => setPlaylistPickerVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.playlistPicker}>
              <AppText variant="heading">Add to Playlist</AppText>
              {playlistLoading ? (
                <View style={styles.modalLoading}>
                  <ActivityIndicator color={colors.accent} />
                  <AppText muted>Loading playlists...</AppText>
                </View>
              ) : null}
              {playlistError ? <AppText style={styles.errorText}>{playlistError}</AppText> : null}
              {!playlistLoading && !playlists.length ? (
                <View style={styles.emptyPicker}>
                  <AppText muted>Create a playlist first from Playlists tab.</AppText>
                  <AppButton title="Go to Playlists" variant="secondary" onPress={handleGoToPlaylists} />
                </View>
              ) : null}
              {!playlistLoading
                ? playlists.map((playlist) => (
                    <Pressable
                      accessibilityRole="button"
                      disabled={playlistLoading}
                      key={playlist.id}
                      onPress={() => handleAddToPlaylist(playlist.id)}
                      style={styles.playlistRow}
                    >
                      <View style={styles.playlistText}>
                        <AppText style={styles.buttonText}>{playlist.name}</AppText>
                        <AppText muted variant="small">
                          {playlist.description ?? "No description"}
                        </AppText>
                      </View>
                      <AppText style={styles.buttonText}>{selectedPlaylistIds.includes(playlist.id) ? "Added" : "Add"}</AppText>
                    </Pressable>
                  ))
                : null}
              <AppButton title="Cancel" variant="secondary" onPress={() => setPlaylistPickerVisible(false)} />
            </View>
          </View>
        </Modal>
      </ScrollView>
    </Screen>
  );
}

function isSuccessMessage(message: string) {
  return message === "Added to favorites" || message === "Added to playlist" || message === "Already in this playlist" || message === "Already in favorites";
}

function getPlaylistErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Could not update playlist.";
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("cannot connect to backend") || lowerMessage.includes("network error") || lowerMessage.includes("timed out")) {
    return "Cannot connect to backend";
  }

  return message;
}

function isValidYouTubeVideoId(videoId: string) {
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
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
  playerShell: {
    alignItems: "center",
    gap: spacing.sm
  },
  playerFrame: {
    backgroundColor: colors.black,
    borderRadius: 8,
    justifyContent: "center",
    overflow: "hidden"
  },
  youtubeWebView: {
    backgroundColor: colors.black
  },
  placeholderContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
    gap: spacing.sm
  },
  centerText: {
    textAlign: "center"
  },
  meta: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  platformBadge: {
    borderRadius: 999,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4
  },
  typeBadge: {
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700"
  },
  sourceBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    padding: spacing.sm,
    gap: 4
  },
  successText: {
    color: "#3ddc84"
  },
  errorText: {
    color: colors.accent
  },
  actions: {
    gap: spacing.sm
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "center",
    padding: spacing.md
  },
  playlistPicker: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md
  },
  modalLoading: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md
  },
  emptyPicker: {
    gap: spacing.md
  },
  playlistRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm
  },
  playlistText: {
    flex: 1,
    gap: 4
  },
  playlistAddButton: {
    minWidth: 88
  }
});

