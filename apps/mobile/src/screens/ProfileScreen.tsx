import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import { Avatar, Button, Card, Text } from "react-native-paper";
import { Screen } from "../components/Screen";
import { useAuth } from "../store/authStore";
import type { RootStackParamList } from "../types";

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Screen>
      <Text variant="headlineLarge" style={styles.title}>
        Profile
      </Text>
      <Card mode="outlined" style={styles.card}>
        <Card.Content style={styles.profile}>
          <Avatar.Text size={56} label={(user?.name ?? "U").slice(0, 1).toUpperCase()} />
          <View style={styles.copy}>
            <Text variant="titleMedium" style={styles.name}>
              {user?.name}
            </Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </Card.Content>
      </Card>
      <Button mode="contained" onPress={() => navigation.navigate("ConnectedAccounts")} style={styles.button}>
        Connected accounts
      </Button>
      <Button mode="outlined" onPress={signOut} style={styles.button}>
        Sign out
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: "#111827",
    fontWeight: "800",
    marginBottom: 12,
    marginTop: 12
  },
  card: {
    borderRadius: 8
  },
  profile: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14
  },
  copy: {
    flex: 1
  },
  name: {
    color: "#111827",
    fontWeight: "800"
  },
  email: {
    color: "#667085",
    marginTop: 4
  },
  button: {
    marginTop: 12
  }
});
