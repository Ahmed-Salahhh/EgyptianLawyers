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
  View,
} from "react-native";
import { useSession } from "@/lib/auth/session";
import { getProfileViewers } from "@/lib/features/lawyers/api";
import type { ProfileViewer } from "@/lib/features/lawyers/types";

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

const PAGE_SIZE = 20;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString();
}

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ProfileViewersScreen() {
  const router = useRouter();
  const { token } = useSession();

  const [viewers, setViewers] = useState<ProfileViewer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const result = await getProfileViewers(token, page, PAGE_SIZE);

        if (append) {
          setViewers((prev) => [...prev, ...result.data]);
        } else {
          setViewers(result.data);
          setTotalCount(result.totalCount);
        }

        currentPage.current = result.pageIndex;
        setHasNextPage(result.hasNextPage);
        setError(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load viewers.";
        setError(msg);
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
    loadPage(1, false);
  }, [loadPage]);

  const handleLoadMore = useCallback(() => {
    if (!hasNextPage || isLoadingMore || isRefreshing) return;
    setIsLoadingMore(true);
    loadPage(currentPage.current + 1, true);
  }, [hasNextPage, isLoadingMore, isRefreshing, loadPage]);

  // ── Loading state ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.loadingText}>Loading viewers...</Text>
      </View>
    );
  }

  // ── Error (full screen, no items yet) ────────────────────────────────────

  if (error && viewers.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="wifi-outline" size={48} color={C.textSecondary} />
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorSubtitle}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => { setIsLoading(true); loadPage(1, false); }}>
          <Text style={styles.retryButtonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  // ── Main list ─────────────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <FlatList
        data={viewers}
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
          viewers.length > 0 ? (
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderText}>
                {totalCount} {totalCount === 1 ? "person" : "people"} viewed your profile
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !error ? <EmptyState /> : null
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={C.primary} />
            </View>
          ) : null
        }
        renderItem={({ item }) => <ViewerCard viewer={item} onPress={() => router.back()} />}
      />
    </View>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ViewerCard({ viewer }: { viewer: ProfileViewer; onPress: () => void }) {
  return (
    <View style={styles.viewerCard}>
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitial(viewer.fullName)}</Text>
      </View>

      {/* Info */}
      <View style={styles.viewerInfo}>
        <Text style={styles.viewerName} numberOfLines={1}>
          {viewer.fullName}
        </Text>
        <Text style={styles.viewerTime}>
          Viewed {formatRelativeDate(viewer.lastViewedAt)}
        </Text>
      </View>

      {/* View count badge */}
      {viewer.viewCount > 1 && (
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{viewer.viewCount}×</Text>
        </View>
      )}
    </View>
  );
}

function EmptyState() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="eye-off-outline" size={40} color={C.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>No profile views yet</Text>
      <Text style={styles.emptySubtitle}>
        Post in the community feed to get noticed by other lawyers in your area.
      </Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  listContent: { padding: 16, paddingBottom: 40, gap: 10 },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg,
    padding: 32,
    gap: 12,
  },
  loadingText: { color: C.textSecondary, fontSize: 14 },

  // Full-screen error
  errorTitle: { fontSize: 17, fontWeight: "700", color: C.textPrimary, textAlign: "center" },
  errorSubtitle: { fontSize: 13, color: C.textSecondary, textAlign: "center", lineHeight: 20 },
  retryButton: {
    marginTop: 4,
    borderRadius: 10,
    backgroundColor: C.primary,
    paddingHorizontal: 24,
    paddingVertical: 11,
  },
  retryButtonText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  // List header
  listHeader: {
    paddingVertical: 4,
    paddingHorizontal: 2,
    marginBottom: 4,
  },
  listHeaderText: {
    fontSize: 13,
    fontWeight: "600",
    color: C.textSecondary,
  },

  // Viewer card
  viewerCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "800",
    color: C.primary,
  },
  viewerInfo: { flex: 1, gap: 3 },
  viewerName: { fontSize: 15, fontWeight: "700", color: C.textPrimary },
  viewerTime: { fontSize: 12, color: C.textSecondary },
  countBadge: {
    borderRadius: 999,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  countBadgeText: { fontSize: 12, fontWeight: "700", color: C.accent },

  // Empty state
  emptyContainer: {
    marginTop: 60,
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: C.textPrimary, textAlign: "center" },
  emptySubtitle: {
    fontSize: 14,
    color: C.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },

  footerLoader: { paddingVertical: 20, alignItems: "center" },
});
