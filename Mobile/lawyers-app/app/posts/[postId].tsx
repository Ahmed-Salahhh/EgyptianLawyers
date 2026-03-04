import { useSession } from "@/lib/auth/session";
import { fetchHelpPostById } from "@/lib/features/posts/api";
import type { HelpPostDetails, HelpPostReply } from "@/lib/features/posts/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString();
}

function openWhatsApp(number: string) {
  const clean = number.replace(/\D/g, "");
  Linking.openURL(`https://wa.me/${clean}`).catch(() => {
    console.warn("[PostDetail] Could not open WhatsApp for:", number);
  });
}

export default function PostDetailScreen() {
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { token } = useSession();

  const [post, setPost] = useState<HelpPostDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId || !token) {
      setError("Missing post ID or auth token.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetchHelpPostById(token, postId)
      .then(setPost)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Failed to load post.";
        setError(msg);
        console.error("[PostDetail]", msg);
      })
      .finally(() => setIsLoading(false));
  }, [postId, token]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1f5bd8" />
        <Text style={styles.loadingText}>Loading post...</Text>
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? "Post not found."}</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* ── Post header ── */}
      <View style={styles.heroCard}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{post.courtName}</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{post.cityName}</Text>
          </View>
        </View>

        <Text style={styles.description}>{post.description}</Text>

        {post.attachmentUrl ? (
          <Pressable onPress={() => Linking.openURL(post.attachmentUrl!)}>
            <Text style={styles.attachmentLink}>View Attachment →</Text>
          </Pressable>
        ) : null}

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Posted by {post.lawyerFullName}</Text>
          <Text style={styles.metaText}>{formatDate(post.createdAt)}</Text>
        </View>

        <Pressable
          style={styles.whatsAppButton}
          onPress={() => openWhatsApp(post.lawyerWhatsAppNumber)}
        >
          <Text style={styles.whatsAppButtonText}>Contact via WhatsApp</Text>
        </Pressable>
      </View>

      {/* ── Replies ── */}
      <Text style={styles.sectionTitle}>
        {post.replies.length === 0
          ? "No Replies Yet"
          : post.replies.length === 1
            ? "1 Reply"
            : `${post.replies.length} Replies`}
      </Text>

      {post.replies.length === 0 ? (
        <View style={styles.emptyReplies}>
          <Text style={styles.emptyText}>
            Be the first to reply and offer your help.
          </Text>
        </View>
      ) : (
        post.replies.map((reply) => (
          <ReplyCard key={reply.id} reply={reply} />
        ))
      )}
    </ScrollView>
  );
}

function ReplyCard({ reply }: { reply: HelpPostReply }) {
  return (
    <View style={styles.replyCard}>
      <View style={styles.replyHeader}>
        <Text style={styles.replyAuthor}>{reply.lawyerFullName}</Text>
        <Text style={styles.replyDate}>{formatDate(reply.createdAt)}</Text>
      </View>

      {reply.comment ? (
        <Text style={styles.replyComment}>{reply.comment}</Text>
      ) : null}

      {reply.attachmentUrl ? (
        <Pressable onPress={() => Linking.openURL(reply.attachmentUrl!)}>
          <Text style={styles.attachmentLink}>View Attachment →</Text>
        </Pressable>
      ) : null}

      <Pressable
        style={styles.whatsAppButtonSmall}
        onPress={() => openWhatsApp(reply.lawyerWhatsAppNumber)}
      >
        <Text style={styles.whatsAppButtonSmallText}>WhatsApp</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f7fc" },
  content: { padding: 16, paddingBottom: 110, gap: 14 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f7fc",
    padding: 24,
  },
  loadingText: { marginTop: 10, color: "#5d7296" },
  errorText: { color: "#b13550", fontSize: 15, textAlign: "center", marginBottom: 16 },
  backButton: {
    borderRadius: 10,
    backgroundColor: "#1f5bd8",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButtonText: { color: "#fff", fontWeight: "700" },

  // Hero
  heroCard: {
    borderRadius: 20,
    padding: 18,
    backgroundColor: "#113e87",
    gap: 12,
  },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  pillText: { color: "#d9e6ff", fontSize: 12, fontWeight: "600" },
  description: { color: "#fff", fontSize: 16, lineHeight: 24, fontWeight: "600" },
  attachmentLink: { color: "#93c3ff", fontSize: 13, textDecorationLine: "underline" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 4 },
  metaText: { color: "#b9cef8", fontSize: 12 },
  whatsAppButton: {
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: "#25D366",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  whatsAppButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  // Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a2f52",
    marginBottom: -4,
  },

  emptyReplies: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d7e1f3",
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
  },
  emptyText: { color: "#60769a", textAlign: "center" },

  // Reply card
  replyCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe5f6",
    backgroundColor: "#fff",
    padding: 14,
    gap: 8,
  },
  replyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  replyAuthor: { fontWeight: "700", color: "#1a2f52", fontSize: 14 },
  replyDate: { color: "#8fa3c4", fontSize: 11 },
  replyComment: { color: "#2c3f61", lineHeight: 20 },
  whatsAppButtonSmall: {
    alignSelf: "flex-start",
    borderRadius: 8,
    backgroundColor: "#25D366",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  whatsAppButtonSmallText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});
