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
  getSales: async (params?: Record<string, string>) => {
    const url = new URL(`${API_BASE_URL}/sales/`);
    if (params) {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    // Handle DRF pagination (returns { results: [], count: ... })
    return data.results || data;
  },
  
  getUniqueValues: async (field: string) => {
    const response = await fetch(`${API_BASE_URL}/sales/`);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    const items = data.results || data; 
    const values = items.map((item: any) => item[field]);
    return Array.from(new Set(values)) as string[];
  }
};
