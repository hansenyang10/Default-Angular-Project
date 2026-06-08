import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { TOKEN_KEY } from '../../api/definition';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  private getPanelClass(baseClass: string): string[] {
    const hasToken = !!localStorage.getItem(TOKEN_KEY);
    return hasToken ? [baseClass, 'with-token'] : [baseClass];
  }

  private readonly defaultConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'center',
    verticalPosition: 'top',
  };

  success(message: string) {
    const snackRef = this.snackBar.open(message, undefined, {
      ...this.defaultConfig,
      panelClass: this.getPanelClass('success-snackbar')
    });

    snackRef.onAction().subscribe(() => snackRef.dismiss()); 
    snackRef.containerInstance._onExit.subscribe(() => {}); 
    
    snackRef.afterOpened().subscribe(() => {
      const element = document.querySelector('.mat-mdc-snack-bar-container');
      element?.addEventListener('click', () => snackRef.dismiss());
    });
  }

  error(message: string) {
    const snackRef = this.snackBar.open(message, undefined, {
      ...this.defaultConfig,
      duration: 5000,
      panelClass: this.getPanelClass('error-snackbar')
    });

    snackRef.onAction().subscribe(() => snackRef.dismiss());
    snackRef.containerInstance._onExit.subscribe(() => {}); 
    
    snackRef.afterOpened().subscribe(() => {
      const element = document.querySelector('.mat-mdc-snack-bar-container');
      element?.addEventListener('click', () => snackRef.dismiss());
    });
  }

  info(message: string) {
    const snackRef = this.snackBar.open(message, undefined, {
      ...this.defaultConfig,
      panelClass: this.getPanelClass('info-snackbar')
    });

    snackRef.onAction().subscribe(() => snackRef.dismiss()); 
    snackRef.containerInstance._onExit.subscribe(() => {}); 
    
    snackRef.afterOpened().subscribe(() => {
      const element = document.querySelector('.mat-mdc-snack-bar-container');
      element?.addEventListener('click', () => snackRef.dismiss());
    });
  }
}