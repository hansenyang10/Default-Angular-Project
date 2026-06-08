import { inject, Injectable } from '@angular/core'
import { NavigationEnd, Router } from '@angular/router'
import { HttpClientService } from '../http/http-client'
import { execute as whoAmI } from '../../api/get-who-am-i'
import { TokenService } from './token.service'
import { UserState } from '../state/user.state'
import { MenuService } from './menu.service'
import { NotificationService } from './notification.service'
import { filter, take } from 'rxjs'
import { PushNotificationService } from './push-notification.service'
import { FCM_KEY } from '../../api/definition'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private autoLogoutTimer: any;
  constructor(
    private notify: NotificationService,
    private http: HttpClientService,
    private router: Router,
    private tokenService: TokenService,
    private userState: UserState,
    private menuService: MenuService,
    private pushService: PushNotificationService
  ) {}

  login(token: string) {
    this.tokenService.set(token)
    this.startAutoLogout(token)
    this.pushService.requestPermission();
    this.pushService.listenForMessages();
  }

  logout(showNotify: boolean = false, message?: string, isError: boolean = false) {
    if (this.autoLogoutTimer) {
      clearTimeout(this.autoLogoutTimer);
    }

    this.tokenService.clear();
    this.userState.clear();

    if (showNotify && message) {
      isError ? this.notify.error(message) : this.notify.success(message);
    }
    localStorage.removeItem(FCM_KEY);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.tokenService.isValid()
  }

  private startAutoLogout(token: string) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresIn = (payload.exp * 1000) - Date.now();
      
      if (expiresIn <= 0) {
        this.logout(true, 'Session expired. Please log in again.', true);
        return;
      }

      if (this.autoLogoutTimer) clearTimeout(this.autoLogoutTimer);

      this.autoLogoutTimer = setTimeout(() => {
        this.logout(true, 'Your session has timed out. Please log in again.', true);
      }, expiresIn);
    } catch (e) {

    }
  }

  async init() {
    if (!this.isLoggedIn()) {
      this.logout(); 
      return;
    }

    if (this.userState.user()) return;

    try {
      const user = await whoAmI(this.http);
      this.userState.set(user);
      this.menuService.loadMenus(user.roles);
      this.startAutoLogout(this.tokenService.get()!); 

      this.router.events.pipe(
        filter(e => e instanceof NavigationEnd),
        take(1)
      ).subscribe((event: any) => {
        const url = event.urlAfterRedirects;
        if (url === '/' || url === '/home' || url === '/dashboard') {
          this.notify.success(`Welcome back, ${user.profile.fullName}`);
        }
      });
    } catch (err) {
      this.logout(false); 
    }
  }
}