import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertInvestmentSchema } from "@shared/schema";
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

const formSchema = insertInvestmentSchema.extend({
  allePercentage: z.number().min(0).max(100),
  aliPercentage: z.number().min(0).max(100),
}).refine((data) => data.allePercentage + data.aliPercentage === 100, {
  message: "Le percentuali devono sommare esattamente a 100%",
  path: ["allePercentage"],
});

interface InvestmentFormProps {
  onCancel: () => void;
}

export function InvestmentForm({ onCancel }: InvestmentFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      symbol: "",
      type: "",
      initialValue: 0,
      currentValue: 0,
      allePercentage: 75,
      aliPercentage: 25,
      purchaseDate: new Date().toISOString().split('T')[0],
      createdBy: user?.username || "",
    },
  });

  const createInvestmentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/investments", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({
        title: "Successo",
        description: "Investimento aggiunto con successo!",
      });
      form.reset();
      onCancel();
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore nella creazione dell'investimento",
        variant: "destructive",
      });
    },
  });

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
    createInvestmentMutation.mutate(data);
  };

  const investmentTypes = [
    { value: "ETF", label: "ETF" },
    { value: "Azioni", label: "Azioni" },
    { value: "Obbligazioni", label: "Obbligazioni" },
    { value: "Fondi", label: "Fondi Comuni" },
    { value: "Crypto", label: "Criptovalute" },
    { value: "Altro", label: "Altro" },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Investimento</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Es. Vanguard FTSE All-World" 
                      {...field} 
                      data-testid="input-investment-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo di Investimento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-investment-type">
                        <SelectValue placeholder="Seleziona tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {investmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Simbolo/Ticker</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="es. VWCE, AAPL" 
                      {...field} 
                      data-testid="input-investment-symbol"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="initialValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Importo Iniziale (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      data-testid="input-initial-value"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valore Attuale (€)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      data-testid="input-current-value"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Acquisto</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      data-testid="input-purchase-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium mb-4">Ripartizione Quote</h3>
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
                        data-testid="input-alle-percentage"
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
                        data-testid="input-ali-percentage"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Le percentuali devono sommare a 100%
            </p>
          </div>

          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              data-testid="button-cancel"
            >
              Annulla
            </Button>
            <Button 
              type="submit" 
              disabled={createInvestmentMutation.isPending}
              data-testid="button-submit"
            >
              {createInvestmentMutation.isPending ? "Salvataggio..." : "Aggiungi Investimento"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
