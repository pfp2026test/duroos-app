import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { apiGet } from "../lib/api";

export default function PlaylistScreen({ route, navigation }) {
  const { id } = route.params;
  const [playlist, setPlaylist] = useState(null);

  useEffect(() => {
    apiGet(`/playlists/${id}`).then(setPlaylist);
  }, [id]);

  if (!playlist) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{playlist.name}</Text>
      {playlist.description && <Text style={styles.description}>{playlist.description}</Text>}
      <FlatList
        data={playlist.duroos}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("DuroosDetail", { id: item.id })}
          >
            <Text style={styles.index}>{index + 1}</Text>
            <Text style={styles.title}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 12 },
  header: { fontSize: 20, fontWeight: "700" },
  description: { color: "#888", marginTop: 4, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  index: { width: 28, color: "#888" },
  title: { flex: 1, fontSize: 15 },
});
