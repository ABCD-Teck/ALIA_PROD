const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '');

const API_BASE_URL = (() => {
  const envUrl = import.meta.env.VITE_API_URL && normalizeBaseUrl(import.meta.env.VITE_API_URL);
  if (envUrl) {
    return envUrl;
  }

  if (import.meta.env.DEV) {
    // In dev we rely on Vite proxying /api to the Express server.
    return '/api';
  }

  if (typeof window !== 'undefined' && window.location) {
    const { origin } = window.location;
    return `${origin}/api`;
  }

  return 'http://localhost:3001/api';
})();

// Token management
let accessToken: string | null = localStorage.getItem('accessToken');
let refreshToken: string | null = localStorage.getItem('refreshToken');

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const getAccessToken = () => accessToken;

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Token refresh function
const refreshTokens = async (): Promise<boolean> => {
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    clearTokens();
    // Redirect to login page
    window.location.href = '/';
    return false;
  }
};

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const makeRequest = async (token?: string) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  };

  try {
    // First attempt with current token
    let response = await makeRequest(accessToken || undefined);

    // If unauthorized and we have a refresh token, try to refresh
    if (response.status === 401 && refreshToken) {
      const refreshSuccess = await refreshTokens();
      if (refreshSuccess) {
        // Retry with new token
        response = await makeRequest(accessToken || undefined);
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    return {
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}

// Contacts API
export const contactsApi = {
  getAll: async (params?: { search?: string; limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return fetchApi<{
      contacts: any[];
      total: number;
      limit: number;
      offset: number;
    }>(`/contacts${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return fetchApi<any>(`/contacts/${id}`);
  },

  create: async (data: any) => {
    return fetchApi<any>('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: any) => {
    return fetchApi<any>(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchApi<any>(`/contacts/${id}`, {
      method: 'DELETE',
    });
  },
};

// Customers API
export const customersApi = {
  getAll: async (params?: { search?: string; limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return fetchApi<{
      customers: any[];
      total: number;
      limit: number;
      offset: number;
    }>(`/customers${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return fetchApi<any>(`/customers/${id}`);
  },

  create: async (data: any) => {
    return fetchApi<any>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: any) => {
    return fetchApi<any>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchApi<any>(`/customers/${id}`, {
      method: 'DELETE',
    });
  },
};

// Opportunities API
export const opportunitiesApi = {
  getAll: async (params?: { search?: string; limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return fetchApi<{
      opportunities: any[];
      total: number;
      limit: number;
      offset: number;
    }>(`/opportunities${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return fetchApi<any>(`/opportunities/${id}`);
  },

  create: async (data: {
    customer_id: string;
    name: string;
    description?: string;
    value?: number;
    currency_id?: string;
    stage?: string;
    probability?: number;
    expected_close_date?: string;
    owner_user_id?: string;
    source?: string;
    priority?: string;
    notes?: string;
  }) => {
    return fetchApi<any>('/opportunities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: {
    name?: string;
    description?: string;
    value?: number;
    currency_id?: string;
    stage?: string;
    probability?: number;
    expected_close_date?: string;
    owner_user_id?: string;
    source?: string;
    priority?: string;
    notes?: string;
  }) => {
    return fetchApi<any>(`/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchApi<any>(`/opportunities/${id}`, {
      method: 'DELETE',
    });
  },
};

// Interactions API
export const interactionsApi = {
  getAll: async (params?: { search?: string; limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return fetchApi<{
      interactions: any[];
      total: number;
      limit: number;
      offset: number;
    }>(`/interactions${query ? `?${query}` : ''}`);
  },
};

// Tasks API
export const tasksApi = {
  getAll: async (params?: { limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return fetchApi<{
      tasks: any[];
      limit: number;
      offset: number;
    }>(`/tasks${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return fetchApi<any>(`/tasks/${id}`);
  },

  create: async (data: {
    title: string;
    description?: string;
    due_at?: string;
    priority?: string;
    status?: string;
    customer_id?: string;
    opportunity_id?: string;
    contact_id?: string;
    owner_user_id?: string;
    notes?: string;
    tags?: string[];
  }) => {
    return fetchApi<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: {
    title?: string;
    description?: string;
    due_at?: string;
    priority?: string;
    status?: string;
    customer_id?: string;
    opportunity_id?: string;
    contact_id?: string;
    owner_user_id?: string;
    notes?: string;
    tags?: string[];
  }) => {
    return fetchApi<any>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchApi<any>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};

// Financial Statements API
export const financialStatementsApi = {
  getByCustomerId: async (customerId: string) => {
    return fetchApi<{
      statements: any[];
    }>(`/financial-statements/customer/${customerId}`);
  },
};

// Authentication API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetchApi<{
      user: any;
      accessToken: string;
      refreshToken: string;
      message: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store tokens if login successful
    if (response.data && response.data.accessToken) {
      setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  },

  register: async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: string;
  }) => {
    const response = await fetchApi<{
      user: any;
      accessToken: string;
      refreshToken: string;
      message: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Store tokens if registration successful
    if (response.data && response.data.accessToken) {
      setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  },

  me: async () => {
    return fetchApi<{
      user: any;
      message: string;
    }>('/auth/me');
  },

  logout: async () => {
    clearTokens();
    return { data: { message: 'Logged out successfully' } };
  },
};

// Market Insights API
export const marketInsightsApi = {
  getArticles: async (params?: {
    bucket?: string;
    region?: string;
    importance?: number;
    company?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.bucket) queryParams.append('bucket', params.bucket);
    if (params?.region) queryParams.append('region', params.region);
    if (params?.importance) queryParams.append('importance', params.importance.toString());
    if (params?.company) queryParams.append('company', params.company);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return fetchApi<{
      articles: any[];
      total: number;
      limit: number;
      offset: number;
    }>(`/market-insights/articles${query ? `?${query}` : ''}`);
  },

  getBuckets: async () => {
    return fetchApi<{
      buckets: any[];
    }>('/market-insights/buckets');
  },

  getArticle: async (id: string) => {
    return fetchApi<any>(`/market-insights/article/${id}`);
  },

  getCompanies: async (params?: { search?: string; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return fetchApi<{
      companies: any[];
    }>(`/market-insights/companies${query ? `?${query}` : ''}`);
  },

  getTags: async (params?: { type?: string; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return fetchApi<{
      tags: any[];
    }>(`/market-insights/tags${query ? `?${query}` : ''}`);
  },

  getRegions: async () => {
    return fetchApi<{
      regions: any[];
    }>('/market-insights/regions');
  },

  getCountries: async (params?: { region?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.region) queryParams.append('region', params.region);

    const query = queryParams.toString();
    return fetchApi<{
      countries: any[];
    }>(`/market-insights/countries${query ? `?${query}` : ''}`);
  },
};

// Translation API
export const translationApi = {
  translate: async (text: string, targetLanguage: 'zh' | 'en', sourceLanguage: 'en' | 'zh' = 'en') => {
    return fetchApi<{
      success: boolean;
      translatedText: string;
      originalText: string;
      sourceLanguage: string;
      targetLanguage: string;
      service: string;
      error?: string;
    }>('/translate', {
      method: 'POST',
      body: JSON.stringify({ text, targetLanguage, sourceLanguage }),
    });
  },

  test: async () => {
    return fetchApi<any>('/translate/test');
  },
};
