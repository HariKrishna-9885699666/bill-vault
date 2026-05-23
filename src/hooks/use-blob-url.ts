/**
 * Resolves the best displayable URL for an attachment.
 *
 * Priority:
 *  1. thumbnailUrl / driveUrl  (remote Drive thumbnail)
 *  2. localDataUrl             (legacy base64 DataURL persisted before IDB migration)
 *  3. hasLocalBlob             (current: load blob from IndexedDB → object URL)
 */
import { useEffect, useRef, useState } from "react";
import { blobObjectUrl } from "@/services/storage";
import type { Attachment } from "@/types";

export function useBlobUrl(attachment: Attachment | undefined): string | undefined {
  const [objectUrl, setObjectUrl] = useState<string | undefined>(undefined);
  const prevUrl = useRef<string | undefined>(undefined);

  // Prefer Drive thumbnail, then legacy DataURL
  const direct = attachment?.thumbnailUrl ?? attachment?.localDataUrl;

  useEffect(() => {
    // Clean up any previously created object URL
    if (prevUrl.current) {
      URL.revokeObjectURL(prevUrl.current);
      prevUrl.current = undefined;
    }

    if (!attachment?.hasLocalBlob) {
      setObjectUrl(undefined);
      return;
    }

    let cancelled = false;
    blobObjectUrl(attachment.id).then((url) => {
      if (cancelled) {
        if (url) URL.revokeObjectURL(url);
        return;
      }
      prevUrl.current = url ?? undefined;
      setObjectUrl(url ?? undefined);
    });

    return () => {
      cancelled = true;
    };
  }, [attachment?.id, attachment?.hasLocalBlob]);

  // Revoke on unmount
  useEffect(() => {
    return () => {
      if (prevUrl.current) {
        URL.revokeObjectURL(prevUrl.current);
      }
    };
  }, []);

  return direct ?? objectUrl;
}
