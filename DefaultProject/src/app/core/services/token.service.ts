import { Injectable } from '@angular/core'
import { TOKEN_KEY } from '../../api/definition'

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  set(token: string) {
    localStorage.setItem(TOKEN_KEY, btoa(token))
  }

  get(): string | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    try {
      return atob(token);
    } catch {
      this.clear();
      return null;
    }
  }

  clear() {
    localStorage.removeItem(TOKEN_KEY)
  }

  isExpired(token: string): boolean {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp * 1000
    return Date.now() > exp
  }

  isValid(): boolean {
    const token = this.get();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const timestamp = Math.floor(Date.now() / 1000);
      
      return payload.exp > (timestamp + 10);
    } catch {
      return false;
    }
  }

  getDecodedToken(): any {
    const token = this.get();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      return {
        ...payload,
        userId: payload.userId || payload.sub, 
        roles: this.extractRoles(payload)
      };
    } catch {
      return null;
    }
  }

  private extractRoles(payload: any): string[] {
    const roles = payload.roles || payload.role; 
    if (!roles) return [];
    return Array.isArray(roles) ? roles : [roles];
  }
}