import { AttachmentPreview } from "@/components/AttachmentPreview";
import { useSession } from "@/lib/auth/session";
import { fetchHelpPostById, replyToPost } from "@/lib/features/posts/api";
import type { HelpPostDetails, HelpPostReply, PickedFile } from "@/lib/features/posts/types";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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

  // ── Post state ─────────────────────────────────────────────────────────────
  const [post, setPost] = useState<HelpPostDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Reply form state ───────────────────────────────────────────────────────
  const [replyComment, setReplyComment] = useState("");
  const [replyFile, setReplyFile] = useState<PickedFile | null>(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySuccess, setReplySuccess] = useState(false);

  // ── Load post ──────────────────────────────────────────────────────────────
  const loadPost = () => {
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
  };

  useEffect(loadPost, [postId, token]);

  // ── Pick image for reply ───────────────────────────────────────────────────
  const handlePickReplyImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setReplyError("Permission to access photos is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const ext = asset.uri.split(".").pop() ?? "jpg";
      setReplyFile({
        uri: asset.uri,
        name: asset.fileName ?? `photo.${ext}`,
        mimeType: asset.mimeType ?? `image/${ext}`,
      });
    }
  };

  // ── Submit reply ───────────────────────────────────────────────────────────
  const handleSubmitReply = async () => {
    if (!token || !postId) return;

    const trimmed = replyComment.trim();
    if (!trimmed && !replyFile) {
      setReplyError("Please write a comment or attach an image.");
      return;
    }

    setReplyError(null);
    setReplySuccess(false);
    setIsSubmittingReply(true);

    try {
      await replyToPost(token, postId, trimmed || null, replyFile);
      setReplyComment("");
      setReplyFile(null);
      setReplySuccess(true);
      loadPost();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit reply.";
      setReplyError(msg);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // ── Loading / error states ─────────────────────────────────────────────────
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

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <>
      <Stack.Screen options={{ title: post.courtName }} />
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

        <AttachmentPreview url={post.attachmentUrl} variant="full" dark />

        <View style={styles.metaRow}>
          <Pressable
            onPress={() =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (router.push as any)({
                pathname: "/public-profile/[lawyerId]",
                params: { lawyerId: post.lawyerId },
              })
            }
            style={({ pressed }) => [pressed && { opacity: 0.6 }]}
            hitSlop={6}
          >
            <Text style={styles.metaAuthorLink}>Posted by {post.lawyerFullName}</Text>
          </Pressable>
          <Text style={styles.metaText}>{formatDate(post.createdAt)}</Text>
        </View>

        <Pressable
          style={styles.whatsAppButton}
          onPress={() => openWhatsApp(post.lawyerWhatsAppNumber)}
        >
          <Text style={styles.whatsAppButtonText}>Contact via WhatsApp</Text>
        </Pressable>
      </View>

      {/* ── Reply form ── */}
      <View style={styles.replyFormCard}>
        <Text style={styles.sectionTitle}>Add a Reply</Text>

        <TextInput
          multiline
          numberOfLines={4}
          value={replyComment}
          onChangeText={(t) => {
            setReplyComment(t);
            setReplySuccess(false);
          }}
          placeholder="Write your comment here..."
          style={[styles.input, styles.textArea]}
          editable={!isSubmittingReply}
        />

        {/* Image picker */}
        {replyFile ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: replyFile.uri }} style={styles.previewImage} resizeMode="cover" />
            <Pressable style={styles.removeImageButton} onPress={() => setReplyFile(null)}>
              <Text style={styles.removeImageText}>✕  Remove image</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.uploadButton} onPress={handlePickReplyImage}>
            <Text style={styles.uploadButtonText}>🖼️  Attach an image (optional)</Text>
          </Pressable>
        )}

        <Pressable
          onPress={handleSubmitReply}
          disabled={isSubmittingReply}
          style={[styles.primaryButton, isSubmittingReply && { opacity: 0.7 }]}
        >
          {isSubmittingReply ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Submit Reply</Text>
          )}
        </Pressable>

        {replyError ? <Text style={styles.replyErrorText}>{replyError}</Text> : null}
        {replySuccess ? (
          <Text style={styles.replySuccessText}>Reply submitted successfully.</Text>
        ) : null}
      </View>

      {/* ── Replies list ── */}
      <Text style={styles.sectionTitle}>
        {post.replies.length === 0
          ? "No Replies Yet"
          : post.replies.length === 1
            ? "1 Reply"
            : `${post.replies.length} Replies`}
      </Text>

      {post.replies.length === 0 ? (
        <View style={styles.emptyReplies}>
          <Text style={styles.emptyText}>Be the first to reply and offer your help.</Text>
        </View>
      ) : (
        post.replies.map((reply) => <ReplyCard key={reply.id} reply={reply} router={router} />)
      )}
    </ScrollView>
    </>
  );
}

function ReplyCard({ reply, router }: { reply: HelpPostReply; router: ReturnType<typeof useRouter> }) {
  return (
    <View style={styles.replyCard}>
      <View style={styles.replyHeader}>
        <Pressable
          onPress={() =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (router.push as any)({
              pathname: "/public-profile/[lawyerId]",
              params: { lawyerId: reply.lawyerId },
            })
          }
          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
          hitSlop={6}
        >
          <Text style={styles.replyAuthorLink}>{reply.lawyerFullName}</Text>
        </Pressable>
        <Text style={styles.replyDate}>{formatDate(reply.createdAt)}</Text>
      </View>

      {reply.comment ? <Text style={styles.replyComment}>{reply.comment}</Text> : null}

      <AttachmentPreview url={reply.attachmentUrl} variant="full" />

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

  // Hero card
  heroCard: { borderRadius: 20, padding: 18, backgroundColor: "#113e87", gap: 12 },
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
  metaRow: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap", gap: 4 },
  metaText: { color: "#b9cef8", fontSize: 12 },
  metaAuthorLink: { color: "#93c5fd", fontSize: 12, fontWeight: "700" },
  whatsAppButton: {
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: "#25D366",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  whatsAppButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  // Reply form
  replyFormCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dbe5f6",
    backgroundColor: "#fff",
    padding: 16,
    gap: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1a2f52", marginBottom: -4 },
  input: {
    borderWidth: 1,
    borderColor: "#d2deef",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#1f2e49",
    backgroundColor: "#fbfdff",
  },
  textArea: { minHeight: 90, textAlignVertical: "top" },
  uploadButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1f5bd8",
    borderStyle: "dashed",
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#f0f5ff",
  },
  uploadButtonText: { color: "#1f5bd8", fontWeight: "600", fontSize: 13 },
  previewContainer: { gap: 8 },
  previewImage: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    backgroundColor: "#e5ebf6",
  },
  removeImageButton: {
    alignSelf: "flex-start",
    borderRadius: 8,
    backgroundColor: "#fce8ec",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeImageText: { color: "#b13550", fontWeight: "600", fontSize: 13 },
  primaryButton: {
    borderRadius: 10,
    backgroundColor: "#1f5bd8",
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  replyErrorText: { color: "#b13550", fontSize: 13 },
  replySuccessText: { color: "#1e7a3e", fontWeight: "600", fontSize: 13 },

  // Replies list
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
  replyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  replyAuthor: { fontWeight: "700", color: "#1a2f52", fontSize: 14 },
  replyAuthorLink: { fontWeight: "700", color: "#0070F3", fontSize: 14 },
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
