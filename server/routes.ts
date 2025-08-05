import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInvestmentSchema, insertTransactionSchema, insertSaleSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username) {
        return res.status(400).json({ message: "Username è richiesto" });
      }
      
      const user = await storage.authenticateUser(username, password);
      if (!user) {
        return res.status(401).json({ message: "Credenziali non valide" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Errore del server" });
    }
  });

  // Users routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero utenti" });
    }
  });

  // Investments routes
  app.get("/api/investments", async (req, res) => {
    try {
      const investments = await storage.getAllInvestments();
      res.json(investments);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero investimenti" });
    }
  });

  app.post("/api/investments", async (req, res) => {
    try {
      const validation = insertInvestmentSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Dati non validi",
          errors: validation.error.issues 
        });
      }

      const { allePercentage, aliPercentage } = validation.data;
      
      if (allePercentage + aliPercentage !== 100) {
        return res.status(400).json({ 
          message: "Le percentuali devono sommare esattamente a 100%" 
        });
      }

      const investment = await storage.createInvestment(validation.data);
      
      // Create transaction
      await storage.createTransaction({
        action: "Acquisto",
        investmentId: investment.id,
        investmentName: investment.name,
        amount: investment.initialValue,
        date: investment.purchaseDate,
        userId: investment.createdBy
      });
      
      res.status(201).json(investment);
    } catch (error) {
      res.status(500).json({ message: "Errore nella creazione investimento" });
    }
  });

  app.put("/api/investments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validation = insertInvestmentSchema.partial().safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Dati non validi",
          errors: validation.error.issues 
        });
      }

      const updated = await storage.updateInvestment(id, validation.data);
      
      if (!updated) {
        return res.status(404).json({ message: "Investimento non trovato" });
      }

      // Create transaction
      await storage.createTransaction({
        action: "Modifica",
        investmentId: updated.id,
        investmentName: updated.name,
        amount: updated.currentValue,
        date: new Date().toISOString().split('T')[0],
        userId: req.body.updatedBy || updated.createdBy
      });
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Errore nell'aggiornamento investimento" });
    }
  });

  app.delete("/api/investments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { deletedBy } = req.body;
      
      const investment = await storage.getInvestment(id);
      if (!investment) {
        return res.status(404).json({ message: "Investimento non trovato" });
      }

      const deleted = await storage.deleteInvestment(id);
      
      if (deleted) {
        // Create transaction
        await storage.createTransaction({
          action: "Eliminazione",
          investmentId: id,
          investmentName: investment.name,
          amount: "0.00",
          date: new Date().toISOString().split('T')[0],
          userId: deletedBy || investment.createdBy
        });
        
        res.json({ message: "Investimento eliminato con successo" });
      } else {
        res.status(500).json({ message: "Errore nell'eliminazione investimento" });
      }
    } catch (error) {
      res.status(500).json({ message: "Errore nell'eliminazione investimento" });
    }
  });

  // Transactions routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero transazioni" });
    }
  });

  // Sales routes
  app.get("/api/sales", async (req, res) => {
    try {
      const sales = await storage.getAllSales();
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero vendite" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const validation = insertSaleSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Dati non validi",
          errors: validation.error.issues 
        });
      }

      const { allePercentage, aliPercentage, investmentId } = validation.data;
      
      if (allePercentage + aliPercentage !== 100) {
        return res.status(400).json({ 
          message: "Le percentuali devono sommare esattamente a 100%" 
        });
      }

      // Get the investment to update
      const investment = await storage.getInvestment(investmentId);
      if (!investment) {
        return res.status(404).json({ message: "Investimento non trovato" });
      }

      // Create the sale record
      const sale = await storage.createSale(validation.data);
      
      // Update investment value (reduce current value by sale amount)
      const newCurrentValue = parseFloat(investment.currentValue) - validation.data.saleAmount;
      await storage.updateInvestment(investmentId, {
        currentValue: newCurrentValue.toString()
      });

      // Create transaction record
      await storage.createTransaction({
        action: "Vendita",
        investmentId: investmentId,
        investmentName: investment.name,
        amount: validation.data.saleAmount.toString(),
        date: validation.data.saleDate,
        userId: validation.data.createdBy
      });
      
      res.status(201).json(sale);
    } catch (error) {
      res.status(500).json({ message: "Errore nella creazione vendita" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
