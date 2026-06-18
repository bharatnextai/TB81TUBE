import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, IconButton, Text } from "react-native-paper";
import { ContentCard } from "../components/ContentCard";
import { EmptyState } from "../components/EmptyState";
import { LoadingState } from "../components/LoadingState";
import { Screen } from "../components/Screen";
import { getErrorMessage } from "../services/api";
import { getPlaylist, removePlaylistItem } from "../services/library.service";
import type { Playlist, PlaylistItem, RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "PlaylistDetails">;

export function PlaylistDetailsScreen({ navigation, route }: Props) {
  const { playlistId } = route.params;
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setPlaylist(await getPlaylist(playlistId));
    } catch (error) {
      Alert.alert("Playlist failed", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [playlistId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  async function removeItem(item: PlaylistItem) {
    if (!item.contentItem.id) {
      Alert.alert("Could not remove item", "This saved item is missing its local content id.");
      return;
    }

    try {
      setRemovingId(item.contentItem.id ?? item.id);
      await removePlaylistItem(playlistId, item.contentItem.id);
      setPlaylist((current) =>
        current
          ? {
              ...current,
              items: current.items.filter((playlistItem) => playlistItem.id !== item.id)
            }
          : current
      );
    } catch (error) {
      Alert.alert("Could not remove item", getErrorMessage(error));
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <Screen>
      <View style={styles.header}>
        <IconButton icon="arrow-left" accessibilityLabel="Back" onPress={() => navigation.goBack()} />
        <View style={styles.headerText}>
          <Text variant="headlineSmall" style={styles.title} numberOfLines={1}>
            {playlist?.name ?? "Playlist"}
          </Text>
          <Text style={styles.meta}>{playlist?.items.length ?? 0} saved items</Text>
        </View>
      </View>

      {loading ? (
        <LoadingState message="Loading playlist" />
      ) : !playlist || playlist.items.length === 0 ? (
        <EmptyState title="No saved items" message="Add videos from the player screen to build this playlist." />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {playlist.items.map((item) => (
            <View key={item.id} style={styles.itemBlock}>
              <ContentCard item={item.contentItem} onPress={(video) => navigation.navigate("Player", { video })} />
              <Button
                compact
                icon="delete-outline"
                loading={removingId === (item.contentItem.id ?? item.id)}
                onPress={() => removeItem(item)}
                textColor="#b42318"
                style={styles.removeButton}
              >
                Remove
              </Button>
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginBottom: 8,
    marginTop: 6
  },
  headerText: {
    flex: 1
  },
  title: {
    color: "#111827",
    fontWeight: "800"
  },
  meta: {
    color: "#667085",
    marginTop: 2
  },
  list: {
    paddingBottom: 28
  },
  itemBlock: {
    borderBottomColor: "#eceff3",
    borderBottomWidth: 1
  },
  removeButton: {
    alignSelf: "flex-end",
    marginBottom: 8
  }
});
