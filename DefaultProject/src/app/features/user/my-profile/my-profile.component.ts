import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TextInputComponent } from '../../components/inputs/text-input/text-input.component';
import { SelectInputComponent } from '../../components/inputs/select-input/select-input.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ChangePasswordComponent } from '../../components/change-password/change-password.component';
import { NotificationService } from '../../../core/services/notification.service';
import { passwordMatchValidator } from '../../../core/utils/password-match-validator';
import { Request as UpdateRequest, execute as Update, PasswordRequest } from '../../../api/update-employee';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClientService } from '../../../core/http/http-client';
import { Role } from '../../../api/get-role';
import { Employee, execute as GetEmployee } from '../../../api/get-employee';
import { execute as GetRoles } from '../../../api/get-roles';
import { PatchRequest } from '../../../api/definition';
import { createPatchOperations } from '../../../core/helper/patch.helper';
import { UserState } from '../../../core/state/user.state';
import { AuthService } from '../../../core/auth';
import { ActionButtonComponent } from "../../components/buttons/action-button/action-button.component";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/dialog/confirm-dialog/confirm-dialog.component';
import { Observable } from 'rxjs';
import { FileInputComponent } from "../../components/inputs/file-input/file-input.component";


@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatButtonModule,
    TextInputComponent,
    SelectInputComponent,
    MatTabsModule,
    ChangePasswordComponent,
    ActionButtonComponent,
    MatDialogModule,
    FileInputComponent
],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.scss'
})
export class MyProfileComponent {
    private notify = inject(NotificationService)
    private dialog = inject(MatDialog); 
  
    updateForm = new FormGroup({
      firstName: new FormControl<string>('', [Validators.required]),
      middleName: new FormControl<string>(''),
      lastName: new FormControl<string>(''),
      userName: new FormControl<string>('', [Validators.required]),
      phoneNumber: new FormControl<string>('', [Validators.required]),
      gender: new FormControl<string>('', [Validators.required]),
      roles: new FormControl<string[]>([], [Validators.required]),
      email: new FormControl<string>('', [Validators.required, Validators.email]),
      oldPassword: new FormControl<string>(''),
      newPassword: new FormControl<string>('', [Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/)]),
      confirmNewPassword: new FormControl<string>('', [Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/)]),
      profileImage: new FormControl<File | null>(null)
    }, { validators: passwordMatchValidator })

    private oldPwdValue = toSignal(this.updateForm.get('oldPassword')!.valueChanges);
    constructor(
      private router: Router,
      private userState: UserState,
      private authService: AuthService,
      private http: HttpClientService
    ) {
      effect(() => {
        const currentUserId = this.userState.getUserId();
        if (currentUserId && currentUserId !== this.userId()) {
          untracked(() => {
            this.userId.set(currentUserId);
            this.loadEmployee();
            this.loadRoles();
          });
        }
    
        const value = this.oldPwdValue();
        const newPwd = this.updateForm.get('newPassword');
        const confirmPwd = this.updateForm.get('confirmNewPassword');
        this.updateForm.updateValueAndValidity();
        if (value && value.trim() !== '') {
          newPwd?.setValidators([Validators.required, Validators.pattern(/.../)]);
          confirmPwd?.setValidators([Validators.required, Validators.pattern(/.../)]);
          newPwd?.markAsTouched();
          confirmPwd?.markAsTouched();
        } else {
          newPwd?.clearValidators(); 
          confirmPwd?.clearValidators();
          newPwd?.setValidators([Validators.pattern(/.../)]);
          confirmPwd?.setValidators([Validators.pattern(/.../)]);
        }
        untracked(() => {
          newPwd?.updateValueAndValidity({ emitEvent: false });
          confirmPwd?.updateValueAndValidity({ emitEvent: false });
        });
      });
    } 

    isSaved = false;    
    userId = signal<string>('');
    genderOptions = [
      { label: 'Male', value: 'Male' },
      { label: 'Female', value: 'Female' }
    ];
    roles = signal<Role[]>([])
    loadingRoles = signal(false)
    employee = signal<Employee>({} as Employee)
    loadingEmployee = signal(false)
    isLoading = signal(false)
    
    async loadEmployee() {
      try {
        this.loadingEmployee.set(true)
        const res = await GetEmployee(this.http, {
          id: this.userId()!,
          select: ['id', 'versionNumber', 'roles', 'firstName', 'middleName', 'lastName', 'userName', 'email', 'gender', 'phoneNumber', 'profilePictureUrl']
        })
        this.employee.set(res)
        this.updateForm.patchValue({
          firstName: res.firstName,
          middleName: res.middleName,
          lastName: res.lastName,
          phoneNumber: res.phoneNumber,
          gender: res.gender,
          roles: res.roles,
          email: res.email,
          userName: res.userName,
        });

        this.loadingEmployee.set(false)
      } catch (err) {
        
      }
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
  
    async onSubmit() {
      if (this.updateForm.invalid) {
        this.updateForm.markAllAsTouched();
        return;
      }

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Save Confirmation',
          message: 'Save changes to your profile?'
        }
      });
      
      dialogRef.afterClosed().subscribe(async (confirmed) => {
        if (confirmed) {
          await this.executeUpdate();
        }
      });
    }

    async executeUpdate(){
      const { 
        oldPassword, 
        newPassword, 
        confirmNewPassword, 
        roles,
        profileImage,
        ...employeeData 
      } = this.updateForm.getRawValue();

      const ops = createPatchOperations(this.employee() as any, employeeData);
      const isImageChanged = !!profileImage;      
      const isPasswordChanged = oldPassword && oldPassword.trim() !== ''
  
      if (ops.length === 0 && !isPasswordChanged && !isImageChanged) {
        this.notify.info('No changes detected.');
        return;
      }
  
      const request: PatchRequest<UpdateRequest> = {
        id: this.employee().id,
        versionNumber: this.employee().versionNumber!,
        operations: ops
      };
  
      const passwordRequest: PasswordRequest = {
        oldPassword: isPasswordChanged ? oldPassword : '',
        newPassword: isPasswordChanged ? newPassword! : '',
        confirmNewPassword: isPasswordChanged ? confirmNewPassword! : '',
      }
      this.isLoading.set(true)
      
      try {
        await Update(this.http, request, roles!, passwordRequest, profileImage)  
        this.isSaved = true; 

        if(isPasswordChanged){
          this.authService.logout(false, "Your profile has been changed! Please log in again.")
        }else{
          this.notify.success("Your profile has been changed!")       
        }        
      } catch (error) {
        
      } finally {
        this.isLoading.set(false)
      }
    }

    goBack() {
      this.router.navigate(['']);
    }

    canDeactivate(): boolean | Observable<boolean> {
      if (this.updateForm.dirty && !this.isSaved) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
          width: '400px',
          data: {
            title: 'Unsaved Changes',
            message: 'Discard unsaved changes?"'
          }
        });
  
        return dialogRef.afterClosed(); // Mengembalikan true/false ke guard
      }
      return true;
    }
}
