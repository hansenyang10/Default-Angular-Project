import { Injectable, inject, signal } from '@angular/core';
import { TitleStrategy, RouterStateSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class CustomTitleStrategy extends TitleStrategy {
  currentPageTitle = signal<string>('');

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot);
    if (title !== undefined) {
      this.currentPageTitle.set(title);
    } else {
      this.currentPageTitle.set('Default Project');
    }
  }
}