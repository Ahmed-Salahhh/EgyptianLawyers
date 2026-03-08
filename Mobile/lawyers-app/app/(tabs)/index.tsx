import { AttachmentPreview, isImageAttachment } from "@/components/AttachmentPreview";
import { useSession } from "@/lib/auth/session";
import { fetchHelpPostsFeed, replyToPost } from "@/lib/features/posts/api";
import type { HelpPostFeedItem } from "@/lib/features/posts/types";
import { formatUtcRelative } from "@/lib/utils/date";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const PAGE_SIZE = 20;

// ── Design tokens (LinkedIn-style) ───────────────────────────────────────────
const C = {
  primary: "#0A2540",
  bg: "#F3F2EF",
  card: "#FFFFFF",
  textPrimary: "#191919",
  textSecondary: "#666666",
  divider: "#EBEBEB",
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
};

export default function HomeScreen() {
  const router = useRouter();
  const { token, profile } = useSession();
  const isVerified = profile?.isVerified ?? false;
  const isSuspended = profile?.isSuspended ?? false;

  const [posts, setPosts] = useState<HelpPostFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const currentPage = useRef(1);

  const loadPage = useCallback(
    async (page: number, append: boolean) => {
      if (!token) {
        setError("Not authenticated.");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }
      if (!isVerified) {
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      try {
        const result = await fetchHelpPostsFeed(token, page, PAGE_SIZE);

        if (append) {
          setPosts((prev) => [...prev, ...result.items]);
        } else {
          setPosts(result.items);
        }

        currentPage.current = result.pageIndex;
        setHasNextPage(result.hasNextPage);
        setError(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load feed.";
        setError(msg);
        console.error("[Feed]", msg);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [token, isVerified],
  );

  useEffect(() => {
    setIsLoading(true);
    loadPage(1, false);
  }, [loadPage]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setIsLoadingMore(false);
    loadPage(1, false);
  }, [loadPage]);

  const handleLoadMore = useCallback(() => {
    if (!hasNextPage || isLoadingMore || isRefreshing) return;
    setIsLoadingMore(true);
    loadPage(currentPage.current + 1, true);
  }, [hasNextPage, isLoadingMore, isRefreshing, loadPage]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.loadingText}>Loading feed...</Text>
      </View>
    );
  }

  if (!isVerified) {
    return (
      <View style={styles.centered}>
        <Ionicons name="lock-closed-outline" size={64} color="#666" />
        <Text style={styles.pendingTitle}>Account Pending Approval</Text>
        <Text style={styles.pendingSubtitle}>
          Your syndicate card is currently under review by our admins. Please check
          your profile for updates.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[C.primary]}
            tintColor={C.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <>
            <View style={styles.heroCard}>
              <Text style={styles.heroEyebrow}>Egyptian Lawyers Network</Text>
              <Text style={styles.heroTitle}>Live Help Feed</Text>
              <Text style={styles.heroSub}>
                Browse requests and offer help by city and court.
              </Text>
              {profile?.fullName ? (
                <View style={styles.heroWelcomeRow}>
                  <Ionicons name="person-circle-outline" size={18} color="#EBEBEB" />
                  <Text style={styles.heroWelcomeText}>
                    Welcome back, {profile.fullName.trim().split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ")}
                  </Text>
                </View>
              ) : null}
            </View>

            {error ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable onPress={handleRefresh} style={styles.retryButton}>
                  <Text style={styles.retryText}>Retry</Text>
                </Pressable>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          !error ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptySubtitle}>New help requests will appear here.</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={C.primary} />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <PostCard
            item={item}
            router={router}
            token={token}
            isSuspended={isSuspended}
            onReplySubmitted={() => loadPage(1, false)}
          />
        )}
      />
    </View>
  );
}

function PostCard({
  item,
  router,
  token,
  isSuspended,
  onReplySubmitted,
}: {
  item: HelpPostFeedItem;
  router: ReturnType<typeof useRouter>;
  token: string | null;
  isSuspended: boolean;
  onReplySubmitted: () => void;
}) {
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtitle = `${item.courtName} • ${item.cityName} • ${formatUtcRelative(item.createdAt)}`;

  const goToPost = () => {
    router.push({
      pathname: "/posts/[postId]" as const,
      params: { postId: item.id },
    });
  };

  const goToProfile = () => {
    router.push({
      pathname: "/public-profile/[lawyerId]" as const,
      params: { lawyerId: item.lawyerId },
    });
  };

  const handleSubmitReply = async () => {
    const trimmed = replyText.trim();
    if (!trimmed || !token) return;

    setIsSubmitting(true);
    try {
      await replyToPost(token, item.id, trimmed, null);
      setReplyText("");
      onReplySubmitted();
    } catch (err) {
      console.warn("[Feed] Reply failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.postCard}>
      {/* ── Header: Avatar | Name + Subtitle ────────────────────────────────── */}
      <View style={styles.postHeader}>
        <Pressable onPress={goToProfile} style={({ pressed }) => [pressed && { opacity: 0.7 }]} hitSlop={8}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.lawyerFullName.trim().charAt(0).toUpperCase()}
            </Text>
          </View>
        </Pressable>
        <View style={styles.headerCenter}>
          <Pressable onPress={goToProfile} style={({ pressed }) => [pressed && { opacity: 0.7 }]} hitSlop={8}>
            <Text style={styles.authorName}>{item.lawyerFullName}</Text>
          </Pressable>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>

      {/* ── Body + Media (tappable → post) ─────────────────────────────────── */}
      <Pressable onPress={goToPost} style={({ pressed }) => [pressed && { opacity: 0.95 }]}>
        <Text style={styles.postDescription}>{item.description}</Text>
        {item.attachmentUrl ? (
          isImageAttachment(item.attachmentUrl) ? (
            <View style={styles.mediaImageWrapper}>
              <AttachmentPreview url={item.attachmentUrl} variant="feed" />
            </View>
          ) : (
            <View style={styles.mediaDocWrapper}>
              <AttachmentPreview url={item.attachmentUrl} variant="feed" />
            </View>
          )
        ) : null}
      </Pressable>

      {/* ── Divider ────────────────────────────────────────────────────────── */}
      <View style={styles.divider} />

      {/* ── Compact inline reply pill ───────────────────────────────────────── */}
      {!isSuspended && (
      <View style={styles.replyPill}>
        <TextInput
          value={replyText}
          onChangeText={setReplyText}
          placeholder="Add a comment..."
          placeholderTextColor={C.textSecondary}
          style={styles.replyPillInput}
          editable={!isSubmitting}
          onSubmitEditing={handleSubmitReply}
          returnKeyType="send"
        />
        <Pressable
          onPress={handleSubmitReply}
          disabled={!replyText.trim() || isSubmitting}
          style={({ pressed }) => [
            styles.replyPillSendBtn,
            (!replyText.trim() || isSubmitting) && { opacity: 0.4 },
            pressed && replyText.trim() && !isSubmitting && { opacity: 0.8 },
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={C.primary} />
          ) : (
            <Ionicons name="send" size={18} color={C.primary} />
          )}
        </Pressable>
      </View>
      )}
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  listContent: { padding: 16, paddingBottom: 110, gap: 12 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg,
    padding: 24,
  },
  loadingText: { marginTop: 10, color: C.textSecondary, fontSize: 14 },

  heroCard: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 4,
    backgroundColor: C.primary,
    gap: 6,
    ...C.shadow,
  },
  heroEyebrow: {
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroTitle: { color: "#FFFFFF", fontSize: 26, fontWeight: "800", lineHeight: 32 },
  heroSub: { color: "rgba(255,255,255,0.75)", fontSize: 14, lineHeight: 20 },
  heroWelcomeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  heroWelcomeText: { color: "#EBEBEB", fontSize: 14, fontWeight: "500" },

  errorCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: C.dangerBg,
    padding: 14,
    marginBottom: 4,
  },
  errorText: { color: C.danger, marginBottom: 10, lineHeight: 20, fontSize: 14 },
  retryButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: C.danger,
  },
  retryText: { color: "#fff", fontWeight: "700" },

  emptyCard: {
    borderRadius: 12,
    backgroundColor: C.card,
    padding: 28,
    alignItems: "center",
    gap: 6,
    ...C.shadow,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: C.textPrimary },
  emptySubtitle: { color: C.textSecondary, textAlign: "center", lineHeight: 22, fontSize: 14 },
  pendingTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0A2540",
    marginTop: 16,
  },
  pendingSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 32,
    marginTop: 8,
  },

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
    marginBottom: 12,
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
  authorName: { fontSize: 16, fontWeight: "700", color: C.textPrimary },
  subtitle: { fontSize: 12, color: C.textSecondary, marginTop: 2 },

  postDescription: {
    fontSize: 15,
    color: C.textPrimary,
    lineHeight: 20,
    marginBottom: 12,
  },
  mediaImageWrapper: {
    marginHorizontal: -16,
    marginTop: 10,
    marginBottom: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  mediaDocWrapper: {
    marginTop: 10,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#EBEBEB",
    borderRadius: 8,
    padding: 12,
  },
  divider: {
    height: 1,
    backgroundColor: C.divider,
    marginVertical: 10,
    marginHorizontal: -16,
  },
  replyPill: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F2EF",
    paddingHorizontal: 14,
    gap: 8,
  },
  replyPillInput: {
    flex: 1,
    fontSize: 15,
    color: C.textPrimary,
    paddingVertical: 0,
    margin: 0,
  },
  replyPillSendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  footerLoader: { paddingVertical: 20, alignItems: "center" },
});
