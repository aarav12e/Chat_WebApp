import { Link, useLocation } from "react-router-dom";
import { MessageSquare, User, Settings, LogOut, Users } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const BottomNav = () => {
  const { authUser, logout } = useAuthStore();
  const location = useLocation();

  if (!authUser) return null;

  const tabs = [
    { to: "/",         icon: MessageSquare, label: "Chats"    },
    { to: "/profile",  icon: User,          label: "Profile"  },
    { to: "/settings", icon: Settings,      label: "Settings" },
  ];

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 
                 bg-base-100/95 backdrop-blur-lg border-t border-base-300
                 flex items-stretch"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabs.map(({ to, icon: Icon, label }) => (
        <Link
          key={to}
          to={to}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5
                      text-xs font-medium transition-all duration-200
                      ${
                        isActive(to)
                          ? "text-primary"
                          : "text-base-content/50 hover:text-base-content"
                      }`}
        >
          <div className={`relative p-1.5 rounded-xl transition-all duration-200
                          ${isActive(to) ? "bg-primary/15" : ""}`}>
            <Icon
              className={`size-5 transition-transform duration-200
                         ${isActive(to) ? "scale-110" : ""}`}
            />
            {/* Active dot */}
            {isActive(to) && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 
                               w-1 h-1 bg-primary rounded-full" />
            )}
          </div>
          <span className={`transition-all duration-200 ${isActive(to) ? "font-semibold" : ""}`}>
            {label}
          </span>
        </Link>
      ))}

      {/* Logout tab */}
      <button
        onClick={logout}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5
                   text-xs font-medium text-base-content/50 hover:text-error
                   transition-all duration-200"
      >
        <div className="p-1.5 rounded-xl">
          <LogOut className="size-5" />
        </div>
        <span>Logout</span>
      </button>
    </nav>
  );
};

export default BottomNav;
