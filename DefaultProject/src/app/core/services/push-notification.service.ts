import { Injectable } from '@angular/core';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { HttpClientService } from '../http/http-client'; 
import { NotificationService } from './notification.service';
import { ConfigService } from '../config/config-service';
import { Request, execute as SaveToken } from '../../api/save-token';
import { UserState } from '../state/user.state';
import { FCM_KEY } from '../../api/definition';
import { Router } from '@angular/router';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  constructor(
    private messaging: Messaging,
    private http: HttpClientService,
    private notify: NotificationService,  
    private config: ConfigService,
    private userState: UserState,
    private tokenService: TokenService,
    private router: Router,
  ) {}

  async requestPermission() {
    try {
      if (!('serviceWorker' in navigator)) {
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        const token = await getToken(this.messaging, { 
          vapidKey: this.config.vapidKey,
          serviceWorkerRegistration: registration
        });

        if (token) {
          console.log('FCM Token:', token);
          this.saveTokenToDatabase(token);
        }
      } else {
        console.warn('Izin notifikasi ditolak oleh user');
      }
    } catch (error) {
      console.error('Error saat mengambil token:', error);
    }
  }

  private async saveTokenToDatabase(token: string) {
    const userId = this.userState.getUserId();
      console.log(userId)
      if (!userId) {
        console.warn('User ID tidak ditemukan, token tidak disimpan ke DB');
        return;
      }

    const lastSavedToken = localStorage.getItem(FCM_KEY);
    if (token === lastSavedToken) {
      console.log('Token masih sama, tidak perlu upload ulang.');
      return; 
    }

    try {
      const req: Request = {
        token: token,
        userId: this.userState.getUserId()
      };

      await SaveToken(this.http, req);
      localStorage.setItem(FCM_KEY, token); 
      console.log('Token baru berhasil disimpan ke DB');
    } catch (error) {
      console.error('Gagal simpan token', error);
    }
  }

  listenForMessages() {
    onMessage(this.messaging, (payload) => {
      if (payload.data?.['type'] === 'force_logout') {
        this.executeForceLogout(payload.notification?.body!);
      }else{
        console.log('Notifikasi diterima (Foreground):', payload);
        this.notify.info(
          payload.notification?.title || 'Pesan Baru',
        );
      }
    });
  }

  private executeForceLogout(message: string) {
    this.tokenService.clear();
    this.userState.clear();
    this.notify.error(message);
    this.router.navigate(['/login']);
  }
}