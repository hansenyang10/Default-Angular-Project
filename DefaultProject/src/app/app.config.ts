import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, inject, NgZone, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, TitleStrategy, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth-interceptor'
import { ConfigService } from './core/config/config-service';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { CustomTitleStrategy } from './core/custom-title-strategy';
import { MatDialogModule } from '@angular/material/dialog';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideMessaging, getMessaging } from '@angular/fire/messaging';

const firebaseConfig ={
  apiKey: "AIzaSyDgprN1NwyPRgWV_M0Y09dvwDnvjtFA3KI",
  authDomain: "defaultproject-746c0.firebaseapp.com",
  projectId: "defaultproject-746c0",
  storageBucket: "defaultproject-746c0.firebasestorage.app",
  messagingSenderId: "180398589167",
  appId: "1:180398589167:web:e5409ac591a9941347c71a",
  measurementId: "G-LWV9KHV485"
};

export function initializeAppFactory(configService: ConfigService) {
  // Gunakan inject(NgZone) di dalam factory
  const ngZone = inject(NgZone); 

  return () => {
    const loadConfigPromise = configService.loadConfig();

    ngZone.runOutsideAngular(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' })
          .then(reg => console.log('SW Registered outside Zone!', reg.scope))
          .catch(err => console.error('SW Fail:', err));
      }
    });

    return loadConfigPromise;
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    {
      provide: APP_INITIALIZER,
      
      useFactory: initializeAppFactory,
      deps: [ConfigService],
      multi: true
    }, 
    provideAnimationsAsync(),
    { provide: TitleStrategy, useClass: CustomTitleStrategy },
    importProvidersFrom(MatDialogModule),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideMessaging(() => getMessaging()),
  ]
};
