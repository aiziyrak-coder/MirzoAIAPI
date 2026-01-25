import { apiClient } from './apiClient';
import { User, SubscriptionStatus } from '../types';

export const authService = {
  async register(fullName: string, phoneNumber: string, password: string, organization: string): Promise<User> {
    try {
      const response = await apiClient.register({ fullName, phoneNumber, password, organization });
      if (!response.success) {
        throw new Error(response.error || 'Registration failed');
      }
      return this.mapUserResponse(response.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Registration failed');
    }
  },

  async login(phoneNumber: string, password: string): Promise<User> {
    try {
      const response = await apiClient.login({ phoneNumber, password });
      if (!response.success) {
        throw new Error(response.error || 'Login failed');
      }
      return this.mapUserResponse(response.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Login failed');
    }
  },

  async loginAsAdmin(secret: string): Promise<User> {
    try {
      const response = await apiClient.loginAsAdmin(secret);
      if (!response.success) {
        throw new Error(response.error || 'Admin login failed');
      }
      return this.mapUserResponse(response.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || error.message || 'Admin login failed');
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;

      const response = await apiClient.getCurrentUser();
      if (!response.success || !response.user) {
        return null;
      }

      // Check subscription expiry
      const user = this.mapUserResponse(response.user);
      if (user.subscriptionStatus === 'ACTIVE' && user.subscriptionExpiry) {
        const expiryDate = new Date(user.subscriptionExpiry);
        const now = new Date();
        if (now > expiryDate) {
          user.subscriptionStatus = 'NONE';
          user.subscriptionExpiry = undefined;
        }
      }

      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  logout(): void {
    apiClient.removeToken();
  },

  mapUserResponse(userData: any): User {
    return {
      id: userData.id,
      fullName: userData.fullName,
      phoneNumber: userData.phoneNumber,
      password: '', // Don't store password in frontend
      organization: userData.organization,
      subscriptionStatus: userData.subscriptionStatus as SubscriptionStatus,
      subscriptionExpiry: userData.subscriptionExpiry,
      history: userData.history || [],
      isAdmin: userData.isAdmin || false
    };
  }
};
