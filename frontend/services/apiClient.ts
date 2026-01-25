import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mirzoaiapi.cdcgroup.uz/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<{ success: false; error: string }>) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.removeToken();
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  public setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  public removeToken(): void {
    localStorage.removeItem('auth_token');
  }

  // Auth methods
  async register(data: { fullName: string; phoneNumber: string; password: string; organization: string }) {
    // Ensure phone number has +998 prefix
    let phone = data.phoneNumber.replace(/\D/g, '');
    if (phone.startsWith('998')) {
      phone = phone;
    } else if (phone.startsWith('9') && phone.length === 9) {
      phone = '998' + phone;
    } else {
      phone = '998' + phone;
    }
    
    const response = await this.client.post('/auth/register/', {
      full_name: data.fullName,
      phone_number: phone,
      password: data.password,
      password2: data.password,
      organization: data.organization
    });
    if (response.data.success && response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async login(data: { phoneNumber: string; password: string }) {
    // Ensure phone number has 998 prefix (without +)
    let phone = data.phoneNumber.replace(/\D/g, '');
    if (!phone.startsWith('998')) {
      if (phone.startsWith('9') && phone.length === 9) {
        phone = '998' + phone;
      } else {
        phone = '998' + phone;
      }
    }
    
    const response = await this.client.post('/auth/login/', {
      phone_number: phone,
      password: data.password
    });
    if (response.data.success && response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async loginAsAdmin(secret: string) {
    const response = await this.client.post('/auth/admin/', { secret });
    if (response.data.success && response.data.token) {
      this.setToken(response.data.token);
    }
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me/');
    return response.data;
  }

  // Document methods
  async generateDocument(data: {
    docType: string;
    sector: string;
    topic: string;
    goal: string;
    useSearch: boolean;
    organization: string;
    files: File[];
  }) {
    const formData = new FormData();
    formData.append('docType', data.docType);
    formData.append('sector', data.sector);
    formData.append('topic', data.topic);
    formData.append('goal', data.goal || '');
    formData.append('useSearch', String(data.useSearch));
    formData.append('organization', data.organization);

    data.files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await this.client.post('/documents/generate/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async refineDocument(data: {
    originalHtml: string;
    instruction: string;
    additionalFiles?: File[];
  }) {
    const formData = new FormData();
    formData.append('originalHtml', data.originalHtml);
    formData.append('instruction', data.instruction || '');

    if (data.additionalFiles) {
      data.additionalFiles.forEach((file) => {
        formData.append('files', file);
      });
    }

    const response = await this.client.post('/documents/refine/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getHistory() {
    const response = await this.client.get('/documents/history/');
    return response.data;
  }

  async deleteHistoryItem(id: string) {
    const response = await this.client.delete(`/documents/history/${id}/`);
    return response.data;
  }

  // User methods
  async getProfile() {
    const response = await this.client.get('/users/profile/');
    return response.data;
  }

  async updateProfile(data: { fullName?: string; organization?: string }) {
    const response = await this.client.put('/users/profile/', data);
    return response.data;
  }

  async updateSubscription(receiptFile?: File) {
    if (!receiptFile) {
      throw new Error('Receipt file is required');
    }
    
    const formData = new FormData();
    formData.append('receipt', receiptFile);
    
    console.log('Sending FormData with file:', receiptFile.name, receiptFile.size, receiptFile.type);

    try {
      const response = await this.client.post('/users/subscription/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Subscription update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Subscription update error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  // Admin methods
  async getAllUsers() {
    const response = await this.client.get('/admin/users/');
    return response.data;
  }

  async updateUserSubscription(userId: string, status: string) {
    const response = await this.client.put(`/admin/users/${userId}/subscription/`, { status });
    return response.data;
  }

  async getAdminStats() {
    const response = await this.client.get('/admin/stats/');
    return response.data;
  }

  async getGeminiApiKey() {
    const response = await this.client.get('/admin/settings/gemini-api-key/');
    return response.data;
  }

  async updateGeminiApiKey(apiKey: string) {
    const response = await this.client.put('/admin/settings/gemini-api-key/', { api_key: apiKey });
    return response.data;
  }

  async createUser(data: {
    fullName: string;
    phoneNumber: string;
    password: string;
    organization: string;
    subscriptionStatus?: string;
    isAdmin?: boolean;
    isActive?: boolean;
  }) {
    // Ensure phone number has 998 prefix (without +)
    let phone = data.phoneNumber.replace(/\D/g, '');
    if (!phone.startsWith('998')) {
      if (phone.startsWith('9') && phone.length === 9) {
        phone = '998' + phone;
      } else {
        phone = '998' + phone;
      }
    }
    
    const response = await this.client.post('/admin/users/', {
      full_name: data.fullName,
      phone_number: phone,
      password: data.password,
      organization: data.organization,
      subscription_status: data.subscriptionStatus || 'NONE',
      is_admin: data.isAdmin || false,
      is_active: data.isActive !== undefined ? data.isActive : true
    });
    return response.data;
  }

  async updateUser(userId: string, data: {
    fullName?: string;
    phoneNumber?: string;
    password?: string;
    organization?: string;
    subscriptionStatus?: string;
    isAdmin?: boolean;
    isActive?: boolean;
  }) {
    const payload: any = {};
    if (data.fullName) payload.full_name = data.fullName;
    if (data.phoneNumber) {
      // Ensure phone number has 998 prefix (without +)
      let phone = data.phoneNumber.replace(/\D/g, '');
      if (!phone.startsWith('998')) {
        if (phone.startsWith('9') && phone.length === 9) {
          phone = '998' + phone;
        } else {
          phone = '998' + phone;
        }
      }
      payload.phone_number = phone;
    }
    if (data.password) payload.password = data.password;
    if (data.organization) payload.organization = data.organization;
    if (data.subscriptionStatus) payload.subscription_status = data.subscriptionStatus;
    if (data.isAdmin !== undefined) payload.is_admin = data.isAdmin;
    if (data.isActive !== undefined) payload.is_active = data.isActive;

    const response = await this.client.put(`/admin/users/${userId}/`, payload);
    return response.data;
  }

  async deleteUser(userId: string) {
    const response = await this.client.delete(`/admin/users/${userId}/`);
    return response.data;
  }

  async getUser(userId: string) {
    const response = await this.client.get(`/admin/users/${userId}/`);
    return response.data;
  }

  async getUserReceipt(userId: string) {
    const response = await this.client.get(`/admin/users/${userId}/receipt/`);
    return response.data;
  }

  // AI methods
  async sendChatMessage(history: Array<{ role: 'user' | 'model'; text: string }>, message: string) {
    const response = await this.client.post('/ai/chat/', { history, message });
    return response.data;
  }

  async getMotivationalQuote() {
    const response = await this.client.get('/ai/quote/');
    return response.data;
  }

  async getDailyBriefing() {
    const response = await this.client.get('/ai/briefing/');
    return response.data;
  }

  async analyzeImage(imageFile: File, prompt: string) {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('prompt', prompt);

    const response = await this.client.post('/ai/analyze-image/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
