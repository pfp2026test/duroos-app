import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import { apiGet } from "../lib/api";

export default function HomeScreen({ navigation }) {
  const [duroos, setDuroos] = useState(null);
  const [language, setLanguage] = useState(null); // null = both

  useEffect(() => {
    apiGet(`/duroos${language ? `?language=${language}` : ""}`)
      .then(setDuroos)
      .catch(() => setDuroos([]));
  }, [language]);

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {[null, "ENGLISH", "ARABIC"].map((lang) => (
          <TouchableOpacity key={lang || "all"} onPress={() => setLanguage(lang)}>
            <Text style={[styles.filter, language === lang && styles.filterActive]}>
              {lang === null ? "All" : lang === "ENGLISH" ? "English" : "Arabic"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {!duroos && <ActivityIndicator style={{ marginTop: 40 }} />}

      <FlatList
        data={duroos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("DuroosDetail", { id: item.id })}
          >
            {item.thumbnailUrl && <Image source={{ uri: item.thumbnailUrl }} style={styles.thumb} />}
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>
                {item.speaker?.name} {item.book ? `· ${item.book.title}` : ""}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  filterRow: { flexDirection: "row", padding: 12, gap: 16 },
  filter: { color: "#888", fontSize: 15 },
  filterActive: { color: "#111", fontWeight: "600" },
  row: { flexDirection: "row", padding: 12, alignItems: "center" },
  thumb: { width: 96, height: 54, borderRadius: 6, backgroundColor: "#eee" },
  title: { fontSize: 15, fontWeight: "600" },
  subtitle: { fontSize: 13, color: "#888", marginTop: 2 },
});
