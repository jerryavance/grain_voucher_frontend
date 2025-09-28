import { useState, useEffect } from 'react';
import { AccountingService } from './Accounting.service';

// Custom hook for fetching accounts data
export const useAccounts = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      // This would be replaced with actual API call
      const response = await fetch('/api/crm/accounts/');
      const data = await response.json();
      setAccounts(data.results || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch accounts');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return { accounts, loading, error, refetch: fetchAccounts };
};

// Custom hook for fetching trades data
export const useTrades = () => {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      setError(null);
      // This would be replaced with actual API call
      const response = await fetch('/api/trade/trades/');
      const data = await response.json();
      setTrades(data.results || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch trades');
      setTrades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  return { trades, loading, error, refetch: fetchTrades };
};

// Custom hook for fetching hubs data
export const useHubs = () => {
  const [hubs, setHubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHubs = async () => {
    try {
      setLoading(true);
      setError(null);
      // This would be replaced with actual API call
      const response = await fetch('/api/hubs/hubs/');
      const data = await response.json();
      setHubs(data.results || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch hubs');
      setHubs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubs();
  }, []);

  return { hubs, loading, error, refetch: fetchHubs };
};

// Custom hook for fetching grain types data
export const useGrainTypes = () => {
  const [grainTypes, setGrainTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGrainTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      // This would be replaced with actual API call
      const response = await fetch('/api/vouchers/grain-types/');
      const data = await response.json();
      setGrainTypes(data.results || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch grain types');
      setGrainTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrainTypes();
  }, []);

  return { grainTypes, loading, error, refetch: fetchGrainTypes };
};

// Custom hook for invoice aging data
export const useInvoiceAging = () => {
  const [agingData, setAgingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AccountingService.getInvoiceAging();
      setAgingData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch aging data');
      setAgingData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgingData();
  }, []);

  return { agingData, loading, error, refetch: fetchAgingData };
};