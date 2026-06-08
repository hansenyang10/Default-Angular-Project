import { computed, inject, Injectable, signal } from '@angular/core'
import { WhoAmIResponse } from '../models/user'
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root'
})
export class UserState {

  private tokenService = inject(TokenService);
  private userState = signal<WhoAmIResponse | null>(null);

  user = this.userState.asReadonly()
  isLoaded = computed(() => this.userState() !== null);

  set(user: WhoAmIResponse) {
    this.userState.set(user)
  }

  clear() {
    this.userState.set(null)
  }

  getUserId(): string{
    const user = this.userState();
    if (user) return user.userId;

    const decoded = this.tokenService.getDecodedToken();
    return decoded?.nameid || decoded?.sub || null;   
  }

  getRoles(): string[] {
    const user = this.userState();
    if (user) return user.roles;

    const decoded = this.tokenService.getDecodedToken();
    return decoded?.roles || [];
  }

  hasRole(role: string): boolean {
    return this.userState()?.roles.includes(role) ?? false
  }
}