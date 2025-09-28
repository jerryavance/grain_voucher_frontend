export interface IHubAdmin {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

export interface IHub {
  id: string;
  name: string;
  slug: string;
  location: string;
  is_active: boolean;
  hub_admin: IHubAdmin;
  created_at: string;
  updated_at: string;
}

export interface IGrainType {
  id: string;
  name: string;
  description?: string;
}

export interface IPriceFeed {
  id: string;
  hub: IHub | null; // allow null for global feeds
  grain_type: IGrainType;
  price_per_kg: string; // backend sends as string
  effective_date: string; // ISO date
  created_at: string;     // ISO datetime
  updated_at: string;     // ISO datetime
}

export interface IPriceFeedResults {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: IPriceFeed[];
}

export interface PriceWithTrend extends IPriceFeed {
  trend?: 'up' | 'down' | 'stable';
  changePercentage?: number;
}
