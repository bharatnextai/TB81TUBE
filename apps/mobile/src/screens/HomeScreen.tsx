import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Searchbar, Text } from "react-native-paper";
import { PlatformBadge } from "../components/PlatformBadge";
import { Screen } from "../components/Screen";
import { getErrorMessage } from "../services/api";
import { getConnections } from "../services/connections.service";
import { getFavorites, getHistory } from "../services/library.service";
import { getYouTubePlaylists } from "../services/youtube.service";
import { useAuth } from "../store/authStore";
import type { ConnectedAccount, Favorite, UnifiedContentItem, WatchHistoryItem, YouTubePlaylist } from "../types";

function ContentTile({ item, onPress }: { item: UnifiedContentItem; onPress: () => void }) {
  return (
    <Pressable style={styles.contentTile} onPress={onPress}>
      <Image source={{ uri: item.thumbnailUrl ?? undefined }} style={styles.contentImage} />
      <Text style={styles.tileTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.tileMeta} numberOfLines={1}>
        {item.creatorName ?? "Unknown creator"}
      </Text>
    </Pressable>
  );
}

function PlaylistTile({ playlist }: { playlist: YouTubePlaylist }) {
  return (
    <View style={styles.playlistTile}>
      <Image source={{ uri: playlist.thumbnailUrl ?? undefined }} style={styles.playlistImage} />
      <Text style={styles.tileTitle} numberOfLines={2}>
        {playlist.title}
      </Text>
      <Text style={styles.tileMeta}>{playlist.itemCount} videos</Text>
    </View>
  );
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text variant="titleLarge" style={styles.sectionTitle}>
        {title}
      </Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <View style={styles.emptyRow}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

export function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [connections, setConnections] = useState<ConnectedAccount[]>([]);
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [youtubePlaylists, setYouTubePlaylists] = useState<YouTubePlaylist[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadFeed() {
    try {
      setLoading(true);
      const [nextConnections, nextHistory, nextFavorites] = await Promise.all([getConnections(), getHistory(), getFavorites()]);
      setConnections(nextConnections);
      setHistory(nextHistory);
      setFavorites(nextFavorites);

      try {
        setYouTubePlaylists(await getYouTubePlaylists());
      } catch {
        setYouTubePlaylists([]);
      }
    } catch (error) {
      Alert.alert("Home failed", getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      void loadFeed();
    }, [])
  );

  const youtubeConnection = connections.find((connection) => connection.platform === "YOUTUBE");

  return (
    <Screen style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.feed}>
        <View style={styles.topBar}>
          <View>
            <Text variant="headlineLarge" style={styles.title}>
              TB81Tube
            </Text>
            <Text style={styles.subtitle}>Welcome back{user?.name ? `, ${user.name}` : ""}</Text>
          </View>
          <Button mode="text" onPress={loadFeed} loading={loading}>
            Refresh
          </Button>
        </View>

        <Searchbar
          value=""
          placeholder="Search YouTube"
          onFocus={() => navigation.navigate("Search")}
          onIconPress={() => navigation.navigate("Search")}
          style={styles.search}
          inputStyle={styles.searchInput}
        />

        <SectionHeader title="Connected platforms" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shortcutRow}>
          <Pressable style={[styles.platformShortcut, youtubeConnection && styles.platformConnected]} onPress={() => navigation.navigate("ConnectedAccounts")}>
            <PlatformBadge platform="YOUTUBE" />
            <Text style={styles.shortcutTitle}>YouTube</Text>
            <Text style={styles.shortcutMeta} numberOfLines={1}>
              {youtubeConnection?.accountName ?? (youtubeConnection ? "Connected" : "Connect account")}
            </Text>
          </Pressable>
          {(["JIOSAAVN", "AMAZON_MUSIC", "AIRTEL_WYNK", "SPOTIFY"] as const).map((platform) => (
            <Pressable key={platform} style={styles.platformShortcut} onPress={() => navigation.navigate("ConnectedAccounts")}>
              <PlatformBadge platform={platform} />
              <Text style={styles.shortcutTitle}>{platform === "AIRTEL_WYNK" ? "Airtel/Wynk" : platform.replace("_", " ")}</Text>
              <Text style={styles.shortcutMeta}>Planned</Text>
            </Pressable>
          ))}
        </ScrollView>

        <SectionHeader title="Recently watched" action={history.length ? "From history" : undefined} />
        {history.length ? (
          <FlatList
            horizontal
            data={history}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <ContentTile item={item.contentItem} onPress={() => navigation.navigate("Player", { video: item.contentItem })} />}
          />
        ) : (
          <EmptyRow message="Videos you play will appear here." />
        )}

        <SectionHeader title="Favorites" />
        {favorites.length ? (
          <FlatList
            horizontal
            data={favorites}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <ContentTile item={item.contentItem} onPress={() => navigation.navigate("Player", { video: item.contentItem })} />}
          />
        ) : (
          <EmptyRow message="Save videos to build your favorites row." />
        )}

        <SectionHeader title="YouTube playlists" />
        {youtubePlaylists.length ? (
          <FlatList
            horizontal
            data={youtubePlaylists}
            keyExtractor={(item) => item.externalPlaylistId}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <PlaylistTile playlist={item} />}
          />
        ) : (
          <EmptyRow message={youtubeConnection ? "No YouTube playlists found." : "Connect YouTube to see your playlists."} />
        )}

        <SectionHeader title="Recommended" />
        <Card mode="contained" style={styles.recommended}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.recommendedTitle}>
              Recommendations are coming soon
            </Text>
            <Text style={styles.recommendedText}>
              The MVP keeps recommendations as a placeholder until search, history, and account connections are stable.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0
  },
  feed: {
    paddingBottom: 28
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12
  },
  title: {
    color: "#111827",
    fontWeight: "900"
  },
  subtitle: {
    color: "#667085",
    marginTop: 2
  },
  search: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    elevation: 0,
    marginHorizontal: 16,
    marginTop: 14
  },
  searchInput: {
    fontSize: 16
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
    paddingHorizontal: 16
  },
  sectionTitle: {
    color: "#111827",
    fontWeight: "900"
  },
  sectionAction: {
    color: "#667085",
    fontSize: 12
  },
  shortcutRow: {
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10
  },
  platformShortcut: {
    backgroundColor: "#ffffff",
    borderColor: "#d8dce5",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 96,
    padding: 12,
    width: 150
  },
  platformConnected: {
    backgroundColor: "#fff1f2",
    borderColor: "#fb7185"
  },
  shortcutTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "800",
    marginTop: 10
  },
  shortcutMeta: {
    color: "#667085",
    fontSize: 12,
    marginTop: 4
  },
  contentTile: {
    marginLeft: 16,
    paddingTop: 10,
    width: 210
  },
  contentImage: {
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    height: 118,
    width: 210
  },
  playlistTile: {
    marginLeft: 16,
    paddingTop: 10,
    width: 190
  },
  playlistImage: {
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    height: 108,
    width: 190
  },
  tileTitle: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 18,
    marginTop: 8
  },
  tileMeta: {
    color: "#667085",
    fontSize: 12,
    marginTop: 4
  },
  emptyRow: {
    backgroundColor: "#f8fafc",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 16
  },
  emptyText: {
    color: "#667085"
  },
  recommended: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 10
  },
  recommendedTitle: {
    color: "#111827",
    fontWeight: "900"
  },
  recommendedText: {
    color: "#667085",
    lineHeight: 20,
    marginTop: 6
  }
});
