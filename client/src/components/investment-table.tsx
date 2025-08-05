import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Investment } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit2, Trash2 } from "lucide-react";

interface InvestmentTableProps {
  investments: Investment[];
}

export function InvestmentTable({ investments }: InvestmentTableProps) {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteInvestmentMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/investments/${id}`, {
        deletedBy: user?.username,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Successo",
        description: "Investimento eliminato con successo",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore nell'eliminazione dell'investimento",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Sei sicuro di voler eliminare l'investimento "${name}"?`)) {
      deleteInvestmentMutation.mutate(id);
    }
  };

  const formatCurrency = (value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(numValue);
  };

  const calculateGainLoss = (initial: string, current: string) => {
    const initialValue = parseFloat(initial);
    const currentValue = parseFloat(current);
    const gain = currentValue - initialValue;
    const percentage = ((gain / initialValue) * 100);
    
    return {
      amount: gain,
      percentage,
      isPositive: gain >= 0,
    };
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      ETF: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Azioni: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      Obbligazioni: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Fondi: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      Crypto: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      Altro: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colors[type] || colors.Altro;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead data-testid="header-investment">Investimento</TableHead>
              <TableHead data-testid="header-type">Tipo</TableHead>
              <TableHead data-testid="header-initial-value">Valore Iniziale</TableHead>
              <TableHead data-testid="header-current-value">Valore Attuale</TableHead>
              <TableHead data-testid="header-performance">Performance</TableHead>
              <TableHead data-testid="header-alle-percentage">Alle %</TableHead>
              <TableHead data-testid="header-ali-percentage">Ali %</TableHead>
              {isAdmin && <TableHead data-testid="header-actions">Azioni</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {investments.map((investment) => {
              const gainLoss = calculateGainLoss(investment.initialValue, investment.currentValue);
              
              return (
                <TableRow key={investment.id} data-testid={`row-investment-${investment.id}`}>
                  <TableCell>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100" data-testid={`text-name-${investment.id}`}>
                        {investment.name}
                      </div>
                      {investment.symbol && (
                        <div className="text-sm text-gray-500 dark:text-gray-400" data-testid={`text-symbol-${investment.id}`}>
                          {investment.symbol}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(investment.type)} data-testid={`text-type-${investment.id}`}>
                      {investment.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-900 dark:text-gray-100" data-testid={`text-initial-${investment.id}`}>
                    {formatCurrency(investment.initialValue)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-900 dark:text-gray-100" data-testid={`text-current-${investment.id}`}>
                    {formatCurrency(investment.currentValue)}
                  </TableCell>
                  <TableCell>
                    <div className={`text-sm ${gainLoss.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} data-testid={`text-performance-${investment.id}`}>
                      {gainLoss.isPositive ? '+' : ''}{formatCurrency(gainLoss.amount)}
                      <div className="text-xs">
                        ({gainLoss.isPositive ? '+' : ''}{gainLoss.percentage.toFixed(1)}%)
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-900 dark:text-gray-100" data-testid={`text-alle-share-${investment.id}`}>
                    {investment.allePercentage}%
                  </TableCell>
                  <TableCell className="text-sm text-gray-900 dark:text-gray-100" data-testid={`text-ali-share-${investment.id}`}>
                    {investment.aliPercentage}%
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          data-testid={`button-edit-${investment.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          onClick={() => handleDelete(investment.id, investment.name)}
                          disabled={deleteInvestmentMutation.isPending}
                          data-testid={`button-delete-${investment.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
