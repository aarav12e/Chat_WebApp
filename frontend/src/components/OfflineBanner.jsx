import useOnlineStatus from "../hooks/useOnlineStatus";
import { WifiOff, Wifi } from "lucide-react";
import { useState, useEffect } from "react";

/**
 * OfflineBanner — slides down when user goes offline, 
 * briefly shows "Back online" then auto-hides.
 */
const OfflineBanner = () => {
  const isOnline = useOnlineStatus();
  const [visible, setVisible] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [showingOnline, setShowingOnline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setVisible(true);
      setShowingOnline(false);
      setWasOffline(true);
    } else if (wasOffline) {
      // Show "Back online" briefly
      setShowingOnline(true);
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setWasOffline(false);
        setShowingOnline(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!visible) return null;

  return (
    <div
      className={`fixed left-0 right-0 z-[60] flex items-center justify-center gap-2
                  py-2 px-4 text-sm font-medium transition-all duration-500
                  ${showingOnline
                    ? "bg-success text-success-content top-16"
                    : "bg-error text-error-content top-16"
                  }`}
      style={{ animation: "slideDown 0.3s ease-out" }}
    >
      {showingOnline ? (
        <>
          <Wifi className="size-4" />
          Back online
        </>
      ) : (
        <>
          <WifiOff className="size-4" />
          No internet connection
        </>
      )}
    </div>
  );
};

export default OfflineBanner;
