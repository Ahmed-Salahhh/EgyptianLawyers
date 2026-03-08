import { Ionicons } from "@expo/vector-icons";
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

/**
 * Returns true when the URL points to an image asset.
 * Matches Cloudinary image-upload paths and the most common image extensions.
 */
export function isImageAttachment(url: string): boolean {
  const lower = url.toLowerCase();
  // Cloudinary stores images under /image/upload/
  if (lower.includes("/image/upload/")) return true;
  return /\.(jpg|jpeg|png|webp|gif)(\?|#|$)/.test(lower);
}

/**
 * Extract a display filename from a URL, or return "Document" if none found.
 */
function getFilenameFromUrl(url: string): string {
  try {
    const pathname = url.split("?")[0];
    const segment = pathname.split("/").pop();
    if (segment && segment.length > 0 && segment.length < 40) return segment;
  } catch {
    // ignore
  }
  return "Document";
}

type Props = {
  url: string | null | undefined;
  /**
   * compact – small thumbnail used inside list / feed cards.
   *           Images render as a short thumbnail; documents show an icon badge.
   *           Neither opens a URL on tap so the parent Pressable keeps full control.
   *
   * full    – full-width rendering used inside detail screens.
   *           Images render tall; documents show an openable "View Document" button.
   *
   * feed    – LinkedIn-style: images edge-to-edge, no padding; docs show gray rect with icon + filename.
   */
  variant?: "compact" | "full" | "feed";
  /** Set to true when rendered on a dark background (inverts the document button colours). */
  dark?: boolean;
};

export function AttachmentPreview({ url, variant = "full", dark = false }: Props) {
  if (!url) return null;

  // ── Image ────────────────────────────────────────────────────────────────
  if (isImageAttachment(url)) {
    const style =
      variant === "compact"
        ? styles.thumbCompact
        : variant === "feed"
          ? styles.thumbFeed
          : styles.thumbFull;
    return (
      <Image
        source={{ uri: url }}
        style={style}
        resizeMode="cover"
        accessible
        accessibilityLabel="Attachment image"
      />
    );
  }

  // ── Document / PDF ────────────────────────────────────────────────────────

  // Compact variant: show a non-interactive badge so the parent card stays tappable
  if (variant === "compact") {
    return (
      <View style={styles.docBadge}>
        <Text style={styles.docBadgeText}>📎 Attachment</Text>
      </View>
    );
  }

  // Feed variant: gray rectangle with document icon and filename
  if (variant === "feed") {
    const filename = getFilenameFromUrl(url);
    return (
      <Pressable
        onPress={() => Linking.openURL(url).catch(() => {})}
        style={({ pressed }) => [
          styles.docFeed,
          pressed && { opacity: 0.85 },
        ]}
        accessibilityRole="button"
        accessibilityLabel="View document attachment"
      >
        <Ionicons name="document-text-outline" size={28} color="#666666" />
        <Text style={styles.docFeedText} numberOfLines={1}>
          {filename}
        </Text>
      </Pressable>
    );
  }

  // Full variant: openable button
  return (
    <Pressable
      onPress={() => Linking.openURL(url).catch(() => {})}
      style={({ pressed }) => [
        styles.docButton,
        dark && styles.docButtonDark,
        pressed && { opacity: 0.75 },
      ]}
      accessibilityRole="button"
      accessibilityLabel="View document attachment"
    >
      <Text style={[styles.docButtonText, dark && styles.docButtonTextDark]}>
        📄  View Document
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // ── Image thumbnails ──────────────────────────────────────────────────────
  thumbCompact: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    backgroundColor: "#e8eef8",
    marginTop: 8,
  },
  thumbFull: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: "#e8eef8",
  },
  thumbFeed: {
    width: "100%",
    height: 250,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },

  // ── Document – compact badge ──────────────────────────────────────────────
  docBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#f0f5ff",
    borderWidth: 1,
    borderColor: "#d0dcf5",
  },
  docBadgeText: {
    color: "#3b63c8",
    fontSize: 12,
    fontWeight: "600",
  },

  // ── Document – feed (icon + filename, vertically centered; container from parent) ─
  docFeed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  docFeedText: {
    flex: 1,
    color: "#666666",
    fontSize: 14,
    fontWeight: "500",
  },

  // ── Document – full button ────────────────────────────────────────────────
  docButton: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#1f5bd8",
    paddingHorizontal: 16,
    paddingVertical: 11,
    alignItems: "center",
  },
  docButtonDark: {
    borderColor: "rgba(255,255,255,0.45)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  docButtonText: {
    color: "#1f5bd8",
    fontWeight: "700",
    fontSize: 14,
  },
  docButtonTextDark: {
    color: "#c8daff",
  },
});
