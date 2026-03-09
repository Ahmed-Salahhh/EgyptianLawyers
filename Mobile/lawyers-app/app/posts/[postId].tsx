import { AttachmentPreview } from "@/components/AttachmentPreview";
import { useSession } from "@/lib/auth/session";
import {
  deleteHelpPost,
  deleteHelpPostReply,
  fetchHelpPostById,
  replyToPost,
  updateHelpPost,
  updateHelpPostReply,
  uploadHelpPostAttachment,
} from "@/lib/features/posts/api";
import {
  countTotalReplies,
  type HelpPostDetails,
  type HelpPostReply,
  type PickedFile,
} from "@/lib/features/posts/types";
import { formatUtcRelative } from "@/lib/utils/date";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const { token, profile } = useSession();
  const isSuspended = profile?.isSuspended ?? false;

  const [post, setPost] = useState<HelpPostDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeMenu, setActiveMenu] = useState<{
    id: string;
    type: "post" | "comment";
    text: string;
    name?: string;
    attachmentUrl?: string | null;
  } | null>(null);
  const [editingPost, setEditingPost] = useState<{
    id: string;
    text: string;
    attachmentUrl?: string | null;
  } | null>(null);
  const [editingComment, setEditingComment] = useState<{
    id: string;
    text: string;
    name: string;
  } | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const [replyComment, setReplyComment] = useState("");
  const [replyFile, setReplyFile] = useState<PickedFile | null>(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [replySuccess, setReplySuccess] = useState(false);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [editPostError, setEditPostError] = useState<string | null>(null);
  const [editingPostFile, setEditingPostFile] = useState<PickedFile | null>(null);

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

  const currentUserId = profile?.lawyerId ?? null;

  const handleSubmitReply = async () => {
    if (!token || !postId) return;

    const trimmed = replyComment.trim();
    const hasContent = editingComment ? trimmed : trimmed || replyFile;
    if (!hasContent) {
      setReplyError(editingComment ? "Comment text is required." : "Please write a comment or attach an image.");
      return;
    }

    setReplyError(null);
    setReplySuccess(false);
    setIsSubmittingReply(true);

    try {
      if (editingComment) {
        await updateHelpPostReply(token, editingComment.id, trimmed, null);
        setReplyComment("");
        setReplyFile(null);
        setEditingComment(null);
      } else {
        await replyToPost(
          token,
          postId,
          trimmed || null,
          replyFile,
          replyingTo?.id ?? null,
        );
        setReplyComment("");
        setReplyFile(null);
        setReplyingTo(null);
      }
      setReplySuccess(true);
      loadPost();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit reply.";
      setReplyError(msg);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleMenuEdit = () => {
    if (!activeMenu) return;
    if (activeMenu.type === "comment") {
      setReplyComment(activeMenu.text);
      setEditingComment({
        id: activeMenu.id,
        text: activeMenu.text,
        name: activeMenu.name ?? "",
      });
      setReplyingTo(null);
    } else if (activeMenu.type === "post") {
      setEditingPost({
        id: activeMenu.id,
        text: activeMenu.text,
        attachmentUrl: activeMenu.attachmentUrl ?? undefined,
      });
      setEditingPostFile(null);
      setEditPostError(null);
    }
    setActiveMenu(null);
  };

  const handlePickEditImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setEditPostError("Permission to access photos is required.");
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
      setEditingPostFile({
        uri: asset.uri,
        name: asset.fileName ?? `photo.${ext}`,
        mimeType: asset.mimeType ?? `image/${ext}`,
      });
      setEditPostError(null);
    }
  };

  const handleSaveEditPost = async () => {
    if (!token || !editingPost) return;
    const trimmed = editingPost.text.trim();
    if (!trimmed) {
      setEditPostError("Description is required.");
      return;
    }
    setEditPostError(null);
    setIsSavingPost(true);
    try {
      let attachmentUrl: string | null = editingPost.attachmentUrl ?? null;
      if (editingPostFile) {
        attachmentUrl = await uploadHelpPostAttachment(token, editingPostFile);
      }
      await updateHelpPost(token, editingPost.id, trimmed, attachmentUrl);
      setEditingPost(null);
      setEditingPostFile(null);
      loadPost();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update post.";
      setEditPostError(msg);
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleMenuDelete = () => {
    if (!activeMenu) return;
    const menu = activeMenu;
    setActiveMenu(null);

    const isPost = menu.type === "post";
    Alert.alert(
      isPost ? "Delete Post" : "Delete Comment",
      isPost
        ? "Are you sure you want to delete this post?"
        : "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!token) return;
            try {
              if (isPost) {
                await deleteHelpPost(token, menu.id);
                router.back();
              } else {
                await deleteHelpPostReply(token, menu.id);
                loadPost();
              }
            } catch (err) {
              const msg = err instanceof Error ? err.message : "Failed to delete.";
              Alert.alert("Error", msg);
            }
          },
        },
      ]
    );
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* ── Child 1: Scrollable content (post + replies) ───────────────────── */}
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.content,
            !isSuspended && { paddingBottom: 120 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
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
            {post.lawyerId === currentUserId && (
              <TouchableOpacity
                onPress={() =>
                  setActiveMenu({
                    id: post.id,
                    type: "post",
                    text: post.description,
                    attachmentUrl: post.attachmentUrl,
                  })
                }
                style={styles.menuButton}
                hitSlop={8}
              >
                <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
              </TouchableOpacity>
            )}
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

        {/* ── Replies list ───────────────────────────────────────────────────── */}
        {(() => {
          const totalCount = countTotalReplies(post.replies);
          return (
            <>
              <Text style={styles.repliesTitle}>
                {totalCount === 0
                  ? "No Replies Yet"
                  : totalCount === 1
                    ? "1 Reply"
                    : `${totalCount} Replies`}
              </Text>

              {post.replies.length === 0 ? (
                <View style={styles.emptyReplies}>
                  <Text style={styles.emptyText}>Be the first to reply and offer your help.</Text>
                </View>
              ) : (
                post.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    depth={0}
                    currentUserId={currentUserId}
                    isSuspended={isSuspended}
                    onReplyPress={(target) => setReplyingTo(target)}
                    onMenuPress={(target) =>
                      setActiveMenu({
                        id: target.id,
                        type: "comment",
                        text: target.text ?? "",
                        name: target.name,
                      })
                    }
                    router={router}
                  />
                ))
              )}
            </>
          );
        })()}
        </ScrollView>

        {/* ── Child 2: Pinned comment input (Instagram/Twitter style) ─────────── */}
        {!isSuspended && (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderTopWidth: 1,
              borderColor: "#EBEBEB",
              paddingHorizontal: 16,
              paddingVertical: 12,
              paddingBottom: Platform.OS === "ios" ? 24 : 12,
              gap: 8,
            }}
          >
            {(replyingTo || editingComment) && (
              <View style={styles.replyingToBanner}>
                <Text style={styles.replyingToText}>
                  {editingComment
                    ? `Editing comment${editingComment.name ? ` by ${editingComment.name}` : ""}`
                    : `Replying to ${replyingTo!.name}`}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setReplyingTo(null);
                    setEditingComment(null);
                  }}
                  hitSlop={8}
                >
                  <Text style={styles.replyingToClear}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            {replyFile ? (
              <View style={styles.replyPreviewRow}>
                <Image
                  source={{ uri: replyFile.uri }}
                  style={styles.replyPreviewImage}
                  resizeMode="cover"
                />
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
                placeholder={editingComment ? "Edit your comment..." : "Add a comment..."}
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
            {replySuccess ? (
              <Text style={styles.replySuccessText}>Reply submitted successfully.</Text>
            ) : null}
          </View>
        )}

        {/* ── Bottom Sheet Modal ─────────────────────────────────────────────── */}
        <Modal
          visible={!!activeMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setActiveMenu(null)}
        >
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "flex-end",
            }}
            activeOpacity={1}
            onPress={() => setActiveMenu(null)}
          >
            <View
              style={{
                backgroundColor: "#FFF",
                paddingBottom: Platform.OS === "ios" ? 40 : 20,
                paddingTop: 10,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
              }}
              onStartShouldSetResponder={() => true}
            >
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#CCC",
                  alignSelf: "center",
                  marginBottom: 20,
                }}
              />
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", padding: 16 }}
                onPress={handleMenuEdit}
              >
                <Ionicons name="pencil-outline" size={24} color="#0A2540" />
                <Text style={{ fontSize: 16, marginLeft: 16, color: "#0A2540" }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", padding: 16 }}
                onPress={handleMenuDelete}
              >
                <Ionicons name="trash-outline" size={24} color="#D32F2F" />
                <Text style={{ fontSize: 16, marginLeft: 16, color: "#D32F2F" }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* ── Edit Post Modal ───────────────────────────────────────────────── */}
        <Modal
          visible={!!editingPost}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => {
            setEditingPost(null);
            setEditingPostFile(null);
            setEditPostError(null);
          }}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={["bottom"]}>
            <View style={styles.editPostHeader}>
              <TouchableOpacity
                onPress={() => {
                  setEditingPost(null);
                  setEditingPostFile(null);
                  setEditPostError(null);
                }}
                hitSlop={8}
              >
                <Text style={styles.editPostCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.editPostTitle}>Edit Post</Text>
              <TouchableOpacity
                onPress={handleSaveEditPost}
                disabled={isSavingPost}
                hitSlop={8}
              >
                {isSavingPost ? (
                  <ActivityIndicator size="small" color={C.primary} />
                ) : (
                  <Text style={[styles.editPostSave, isSavingPost && { opacity: 0.5 }]}>
                    Save
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                multiline
                value={editingPost?.text ?? ""}
                onChangeText={(text) =>
                  setEditingPost((prev) => (prev ? { ...prev, text } : null))
                }
                placeholder="Describe your legal need..."
                placeholderTextColor={C.textSecondary}
                style={styles.editPostInput}
                editable={!isSavingPost}
              />
              {(editingPostFile || editingPost?.attachmentUrl) ? (
                <View style={styles.editPostAttachmentRow}>
                  <Image
                    source={{
                      uri: editingPostFile?.uri ?? editingPost?.attachmentUrl ?? "",
                    }}
                    style={styles.editPostImage}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => {
                      setEditingPostFile(null);
                      setEditingPost((prev) =>
                        prev ? { ...prev, attachmentUrl: null } : null,
                      );
                    }}
                  >
                    <Text style={styles.removeImageText}>Remove Image</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addAttachmentBtn}
                  onPress={handlePickEditImage}
                  disabled={isSavingPost}
                >
                  <Ionicons name="image-outline" size={24} color={C.primary} />
                  <Text style={styles.addAttachmentText}>Add Attachment</Text>
                </TouchableOpacity>
              )}
              {editPostError ? (
                <Text style={styles.editPostError}>{editPostError}</Text>
              ) : null}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </KeyboardAvoidingView>
    </>
  );
}

function CommentItem({
  comment,
  depth = 0,
  currentUserId,
  isSuspended,
  onReplyPress,
  onMenuPress,
  router,
}: {
  comment: HelpPostReply;
  depth?: number;
  currentUserId: string | null;
  isSuspended: boolean;
  onReplyPress: (target: { id: string; name: string }) => void;
  onMenuPress: (target: { id: string; text: string | null; name: string }) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const wrapperStyle = [
    depth > 0 && {
      marginLeft: 32,
      borderLeftWidth: 2,
      borderColor: "#EBEBEB",
      paddingLeft: 12,
    },
  ];

  return (
    <View style={wrapperStyle}>
      <View style={styles.replyRow}>
      <Pressable
        onPress={() =>
          (router.push as (opts: { pathname: string; params: { lawyerId: string } }) => void)({
            pathname: "/public-profile/[lawyerId]",
            params: { lawyerId: comment.lawyerId },
          })
        }
        style={({ pressed }) => [pressed && { opacity: 0.7 }]}
        hitSlop={8}
      >
        <View style={styles.replyAvatar}>
          <Text style={styles.replyAvatarText}>
            {comment.lawyerFullName.trim().charAt(0).toUpperCase()}
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
                  params: { lawyerId: comment.lawyerId },
                })
              }
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
              hitSlop={6}
            >
              <Text style={styles.replyAuthorName}>{comment.lawyerFullName}</Text>
            </Pressable>
            <View style={styles.replyHeaderRight}>
              <Text style={styles.replyTimestamp}>{formatUtcRelative(comment.createdAt)}</Text>
              {comment.lawyerId === currentUserId && (
                <TouchableOpacity
                  onPress={() =>
                    onMenuPress({
                      id: comment.id,
                      text: comment.comment ?? null,
                      name: comment.lawyerFullName,
                    })
                  }
                  style={{ marginLeft: 8 }}
                  hitSlop={8}
                >
                  <Ionicons name="ellipsis-horizontal" size={18} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          {comment.comment ? <Text style={styles.replyCommentText}>{comment.comment}</Text> : null}
          <AttachmentPreview url={comment.attachmentUrl} variant="compact" />
          {!isSuspended && (
            <TouchableOpacity
              onPress={() => onReplyPress({ id: comment.id, name: comment.lawyerFullName })}
              style={{ marginTop: 4 }}
              hitSlop={8}
            >
              <Text style={styles.replyButtonText}>Reply</Text>
            </TouchableOpacity>
          )}
        </View>

        <Pressable
          onPress={() => openWhatsApp(comment.lawyerWhatsAppNumber)}
          style={({ pressed }) => [styles.replyWhatsAppLink, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="logo-whatsapp" size={14} color={C.whatsAppGreen} />
          <Text style={styles.replyWhatsAppText}>WhatsApp</Text>
        </Pressable>
      </View>
      </View>

      {comment.childReplies && comment.childReplies.length > 0
        ? comment.childReplies.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              depth={depth + 1}
              currentUserId={currentUserId}
              isSuspended={isSuspended}
              onReplyPress={onReplyPress}
              onMenuPress={onMenuPress}
              router={router}
            />
          ))
        : null}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 30, gap: 14 },
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

  // Replying to banner
  replyingToBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F2EF",
    padding: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  replyingToText: {
    fontSize: 12,
    color: "#666",
  },
  replyingToClear: {
    fontSize: 16,
    color: "#666",
    paddingHorizontal: 4,
  },

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
  replyHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  replyAuthorName: { fontSize: 13, fontWeight: "700", color: C.textPrimary },
  replyTimestamp: { fontSize: 11, color: C.textSecondary },
  menuButton: { padding: 4 },
  replyCommentText: { fontSize: 14, color: C.textPrimary, lineHeight: 20 },
  replyButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  replyWhatsAppLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    alignSelf: "flex-start",
  },
  replyWhatsAppText: { fontSize: 12, fontWeight: "600", color: C.whatsAppGreen },

  // Edit Post modal
  editPostHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.card,
    borderBottomWidth: 1,
    borderColor: C.divider,
  },
  editPostCancel: { fontSize: 16, color: C.textSecondary },
  editPostTitle: { fontSize: 17, fontWeight: "700", color: C.textPrimary },
  editPostSave: { fontSize: 16, fontWeight: "600", color: C.primary },
  editPostInput: {
    minHeight: 100,
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.inputBorder,
    backgroundColor: C.card,
    padding: 16,
    fontSize: 15,
    color: C.textPrimary,
    textAlignVertical: "top",
  },
  editPostAttachmentRow: { marginTop: 16, gap: 12 },
  editPostImage: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: C.inputBorder,
  },
  removeImageBtn: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: C.danger,
  },
  removeImageText: { color: "#FFFFFF", fontWeight: "600", fontSize: 14 },
  addAttachmentBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.inputBorder,
    borderStyle: "dashed",
  },
  addAttachmentText: { fontSize: 15, fontWeight: "600", color: C.primary },
  editPostError: { color: C.danger, fontSize: 14, marginTop: 12 },
});
