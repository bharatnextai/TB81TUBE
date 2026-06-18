import { StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

type Props = {
  message?: string;
};

export function LoadingState({ message = "Loading" }: Props) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 36
  },
  message: {
    color: "#667085"
  }
});
