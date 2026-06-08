import { Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CustomTitleStrategy } from '../../../core/custom-title-strategy';
import { NavigationEnd, Router, TitleStrategy } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AuthService } from '../../../core/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, MatToolbarModule, MatButtonModule, MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  constructor(
    private authService: AuthService
  ) {}    

  private location = inject(Location);
  readonly titleStrategy = inject(TitleStrategy) as CustomTitleStrategy;

  private router = inject(Router);

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects)
    ), 
    { initialValue: this.router.url }
  );

  isHome = computed(() => {
    const url = this.currentUrl();
    const noBackPages = ['/'];
    return noBackPages.includes(url);
  });

  goBack() {
    this.location.back();
  }
  
  async logout(){
    this.authService.logout(false, "Logout Successfully!")
  }
}
