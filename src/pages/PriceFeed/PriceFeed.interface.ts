export interface IPriceFeed {
    id: string;
    hub?: {
      id: string;
      name: string;
      location?: string;
    } | null; // hub can be null for global price feeds
    grain_type: {
      id: string;
      name: string;
    };
    price_per_kg: number;
    effective_date: string; // ISO date string, e.g., '2025-09-20'
    created_at: string; // ISO datetime string
    updated_at: string; // ISO datetime string
  }
  
  export interface IPriceFeedResults {
    count: number;
    next?: string | null;
    previous?: string | null;
    results: IPriceFeed[];
  }
  