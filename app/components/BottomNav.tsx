"use client";

import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Flame, Lightbulb, MessageCircle, Target, Smile, Brain } from "lucide-react";
import { useEffect, useState } from "react";

interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const navItems: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/streaks", icon: Flame, label: "Streaks" },
  { href: "/insights", icon: Lightbulb, label: "Insights" },
  { href: "/coach", icon: MessageCircle, label: "Coach" },
  { href: "/goals", icon: Target, label: "Goals" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/");
            
            return (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={`
                  relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl
                  transition-all duration-200 ease-in-out
                  ${isActive 
                    ? "text-green-600" 
                    : "text-gray-500 hover:text-gray-700"
                  }
                  active:scale-95
                `}
                aria-label={item.label}
              >
                <div className={`
                  relative transition-all duration-200
                  ${isActive ? "scale-110" : ""}
                `}>
                  <Icon className="w-6 h-6" />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-600 rounded-full" />
                  )}
                </div>
                <span className={`
                  text-[10px] font-semibold transition-colors leading-tight
                  ${isActive ? "text-green-600" : "text-gray-500"}
                `}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
