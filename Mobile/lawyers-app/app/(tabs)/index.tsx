import { AttachmentPreview } from "@/components/AttachmentPreview";
import { useSession } from "@/lib/auth/session";
import { fetchHelpPostsFeed } from "@/lib/features/posts/api";
import type { HelpPostFeedItem } from "@/lib/features/posts/types";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

const PAGE_SIZE = 20;

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: "#0A2540",
  accent: "#0070F3",
  bg: "#F5F7FA",
  card: "#FFFFFF",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
};

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function HomeScreen() {
  const router = useRouter();
  const { token, profile } = useSession();

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
    [token],
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
            {/* ── Hero ── */}
            <View style={styles.heroCard}>
              <Text style={styles.heroEyebrow}>Egyptian Lawyers Network</Text>
              <Text style={styles.heroTitle}>Live Help Feed</Text>
              <Text style={styles.heroSub}>
                Browse requests and offer help by city and court.
              </Text>
              {profile?.fullName ? (
                <View style={styles.heroPill}>
                  <Text style={styles.heroPillText}>Welcome, {profile.fullName}</Text>
                </View>
              ) : null}
            </View>

            {/* ── Error ── */}
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
        renderItem={({ item }) => <PostCard item={item} router={router} />}
      />
    </View>
  );
}

type RouterLike = { push: (route: { pathname: string; params: Record<string, string> }) => void };

function PostCard({ item, router }: { item: HelpPostFeedItem; router: RouterLike }) {
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/posts/[postId]",
          params: { postId: item.id },
        })
      }
      style={({ pressed }) => [styles.postCard, pressed && { opacity: 0.88 }]}
    >
      {/* Court + City + Date row */}
      <View style={styles.postTop}>
        <View style={styles.badgeRow}>
          <View style={styles.courtBadge}>
            <Text style={styles.courtBadgeText}>{item.courtName}</Text>
          </View>
          <View style={styles.cityPill}>
            <Text style={styles.cityPillText}>{item.cityName}</Text>
          </View>
        </View>
        <Text style={styles.dateText}>{formatRelativeDate(item.createdAt)}</Text>
      </View>

      {/* Description */}
      <Text style={styles.postDescription} numberOfLines={3}>
        {item.description}
      </Text>

      {/* Attachment */}
      <AttachmentPreview url={item.attachmentUrl} variant="compact" />

      {/* Footer */}
      <View style={styles.postFooter}>
        <Text style={styles.authorText}>{item.lawyerFullName}</Text>
        <View style={styles.replyChip}>
          <Text style={styles.replyChipText}>
            {item.replyCount === 0
              ? "No replies"
              : item.replyCount === 1
                ? "1 reply"
                : `${item.replyCount} replies`}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

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

  // Hero
  heroCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 4,
    backgroundColor: C.primary,
    gap: 6,
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
  heroPill: {
    marginTop: 8,
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  heroPillText: { color: "#FFFFFF", fontWeight: "600", fontSize: 13 },

  // Error
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

  // Empty
  emptyCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    padding: 28,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: C.textPrimary },
  emptySubtitle: { color: C.textSecondary, textAlign: "center", lineHeight: 22, fontSize: 14 },

  // Post card
  postCard: {
    borderRadius: 12,
    backgroundColor: C.card,
    padding: 16,
    gap: 10,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  postTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, flex: 1 },
  courtBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  courtBadgeText: { color: "#1D4ED8", fontWeight: "700", fontSize: 12 },
  cityPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },
  cityPillText: { color: C.textSecondary, fontSize: 12, fontWeight: "600" },
  dateText: { color: C.textSecondary, fontSize: 11, marginTop: 2, flexShrink: 0 },
  postDescription: {
    fontSize: 15,
    fontWeight: "600",
    color: C.textPrimary,
    lineHeight: 22,
  },
  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 10,
    marginTop: 2,
  },
  authorText: { color: C.textSecondary, fontSize: 13 },
  replyChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },
  replyChipText: { color: C.textSecondary, fontSize: 12, fontWeight: "600" },

  footerLoader: { paddingVertical: 20, alignItems: "center" },
});
