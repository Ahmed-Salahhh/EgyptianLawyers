import { useSession } from '@/lib/auth/session';
import { fetchHelpPostById } from '@/lib/features/posts/api';
import type { HelpPostDetails } from '@/lib/features/posts/types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function PostDetailsScreen() {
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { token } = useSession();
  const [post, setPost] = useState<HelpPostDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canLoad = useMemo(() => Boolean(token && postId), [postId, token]);

  const loadDetails = useCallback(async () => {
    if (!token || !postId) {
      setIsLoading(false);
      setError('Missing token or post id.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const details = await fetchHelpPostById(token, postId);
      setPost(details);
    } catch {
      setError('Failed to load post details.');
    } finally {
      setIsLoading(false);
    }
  }, [postId, token]);

  useEffect(() => {
    if (canLoad) {
      loadDetails();
    }
  }, [canLoad, loadDetails]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' color='#1f5bd8' />
        <Text style={styles.loadingText}>Loading post details...</Text>
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error ?? 'Post not found.'}</Text>
        <Pressable style={styles.retryButton} onPress={loadDetails}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Post Details' }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={styles.card}>
          <Text style={styles.title}>Post Details</Text>
          <Text style={styles.description}>{post.description}</Text>
          <Text style={styles.meta}>
            {post.courtName} | {post.cityName}
          </Text>
          <Text style={styles.meta}>Author: {post.lawyerFullName}</Text>
          <Text style={styles.meta}>WhatsApp: {post.lawyerWhatsAppNumber}</Text>
          <Text style={styles.meta}>Created: {formatDate(post.createdAt)}</Text>
          <Text style={styles.meta}>Replies: {post.replies.length}</Text>
        </View>

        <Text style={styles.sectionTitle}>Replies</Text>
        {post.replies.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.meta}>No replies yet.</Text>
          </View>
        ) : (
          post.replies.map((reply) => (
            <View key={reply.id} style={styles.replyCard}>
              <Text style={styles.replyName}>{reply.lawyerFullName}</Text>
              <Text style={styles.replyComment}>{reply.comment}</Text>
              <Text style={styles.meta}>
                WhatsApp: {reply.lawyerWhatsAppNumber}
              </Text>
              <Text style={styles.meta}>
                Created: {formatDate(reply.createdAt)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f6fb',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f6fb',
    padding: 16,
  },
  loadingText: {
    marginTop: 10,
    color: '#4f6487',
  },
  errorText: {
    color: '#b13550',
    marginBottom: 10,
  },
  retryButton: {
    borderRadius: 10,
    backgroundColor: '#c9415b',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: '700',
  },
  backButton: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    backgroundColor: '#e5edf9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  backText: {
    color: '#1d3f74',
    fontWeight: '700',
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d7e1f3',
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#13294b',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    fontWeight: '700',
    color: '#183258',
    marginBottom: 6,
  },
  meta: {
    marginTop: 4,
    color: '#4f6487',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#13294b',
    marginBottom: 8,
  },
  replyCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d7e1f3',
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 10,
  },
  replyName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a2f52',
  },
  replyComment: {
    marginTop: 6,
    color: '#243957',
  },
});
