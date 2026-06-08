import { Component, inject, signal } from '@angular/core';
import { Validators, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientService } from '../../../../core/http/http-client';
import { execute as Create } from '../../../../api/create-role';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { TextInputComponent } from "../../../components/inputs/text-input/text-input.component";
import { SelectInputComponent } from "../../../components/inputs/select-input/select-input.component";
import { NotificationService } from '../../../../core/services/notification.service';
import { ActionButtonComponent } from "../../../components/buttons/action-button/action-button.component";

@Component({
  selector: 'app-role-add',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule, TextInputComponent, SelectInputComponent, ActionButtonComponent],
  templateUrl: './role-add.component.html',
  styleUrl: './role-add.component.scss'
})
export class RoleAddComponent {
private notify = inject(NotificationService)
  constructor(
    private router: Router,
    private http: HttpClientService
  ) {
  } 
  statusOptions = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'In Active', value: 'INACTIVE' }
  ];
  isLoading = signal(false)

  addForm = new FormGroup({
    roleName: new FormControl<string>('', [Validators.required]),
    status: new FormControl<string>('ACTIVE', [Validators.required]),
  })

  async onSubmit() {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      this.addForm.updateValueAndValidity(); 
      return;
    }
    
    const { roleName, status } = this.addForm.value
    this.isLoading.set(true);

    try {
      const res = await Create(this.http, {
        roleName: roleName!,
        status: status!,
      })
  
      this.notify.success(`Data has been succesfully saved!`)
      this.goBack()
    } catch (error) {
      
    } finally {
      this.isLoading.set(false)
    }
  }

  goBack() {
    this.router.navigate(['/roles']);
  }
}
