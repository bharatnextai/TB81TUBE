import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useCallback, useMemo, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Card, Chip, Text } from "react-native-paper";
import { Screen } from "../components/Screen";
import { connectYouTube, getConnections, removeConnection } from "../services/connections.service";
import { getErrorMessage } from "../services/api";
import { useAuth } from "../store/authStore";
import type { ConnectedAccount, Platform, RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "ConnectedAccounts">;

type ProviderCard = {
  platform: Platform;
  name: string;
  description: string;
  available: boolean;
};

const providers: ProviderCard[] = [
  {
    platform: "YOUTUBE",
    name: "YouTube",
    description: "Search videos, view playlists, and play through the official player.",
    available: true
  },
  {
    platform: "JIOSAAVN",
    name: "JioSaavn",
    description: "Music account support planned for a later version.",
    available: false
  },
  {
    platform: "AMAZON_MUSIC",
    name: "Amazon Music",
    description: "Official account connection will be added when provider access is available.",
    available: false
  },
  {
    platform: "AIRTEL_WYNK",
    name: "Airtel/Wynk Music",
    description: "Placeholder for future official login integration.",
    available: false
  },
  {
    platform: "SPOTIFY",
    name: "Spotify",
    description: "Placeholder for a future official API integration.",
    available: false
  }
];

export function ConnectedAccountsScreen({ navigation }: Props) {
  const { refreshUser } = useAuth();
  const [connections, setConnections] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyPlatform, setBusyPlatform] = useState<Platform | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connectionsByPlatform = useMemo(() => {
    return new Map(connections.map((connection) => [connection.platform, connection]));
  }, [connections]);

  async function load() {
    try {
      setError(null);
      setLoading(true);
      setConnections(await getConnections());
      await refreshUser();
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [])
  );

  async function connect() {
    try {
      setBusyPlatform("YOUTUBE");
      await connectYouTube();
      await load();
    } catch (connectError) {
      Alert.alert("Could not connect YouTube", getErrorMessage(connectError));
    } finally {
      setBusyPlatform(null);
    }
  }

  async function disconnect(connection: ConnectedAccount) {
    try {
      setBusyPlatform(connection.platform);
      await removeConnection(connection.id);
      await load();
    } catch (disconnectError) {
      Alert.alert("Could not disconnect", getErrorMessage(disconnectError));
    } finally {
      setBusyPlatform(null);
    }
  }

  function renderProvider(provider: ProviderCard) {
    const connection = connectionsByPlatform.get(provider.platform);
    const connected = Boolean(connection);
    const isBusy = busyPlatform === provider.platform;

    return (
      <Card key={provider.platform} mode="outlined" style={[styles.card, !provider.available && styles.placeholderCard]}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.identity}>
              {connection?.accountThumbnailUrl ? <Image source={{ uri: connection.accountThumbnailUrl }} style={styles.avatar} /> : null}
              <View style={styles.titleBlock}>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  {provider.name}
                </Text>
                <Text style={styles.description}>{provider.description}</Text>
              </View>
            </View>
            <Chip compact mode="flat" selected={connected} style={connected ? styles.connectedChip : styles.plannedChip}>
              {connected ? "Connected" : provider.available ? "Not connected" : "Planned"}
            </Chip>
          </View>

          {provider.platform === "YOUTUBE" ? (
            <View style={styles.accountBlock}>
              <Text style={styles.accountLabel}>Status</Text>
              <Text style={styles.accountValue}>
                {connected ? connection?.accountName ?? connection?.platformUserId ?? "YouTube connected" : "YouTube is not connected"}
              </Text>
              {connected && connection?.platformUserId ? <Text style={styles.channelId}>Channel ID: {connection.platformUserId}</Text> : null}
              <View style={styles.actions}>
                {connected && connection ? (
                  <Button mode="outlined" onPress={() => disconnect(connection)} loading={isBusy} disabled={isBusy}>
                    Disconnect
                  </Button>
                ) : (
                  <Button mode="contained" onPress={connect} loading={isBusy} disabled={isBusy}>
                    Connect YouTube
                  </Button>
                )}
              </View>
            </View>
          ) : (
            <Text style={styles.futureNote}>Coming after the YouTube MVP foundation is stable.</Text>
          )}
        </Card.Content>
      </Card>
    );
  }

  return (
    <Screen>
      <Button mode="text" onPress={() => navigation.goBack()} style={styles.back}>
        Back
      </Button>
      <View style={styles.header}>
        <Text variant="headlineLarge" style={styles.title}>
          Connected accounts
        </Text>
        <Button mode="text" onPress={load} disabled={loading}>
          Refresh
        </Button>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Loading connected accounts</Text>
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ScrollView contentContainerStyle={styles.list}>{providers.map(renderProvider)}</ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    alignSelf: "flex-start",
    marginTop: 8
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12
  },
  title: {
    color: "#111827",
    fontWeight: "800"
  },
  loading: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    paddingVertical: 12
  },
  loadingText: {
    color: "#667085"
  },
  error: {
    color: "#be123c",
    marginBottom: 10
  },
  list: {
    paddingBottom: 24
  },
  card: {
    borderColor: "#d8dce5",
    borderRadius: 8,
    marginBottom: 12
  },
  placeholderCard: {
    backgroundColor: "#f8fafc"
  },
  cardHeader: {
    gap: 12
  },
  identity: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  avatar: {
    borderRadius: 20,
    height: 40,
    width: 40
  },
  titleBlock: {
    flex: 1
  },
  cardTitle: {
    color: "#111827",
    fontWeight: "800"
  },
  description: {
    color: "#667085",
    marginTop: 4
  },
  connectedChip: {
    alignSelf: "flex-start",
    backgroundColor: "#dcfce7"
  },
  plannedChip: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f5f9"
  },
  accountBlock: {
    borderTopColor: "#eceff3",
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 14
  },
  accountLabel: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  accountValue: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4
  },
  channelId: {
    color: "#667085",
    fontSize: 12,
    marginTop: 4
  },
  actions: {
    alignItems: "flex-start",
    marginTop: 12
  },
  futureNote: {
    color: "#667085",
    marginTop: 12
  }
});
