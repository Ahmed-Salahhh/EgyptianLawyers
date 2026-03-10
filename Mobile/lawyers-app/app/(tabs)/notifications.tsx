import { useSession } from "@/lib/auth/session";
import { useTheme } from "@/lib/ThemeContext";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/features/notifications/api";
import {
  parseNotificationPayload,
  type UserNotification,
} from "@/lib/features/notifications/types";
import { formatUtcRelative } from "@/lib/utils/date";
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
  unreadBg: "#EFF6FF",
  unreadBorder: "#BFDBFE",
  danger: "#DC2626",
  dangerBg: "#FEF2F2",
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { token } = useSession();
  const { theme } = useTheme();

  const [items, setItems] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const currentPage = useRef(1);

  // ── Data loading ─────────────────────────────────────────────────────────────

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

  // ── Actions ──────────────────────────────────────────────────────────────────

  const handleTap = useCallback(
    async (item: UserNotification) => {
      if (!token) return;

      if (!item.isRead) {
        setItems((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)),
        );
        setUnreadCount((c) => Math.max(0, c - 1));
        markNotificationAsRead(token, item.id).catch((err) =>
          console.warn("[Notifications] Failed to mark as read:", err),
        );
      }

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

  // ── Render ───────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={items}
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
          <ListHeader
            unreadCount={unreadCount}
            isMarkingAll={isMarkingAll}
            error={error}
            onMarkAll={handleMarkAll}
            onRetry={handleRefresh}
            theme={theme}
          />
        }
        ListEmptyComponent={
          !error ? (
            <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No notifications yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                You'll be notified about new help requests in your area.
              </Text>
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
          <NotificationItem item={item} onPress={handleTap} theme={theme} />
        )}
      />
    </View>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

type AppTheme = { background: string; card: string; text: string; textSecondary: string; border: string };

type ListHeaderProps = {
  unreadCount: number;
  isMarkingAll: boolean;
  error: string | null;
  onMarkAll: () => void;
  onRetry: () => void;
  theme: AppTheme;
};

function ListHeader({ unreadCount, isMarkingAll, error, onMarkAll, onRetry, theme }: ListHeaderProps) {
  return (
    <>
      {/* ── Summary row ── */}
      <View style={styles.summaryRow}>
        {unreadCount > 0 ? (
          <View style={[styles.unreadBadge, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Text style={[styles.unreadBadgeText, { color: theme.text }]}>{unreadCount} unread</Text>
          </View>
        ) : (
          <Text style={[styles.allReadText, { color: theme.textSecondary }]}>All caught up ✓</Text>
        )}

        <Pressable
          onPress={onMarkAll}
          disabled={unreadCount === 0 || isMarkingAll}
          style={({ pressed }) => [
            styles.markAllButton,
            (unreadCount === 0 || isMarkingAll) && { opacity: 0.4 },
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
  theme: AppTheme;
};

function NotificationItem({ item, onPress, theme }: NotificationItemProps) {
  const hasPostLink = !!parseNotificationPayload(item.dataPayload).postId;

  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => [
        styles.notifCard,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
        !item.isRead && { backgroundColor: theme.background, borderColor: theme.border },
        pressed && { opacity: 0.82 },
      ]}
    >
      {/* Unread indicator */}
      <View style={styles.notifLeft}>
        {!item.isRead ? <View style={styles.unreadDot} /> : <View style={styles.readDotPlaceholder} />}
      </View>

      <View style={styles.notifContent}>
        <View style={styles.notifTopRow}>
          <Text
            style={[
              styles.notifTitle,
              { color: item.isRead ? theme.text : C.accent },
              !item.isRead && styles.notifTitleUnread,
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={[styles.notifTime, { color: theme.textSecondary }]}>{formatUtcRelative(item.createdAt)}</Text>
        </View>

        <Text style={[styles.notifBody, { color: theme.textSecondary }]} numberOfLines={2}>
          {item.body}
        </Text>

        {hasPostLink ? (
          <Text style={[styles.notifCta, { color: C.accent }]}>View post →</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  listContent: { padding: 16, paddingBottom: 110, gap: 8 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg,
    padding: 24,
  },
  loadingText: { marginTop: 10, color: C.textSecondary, fontSize: 14 },

  // Summary row
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginBottom: 8,
  },
  unreadBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: C.unreadBg,
    borderWidth: 1,
    borderColor: C.unreadBorder,
  },
  unreadBadgeText: { color: C.accent, fontWeight: "700", fontSize: 13 },
  allReadText: { color: C.textSecondary, fontSize: 13, fontWeight: "600" },
  markAllButton: {
    borderRadius: 8,
    backgroundColor: C.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    minWidth: 130,
    alignItems: "center",
  },
  markAllButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  // Error
  errorCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
    backgroundColor: C.dangerBg,
    padding: 14,
    marginBottom: 8,
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
    padding: 32,
    alignItems: "center",
    gap: 8,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: C.textPrimary },
  emptySubtitle: { color: C.textSecondary, textAlign: "center", lineHeight: 22, fontSize: 14 },

  // Notification card
  notifCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.card,
    paddingVertical: 14,
    paddingRight: 14,
    paddingLeft: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  notifCardUnread: {
    backgroundColor: C.unreadBg,
    borderColor: C.unreadBorder,
  },
  notifLeft: {
    width: 20,
    alignItems: "center",
    paddingTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.accent,
  },
  readDotPlaceholder: {
    width: 8,
    height: 8,
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
    color: C.textPrimary,
    fontWeight: "600",
  },
  notifTitleUnread: {
    color: C.accent,
    fontWeight: "700",
  },
  notifTime: {
    fontSize: 11,
    color: C.textSecondary,
    flexShrink: 0,
    marginTop: 1,
  },
  notifBody: {
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 20,
  },
  notifCta: {
    fontSize: 12,
    color: C.accent,
    fontWeight: "700",
    marginTop: 2,
  },

  // Footer loader
  footerLoader: { paddingVertical: 20, alignItems: "center" },
});
