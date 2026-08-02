const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Sale {
  id: number;
  category: string;
  subcategory: string;
  item: string;
  store: string;
  week: string;
  season: string;
  units_sold: number;
  gross_selling_price: string;
  net_sales_price: string;
  markdown_percentage: string;
  ending_stock: number;
}

export const salesService = {
  getDashboardMetrics: async (params?: Record<string, string>) => {
    const url = new URL(`${API_BASE_URL}/sales/dashboard_metrics/`);
    if (params) {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }
    const response = await fetch(url.toString(), { cache: 'no-store' });
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  },

  getStylePerformance: async (params?: Record<string, string>) => {
    const url = new URL(`${API_BASE_URL}/sales/style_performance/`);
    if (params) {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }
    const response = await fetch(url.toString(), { cache: 'no-store' });
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  },

  getSales: async (params?: Record<string, string>) => {
    const url = new URL(`${API_BASE_URL}/sales/`);
    if (params) {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }
    const response = await fetch(url.toString(), { cache: 'no-store' });
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    // Handle DRF pagination (returns { results: [], count: ... })
    return data.results || data;
  },
  
  getFilters: async () => {
    const response = await fetch(`${API_BASE_URL}/sales/filters/`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  },
  
  getUniqueValues: async (field: string) => {
    // Kept for backward compatibility, but we recommend using getFilters
    const response = await fetch(`${API_BASE_URL}/sales/filters/`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    return data[field + 's'] || [];
  },

  getInventoryNeeds: async (params?: Record<string, string>) => {
    const url = new URL(`${API_BASE_URL}/sales/inventory_needs/`);
    if (params) {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }
    const response = await fetch(url.toString(), { cache: 'no-store' });
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  },

  syncData: async () => {
    const response = await fetch(`${API_BASE_URL}/sales/sync_data/`, { 
      method: 'POST',
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return await response.json();
  }
};
