import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

type Props = {
  title: string;
  message: string;
};

export function EmptyState({ title, message }: Props) {
  return (
    <View style={styles.empty}>
      <Text variant="titleMedium" style={styles.title}>
        {title}
      </Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 48
  },
  title: {
    color: "#111827",
    fontWeight: "800",
    textAlign: "center"
  },
  message: {
    color: "#667085",
    marginTop: 6,
    textAlign: "center"
  }
});
