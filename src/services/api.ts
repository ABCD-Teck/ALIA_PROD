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
  getAll: async (params?: { search?: string; limit?: number; offset?: number; include_archived?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.include_archived) queryParams.append('include_archived', params.include_archived.toString());

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
    amount?: number;
    currency_id?: string;
    stage?: string;
    probability?: number;
    expected_close_date?: string;
    owner_user_id?: string;
    source?: string;
    priority?: string;
    country_code?: string;
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

  archive: async (id: string) => {
    return fetchApi<any>(`/opportunities/${id}/archive`, {
      method: 'PATCH',
    });
  },

  restore: async (id: string) => {
    return fetchApi<any>(`/opportunities/${id}/restore`, {
      method: 'PATCH',
    });
  },
};

// Calendar API
export const calendarApi = {
  getEvents: async (params: { start: string; end: string; view?: string }) => {
    const queryParams = new URLSearchParams();
    queryParams.append('start', params.start);
    queryParams.append('end', params.end);
    if (params.view) queryParams.append('view', params.view);

    const query = queryParams.toString();
    return fetchApi<{ events: any[] }>(
      `/calendar/events${query ? `?${query}` : ''}`
    );
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

  getPast: async (params?: { search?: string; limit?: number; offset?: number }) => {
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
    }>(`/interactions/past${query ? `?${query}` : ''}`);
  },

  getFuture: async (params?: { search?: string; limit?: number; offset?: number }) => {
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
    }>(`/interactions/future${query ? `?${query}` : ''}`);
  },

  getByCustomerId: async (customerId: string, params?: { limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return fetchApi<{
      interactions: any[];
      total: number;
      limit: number;
      offset: number;
    }>(`/interactions/customer/${customerId}${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return fetchApi<any>(`/interactions/${id}`);
  },

  create: async (data: any) => {
    return fetchApi<any>('/interactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: {
    interaction_type?: string;
    subject?: string;
    description?: string;
    interaction_date?: string;
    customer_id?: string;
    contact_id?: string;
    duration_minutes?: number;
    direction?: string;
    medium?: string;
    outcome?: string;
    sentiment?: string;
    importance?: string;
    location?: string;
    private_notes?: string;
  }) => {
    return fetchApi<any>(`/interactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchApi<any>(`/interactions/${id}`, {
      method: 'DELETE',
    });
  },

  archive: async (id: string) => {
    return fetchApi<any>(`/interactions/${id}/archive`, {
      method: 'PATCH',
    });
  },

  unarchive: async (id: string) => {
    return fetchApi<any>(`/interactions/${id}/unarchive`, {
      method: 'PATCH',
    });
  },

  getArchived: async (params?: { search?: string; limit?: number; offset?: number }) => {
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
    }>(`/interactions/archived/list${query ? `?${query}` : ''}`);
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
    subject: string;
    description?: string;
    due_date?: string;
    priority?: string;
    status?: string;
    customer_id?: string;
    opportunity_id?: string;
    contact_id?: string;
    assigned_to?: string;
  }) => {
    return fetchApi<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: {
    subject?: string;
    description?: string;
    due_date?: string;
    priority?: string;
    status?: string;
    customer_id?: string;
    opportunity_id?: string;
    contact_id?: string;
    assigned_to?: string;
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

  archive: async (id: string) => {
    return fetchApi<any>(`/tasks/${id}/archive`, {
      method: 'PATCH',
    });
  },

  getArchived: async (params?: { limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return fetchApi<{
      tasks: any[];
      total: number;
      limit: number;
      offset: number;
    }>(`/tasks/archived/list${query ? `?${query}` : ''}`);
  },

  restore: async (id: string) => {
    return fetchApi<any>(`/tasks/${id}/restore`, {
      method: 'PATCH',
    });
  },

  permanentDelete: async (id: string) => {
    return fetchApi<any>(`/tasks/${id}/permanent`, {
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

  getById: async (id: string) => {
    return fetchApi<{
      statement: any;
    }>(`/financial-statements/${id}`);
  },

  create: async (data: {
    customer_id: string;
    fiscal_year: string;
    revenue?: number;
    net_profit?: number;
    roe?: number;
    debt_ratio?: number;
    currency_id?: string;
    notes?: string;
  }) => {
    return fetchApi<{
      statement: any;
      message: string;
    }>('/financial-statements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: {
    fiscal_year?: string;
    revenue?: number;
    net_profit?: number;
    roe?: number;
    debt_ratio?: number;
    currency_id?: string;
    notes?: string;
  }) => {
    return fetchApi<{
      statement: any;
      message: string;
    }>(`/financial-statements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchApi<{
      message: string;
      statement_id: string;
    }>(`/financial-statements/${id}`, {
      method: 'DELETE',
    });
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

  updateProfile: async (data: {
    first_name?: string;
    last_name?: string;
    email?: string;
  }) => {
    return fetchApi<{
      user: any;
      message: string;
    }>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Market Insights API
export const marketInsightsApi = {
  getBucketTags: async (bucketName: string, params?: { limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    return fetchApi<{
      bucket_name: string;
      tags: any[];
      total: number;
    }>(`/market-insights/bucket-tags/${encodeURIComponent(bucketName)}${query ? `?${query}` : ''}`);
  },

  getArticles: async (params?: {
    bucket?: string;
    region?: string;
    importance?: number;
    company?: string;
    search?: string;
    tag_code?: string; // NEW: Support for bucket tag filtering
    custom_tag?: string; // NEW: Support for custom user tag filtering
    limit?: number;
    offset?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.bucket) queryParams.append('bucket', params.bucket);
    if (params?.region) queryParams.append('region', params.region);
    if (params?.importance) queryParams.append('importance', params.importance.toString());
    if (params?.company) queryParams.append('company', params.company);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.tag_code) queryParams.append('tag_code', params.tag_code); // NEW
    if (params?.custom_tag) queryParams.append('custom_tag', params.custom_tag); // NEW
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

  getCustomerNews: async (customerName: string, params?: { limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return fetchApi<{
      articles: any[];
      total: number;
      limit: number;
      offset: number;
      customer_name: string;
    }>(`/market-insights/customer/${encodeURIComponent(customerName)}${query ? `?${query}` : ''}`);
  },

  updateTranslation: async (articleId: string, translations: { title_zh?: string; summary_zh?: string }) => {
    return fetchApi<{
      success: boolean;
      article: any;
    }>(`/market-insights/article/${articleId}/translation`, {
      method: 'PATCH',
      body: JSON.stringify(translations),
    });
  },

  // Article tag management
  getUserTags: async () => {
    return fetchApi<{
      tags: Array<{ name: string; usage_count: number; last_used: string }>;
    }>('/market-insights/user-tags');
  },

  getArticleTags: async (articleId: string) => {
    return fetchApi<{
      tags: Array<{ name: string; created_at: string }>;
    }>(`/market-insights/article/${articleId}/tags`);
  },

  addArticleTag: async (articleId: string, tagName: string) => {
    return fetchApi<{
      success: boolean;
      tag: { name: string; created_at?: string };
      message?: string;
    }>(`/market-insights/article/${articleId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tagName }),
    });
  },

  removeArticleTag: async (articleId: string, tagName: string) => {
    return fetchApi<{
      success: boolean;
      message: string;
    }>(`/market-insights/article/${articleId}/tags/${encodeURIComponent(tagName)}`, {
      method: 'DELETE',
    });
  },

  // Article reactions (like/bookmark)
  toggleLike: async (articleId: string) => {
    return fetchApi<{
      success: boolean;
      isLiked: boolean;
      likes: number;
    }>(`/market-insights/articles/${articleId}/like`, {
      method: 'POST',
    });
  },

  toggleBookmark: async (articleId: string) => {
    return fetchApi<{
      success: boolean;
      isBookmarked: boolean;
    }>(`/market-insights/articles/${articleId}/bookmark`, {
      method: 'POST',
    });
  },

  getBookmarks: async (params?: { limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return fetchApi<{
      articles: any[];
      total: number;
      limit: number;
      offset: number;
    }>(`/market-insights/bookmarks${query ? `?${query}` : ''}`);
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

// Annotations API
export const annotationsApi = {
  getByCustomerId: async (customerId: string, params?: { limit?: number; offset?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return fetchApi<{
      annotations: any[];
      total: number;
      limit: number;
      offset: number;
    }>(`/annotations/customer/${customerId}${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return fetchApi<any>(`/annotations/${id}`);
  },

  create: async (data: {
    customer_id: string;
    title: string;
    status: string;
    content?: string;
  }) => {
    return fetchApi<any>('/annotations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: {
    title?: string;
    status?: string;
    content?: string;
  }) => {
    return fetchApi<any>(`/annotations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchApi<any>(`/annotations/${id}`, {
      method: 'DELETE',
    });
  },
};

// Documents API
export const documentsApi = {
  getByCustomerId: async (customerId: string, category?: string) => {
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);

    const query = queryParams.toString();
    return fetchApi<{
      documents: any[];
      total: number;
    }>(`/documents/customer/${customerId}${query ? `?${query}` : ''}`);
  },

  getById: async (id: string) => {
    return fetchApi<any>(`/documents/${id}`);
  },

  upload: async (file: File, customerId: string, category: string, description?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('customer_id', customerId);
    formData.append('category', category);
    if (description) formData.append('description', description);

    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error(`Document upload error:`, error);
      return {
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  },

  download: async (id: string) => {
    const token = getAccessToken();

    try {
      const response = await fetch(`${API_BASE_URL}/documents/${id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Get the filename from Content-Disposition header or use a default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `document_${id}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { data: { success: true } };
    } catch (error) {
      console.error(`Document download error:`, error);
      return {
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  },

  update: async (id: string, data: { category?: string; description?: string }) => {
    return fetchApi<any>(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchApi<any>(`/documents/${id}`, {
      method: 'DELETE',
    });
  },
};
