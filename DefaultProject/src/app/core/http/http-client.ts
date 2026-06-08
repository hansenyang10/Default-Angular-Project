import { inject, Injectable } from '@angular/core'
import { AuthService } from '../services/auth.service'
import { ConfigService } from '../../core/config/config-service';
import { TokenService } from '../services/token.service';
import { Router } from '@angular/router';
import { UserState } from '../state/user.state';
import { NotificationService } from '../services/notification.service';
import { TOKEN_KEY } from '../../api/definition';

@Injectable({
  providedIn: 'root'
})
export class HttpClientService {

  constructor(
    private tokenService: TokenService,
    private router: Router,
    private userState: UserState,
    private config: ConfigService
  ) {}

  private notify = inject(NotificationService)
  
  private getToken(): string | null {
    const maskedToken = localStorage.getItem(TOKEN_KEY);    
    if (!maskedToken) return null;
    return atob(maskedToken);
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path, {
      method: 'GET'
    })
  }

  async post<T>(path: string, body: any): Promise<T> {
    const isFormData = body instanceof FormData;
    return this.request<T>(path, {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body)
    })
  }

  async delete<T>(path: string, body: any): Promise<T> {
    return this.request<T>(path, {
      method: 'DELETE',
      body: JSON.stringify(body)
    })
  }

  async patch<T>(path: string, body: any, versionNumber: string): Promise<T> {
    const isFormData = body instanceof FormData;
    const customHeaders = {
      'If-Match': versionNumber 
    };
    return this.request<T>(path, {
      method: 'PATCH',
      body: isFormData ? body : JSON.stringify(body)
    }, customHeaders)
  }

  private async request<T>(
  path: string,
  options: RequestInit,
  customHeaders: Record<string, string> = {}
): Promise<T> {
  const token = this.getToken();
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${this.config.apiBaseUrl}${path}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      this.handleUnauthorized();
      throw new Error('Session expired. Please log in again.');
    }

    if (response.ok) {
      return await response.json();
    }

    const errorBody = await this.parseErrorBody(response);
    let finalMessage = '';

    if (response.status === 500) {
      finalMessage = 'An unexpected server error occurred. Please try again later.';
    } else if (response.status === 404) {
      finalMessage = 'The requested resource was not found.';
    } else {
      finalMessage = this.extractErrorMessage(errorBody) || `Error ${response.status}: ${response.statusText}`;
    }

    this.notify.error(finalMessage);
    throw new Error(finalMessage);

  } catch (error: any) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      const netError = 'Connection failed. Please check your internet connection.';
      this.notify.error(netError);
      throw new Error(netError);
    }

    throw error;
  }
}

  private async parseErrorBody(response: Response): Promise<any> {
    try {
      return await response.json();
    } catch {
      const text = await response.text();
      return { message: text };
    }
  }

  private extractErrorMessage(errorBody: any): string {
    if (errorBody.errors && Array.isArray(errorBody.errors)) {
      return errorBody.errors.map((e: any) => e.errorMessage).join('\n');
    }
    return errorBody.message || errorBody.error;
  }

  private handleUnauthorized(): void {
    this.tokenService.clear();
    this.userState.clear();
    this.notify.error(`Session expired. Please log in again`);
    this.router.navigate(['/login']);
  }
}