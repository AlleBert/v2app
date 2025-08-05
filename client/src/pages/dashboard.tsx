import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Investment, Transaction } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { InvestmentForm } from "@/components/investment-form";
import { InvestmentTable } from "@/components/investment-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Euro,
  User,
  Wallet,
  TrendingUp,
  Plus,
  PlusCircle,
  MinusCircle,
  Bell,
} from "lucide-react";

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");

  const { data: investments = [], isLoading: investmentsLoading } = useQuery<Investment[]>({
    queryKey: ["/api/investments"],
  });

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const calculatePortfolioStats = () => {
    const totalInitial = investments.reduce((sum, inv) => sum + parseFloat(inv.initialValue), 0);
    const totalCurrent = investments.reduce((sum, inv) => sum + parseFloat(inv.currentValue), 0);
    const totalGain = totalCurrent - totalInitial;
    const gainPercentage = totalInitial > 0 ? (totalGain / totalInitial) * 100 : 0;

    const alleTotal = investments.reduce(
      (sum, inv) => sum + (parseFloat(inv.currentValue) * inv.allePercentage) / 100,
      0
    );
    const aliTotal = investments.reduce(
      (sum, inv) => sum + (parseFloat(inv.currentValue) * inv.aliPercentage) / 100,
      0
    );

    return {
      totalCurrent,
      totalInitial,
      totalGain,
      gainPercentage,
      alleTotal,
      aliTotal,
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT");
  };

  const stats = calculatePortfolioStats();
  const recentInvestments = investments.slice(-3);

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" data-testid="text-dashboard-title">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card data-testid="card-total-value">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Valore totale</p>
                <h3 className="text-2xl font-bold mt-1" data-testid="text-total-value">
                  {formatCurrency(stats.totalCurrent)}
                </h3>
              </div>
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                <Euro className="w-5 h-5" />
              </div>
            </div>
            <p className="text-green-500 dark:text-green-400 mt-2 flex items-center" data-testid="text-total-gain">
              <TrendingUp className="w-4 h-4 mr-1" />
              +{stats.gainPercentage.toFixed(1)}% ({formatCurrency(stats.totalGain)})
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-alle-share">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Quota Alle</p>
                <h3 className="text-2xl font-bold mt-1" data-testid="text-alle-value">
                  {formatCurrency(stats.alleTotal)}
                </h3>
              </div>
              <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                <User className="w-5 h-5" />
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {stats.totalCurrent > 0 ? ((stats.alleTotal / stats.totalCurrent) * 100).toFixed(1) : 0}% del totale
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-ali-share">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Quota Ali</p>
                <h3 className="text-2xl font-bold mt-1" data-testid="text-ali-value">
                  {formatCurrency(stats.aliTotal)}
                </h3>
              </div>
              <div className="p-2 rounded-full bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300">
                <User className="w-5 h-5" />
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              {stats.totalCurrent > 0 ? ((stats.aliTotal / stats.totalCurrent) * 100).toFixed(1) : 0}% del totale
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-deposits">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Depositi totali</p>
                <h3 className="text-2xl font-bold mt-1" data-testid="text-total-deposits">
                  {formatCurrency(stats.totalInitial)}
                </h3>
              </div>
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <p className="text-green-500 dark:text-green-400 mt-2 flex items-center" data-testid="text-roi">
              <TrendingUp className="w-4 h-4 mr-1" />
              +{stats.gainPercentage.toFixed(1)}% ROI
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart Placeholder */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Andamento portafoglio</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">1M</Button>
              <Button variant="outline" size="sm">6M</Button>
              <Button variant="default" size="sm">1Y</Button>
              <Button variant="outline" size="sm">Tutto</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">Grafico performance portfolio</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Investments */}
      <Card data-testid="card-recent-investments">
        <CardHeader>
          <CardTitle>Investimenti Recenti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3" data-testid="list-recent-investments">
            {recentInvestments.map((inv) => {
              const gain = parseFloat(inv.currentValue) - parseFloat(inv.initialValue);
              const gainPercentage = ((gain / parseFloat(inv.initialValue)) * 100);
              const isPositive = gain >= 0;
              
              return (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  data-testid={`item-recent-investment-${inv.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium" data-testid={`text-recent-name-${inv.id}`}>
                        {inv.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400" data-testid={`text-recent-details-${inv.id}`}>
                        {inv.symbol} • {inv.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold" data-testid={`text-recent-value-${inv.id}`}>
                      {formatCurrency(parseFloat(inv.currentValue))}
                    </p>
                    <p className={`text-sm ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} data-testid={`text-recent-performance-${inv.id}`}>
                      {isPositive ? '+' : ''}{gainPercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPortfolio = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" data-testid="text-portfolio-title">Portafoglio Investimenti</h2>
        {isAdmin && (
          <Button
            onClick={() => setActiveSection("newInvestment")}
            className="flex items-center space-x-2"
            data-testid="button-add-investment"
          >
            <Plus className="w-4 h-4" />
            <span>Aggiungi</span>
          </Button>
        )}
      </div>
      
      {investmentsLoading ? (
        <div className="text-center py-8">Caricamento investimenti...</div>
      ) : (
        <InvestmentTable investments={investments} />
      )}
    </div>
  );

  const renderNewInvestment = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" data-testid="text-new-investment-title">Nuovo Investimento</h2>
      <InvestmentForm onCancel={() => setActiveSection("portfolio")} />
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" data-testid="text-history-title">Storico Operazioni</h2>
      
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200 dark:divide-gray-700" data-testid="list-transactions">
            {transactionsLoading ? (
              <div className="p-6 text-center">Caricamento storico...</div>
            ) : transactions.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                Nessuna transazione trovata
              </div>
            ) : (
              transactions.map((transaction) => {
                const actionColor = transaction.action === "Acquisto" 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400";
                const ActionIcon = transaction.action === "Acquisto" ? PlusCircle : MinusCircle;
                
                return (
                  <div 
                    key={transaction.id} 
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                    data-testid={`item-transaction-${transaction.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <ActionIcon className={`w-4 h-4 ${actionColor}`} />
                        </div>
                        <div>
                          <p className="font-medium" data-testid={`text-transaction-action-${transaction.id}`}>
                            {transaction.action} {transaction.investmentName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400" data-testid={`text-transaction-details-${transaction.id}`}>
                            Da {transaction.userId === "alle" ? "Alle" : "Ali"} • {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${actionColor}`} data-testid={`text-transaction-amount-${transaction.id}`}>
                          {transaction.action === "Acquisto" ? "+" : ""}{formatCurrency(parseFloat(transaction.amount))}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderParticipants = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" data-testid="text-participants-title">Partecipanti</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Alle Card */}
        <Card data-testid="card-participant-alle">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Alle</h3>
                <p className="text-blue-600 dark:text-blue-400">Amministratore</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Quota totale:</span>
                <span className="font-semibold" data-testid="text-alle-total-percentage">
                  {stats.totalCurrent > 0 ? ((stats.alleTotal / stats.totalCurrent) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Valore:</span>
                <span className="font-semibold" data-testid="text-alle-total-value">
                  {formatCurrency(stats.alleTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Depositi:</span>
                <span className="font-semibold" data-testid="text-alle-deposits">
                  {formatCurrency(investments.reduce((sum, inv) => sum + (parseFloat(inv.initialValue) * inv.allePercentage / 100), 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Guadagno:</span>
                <span className="font-semibold text-green-600 dark:text-green-400" data-testid="text-alle-gain">
                  +{formatCurrency(stats.alleTotal - investments.reduce((sum, inv) => sum + (parseFloat(inv.initialValue) * inv.allePercentage / 100), 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ali Card */}
        <Card data-testid="card-participant-ali">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Ali</h3>
                <p className="text-pink-600 dark:text-pink-400">Visualizzatore</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Quota totale:</span>
                <span className="font-semibold" data-testid="text-ali-total-percentage">
                  {stats.totalCurrent > 0 ? ((stats.aliTotal / stats.totalCurrent) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Valore:</span>
                <span className="font-semibold" data-testid="text-ali-total-value">
                  {formatCurrency(stats.aliTotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Depositi:</span>
                <span className="font-semibold" data-testid="text-ali-deposits">
                  {formatCurrency(investments.reduce((sum, inv) => sum + (parseFloat(inv.initialValue) * inv.aliPercentage / 100), 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Guadagno:</span>
                <span className="font-semibold text-green-600 dark:text-green-400" data-testid="text-ali-gain">
                  +{formatCurrency(stats.aliTotal - investments.reduce((sum, inv) => sum + (parseFloat(inv.initialValue) * inv.aliPercentage / 100), 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboard();
      case "portfolio":
        return renderPortfolio();
      case "newInvestment":
        return renderNewInvestment();
      case "history":
        return renderHistory();
      case "participants":
        return renderParticipants();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <div className="md:hidden" /> {/* Spacer for mobile */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
}
