import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export function SplashScreen() {
  return (
    <View style={styles.screen}>
      <Text variant="displaySmall" style={styles.logo}>
        TB81Tube
      </Text>
      <ActivityIndicator color="#e11d48" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    flex: 1,
    justifyContent: "center"
  },
  logo: {
    color: "#e11d48",
    fontWeight: "800"
  },
  loader: {
    marginTop: 20
  }
});
