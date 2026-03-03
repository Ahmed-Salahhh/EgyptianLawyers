import { useSession } from "@/lib/auth/session";
import { fetchHelpPostsFeed } from "@/lib/features/posts/api";
import type { HelpPostFeedItem } from "@/lib/features/posts/types";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function HomeScreen() {
  const router = useRouter();
  const { token, profile } = useSession();
  const [posts, setPosts] = useState<HelpPostFeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(
    async (refresh = false) => {
      if (!token) {
        setPosts([]);
        setIsLoading(false);
        setIsRefreshing(false);
        setError("No auth token available.");
        return;
      }

      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const feed = await fetchHelpPostsFeed(token);
        setPosts(feed);
      } catch {
        setError("Failed to load posts feed.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const header = useMemo(
    () => (
      <View>
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Lawyers Network</Text>
          <Text style={styles.heroTitle}>Live Help Feed</Text>
          <Text style={styles.heroSub}>Browse requests and respond quickly by city and court.</Text>
          <Text style={styles.heroMeta}>Welcome, {profile?.fullName ?? "Lawyer"}</Text>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => loadPosts()} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    ),
    [error, loadPosts, profile?.fullName],
  );

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
        ListHeaderComponent={header}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => loadPosts(true)} />
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No posts yet</Text>
            <Text style={styles.emptySubtitle}>New requests will appear here.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/posts/[postId]",
                params: { postId: item.id },
              })
            }
            style={({ pressed }) => [styles.postCard, pressed ? { opacity: 0.9 } : null]}
          >
            <View style={styles.postTop}>
              <Text style={styles.badge}>{item.courtName}</Text>
              <Text style={styles.metaPill}>{item.cityName}</Text>
            </View>
            <Text style={styles.postDescription}>{item.description}</Text>
            <Text style={styles.postMeta}>By {item.lawyerFullName}</Text>
            <View style={styles.postFooter}>
              <Text style={styles.footerText}>{item.replyCount} replies</Text>
              <Text style={styles.footerText}>{formatDate(item.createdAt)}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f7fc",
  },
  listContent: {
    padding: 16,
    paddingBottom: 110,
    gap: 12,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f7fc",
  },
  loadingText: {
    marginTop: 10,
    color: "#5d7296",
  },
  heroCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 12,
    backgroundColor: "#113e87",
  },
  heroLabel: {
    color: "#b9cef8",
    fontWeight: "600",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroTitle: {
    marginTop: 4,
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "700",
  },
  heroSub: {
    marginTop: 6,
    color: "#d9e6ff",
  },
  heroMeta: {
    marginTop: 14,
    color: "#e6efff",
    fontWeight: "600",
  },
  errorCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#f1c7d0",
    backgroundColor: "#fff3f6",
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    color: "#b13550",
    marginBottom: 10,
  },
  retryButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#c9415b",
  },
  retryText: {
    color: "#fff",
    fontWeight: "700",
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d7e1f3",
    backgroundColor: "#fff",
    padding: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a2f52",
  },
  emptySubtitle: {
    marginTop: 4,
    color: "#60769a",
  },
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
    alignItems: "center",
    marginBottom: 10,
  },
  postDescription: {
    fontSize: 15,
    fontWeight: "700",
    color: "#17315c",
  },
  badge: {
    alignSelf: "flex-start",
    marginTop: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#e8f0ff",
    color: "#1744a9",
    fontWeight: "700",
    fontSize: 12,
  },
  metaPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#eff4fd",
    color: "#4d668f",
    fontSize: 12,
    fontWeight: "600",
  },
  postMeta: {
    marginTop: 6,
    color: "#5f7498",
    fontSize: 13,
  },
  postFooter: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#edf1fa",
    paddingTop: 10,
  },
  footerText: {
    color: "#7487a8",
    fontSize: 12,
  },
});
