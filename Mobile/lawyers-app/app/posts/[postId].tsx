import { AttachmentPreview } from "@/components/AttachmentPreview";
import { useSession } from "@/lib/auth/session";
import { fetchHelpPostById, replyToPost } from "@/lib/features/posts/api";
import type { HelpPostDetails, HelpPostReply, PickedFile } from "@/lib/features/posts/types";
import { formatUtcRelative } from "@/lib/utils/date";
import { Ionicons } from "@expo/vector-icons";
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

// ── Design tokens (match Feed LinkedIn-style) ─────────────────────────────────
const C = {
  primary: "#0A2540",
  bg: "#F3F2EF",
  card: "#FFFFFF",
  textPrimary: "#191919",
  textSecondary: "#666666",
  divider: "#EBEBEB",
  inputBorder: "#E5E7EB",
  whatsAppGreen: "#25D366",
  danger: "#DC2626",
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
};

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

  const [replyComment, setReplyComment] = useState("");
  const [replyFile, setReplyFile] = useState<PickedFile | null>(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySuccess, setReplySuccess] = useState(false);

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

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={C.primary} />
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

  const subtitle = `${post.courtName} • ${post.cityName} • ${formatUtcRelative(post.createdAt)}`;

  return (
    <>
      <Stack.Screen options={{ title: post.courtName }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* ── Main post card (white, Feed-style) ─────────────────────────────── */}
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <Pressable
              onPress={() =>
                (router.push as (opts: { pathname: string; params: { lawyerId: string } }) => void)({
                  pathname: "/public-profile/[lawyerId]",
                  params: { lawyerId: post.lawyerId },
                })
              }
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
              hitSlop={8}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {post.lawyerFullName.trim().charAt(0).toUpperCase()}
                </Text>
              </View>
            </Pressable>
            <View style={styles.headerCenter}>
              <Pressable
                onPress={() =>
                  (router.push as (opts: { pathname: string; params: { lawyerId: string } }) => void)({
                    pathname: "/public-profile/[lawyerId]",
                    params: { lawyerId: post.lawyerId },
                  })
                }
                style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                hitSlop={8}
              >
                <Text style={styles.authorName}>{post.lawyerFullName}</Text>
              </Pressable>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
          </View>

          <Text style={styles.postDescription}>{post.description}</Text>

          {post.attachmentUrl ? (
            <View style={styles.mediaWrapper}>
              <AttachmentPreview url={post.attachmentUrl} variant="full" />
            </View>
          ) : null}

          <Pressable
            style={({ pressed }) => [styles.whatsAppButton, pressed && { opacity: 0.9 }]}
            onPress={() => openWhatsApp(post.lawyerWhatsAppNumber)}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
            <Text style={styles.whatsAppButtonText}>Contact via WhatsApp</Text>
          </Pressable>
        </View>

        {/* ── Compact reply form ────────────────────────────────────────────── */}
        <View style={styles.replyFormContainer}>
          {replyFile ? (
            <View style={styles.replyPreviewRow}>
              <Image source={{ uri: replyFile.uri }} style={styles.replyPreviewImage} resizeMode="cover" />
              <Pressable style={styles.removePreviewBtn} onPress={() => setReplyFile(null)}>
                <Ionicons name="close-circle" size={24} color={C.textSecondary} />
              </Pressable>
            </View>
          ) : null}

          <View style={styles.replyInputRow}>
            <TextInput
              multiline
              value={replyComment}
              onChangeText={(t) => {
                setReplyComment(t);
                setReplySuccess(false);
              }}
              placeholder="Add a comment..."
              placeholderTextColor={C.textSecondary}
              style={styles.replyInput}
              editable={!isSubmittingReply}
            />
            <View style={styles.replyActions}>
              <Pressable
                onPress={handlePickReplyImage}
                style={({ pressed }) => [styles.replyIconBtn, pressed && { opacity: 0.6 }]}
                hitSlop={8}
              >
                <Ionicons name="image-outline" size={22} color={C.textSecondary} />
              </Pressable>
              <Pressable
                onPress={handleSubmitReply}
                disabled={isSubmittingReply || (!replyComment.trim() && !replyFile)}
                style={({ pressed }) => [
                  styles.sendBtn,
                  (isSubmittingReply || (!replyComment.trim() && !replyFile)) && { opacity: 0.5 },
                  pressed && !isSubmittingReply && { opacity: 0.8 },
                ]}
                hitSlop={8}
              >
                {isSubmittingReply ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                )}
              </Pressable>
            </View>
          </View>

          {replyError ? <Text style={styles.replyErrorText}>{replyError}</Text> : null}
          {replySuccess ? <Text style={styles.replySuccessText}>Reply submitted successfully.</Text> : null}
        </View>

        {/* ── Replies list ───────────────────────────────────────────────────── */}
        <Text style={styles.repliesTitle}>
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
          post.replies.map((reply) => (
            <ReplyCard key={reply.id} reply={reply} router={router} />
          ))
        )}
      </ScrollView>
    </>
  );
}

function ReplyCard({
  reply,
  router,
}: {
  reply: HelpPostReply;
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <View style={styles.replyRow}>
      <Pressable
        onPress={() =>
          (router.push as (opts: { pathname: string; params: { lawyerId: string } }) => void)({
            pathname: "/public-profile/[lawyerId]",
            params: { lawyerId: reply.lawyerId },
          })
        }
        style={({ pressed }) => [pressed && { opacity: 0.7 }]}
        hitSlop={8}
      >
        <View style={styles.replyAvatar}>
          <Text style={styles.replyAvatarText}>
            {reply.lawyerFullName.trim().charAt(0).toUpperCase()}
          </Text>
        </View>
      </Pressable>

      <View style={styles.replyBubbleWrap}>
        <View style={styles.replyBubble}>
          <View style={styles.replyBubbleHeader}>
            <Pressable
              onPress={() =>
                (router.push as (opts: { pathname: string; params: { lawyerId: string } }) => void)({
                  pathname: "/public-profile/[lawyerId]",
                  params: { lawyerId: reply.lawyerId },
                })
              }
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
              hitSlop={6}
            >
              <Text style={styles.replyAuthorName}>{reply.lawyerFullName}</Text>
            </Pressable>
            <Text style={styles.replyTimestamp}>{formatUtcRelative(reply.createdAt)}</Text>
          </View>
          {reply.comment ? <Text style={styles.replyCommentText}>{reply.comment}</Text> : null}
          <AttachmentPreview url={reply.attachmentUrl} variant="compact" />
        </View>

        <Pressable
          onPress={() => openWhatsApp(reply.lawyerWhatsAppNumber)}
          style={({ pressed }) => [styles.replyWhatsAppLink, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="logo-whatsapp" size={14} color={C.whatsAppGreen} />
          <Text style={styles.replyWhatsAppText}>WhatsApp</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 110, gap: 14 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg,
    padding: 24,
  },
  loadingText: { marginTop: 10, color: C.textSecondary, fontSize: 14 },
  errorText: { color: C.danger, fontSize: 15, textAlign: "center", marginBottom: 16 },
  backButton: {
    borderRadius: 8,
    backgroundColor: C.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButtonText: { color: "#FFFFFF", fontWeight: "700" },

  // Main post card
  postCard: {
    borderRadius: 12,
    backgroundColor: C.card,
    padding: 16,
    ...C.shadow,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#FFFFFF", fontSize: 20, fontWeight: "700" },
  headerCenter: { flex: 1, justifyContent: "center", minWidth: 0 },
  authorName: { fontSize: 16, fontWeight: "700", color: C.primary },
  subtitle: { fontSize: 12, color: C.textSecondary, marginTop: 2 },
  postDescription: {
    fontSize: 15,
    color: C.textPrimary,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  mediaWrapper: { marginTop: 4, marginBottom: 12 },
  whatsAppButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: 8,
    backgroundColor: C.whatsAppGreen,
  },
  whatsAppButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },

  // Compact reply form
  replyFormContainer: {
    backgroundColor: C.bg,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  replyPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  replyPreviewImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: C.inputBorder,
  },
  removePreviewBtn: { padding: 4 },
  replyInputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  replyInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.inputBorder,
    backgroundColor: C.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    fontSize: 15,
    color: C.textPrimary,
  },
  replyActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  replyIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  replyErrorText: { color: C.danger, fontSize: 12 },
  replySuccessText: { color: "#059669", fontWeight: "600", fontSize: 12 },

  // Replies list
  repliesTitle: { fontSize: 16, fontWeight: "700", color: C.textPrimary, marginBottom: 4 },
  emptyReplies: {
    borderRadius: 12,
    backgroundColor: C.card,
    padding: 20,
    alignItems: "center",
    ...C.shadow,
  },
  emptyText: { color: C.textSecondary, textAlign: "center", fontSize: 14 },

  // Reply card (LinkedIn-style bubble)
  replyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  replyAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  replyAvatarText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  replyBubbleWrap: { flex: 1, minWidth: 0 },
  replyBubble: {
    backgroundColor: "#F3F2EF",
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  replyBubbleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  replyAuthorName: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  replyTimestamp: { fontSize: 11, color: C.textSecondary },
  replyCommentText: { fontSize: 14, color: C.textPrimary, lineHeight: 20 },
  replyWhatsAppLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  replyWhatsAppText: { fontSize: 12, fontWeight: "600", color: C.whatsAppGreen },
});
