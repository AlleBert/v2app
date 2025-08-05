import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PieChart,
  PlusCircle,
  MinusCircle,
  List,
  Users,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "portfolio", label: "Portafoglio", icon: PieChart },
    ...(isAdmin ? [
      { id: "newInvestment", label: "Nuovo Investimento", icon: PlusCircle },
      { id: "sellInvestment", label: "Vendi", icon: MinusCircle }
    ] : []),
    { id: "history", label: "Storico", icon: List },
    { id: "participants", label: "Partecipanti", icon: Users },
  ];

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    setIsOpen(false);
  };

  const getUserGradient = () => {
    return user?.username === "alle"
      ? "bg-gradient-to-r from-blue-500 to-purple-600"
      : "bg-gradient-to-r from-pink-500 to-rose-600";
  };

  const getUserRoleText = () => {
    return user?.role === "admin" ? "Amministratore" : "Visualizzatore";
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(true)}
        data-testid="button-open-sidebar"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "sidebar fixed md:relative z-30 w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700",
          isOpen && "open"
        )}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold" data-testid="text-app-title">
            Investimenti Condivisi
          </h1>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(false)}
            data-testid="button-close-sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-white",
                getUserGradient()
              )}
              data-testid="img-user-avatar"
            >
              <span className="font-bold">
                {user?.displayName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium" data-testid="text-username">
                {user?.displayName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400" data-testid="text-user-role">
                {getUserRoleText()}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="mt-3 w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            onClick={logout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Esci
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    activeSection === item.id
                      ? "bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                  onClick={() => handleSectionChange(item.id)}
                  data-testid={`button-nav-${item.id}`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Theme Toggle */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={toggleTheme}
            data-testid="button-toggle-theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 mr-2" />
            ) : (
              <Moon className="w-4 h-4 mr-2" />
            )}
            <span>{theme === "dark" ? "Modalità Chiara" : "Modalità Scura"}</span>
          </Button>
        </div>
      </div>
    </>
  );
}
