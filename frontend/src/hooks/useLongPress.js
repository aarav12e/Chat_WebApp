import { useRef, useCallback } from "react";

/**
 * useLongPress — fires onLongPress after `delay` ms of continuous touch.
 * Also triggers haptic feedback via navigator.vibrate if available.
 *
 * @param {Function} onLongPress  - called with the touch event when threshold is met
 * @param {number}   delay        - hold duration in ms (default 500)
 */
const useLongPress = (onLongPress, delay = 500) => {
  const timerRef = useRef(null);
  const isLongPress = useRef(false);

  const start = useCallback(
    (e) => {
      isLongPress.current = false;
      timerRef.current = setTimeout(() => {
        isLongPress.current = true;
        // Haptic feedback on supported devices
        if (navigator.vibrate) navigator.vibrate(50);
        onLongPress(e);
      }, delay);
    },
    [onLongPress, delay]
  );

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchMove: cancel,   // cancel if finger moves (scroll intent)
    onMouseDown: start,    // also works for desktop right-click feel
    onMouseUp: cancel,
    onMouseLeave: cancel,
  };
};

export default useLongPress;
