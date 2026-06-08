import { Component, inject, signal } from '@angular/core';
import { Validators, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Role } from '../../../../api/get-role';
import { execute as GetRoles } from '../../../../api/get-roles';
import { HttpClientService } from '../../../../core/http/http-client';
import { execute as Create } from '../../../../api/create-employee';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { TextInputComponent } from "../../../components/inputs/text-input/text-input.component";
import { SelectInputComponent } from "../../../components/inputs/select-input/select-input.component";
import { NotificationService } from '../../../../core/services/notification.service';
import { ActionButtonComponent } from "../../../components/buttons/action-button/action-button.component";
import { FileInputComponent } from "../../../components/inputs/file-input/file-input.component";

@Component({
  selector: 'app-employee-add',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule, TextInputComponent, SelectInputComponent, ActionButtonComponent, FileInputComponent],
  templateUrl: './employee-add.component.html',
  styleUrls: ['./employee-add.component.scss']
})
export class EmployeeAddComponent {
  private notify = inject(NotificationService)
  constructor(
    private router: Router,
    private http: HttpClientService
  ) {} 
  genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' }
  ];
  roles = signal<Role[]>([])
  loadingRoles = signal(false)
  isLoading = signal(false)
  imagePreview = signal<string | null>(null);
  async ngOnInit() {
    await this.loadRoles()
  }

  async loadRoles() {
    try {
      this.loadingRoles.set(true)
      const res = await GetRoles(this.http, {
        pageNumber: 1,
        pageSize: 25,
        select: ['id', 'versionNumber', 'roleName']
      })
      this.roles.set(res.data)
      this.loadingRoles.set(false)
    } catch (err) {
      
    }
  }

  registerForm = new FormGroup({
    firstName: new FormControl<string>('', [Validators.required]),
    middleName: new FormControl<string>(''),
    lastName: new FormControl<string>(''),
    userName: new FormControl<string>('', [Validators.required]),
    phoneNumber: new FormControl<string>('', [Validators.required]),
    gender: new FormControl<string>('', [Validators.required]),
    roles: new FormControl<string[]>([], [Validators.required]),
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    password: new FormControl<string>('', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/)]),
    profileImage: new FormControl<File | null>(null)
  })

  async onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.registerForm.updateValueAndValidity(); 
      return;
    }
    
    const { firstName, middleName, lastName, userName, phoneNumber, gender, roles, email, password, profileImage } = this.registerForm.value
    this.isLoading.set(true)

    try{
      const res = await Create(this.http, {
        firstName: firstName!,
        middleName: middleName!,
        lastName: lastName!,
        username: userName!,
        phoneNumber: phoneNumber!,
        gender: gender!,
        roles: roles!,
        email: email!,
        password: password!,
        profileImage: profileImage!
      })
  
      this.notify.success(`Data has been succesfully saved!`)  
      this.goBack()
    }catch(error){

    }finally{
      this.isLoading.set(false)
    }
  }

  goBack() {
    this.router.navigate(['/employees']);
  }

  onFileSelected(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.registerForm.patchValue({ profileImage: file });
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
}
}