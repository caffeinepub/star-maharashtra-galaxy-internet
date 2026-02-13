import { useState, useCallback, useRef, useEffect } from 'react';

interface UseDoubleInteractionOptions {
  onDoubleInteraction: () => void;
  hintDuration?: number; // milliseconds
  doubleClickThreshold?: number; // milliseconds
}

interface UseDoubleInteractionReturn {
  showHint: boolean;
  handleClick: () => void;
  handleDoubleClick: () => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  dismissHint: () => void;
}

export function useDoubleInteraction({
  onDoubleInteraction,
  hintDuration = 2000,
  doubleClickThreshold = 300,
}: UseDoubleInteractionOptions): UseDoubleInteractionReturn {
  const [showHint, setShowHint] = useState(false);
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTimeRef = useRef<number>(0);
  const lastTouchTimeRef = useRef<number>(0);
  const touchCountRef = useRef<number>(0);

  // Clear hint timeout on unmount
  useEffect(() => {
    return () => {
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
    };
  }, []);

  const dismissHint = useCallback(() => {
    setShowHint(false);
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = null;
    }
  }, []);

  const showHintTemporarily = useCallback(() => {
    setShowHint(true);
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
    }
    hintTimeoutRef.current = setTimeout(() => {
      setShowHint(false);
      hintTimeoutRef.current = null;
    }, hintDuration);
  }, [hintDuration]);

  const handleClick = useCallback(() => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;

    if (timeSinceLastClick < doubleClickThreshold && timeSinceLastClick > 0) {
      // This is a double-click
      dismissHint();
      onDoubleInteraction();
      lastClickTimeRef.current = 0; // Reset to prevent triple-click
    } else {
      // Single click - show hint
      showHintTemporarily();
      lastClickTimeRef.current = now;
    }
  }, [onDoubleInteraction, dismissHint, showHintTemporarily, doubleClickThreshold]);

  const handleDoubleClick = useCallback(() => {
    // Native double-click event (desktop)
    dismissHint();
    onDoubleInteraction();
  }, [onDoubleInteraction, dismissHint]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault(); // Prevent default to avoid double-tap zoom on mobile
      const now = Date.now();
      const timeSinceLastTouch = now - lastTouchTimeRef.current;

      if (timeSinceLastTouch < doubleClickThreshold && timeSinceLastTouch > 0) {
        // This is a double-tap
        touchCountRef.current = 0;
        dismissHint();
        onDoubleInteraction();
        lastTouchTimeRef.current = 0; // Reset
      } else {
        // Single tap - show hint
        touchCountRef.current = 1;
        showHintTemporarily();
        lastTouchTimeRef.current = now;
      }
    },
    [onDoubleInteraction, dismissHint, showHintTemporarily, doubleClickThreshold]
  );

  return {
    showHint,
    handleClick,
    handleDoubleClick,
    handleTouchStart,
    dismissHint,
  };
}
