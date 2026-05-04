import { useEffect, useRef } from "react";
import { Trash2, X } from "lucide-react";

/**
 * MessageContextMenu — floating context menu triggered by long-press.
 * Positions itself near the touch point, auto-closes on outside tap.
 *
 * Props:
 *  x, y        - screen coords (from touch/mouse event)
 *  canDelete   - whether delete option should be shown
 *  onDelete    - callback when Delete is tapped
 *  onClose     - callback to close the menu
 */
const MessageContextMenu = ({ x, y, canDelete, onDelete, onClose }) => {
  const menuRef = useRef(null);

  // Close on outside tap / click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    // Small delay so the triggering touchstart doesn't immediately close it
    const t = setTimeout(() => {
      document.addEventListener("touchstart", handler);
      document.addEventListener("mousedown", handler);
    }, 50);

    return () => {
      clearTimeout(t);
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("mousedown", handler);
    };
  }, [onClose]);

  // Clamp position so menu doesn't overflow viewport
  const menuWidth = 160;
  const menuHeight = canDelete ? 96 : 56;
  const clampedX = Math.min(x, window.innerWidth - menuWidth - 8);
  const clampedY = Math.min(y, window.innerHeight - menuHeight - 8);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 rounded-xl shadow-2xl border border-base-300 bg-base-100 overflow-hidden"
      style={{
        left: clampedX,
        top: clampedY,
        minWidth: menuWidth,
        animation: "contextMenuIn 0.15s ease-out",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-base-300 bg-base-200">
        <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wide">
          Message
        </span>
        <button
          onClick={onClose}
          className="btn btn-ghost btn-xs btn-circle"
          aria-label="Close menu"
        >
          <X className="size-3" />
        </button>
      </div>

      {/* Actions */}
      {canDelete ? (
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-error/10 transition-colors"
        >
          <Trash2 className="size-4" />
          Delete Message
        </button>
      ) : (
        <div className="px-4 py-3 text-xs text-base-content/40 italic">
          No actions available
        </div>
      )}
    </div>
  );
};

export default MessageContextMenu;
