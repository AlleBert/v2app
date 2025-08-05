import { type User, type InsertUser, type Investment, type InsertInvestment, type Transaction, type InsertTransaction, type Sale, type InsertSale } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  authenticateUser(username: string, password?: string): Promise<User | null>;
  
  // Investments
  getInvestment(id: string): Promise<Investment | undefined>;
  getAllInvestments(): Promise<Investment[]>;
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  updateInvestment(id: string, investment: Partial<Investment>): Promise<Investment | undefined>;
  deleteInvestment(id: string): Promise<boolean>;
  
  // Transactions
  getTransaction(id: string): Promise<Transaction | undefined>;
  getAllTransactions(): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Sales
  getSale(id: string): Promise<Sale | undefined>;
  getAllSales(): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private investments: Map<string, Investment>;
  private transactions: Map<string, Transaction>;
  private sales: Map<string, Sale>;

  constructor() {
    this.users = new Map();
    this.investments = new Map();
    this.transactions = new Map();
    this.sales = new Map();
    
    // Initialize default users
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Create default users
    await this.createUser({
      username: "alle",
      displayName: "Alle",
      role: "admin",
      password: "admin123" // Admin requires password
    });
    
    await this.createUser({
      username: "ali",
      displayName: "Ali", 
      role: "viewer",
      password: null // Viewer doesn't need password
    });

    // Create sample investments
    const sampleInvestments = [
      {
        name: "Vanguard FTSE All-World",
        symbol: "VWCE",
        type: "ETF",
        initialValue: "8000.00",
        currentValue: "9200.00",
        allePercentage: 75,
        aliPercentage: 25,
        purchaseDate: "2023-06-15",
        createdBy: "alle"
      },
      {
        name: "Apple Inc.",
        symbol: "AAPL", 
        type: "Azioni",
        initialValue: "5000.00",
        currentValue: "5800.00",
        allePercentage: 80,
        aliPercentage: 20,
        purchaseDate: "2023-08-20",
        createdBy: "alle"
      },
      {
        name: "iShares Core MSCI World",
        symbol: "IWDA",
        type: "ETF",
        initialValue: "7000.00",
        currentValue: "7589.34",
        allePercentage: 70,
        aliPercentage: 30,
        purchaseDate: "2023-09-10",
        createdBy: "alle"
      }
    ];

    for (const inv of sampleInvestments) {
      const investment = await this.createInvestment(inv);
      
      // Create transaction history
      await this.createTransaction({
        action: "Acquisto",
        investmentId: investment.id,
        investmentName: inv.name,
        amount: inv.initialValue,
        date: inv.purchaseDate,
        userId: "alle"
      });
    }
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async authenticateUser(username: string, password?: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    // Admin users require password
    if (user.role === "admin") {
      if (!password || user.password !== password) {
        return null;
      }
    }
    
    return user;
  }

  // Investments
  async getInvestment(id: string): Promise<Investment | undefined> {
    return this.investments.get(id);
  }

  async getAllInvestments(): Promise<Investment[]> {
    return Array.from(this.investments.values());
  }

  async createInvestment(investment: InsertInvestment): Promise<Investment> {
    const id = randomUUID();
    const newInvestment: Investment = { 
      ...investment, 
      id,
      createdAt: new Date()
    };
    this.investments.set(id, newInvestment);
    return newInvestment;
  }

  async updateInvestment(id: string, investment: Partial<Investment>): Promise<Investment | undefined> {
    const existing = this.investments.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...investment };
    this.investments.set(id, updated);
    return updated;
  }

  async deleteInvestment(id: string): Promise<boolean> {
    return this.investments.delete(id);
  }

  // Transactions
  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const newTransaction: Transaction = { 
      ...transaction, 
      id,
      createdAt: new Date()
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  // Sales
  async getSale(id: string): Promise<Sale | undefined> {
    return this.sales.get(id);
  }

  async getAllSales(): Promise<Sale[]> {
    return Array.from(this.sales.values())
      .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
  }

  async createSale(sale: InsertSale): Promise<Sale> {
    const id = randomUUID();
    const newSale: Sale = { 
      ...sale, 
      id,
      createdAt: new Date()
    };
    this.sales.set(id, newSale);
    return newSale;
  }
}

export const storage = new MemStorage();
