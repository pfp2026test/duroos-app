import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";
import { apiGet } from "../lib/api";

export default function DuroosDetailScreen({ route }) {
  const { id } = route.params;
  const [durs, setDurs] = useState(null);
  const [captionLang, setCaptionLang] = useState("ENGLISH");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    apiGet(`/duroos/${id}`).then(setDurs);
    apiGet(`/comments/duroos/${id}`).then(setComments);
  }, [id]);

  if (!durs) return <ActivityIndicator style={{ marginTop: 40 }} />;

  const activeCaption = durs.captions?.find((c) => c.language === captionLang);
  const verifiedResources = durs.resources?.filter((r) => r.status === "VERIFIED") || [];

  return (
    <ScrollView style={styles.container}>
      <YoutubePlayer height={220} videoId={durs.youtubeVideoId} />

      <View style={styles.captionToggle}>
        {["ENGLISH", "ARABIC"].map((lang) => (
          <TouchableOpacity key={lang} onPress={() => setCaptionLang(lang)}>
            <Text style={[styles.toggleText, captionLang === lang && styles.toggleActive]}>
              {lang === "ENGLISH" ? "EN Captions" : "AR Captions"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {!activeCaption && <Text style={styles.dim}>No {captionLang.toLowerCase()} captions yet.</Text>}

      <Text style={styles.title}>{durs.title}</Text>
      <Text style={styles.meta}>
        {durs.speaker?.name} {durs.book ? `· ${durs.book.title}` : ""}
      </Text>
      <Text style={styles.description}>{durs.description}</Text>

      {verifiedResources.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>
          {verifiedResources.map((r) => (
            <View key={r.id} style={styles.resourceCard}>
              <Text style={styles.resourceTitle}>{r.title}</Text>
              <Text>{r.content}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>
        {comments.map((c) => (
          <View key={c.id} style={styles.comment}>
            <Text style={styles.commentAuthor}>{c.user?.name || "User"}</Text>
            <Text>{c.body}</Text>
          </View>
        ))}
        {/* Comment input box would go here, posting to /comments/duroos/:id */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  captionToggle: { flexDirection: "row", gap: 16, padding: 12 },
  toggleText: { color: "#888" },
  toggleActive: { color: "#111", fontWeight: "600" },
  dim: { color: "#aaa", paddingHorizontal: 12, fontSize: 12 },
  title: { fontSize: 18, fontWeight: "700", paddingHorizontal: 12, marginTop: 8 },
  meta: { color: "#888", paddingHorizontal: 12, marginTop: 4 },
  description: { paddingHorizontal: 12, marginTop: 8, lineHeight: 20 },
  section: { marginTop: 20, paddingHorizontal: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 8 },
  resourceCard: { backgroundColor: "#f7f7f7", borderRadius: 8, padding: 12, marginBottom: 8 },
  resourceTitle: { fontWeight: "600", marginBottom: 4 },
  comment: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
  commentAuthor: { fontWeight: "600" },
});
