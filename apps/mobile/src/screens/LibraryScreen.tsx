import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";
import { PlatformBadge } from "../components/PlatformBadge";
import { Screen } from "../components/Screen";
import { getErrorMessage } from "../services/api";
import { getConnections } from "../services/connections.service";
import { clearHistory, getFavorites, getHistory, getPlaylists } from "../services/library.service";
import type { ConnectedAccount, Favorite, Playlist, RootStackParamList, UnifiedContentItem, WatchHistoryItem } from "../types";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export function LibraryScreen() {
  const navigation = useNavigation<Navigation>();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [connections, setConnections] = useState<ConnectedAccount[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [nextHistory, nextFavorites, nextConnections, nextPlaylists] = await Promise.all([
        getHistory(),
        getFavorites(),
        getConnections(),
        getPlaylists()
      ]);
      setHistory(nextHistory);
      setFavorites(nextFavorites);
      setConnections(nextConnections);
      setPlaylists(nextPlaylists);
    } catch (error) {
      Alert.alert("Library failed", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  async function clearAllHistory() {
    try {
      await clearHistory();
      setHistory([]);
    } catch (error) {
      Alert.alert("Could not clear history", getErrorMessage(error));
    }
  }

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineLarge" style={styles.title}>
            Library
          </Text>
          <Button mode="outlined" icon="refresh" compact onPress={load} loading={loading}>
            Refresh
          </Button>
        </View>

        <SectionHeader title="Watch History" actionLabel={history.length ? "Clear" : undefined} onAction={clearAllHistory} />
        <HorizontalContentRow
          items={history.map((item) => item.contentItem)}
          emptyText="Videos you play will appear here."
          onPress={(video) => navigation.navigate("Player", { video })}
        />

        <SectionHeader title="Favorites" />
        <HorizontalContentRow
          items={favorites.map((item) => item.contentItem)}
          emptyText="Favorite videos from the player screen to collect them here."
          onPress={(video) => navigation.navigate("Player", { video })}
        />

        <SectionHeader title="Connected Accounts" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
          <Pressable style={styles.accountCard} onPress={() => navigation.navigate("ConnectedAccounts")}>
            <Text variant="titleMedium" style={styles.cardTitle}>
              YouTube
            </Text>
            <Text style={styles.meta}>{connections.some((item) => item.platform === "YOUTUBE") ? "Connected" : "Not connected"}</Text>
            <Text style={styles.linkText}>Manage</Text>
          </Pressable>
          {connections
            .filter((item) => item.platform !== "YOUTUBE")
            .map((connection) => (
              <Pressable key={connection.id} style={styles.accountCard} onPress={() => navigation.navigate("ConnectedAccounts")}>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  {connection.accountName ?? connection.platform}
                </Text>
                <PlatformBadge platform={connection.platform} />
              </Pressable>
            ))}
        </ScrollView>

        <SectionHeader title="Local Playlists" />
        {playlists.length === 0 ? (
          <Card mode="outlined" style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>Create local playlists to organize videos inside this app.</Text>
            </Card.Content>
          </Card>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
            {playlists.map((playlist) => (
              <Pressable
                key={playlist.id}
                style={styles.playlistCard}
                onPress={() => navigation.navigate("PlaylistDetails", { playlistId: playlist.id })}
              >
                <Text variant="titleMedium" style={styles.cardTitle} numberOfLines={2}>
                  {playlist.name}
                </Text>
                <Text style={styles.meta}>{playlist.items?.length ?? 0} saved items</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </Screen>
  );
}

function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text variant="titleLarge" style={styles.sectionTitle}>
        {title}
      </Text>
      {actionLabel ? (
        <Button compact onPress={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

function HorizontalContentRow({
  items,
  emptyText,
  onPress
}: {
  items: UnifiedContentItem[];
  emptyText: string;
  onPress: (item: UnifiedContentItem) => void;
}) {
  if (items.length === 0) {
    return (
      <Card mode="outlined" style={styles.emptyCard}>
        <Card.Content>
          <Text style={styles.emptyText}>{emptyText}</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRow}>
      {items.slice(0, 10).map((item) => (
        <Pressable key={`${item.platform}-${item.externalContentId}`} style={styles.contentTile} onPress={() => onPress(item)}>
          <Image source={{ uri: item.thumbnailUrl ?? undefined }} style={styles.thumbnail} />
          <Text style={styles.tileTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.meta} numberOfLines={1}>
            {item.creatorName ?? "Unknown creator"}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 12
  },
  title: {
    color: "#111827",
    fontWeight: "800"
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18
  },
  sectionTitle: {
    color: "#111827",
    fontWeight: "800"
  },
  horizontalRow: {
    gap: 12,
    paddingRight: 8,
    paddingTop: 10
  },
  contentTile: {
    width: 188
  },
  thumbnail: {
    aspectRatio: 16 / 9,
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    width: "100%"
  },
  tileTitle: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: 8
  },
  meta: {
    color: "#667085",
    marginTop: 4
  },
  emptyCard: {
    borderColor: "#e4e7ec",
    borderRadius: 8,
    marginTop: 10
  },
  emptyText: {
    color: "#667085",
    lineHeight: 20
  },
  accountCard: {
    backgroundColor: "#ffffff",
    borderColor: "#e4e7ec",
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    minHeight: 112,
    padding: 14,
    width: 172
  },
  playlistCard: {
    backgroundColor: "#ffffff",
    borderColor: "#e4e7ec",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 116,
    padding: 14,
    width: 172
  },
  cardTitle: {
    color: "#111827",
    fontWeight: "800"
  },
  linkText: {
    color: "#d92d20",
    fontWeight: "800",
    marginTop: "auto"
  }
});
