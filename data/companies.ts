export interface Company {
  ticker: string;
  name: string;
  sector: string;
  employees: number;
  revenue: number;
  marketCap: number;
  revenuePerEmployee?: number;
  bloat?: "lean" | "normal" | "bloated" | "finance";
}

export const companies: Company[] = [
  // TECHNOLOGY
  { ticker: "AAPL", name: "Apple", sector: "Technology", employees: 161000, revenue: 383e9, marketCap: 3e12 },
  { ticker: "MSFT", name: "Microsoft", sector: "Technology", employees: 221000, revenue: 212e9, marketCap: 3.1e12 },
  { ticker: "GOOGL", name: "Alphabet", sector: "Technology", employees: 182000, revenue: 307e9, marketCap: 2e12 },
  { ticker: "META", name: "Meta Platforms", sector: "Technology", employees: 67000, revenue: 134e9, marketCap: 1.4e12 },
  { ticker: "NVDA", name: "NVIDIA", sector: "Technology", employees: 29600, revenue: 60e9, marketCap: 3.3e12 },
  { ticker: "AMZN", name: "Amazon", sector: "Technology", employees: 1525000, revenue: 575e9, marketCap: 1.9e12 },
  { ticker: "TSLA", name: "Tesla", sector: "Technology", employees: 127855, revenue: 97e9, marketCap: 700e9 },
  { ticker: "ORCL", name: "Oracle", sector: "Technology", employees: 164000, revenue: 53e9, marketCap: 450e9 },
  { ticker: "ADBE", name: "Adobe", sector: "Technology", employees: 30000, revenue: 19.4e9, marketCap: 200e9 },
  { ticker: "CRM", name: "Salesforce", sector: "Technology", employees: 73000, revenue: 34.9e9, marketCap: 250e9 },
  { ticker: "AMD", name: "AMD", sector: "Technology", employees: 26000, revenue: 22.7e9, marketCap: 200e9 },
  { ticker: "INTC", name: "Intel", sector: "Technology", employees: 124800, revenue: 54e9, marketCap: 90e9 },
  { ticker: "CSCO", name: "Cisco", sector: "Technology", employees: 84900, revenue: 57e9, marketCap: 200e9 },
  { ticker: "IBM", name: "IBM", sector: "Technology", employees: 288000, revenue: 61.9e9, marketCap: 170e9 },
  { ticker: "SAP", name: "SAP SE", sector: "Technology", employees: 105000, revenue: 31e9, marketCap: 230e9 },
  { ticker: "INFY", name: "Infosys", sector: "Technology", employees: 343000, revenue: 18.6e9, marketCap: 75e9 },
  { ticker: "WIT", name: "Wipro", sector: "Technology", employees: 258000, revenue: 11.2e9, marketCap: 26e9 },
  { ticker: "TCS", name: "TCS", sector: "Technology", employees: 614000, revenue: 27e9, marketCap: 140e9 },
  { ticker: "SNAP", name: "Snap Inc.", sector: "Technology", employees: 5289, revenue: 4.6e9, marketCap: 18e9 },
  { ticker: "NFLX", name: "Netflix", sector: "Technology", employees: 13000, revenue: 33.7e9, marketCap: 360e9 },
  { ticker: "UBER", name: "Uber", sector: "Technology", employees: 32100, revenue: 37.3e9, marketCap: 140e9 },
  { ticker: "ABNB", name: "Airbnb", sector: "Technology", employees: 6907, revenue: 9.9e9, marketCap: 75e9 },
  { ticker: "SHOP", name: "Shopify", sector: "Technology", employees: 11600, revenue: 7.1e9, marketCap: 110e9 },
  { ticker: "PYPL", name: "PayPal", sector: "Technology", employees: 26500, revenue: 29.8e9, marketCap: 70e9 },
  { ticker: "NOW", name: "ServiceNow", sector: "Technology", employees: 22000, revenue: 8.97e9, marketCap: 190e9 },
  { ticker: "PLTR", name: "Palantir", sector: "Technology", employees: 3838, revenue: 2.23e9, marketCap: 85e9 },
  { ticker: "SNOW", name: "Snowflake", sector: "Technology", employees: 7000, revenue: 2.81e9, marketCap: 50e9 },
  { ticker: "COIN", name: "Coinbase", sector: "Technology", employees: 3800, revenue: 3.6e9, marketCap: 52e9 },
  // RETAIL
  { ticker: "WMT", name: "Walmart", sector: "Retail", employees: 2100000, revenue: 648e9, marketCap: 700e9 },
  { ticker: "COST", name: "Costco", sector: "Retail", employees: 316000, revenue: 238e9, marketCap: 390e9 },
  { ticker: "TGT", name: "Target", sector: "Retail", employees: 440000, revenue: 109e9, marketCap: 55e9 },
  { ticker: "HD", name: "Home Depot", sector: "Retail", employees: 465000, revenue: 152e9, marketCap: 370e9 },
  { ticker: "MCD", name: "McDonald's", sector: "Retail", employees: 150000, revenue: 25.5e9, marketCap: 210e9 },
  { ticker: "SBUX", name: "Starbucks", sector: "Retail", employees: 381000, revenue: 35.9e9, marketCap: 90e9 },
  { ticker: "NKE", name: "Nike", sector: "Retail", employees: 79000, revenue: 51.4e9, marketCap: 100e9 },
  // MANUFACTURING
  { ticker: "F", name: "Ford", sector: "Manufacturing", employees: 177000, revenue: 185e9, marketCap: 50e9 },
  { ticker: "GM", name: "General Motors", sector: "Manufacturing", employees: 163000, revenue: 172e9, marketCap: 55e9 },
  { ticker: "TM", name: "Toyota", sector: "Manufacturing", employees: 375235, revenue: 274e9, marketCap: 265e9 },
  // HEALTHCARE
  { ticker: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", employees: 152700, revenue: 85.2e9, marketCap: 380e9 },
  { ticker: "UNH", name: "UnitedHealth", sector: "Healthcare", employees: 440000, revenue: 371e9, marketCap: 530e9 },
  { ticker: "PFE", name: "Pfizer", sector: "Healthcare", employees: 88000, revenue: 58.5e9, marketCap: 165e9 },
  { ticker: "MRK", name: "Merck", sector: "Healthcare", employees: 69000, revenue: 60.1e9, marketCap: 270e9 },
  { ticker: "CVS", name: "CVS Health", sector: "Healthcare", employees: 300000, revenue: 357e9, marketCap: 70e9 },
  { ticker: "AMGN", name: "Amgen", sector: "Healthcare", employees: 24400, revenue: 28.2e9, marketCap: 155e9 },
  // FINANCE
  { ticker: "JPM", name: "JPMorgan Chase", sector: "Finance", employees: 309926, revenue: 158e9, marketCap: 600e9 },
  { ticker: "BAC", name: "Bank of America", sector: "Finance", employees: 213000, revenue: 98.6e9, marketCap: 330e9 },
  { ticker: "GS", name: "Goldman Sachs", sector: "Finance", employees: 45900, revenue: 47.4e9, marketCap: 175e9 },
  { ticker: "V", name: "Visa", sector: "Finance", employees: 26500, revenue: 35.9e9, marketCap: 575e9 },
  { ticker: "MA", name: "Mastercard", sector: "Finance", employees: 34000, revenue: 25.1e9, marketCap: 455e9 },
  { ticker: "BLK", name: "BlackRock", sector: "Finance", employees: 21000, revenue: 18.6e9, marketCap: 140e9 },
  // ENERGY
  { ticker: "XOM", name: "ExxonMobil", sector: "Energy", employees: 62000, revenue: 398e9, marketCap: 470e9 },
  { ticker: "CVX", name: "Chevron", sector: "Energy", employees: 43846, revenue: 200e9, marketCap: 290e9 },
  { ticker: "SLB", name: "SLB", sector: "Energy", employees: 100000, revenue: 35.2e9, marketCap: 65e9 },
  // MEDIA / TELECOM
  { ticker: "DIS", name: "Walt Disney", sector: "Media", employees: 225000, revenue: 89.1e9, marketCap: 185e9 },
  { ticker: "CMCSA", name: "Comcast", sector: "Media", employees: 186000, revenue: 121.6e9, marketCap: 160e9 },
  { ticker: "T", name: "AT&T", sector: "Telecom", employees: 164000, revenue: 122.4e9, marketCap: 130e9 },
  { ticker: "VZ", name: "Verizon", sector: "Telecom", employees: 103000, revenue: 133.9e9, marketCap: 165e9 },
  // AEROSPACE
  { ticker: "BA", name: "Boeing", sector: "Aerospace", employees: 171000, revenue: 77.8e9, marketCap: 130e9 },
  { ticker: "LMT", name: "Lockheed Martin", sector: "Aerospace", employees: 122000, revenue: 67.6e9, marketCap: 120e9 },
  { ticker: "RTX", name: "RTX Corp", sector: "Aerospace", employees: 185000, revenue: 68.9e9, marketCap: 150e9 },
  // CONSUMER
  { ticker: "PG", name: "Procter & Gamble", sector: "Consumer", employees: 107000, revenue: 84e9, marketCap: 385e9 },
  { ticker: "KO", name: "Coca-Cola", sector: "Consumer", employees: 82500, revenue: 45.8e9, marketCap: 265e9 },
  { ticker: "PEP", name: "PepsiCo", sector: "Consumer", employees: 318000, revenue: 91.5e9, marketCap: 220e9 }
];
