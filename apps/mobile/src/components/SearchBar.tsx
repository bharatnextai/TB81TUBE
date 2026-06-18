import { StyleSheet } from "react-native";
import { Searchbar } from "react-native-paper";

type Props = {
  value: string;
  loading?: boolean;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
};

export function SearchBar({ value, loading, onChangeText, onSubmit }: Props) {
  return (
    <Searchbar
      placeholder="Search YouTube"
      value={value}
      loading={loading}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmit}
      returnKeyType="search"
      style={styles.search}
      inputStyle={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    elevation: 0
  },
  input: {
    fontSize: 16
  }
});
