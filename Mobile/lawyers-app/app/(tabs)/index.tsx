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

  // Initial load
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
        <ActivityIndicator size="large" color="#1f5bd8" />
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
            colors={["#1f5bd8"]}
            tintColor="#1f5bd8"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <>
            {/* ── Hero ── */}
            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>Lawyers Network</Text>
              <Text style={styles.heroTitle}>Live Help Feed</Text>
              <Text style={styles.heroSub}>
                Browse requests and respond quickly by city and court.
              </Text>
              <Text style={styles.heroMeta}>
                Welcome, {profile?.fullName ?? "Lawyer"}
              </Text>
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
              <Text style={styles.emptySubtitle}>
                New help requests will appear here.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#1f5bd8" />
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
      style={({ pressed }) => [styles.postCard, pressed ? { opacity: 0.88 } : null]}
    >
      {/* Court + City badges */}
      <View style={styles.postTop}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.courtName}</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>{item.cityName}</Text>
          </View>
        </View>
        <Text style={styles.dateText}>{formatRelativeDate(item.createdAt)}</Text>
      </View>

      {/* Description */}
      <Text style={styles.postDescription} numberOfLines={3}>
        {item.description}
      </Text>

      {/* Attachment thumbnail / badge — tapping the card navigates to the detail screen */}
      <AttachmentPreview url={item.attachmentUrl} variant="compact" />

      {/* Author + reply count */}
      <View style={styles.postFooter}>
        <Text style={styles.authorText}>By {item.lawyerFullName}</Text>
        <View style={styles.replyBadge}>
          <Text style={styles.replyBadgeText}>
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
  container: { flex: 1, backgroundColor: "#f4f7fc" },
  listContent: { padding: 16, paddingBottom: 110, gap: 12 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f7fc",
  },
  loadingText: { marginTop: 10, color: "#5d7296" },

  // Hero
  heroCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 4,
    backgroundColor: "#113e87",
  },
  heroLabel: {
    color: "#b9cef8",
    fontWeight: "600",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroTitle: { marginTop: 4, color: "#ffffff", fontSize: 28, fontWeight: "700" },
  heroSub: { marginTop: 6, color: "#d9e6ff", fontSize: 14 },
  heroMeta: { marginTop: 14, color: "#e6efff", fontWeight: "600" },

  // Error
  errorCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f1c7d0",
    backgroundColor: "#fff3f6",
    padding: 14,
    marginBottom: 4,
  },
  errorText: { color: "#b13550", marginBottom: 10, lineHeight: 20 },
  retryButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#c9415b",
  },
  retryText: { color: "#fff", fontWeight: "700" },

  // Empty
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d7e1f3",
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#1a2f52" },
  emptySubtitle: { marginTop: 4, color: "#60769a", textAlign: "center" },

  // Post card
  postCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#dbe5f6",
    backgroundColor: "#fff",
    padding: 15,
  },
  postTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 8,
  },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, flex: 1 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#e8f0ff",
  },
  badgeText: { color: "#1744a9", fontWeight: "700", fontSize: 12 },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#eff4fd",
  },
  pillText: { color: "#4d668f", fontSize: 12, fontWeight: "600" },
  dateText: { color: "#8fa3c4", fontSize: 11, marginTop: 2, flexShrink: 0 },
  postDescription: { fontSize: 15, fontWeight: "600", color: "#17315c", lineHeight: 22 },
  postFooter: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#edf1fa",
    paddingTop: 10,
  },
  authorText: { color: "#5f7498", fontSize: 13 },
  replyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#f0f5ff",
    borderWidth: 1,
    borderColor: "#dce8ff",
  },
  replyBadgeText: { color: "#3b63c8", fontSize: 12, fontWeight: "600" },

  footerLoader: { paddingVertical: 20, alignItems: "center" },
});
