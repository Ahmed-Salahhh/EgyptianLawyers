import { useSession } from "@/lib/auth/session";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/features/notifications/api";
import {
  parseNotificationPayload,
  type UserNotification,
} from "@/lib/features/notifications/types";
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
  if (Number.isNaN(date.getTime())) return "";
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

export default function NotificationsScreen() {
  const router = useRouter();
  const { token } = useSession();

  const [items, setItems] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const currentPage = useRef(1);

  // ── Data loading ────────────────────────────────────────────────────────────

  const loadPage = useCallback(
    async (page: number, append: boolean) => {
      if (!token) {
        setError("Not authenticated.");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }
      try {
        const result = await getNotifications(token, page, PAGE_SIZE);

        if (append) {
          setItems((prev) => [...prev, ...result.data]);
        } else {
          setItems(result.data);
          setUnreadCount(result.unreadCount);
        }

        currentPage.current = result.pageIndex;
        setHasNextPage(result.hasNextPage);
        setError(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load notifications.";
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

  // ── Actions ─────────────────────────────────────────────────────────────────

  const handleTap = useCallback(
    async (item: UserNotification) => {
      if (!token) return;

      // Optimistically mark as read in local state
      if (!item.isRead) {
        setItems((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((c) => Math.max(0, c - 1));

        // Fire-and-forget — no need to block navigation
        markNotificationAsRead(token, item.id).catch((err) =>
          console.warn("[Notifications] Failed to mark as read:", err),
        );
      }

      // Navigate to post if dataPayload carries a postId
      const payload = parseNotificationPayload(item.dataPayload);
      if (payload.postId) {
        router.push({
          pathname: "/posts/[postId]",
          params: { postId: payload.postId },
        });
      }
    },
    [token, router],
  );

  const handleMarkAll = useCallback(async () => {
    if (!token || unreadCount === 0 || isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      await markAllNotificationsAsRead(token);
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn("[Notifications] Failed to mark all as read:", err);
    } finally {
      setIsMarkingAll(false);
    }
  }, [token, unreadCount, isMarkingAll]);

  // ── Render ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1f5bd8" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
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
          <ListHeader
            unreadCount={unreadCount}
            isMarkingAll={isMarkingAll}
            error={error}
            onMarkAll={handleMarkAll}
            onRetry={handleRefresh}
          />
        }
        ListEmptyComponent={
          !error ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySubtitle}>
                You'll be notified about new help requests in your area.
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
        renderItem={({ item }) => (
          <NotificationItem item={item} onPress={handleTap} />
        )}
      />
    </View>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

type ListHeaderProps = {
  unreadCount: number;
  isMarkingAll: boolean;
  error: string | null;
  onMarkAll: () => void;
  onRetry: () => void;
};

function ListHeader({ unreadCount, isMarkingAll, error, onMarkAll, onRetry }: ListHeaderProps) {
  return (
    <>
      {/* ── Hero ── */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>In-App</Text>
        <Text style={styles.heroTitle}>Notifications</Text>

        <View style={styles.heroRow}>
          {unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount} unread</Text>
            </View>
          ) : (
            <Text style={styles.allReadText}>All caught up ✓</Text>
          )}

          <Pressable
            onPress={onMarkAll}
            disabled={unreadCount === 0 || isMarkingAll}
            style={({ pressed }) => [
              styles.markAllButton,
              (unreadCount === 0 || isMarkingAll) && { opacity: 0.45 },
              pressed && { opacity: 0.7 },
            ]}
          >
            {isMarkingAll ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.markAllButtonText}>Mark all as read</Text>
            )}
          </Pressable>
        </View>
      </View>

      {/* ── Error ── */}
      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={onRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}
    </>
  );
}

type NotificationItemProps = {
  item: UserNotification;
  onPress: (item: UserNotification) => void;
};

function NotificationItem({ item, onPress }: NotificationItemProps) {
  const hasPostLink = !!parseNotificationPayload(item.dataPayload).postId;

  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        styles.notifCard,
        !item.isRead && styles.notifCardUnread,
        pressed && { opacity: 0.85 },
      ]}
    >
      {/* Unread dot */}
      {!item.isRead && <View style={styles.unreadDot} />}

      <View style={styles.notifContent}>
        <View style={styles.notifTopRow}>
          <Text
            style={[styles.notifTitle, !item.isRead && styles.notifTitleUnread]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={styles.notifTime}>{formatRelativeDate(item.createdAt)}</Text>
        </View>

        <Text style={styles.notifBody} numberOfLines={2}>
          {item.body}
        </Text>

        {hasPostLink ? (
          <Text style={styles.notifCta}>Tap to view post →</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f7fc" },
  listContent: { padding: 16, paddingBottom: 110, gap: 10 },
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
    gap: 14,
  },
  heroLabel: {
    color: "#b9cef8",
    fontWeight: "600",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroTitle: { color: "#ffffff", fontSize: 28, fontWeight: "700", marginTop: -8 },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  unreadBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  unreadBadgeText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  allReadText: { color: "#a8c4f0", fontSize: 13, fontWeight: "600" },
  markAllButton: {
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 110,
    alignItems: "center",
  },
  markAllButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },

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
    padding: 24,
    alignItems: "center",
    gap: 6,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#1a2f52" },
  emptySubtitle: { color: "#60769a", textAlign: "center", lineHeight: 20 },

  // Notification card
  notifCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#dbe5f6",
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  notifCardUnread: {
    backgroundColor: "#eef4ff",
    borderColor: "#b8d0f8",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#1f5bd8",
    marginTop: 6,
    flexShrink: 0,
  },
  notifContent: { flex: 1, gap: 4 },
  notifTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  notifTitle: {
    flex: 1,
    fontSize: 14,
    color: "#2c3f61",
    fontWeight: "600",
  },
  notifTitleUnread: {
    color: "#0f274d",
    fontWeight: "800",
  },
  notifTime: {
    fontSize: 11,
    color: "#8fa3c4",
    flexShrink: 0,
    marginTop: 1,
  },
  notifBody: {
    fontSize: 13,
    color: "#4d6080",
    lineHeight: 19,
  },
  notifCta: {
    fontSize: 12,
    color: "#1f5bd8",
    fontWeight: "700",
    marginTop: 2,
  },

  // Footer loader
  footerLoader: { paddingVertical: 20, alignItems: "center" },
});
