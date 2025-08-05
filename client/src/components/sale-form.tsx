import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { insertSaleSchema, Investment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";

const formSchema = insertSaleSchema.extend({
  allePercentage: z.number().min(0).max(100),
  aliPercentage: z.number().min(0).max(100),
}).refine((data) => data.allePercentage + data.aliPercentage === 100, {
  message: "Le percentuali devono sommare esattamente a 100%",
  path: ["allePercentage"],
});

interface SaleFormProps {
  onCancel: () => void;
}

export function SaleForm({ onCancel }: SaleFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: investments = [], isLoading: investmentsLoading } = useQuery<Investment[]>({
    queryKey: ["/api/investments"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      investmentId: "",
      investmentName: "",
      saleAmount: 0,
      salePrice: 0,
      allePercentage: 75,
      aliPercentage: 25,
      saleDate: new Date().toISOString().split('T')[0],
      createdBy: user?.username || "",
    },
  });

  const createSaleMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/sales", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales"] });
      toast({
        title: "Successo",
        description: "Vendita registrata con successo!",
      });
      form.reset();
      onCancel();
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore nella registrazione della vendita",
        variant: "destructive",
      });
    },
  });

  const handleInvestmentChange = (investmentId: string) => {
    const investment = investments.find(inv => inv.id === investmentId);
    if (investment) {
      form.setValue("investmentName", investment.name);
      form.setValue("salePrice", parseFloat(investment.currentValue));
    }
  };

  const handleAllePercentageChange = (value: string) => {
    const alleValue = parseFloat(value) || 0;
    form.setValue("allePercentage", alleValue);
    form.setValue("aliPercentage", Math.max(0, 100 - alleValue));
  };

  const handleAliPercentageChange = (value: string) => {
    const aliValue = parseFloat(value) || 0;
    form.setValue("aliPercentage", aliValue);
    form.setValue("allePercentage", Math.max(0, 100 - aliValue));
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    const selectedInvestment = investments.find(inv => inv.id === data.investmentId);
    if (!selectedInvestment) {
      toast({
        title: "Errore",
        description: "Investimento selezionato non valido",
        variant: "destructive",
      });
      return;
    }

    if (data.saleAmount > parseFloat(selectedInvestment.currentValue)) {
      toast({
        title: "Errore", 
        description: "L'importo di vendita non può essere superiore al valore corrente dell'investimento",
        variant: "destructive",
      });
      return;
    }

    createSaleMutation.mutate(data);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="investmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investimento da Vendere</FormLabel>
                  <Select onValueChange={(value) => {
                    field.onChange(value);
                    handleInvestmentChange(value);
                  }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-investment">
                        <SelectValue placeholder="Seleziona investimento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {investments.map((investment) => (
                        <SelectItem key={investment.id} value={investment.id}>
                          {investment.name} ({investment.symbol}) - {formatCurrency(parseFloat(investment.currentValue))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="saleAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Importo da Vendere (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      data-testid="input-sale-amount"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prezzo di Vendita Totale (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      data-testid="input-sale-price"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="saleDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Vendita</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      data-testid="input-sale-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium mb-4">Ripartizione Quote di Vendita</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="allePercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quota Alle (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => {
                          field.onChange(parseFloat(e.target.value) || 0);
                          handleAllePercentageChange(e.target.value);
                        }}
                        data-testid="input-alle-sale-percentage"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aliPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quota Ali (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => {
                          field.onChange(parseFloat(e.target.value) || 0);
                          handleAliPercentageChange(e.target.value);
                        }}
                        data-testid="input-ali-sale-percentage"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Le percentuali determinano come viene ripartito il ricavato della vendita
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              data-testid="button-cancel-sale"
            >
              Annulla
            </Button>
            <Button 
              type="submit" 
              disabled={createSaleMutation.isPending}
              data-testid="button-submit-sale"
            >
              {createSaleMutation.isPending ? "Registrazione..." : "Registra Vendita"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}