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
  GetRTDELastCompletedResponse,
  // Milk Count Types
  GetMilkTypesResponse,
  UpdateMilkTypeRequest,
  UpdateMilkTypeResponse,
  GetParLevelsResponse,
  UpdateParLevelRequest,
  UpdateParLevelResponse,
  GetTodaySessionResponse,
  StartMilkCountSessionResponse,
  GetMilkCountSessionResponse,
  SaveNightFOHRequest,
  SaveNightBOHRequest,
  SaveMorningCountRequest,
  SaveOnOrderRequest,
  SaveMilkCountResponse,
  GetMilkCountSummaryResponse,
  GetMilkCountHistoryResponse,
  // Activity Feed Types
  GetRecentActivityResponse,
  GetAdminActivityResponse,
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

  async getRTDELastCompleted(): Promise<GetRTDELastCompletedResponse> {
    const response = await this.client.get<GetRTDELastCompletedResponse>(
      '/api/rtde/sessions/last-completed'
    );
    return response.data;
  }

  async getRTDEActiveSession(): Promise<GetRTDEActiveSessionResponse> {
    const response = await this.client.get<GetRTDEActiveSessionResponse>(
      '/api/rtde/sessions/active',
      {
        // Prevent browser caching to ensure fresh session state
        headers: { 'Cache-Control': 'no-cache' },
        params: { _t: Date.now() }
      }
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

  // ============================================================================
  // Milk Count Tool - Admin Endpoints
  // ============================================================================

  async getMilkTypes(params?: { include_inactive?: boolean }): Promise<GetMilkTypesResponse> {
    const response = await this.client.get<GetMilkTypesResponse>(
      '/api/milk-count/admin/milk-types',
      { params }
    );
    return response.data;
  }

  async updateMilkType(
    milkTypeId: string,
    data: UpdateMilkTypeRequest
  ): Promise<UpdateMilkTypeResponse> {
    const response = await this.client.put<UpdateMilkTypeResponse>(
      `/api/milk-count/admin/milk-types/${milkTypeId}`,
      data
    );
    return response.data;
  }

  async getParLevels(): Promise<GetParLevelsResponse> {
    const response = await this.client.get<GetParLevelsResponse>(
      '/api/milk-count/admin/par-levels'
    );
    return response.data;
  }

  async updateParLevel(
    milkTypeId: string,
    data: UpdateParLevelRequest
  ): Promise<UpdateParLevelResponse> {
    const response = await this.client.put<UpdateParLevelResponse>(
      `/api/milk-count/admin/par-levels/${milkTypeId}`,
      data
    );
    return response.data;
  }

  // ============================================================================
  // Milk Count Tool - Session Endpoints
  // ============================================================================

  async getMilkCountTodaySession(): Promise<GetTodaySessionResponse> {
    const response = await this.client.get<GetTodaySessionResponse>(
      '/api/milk-count/sessions/today'
    );
    return response.data;
  }

  async startMilkCountSession(): Promise<StartMilkCountSessionResponse> {
    const response = await this.client.post<StartMilkCountSessionResponse>(
      '/api/milk-count/sessions/start'
    );
    return response.data;
  }

  async getMilkCountSession(sessionId: string): Promise<GetMilkCountSessionResponse> {
    const response = await this.client.get<GetMilkCountSessionResponse>(
      `/api/milk-count/sessions/${sessionId}`
    );
    return response.data;
  }

  async saveMilkCountNightFOH(
    sessionId: string,
    data: SaveNightFOHRequest
  ): Promise<SaveMilkCountResponse> {
    const response = await this.client.put<SaveMilkCountResponse>(
      `/api/milk-count/sessions/${sessionId}/night-foh`,
      data
    );
    return response.data;
  }

  async saveMilkCountNightBOH(
    sessionId: string,
    data: SaveNightBOHRequest
  ): Promise<SaveMilkCountResponse> {
    const response = await this.client.put<SaveMilkCountResponse>(
      `/api/milk-count/sessions/${sessionId}/night-boh`,
      data
    );
    return response.data;
  }

  async saveMilkCountMorning(
    sessionId: string,
    data: SaveMorningCountRequest
  ): Promise<SaveMilkCountResponse> {
    const response = await this.client.put<SaveMilkCountResponse>(
      `/api/milk-count/sessions/${sessionId}/morning`,
      data
    );
    return response.data;
  }

  async saveMilkCountOnOrder(
    sessionId: string,
    data: SaveOnOrderRequest
  ): Promise<SaveMilkCountResponse> {
    const response = await this.client.put<SaveMilkCountResponse>(
      `/api/milk-count/sessions/${sessionId}/on-order`,
      data
    );
    return response.data;
  }

  // ============================================================================
  // Milk Count Tool - Summary & History Endpoints
  // ============================================================================

  async getMilkCountSummary(sessionId: string): Promise<GetMilkCountSummaryResponse> {
    const response = await this.client.get<GetMilkCountSummaryResponse>(
      `/api/milk-count/sessions/${sessionId}/summary`
    );
    return response.data;
  }

  async getMilkCountHistory(params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<GetMilkCountHistoryResponse> {
    const response = await this.client.get<GetMilkCountHistoryResponse>(
      '/api/milk-count/history',
      { params }
    );
    return response.data;
  }

  // ============================================================================
  // Milk Count Tool - Staff Endpoint (for counting screens)
  // ============================================================================

  async getMilkTypesForCounting(): Promise<GetMilkTypesResponse> {
    const response = await this.client.get<GetMilkTypesResponse>(
      '/api/milk-count/milk-types'
    );
    return response.data;
  }

  // ============================================================================
  // Activity Feed Endpoints
  // ============================================================================

  async getRecentActivity(params?: { limit?: number }): Promise<GetRecentActivityResponse> {
    const response = await this.client.get<GetRecentActivityResponse>(
      '/api/activity/recent',
      { params }
    );
    return response.data;
  }

  async getAdminActivity(params?: { limit?: number }): Promise<GetAdminActivityResponse> {
    const response = await this.client.get<GetAdminActivityResponse>(
      '/api/admin/activity',
      { params }
    );
    return response.data;
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

const apiClient = new APIClient();
export default apiClient;
