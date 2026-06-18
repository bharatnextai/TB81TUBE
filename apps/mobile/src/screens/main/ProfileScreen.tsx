import { ScrollView, StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppButton } from "../../components/AppButton";
import { AppText } from "../../components/AppText";
import { Screen } from "../../components/Screen";
import { useAuth } from "../../store/authStore";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";
import type { RootStackParamList } from "../../types";

export function ProfileScreen() {
  const { loading, logout, user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Screen style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppText variant="title">Profile</AppText>
          <AppText muted>Manage your account and connected platforms.</AppText>
        </View>

        <View style={styles.card}>
          <AppText variant="heading">{user?.name ?? "TB81TUBE User"}</AppText>
          <AppText muted>{user?.email ?? "No email available"}</AppText>
        </View>

        <View style={styles.actions}>
          <AppButton title="Connected Accounts" variant="secondary" onPress={() => navigation.navigate("ConnectedAccounts")} />
          <AppButton title={loading ? "Logging out..." : "Logout"} variant="secondary" disabled={loading} onPress={logout} />
        </View>
      </ScrollView>
    </Screen>
  );
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
    gap: spacing.sm
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm
  },
  actions: {
    gap: spacing.sm
  }
});
