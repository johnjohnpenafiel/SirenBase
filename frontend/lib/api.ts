/**
 * SirenBase - API Client
 * Centralized API client with JWT authentication and error handling
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  GetItemsResponse,
  CreateItemRequest,
  CreateItemResponse,
  DeleteItemResponse,
  SearchItemNamesResponse,
  GetHistoryResponse,
  GetUsersResponse,
  CreateUserRequest,
  CreateUserResponse,
  DeleteUserResponse,
  User,
  ItemCategory,
  HistoryAction,
  // RTD&E Types
  GetRTDEItemsResponse,
  CreateRTDEItemRequest,
  CreateRTDEItemResponse,
  UpdateRTDEItemRequest,
  UpdateRTDEItemResponse,
  DeleteRTDEItemResponse,
  ReorderRTDEItemsRequest,
  ReorderRTDEItemsResponse,
  GetRTDEActiveSessionResponse,
  StartRTDESessionRequest,
  StartRTDESessionResponse,
  GetRTDESessionResponse,
  UpdateRTDECountRequest,
  UpdateRTDECountResponse,
  GetRTDEPullListResponse,
  MarkRTDEItemPulledRequest,
  MarkRTDEItemPulledResponse,
  CompleteRTDESessionResponse,
} from '@/types';
import { API_BASE_URL, AUTH_TOKEN_KEY } from './constants';

// ============================================================================
// Axios Instance Configuration
// ============================================================================

class APIClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor: Inject JWT token
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

    // Response interceptor: Handle errors globally
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Auto-logout on 401 Unauthorized
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // ============================================================================
  // Token Management
  // ============================================================================

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  }

  public setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  public clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  // ============================================================================
  // Authentication Endpoints
  // ============================================================================

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>('/api/auth/login', data);
    return response.data;
  }

  async signup(data: SignupRequest): Promise<SignupResponse> {
    const response = await this.client.post<SignupResponse>('/api/auth/signup', data);
    return response.data;
  }

  async getMe(): Promise<User> {
    const response = await this.client.get<{ user: User }>('/api/auth/me');
    return response.data.user; // Extract user from response wrapper
  }

  // ============================================================================
  // Tracking Tool - Items Endpoints
  // ============================================================================

  async getItems(params?: {
    category?: ItemCategory;
    include_removed?: boolean;
  }): Promise<GetItemsResponse> {
    const response = await this.client.get<GetItemsResponse>('/api/tracking/items', {
      params,
    });
    return response.data;
  }

  async createItem(data: CreateItemRequest): Promise<CreateItemResponse> {
    const response = await this.client.post<CreateItemResponse>('/api/tracking/items', data);
    return response.data;
  }

  async deleteItem(code: string): Promise<DeleteItemResponse> {
    const response = await this.client.delete<DeleteItemResponse>(
      `/api/tracking/items/${code}`
    );
    return response.data;
  }

  async searchItemNames(params: {
    q: string;
    category: ItemCategory;
    limit?: number;
  }): Promise<SearchItemNamesResponse> {
    const response = await this.client.get<SearchItemNamesResponse>(
      '/api/tracking/items/search',
      { params }
    );
    return response.data;
  }

  // ============================================================================
  // Tracking Tool - History Endpoints
  // ============================================================================

  async getHistory(params?: {
    limit?: number;
    user_id?: string;
    action?: HistoryAction;
  }): Promise<GetHistoryResponse> {
    const response = await this.client.get<GetHistoryResponse>('/api/tracking/history', {
      params,
    });
    return response.data;
  }

  // ============================================================================
  // Admin Endpoints
  // ============================================================================

  async getUsers(): Promise<GetUsersResponse> {
    const response = await this.client.get<GetUsersResponse>('/api/admin/users');
    return response.data;
  }

  async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    const response = await this.client.post<CreateUserResponse>('/api/admin/users', data);
    return response.data;
  }

  async deleteUser(userId: string): Promise<DeleteUserResponse> {
    const response = await this.client.delete<DeleteUserResponse>(
      `/api/admin/users/${userId}`
    );
    return response.data;
  }

  // ============================================================================
  // RTD&E Tool - Admin Item Management Endpoints
  // ============================================================================

  async getRTDEItems(params?: { include_inactive?: boolean }): Promise<GetRTDEItemsResponse> {
    const response = await this.client.get<GetRTDEItemsResponse>('/api/rtde/admin/items', {
      params,
    });
    return response.data;
  }

  async createRTDEItem(data: CreateRTDEItemRequest): Promise<CreateRTDEItemResponse> {
    const response = await this.client.post<CreateRTDEItemResponse>(
      '/api/rtde/admin/items',
      data
    );
    return response.data;
  }

  async updateRTDEItem(
    id: string,
    data: UpdateRTDEItemRequest
  ): Promise<UpdateRTDEItemResponse> {
    const response = await this.client.put<UpdateRTDEItemResponse>(
      `/api/rtde/admin/items/${id}`,
      data
    );
    return response.data;
  }

  async deleteRTDEItem(id: string): Promise<DeleteRTDEItemResponse> {
    const response = await this.client.delete<DeleteRTDEItemResponse>(
      `/api/rtde/admin/items/${id}`
    );
    return response.data;
  }

  async reorderRTDEItems(data: ReorderRTDEItemsRequest): Promise<ReorderRTDEItemsResponse> {
    const response = await this.client.put<ReorderRTDEItemsResponse>(
      '/api/rtde/admin/items/reorder',
      data
    );
    return response.data;
  }

  // ============================================================================
  // RTD&E Tool - Session Management Endpoints
  // ============================================================================

  async getRTDEActiveSession(): Promise<GetRTDEActiveSessionResponse> {
    const response = await this.client.get<GetRTDEActiveSessionResponse>(
      '/api/rtde/sessions/active'
    );
    return response.data;
  }

  async startRTDESession(data: StartRTDESessionRequest): Promise<StartRTDESessionResponse> {
    const response = await this.client.post<StartRTDESessionResponse>(
      '/api/rtde/sessions/start',
      data
    );
    return response.data;
  }

  async getRTDESession(sessionId: string): Promise<GetRTDESessionResponse> {
    const response = await this.client.get<GetRTDESessionResponse>(
      `/api/rtde/sessions/${sessionId}`
    );
    return response.data;
  }

  async updateRTDECount(
    sessionId: string,
    data: UpdateRTDECountRequest
  ): Promise<UpdateRTDECountResponse> {
    const response = await this.client.put<UpdateRTDECountResponse>(
      `/api/rtde/sessions/${sessionId}/count`,
      data
    );
    return response.data;
  }

  // ============================================================================
  // RTD&E Tool - Pull List Endpoints
  // ============================================================================

  async getRTDEPullList(sessionId: string): Promise<GetRTDEPullListResponse> {
    const response = await this.client.get<GetRTDEPullListResponse>(
      `/api/rtde/sessions/${sessionId}/pull-list`
    );
    return response.data;
  }

  async markRTDEItemPulled(
    sessionId: string,
    data: MarkRTDEItemPulledRequest
  ): Promise<MarkRTDEItemPulledResponse> {
    const response = await this.client.put<MarkRTDEItemPulledResponse>(
      `/api/rtde/sessions/${sessionId}/pull`,
      data
    );
    return response.data;
  }

  async completeRTDESession(sessionId: string): Promise<CompleteRTDESessionResponse> {
    const response = await this.client.post<CompleteRTDESessionResponse>(
      `/api/rtde/sessions/${sessionId}/complete`
    );
    return response.data;
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

const apiClient = new APIClient();
export default apiClient;
