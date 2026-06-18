import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Linking, ScrollView, Share, StyleSheet, View } from "react-native";
import { Button, Dialog, List, Portal, Text } from "react-native-paper";
import YoutubePlayer from "react-native-youtube-iframe";
import { PlatformBadge } from "../components/PlatformBadge";
import { Screen } from "../components/Screen";
import { getErrorMessage } from "../services/api";
import { addHistory, addPlaylistItem, getPlaylists, saveFavorite } from "../services/library.service";
import type { Playlist, RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Player">;

function getYouTubeUrl(videoId: string, sourceUrl?: string | null) {
  return sourceUrl || `https://www.youtube.com/watch?v=${videoId}`;
}

export function PlayerScreen({ navigation, route }: Props) {
  const { video } = route.params;
  const historySavedRef = useRef(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistDialogVisible, setPlaylistDialogVisible] = useState(false);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [savingPlaylistId, setSavingPlaylistId] = useState<string | null>(null);

  const youtubeUrl = getYouTubeUrl(video.externalContentId, video.sourceUrl);
  const canUseYouTubePlayer = video.platform === "YOUTUBE" && video.playbackType === "EMBEDDED_PLAYER";

  const saveHistory = useCallback(async () => {
    if (historySavedRef.current) return;
    try {
      await addHistory(video);
      historySavedRef.current = true;
    } catch {
      // History is helpful, but playback should never be blocked by a history write.
    }
  }, [video]);

  useEffect(() => {
    void saveHistory();
  }, [saveHistory]);

  async function favorite() {
    try {
      setSavingFavorite(true);
      await saveFavorite(video);
      Alert.alert("Saved", "Added to favorites.");
    } catch (error) {
      Alert.alert("Could not save", getErrorMessage(error));
    } finally {
      setSavingFavorite(false);
    }
  }

  async function openPlaylistDialog() {
    try {
      setLoadingPlaylists(true);
      setPlaylists(await getPlaylists());
      setPlaylistDialogVisible(true);
    } catch (error) {
      Alert.alert("Could not load playlists", getErrorMessage(error));
    } finally {
      setLoadingPlaylists(false);
    }
  }

  async function addToPlaylist(playlist: Playlist) {
    try {
      setSavingPlaylistId(playlist.id);
      await addPlaylistItem(playlist.id, video);
      setPlaylistDialogVisible(false);
      Alert.alert("Saved", `Added to ${playlist.name}.`);
    } catch (error) {
      Alert.alert("Could not add to playlist", getErrorMessage(error));
    } finally {
      setSavingPlaylistId(null);
    }
  }

  async function shareVideo() {
    await Share.share({
      title: video.title,
      message: `${video.title}\n${youtubeUrl}`,
      url: youtubeUrl
    });
  }

  async function openOnYouTube() {
    const supported = await Linking.canOpenURL(youtubeUrl);
    if (!supported) {
      Alert.alert("Could not open YouTube", "No app or browser is available to open this link.");
      return;
    }

    await Linking.openURL(youtubeUrl);
  }

  return (
    <Screen style={styles.screen}>
      <ScrollView>
        <View style={styles.header}>
          <Button mode="text" onPress={() => navigation.goBack()}>
            Back
          </Button>
        </View>

        <View style={styles.player}>
          {canUseYouTubePlayer ? (
            <YoutubePlayer
              height={232}
              play={false}
              videoId={video.externalContentId}
              onChangeState={(state: string) => {
                if (state === "playing") {
                  void saveHistory();
                }
              }}
            />
          ) : (
            <View style={styles.unsupportedPlayer}>
              <Text style={styles.unsupportedText}>Playback is only available for YouTube embedded videos in the MVP.</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          <View style={styles.metaRow}>
            <PlatformBadge platform={video.platform} />
            <Text style={styles.contentType}>{video.contentType.toLowerCase()}</Text>
          </View>
          <Text variant="headlineSmall" style={styles.title}>
            {video.title}
          </Text>
          <Text style={styles.creator}>{video.creatorName ?? "Unknown creator"}</Text>
          {video.description ? (
            <Text style={styles.description} numberOfLines={4}>
              {video.description}
            </Text>
          ) : null}

          <View style={styles.actions}>
            <Button mode="contained" onPress={favorite} loading={savingFavorite} disabled={savingFavorite}>
              Add to Favorites
            </Button>
            <Button mode="outlined" onPress={openPlaylistDialog} loading={loadingPlaylists} disabled={loadingPlaylists}>
              Add to Playlist
            </Button>
            <Button mode="outlined" onPress={shareVideo}>
              Share
            </Button>
            <Button mode="text" onPress={openOnYouTube}>
              Open on YouTube
            </Button>
          </View>
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={playlistDialogVisible} onDismiss={() => setPlaylistDialogVisible(false)}>
          <Dialog.Title>Add to playlist</Dialog.Title>
          <Dialog.Content>
            {playlists.length === 0 ? (
              <Text style={styles.emptyText}>Create a local playlist first from the Playlists tab.</Text>
            ) : (
              playlists.map((playlist) => (
                <List.Item
                  key={playlist.id}
                  title={playlist.name}
                  description={`${playlist.items?.length ?? 0} videos`}
                  onPress={() => void addToPlaylist(playlist)}
                  right={() => (savingPlaylistId === playlist.id ? <List.Icon icon="loading" /> : <List.Icon icon="plus" />)}
                />
              ))
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPlaylistDialogVisible(false)}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0
  },
  header: {
    alignItems: "flex-start",
    paddingHorizontal: 8,
    paddingTop: 4
  },
  player: {
    backgroundColor: "#000000",
    minHeight: 232
  },
  unsupportedPlayer: {
    alignItems: "center",
    minHeight: 232,
    justifyContent: "center",
    padding: 20
  },
  unsupportedText: {
    color: "#ffffff",
    textAlign: "center"
  },
  body: {
    padding: 16
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10
  },
  contentType: {
    color: "#667085",
    fontSize: 12,
    textTransform: "capitalize"
  },
  title: {
    color: "#111827",
    fontWeight: "800",
    lineHeight: 30
  },
  creator: {
    color: "#667085",
    fontSize: 15,
    marginTop: 6
  },
  description: {
    color: "#475467",
    lineHeight: 20,
    marginTop: 12
  },
  actions: {
    gap: 10,
    marginTop: 18
  },
  emptyText: {
    color: "#667085",
    lineHeight: 20
  }
});
