import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/components/theme-provider";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, ShieldCheck, Eye, Moon, Sun } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const loginMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await apiRequest("POST", "/api/auth/login", { username });
      return response.json();
    },
    onSuccess: (user) => {
      login(user);
    },
    onError: (error) => {
      console.error("Login failed:", error);
    },
  });

  const handleUserSelect = (username: string) => {
    loginMutation.mutate(username);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2" data-testid="text-app-title">
            Investimenti Condivisi
          </h1>
          <p className="text-gray-600 dark:text-gray-300" data-testid="text-subtitle">
            Seleziona il tuo profilo per accedere
          </p>
        </div>

        {/* User Cards */}
        <div className="space-y-4 mb-8">
          {/* Alle (Admin) Card */}
          <Card
            className="user-card bg-white dark:bg-gray-800 p-6 border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer"
            onClick={() => handleUserSelect("alle")}
            data-testid="card-user-alle"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white" data-testid="text-alle-name">
                  Alle
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium" data-testid="text-alle-role">
                  Amministratore
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400" data-testid="text-alle-description">
                  Accesso completo • Gestione investimenti
                </p>
              </div>
              <div className="text-blue-500 dark:text-blue-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
          </Card>

          {/* Ali (Viewer) Card */}
          <Card
            className="user-card bg-white dark:bg-gray-800 p-6 border-2 border-transparent hover:border-pink-500 dark:hover:border-pink-400 cursor-pointer"
            onClick={() => handleUserSelect("ali")}
            data-testid="card-user-ali"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white" data-testid="text-ali-name">
                  Ali
                </h3>
                <p className="text-pink-600 dark:text-pink-400 font-medium" data-testid="text-ali-role">
                  Visualizzatore
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400" data-testid="text-ali-description">
                  Solo lettura • Monitoraggio portfolio
                </p>
              </div>
              <div className="text-pink-500 dark:text-pink-400">
                <Eye className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* Theme Toggle */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={toggleTheme}
            className="flex items-center space-x-2"
            data-testid="button-toggle-theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="text-sm">Cambia tema</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
