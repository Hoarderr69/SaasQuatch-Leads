import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Building2, Users, Mail, BarChart3, Layers } from "lucide-react";
import { Badge } from "./ui/badge";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  // Pruned to implemented/ideated features only
  const menuItems = [
    { icon: Building2, label: "Companies", path: "/companies", badge: null },
    { icon: Users, label: "Persons", path: "/persons", badge: null },
    {
      icon: Mail,
      label: "Email Generator",
      path: "/email-generator",
      badge: null,
    },
    {
      icon: Layers,
      label: "Sequence Builder",
      path: "/sequences",
      badge: "AI",
      badgeColor: "bg-purple-600",
    },
    {
      icon: BarChart3,
      label: "Response Tracker",
      path: "/tracker",
      badge: "NEW",
      badgeColor: "bg-green-600",
    },
  ];

  // Close on Escape and prevent body scroll when open
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (isOpen) {
      document.addEventListener("keydown", onKeyDown);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay with blur when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-[#1a1d29] border-r border-gray-800 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal={isOpen}
        aria-hidden={!isOpen}
      >
        <div className="flex flex-col h-full pt-24 pb-6 overflow-y-auto">
          {/* Menu Items */}
          <nav className="flex-1 px-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge
                      className={`ml-auto ${item.badgeColor} text-white text-xs px-2 py-0.5 rounded-full`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
