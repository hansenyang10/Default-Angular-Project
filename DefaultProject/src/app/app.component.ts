import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth';
import { PushNotificationService } from './core/services/push-notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private pushService = inject(PushNotificationService);
  constructor(private authService: AuthService) {}

  title = 'DefaultProject';
  ngOnInit() {
    this.authService.init()
    this.pushService.requestPermission();
    this.pushService.listenForMessages();
  }
}
