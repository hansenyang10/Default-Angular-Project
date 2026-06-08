import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {FormGroup, FormControl} from '@angular/forms';
import {ReactiveFormsModule, Validators} from '@angular/forms';
import { login } from '../../api/auth/login'
import { MenuService } from '../../core/services/menu.service';
import { execute as WhoAmI } from '../../api/get-who-am-i';
import { HttpClientService } from '../../core/http/http-client';
import { UserState } from '../../core/state/user.state';
import { TokenService } from '../../core/services/token.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '../../core/services/notification.service';
import { TextInputComponent } from '../components/inputs/text-input/text-input.component';

@Component({
  selector: 'login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    TextInputComponent
],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  constructor(
      private router: Router,
      private menuService: MenuService,
      private userState: UserState,
      private tokenService: TokenService,
      private http: HttpClientService
    ) {}    
  private notify = inject(NotificationService);
  hide = signal<boolean>(true)
  loading = signal<boolean>(false)

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  })

  async onSubmit() {
    this.loading.set(true)
    if (this.loginForm.invalid) return
    const { email, password } = this.loginForm.value
    try {
      const res = await login( this.http, {
        email: email!,
        password: password!
      })
      this.tokenService.set(res.data.accessToken)
      
      const user = await WhoAmI(this.http)
      this.userState.set(user)
      this.menuService.loadMenus(user.roles)
      this.notify.success(`Welcome ${user.profile.fullName}`);
      this.router.navigate([''])
      
    } catch (error: any) {
      
    } finally {
      this.loading.set(false)
    }
  }
}
