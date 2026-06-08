import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { Validators, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Role } from '../../../../api/get-role';
import { HttpClientService } from '../../../../core/http/http-client';
import { Request as UpdateRequest, execute as Update, PasswordRequest } from '../../../../api/update-employee';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { TextInputComponent } from "../../../components/inputs/text-input/text-input.component";
import { SelectInputComponent } from "../../../components/inputs/select-input/select-input.component";
import { NotificationService } from '../../../../core/services/notification.service';
import { createPatchOperations } from '../../../../core/helper/patch.helper';
import { PatchRequest } from '../../../../api/definition';
import { Employee, execute as GetEmployee } from '../../../../api/get-employee';
import { execute as GetRoles } from '../../../../api/get-roles';
import { MatTabsModule } from '@angular/material/tabs';
import { ChangePasswordComponent } from "../../../components/change-password/change-password.component";
import { toSignal } from '@angular/core/rxjs-interop';
import { passwordMatchValidator } from '../../../../core/utils/password-match-validator';
import { ActionButtonComponent } from "../../../components/buttons/action-button/action-button.component";
import { UserState } from '../../../../core/state/user.state';
import { AuthService } from '../../../../core/auth';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent } from '../../../components/dialog/confirm-dialog/confirm-dialog.component';
import { FileInputComponent } from "../../../components/inputs/file-input/file-input.component";

@Component({
  selector: 'app-employee-edit',
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
  templateUrl: './employee-edit.component.html',
  styleUrls: ['./employee-edit.component.scss']
})
export class EmployeeEditComponent {
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
      const id = this.userId(); 
      if (id) {
        untracked(() => {
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
  userId = input<string>();
  genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' }
  ];
  roles = signal<Role[]>([])
  loadingRoles = signal(false)
  isLoading = signal(false)
  employee = signal<Employee>({} as Employee)
  loadingEmployee = signal(false)

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
        message: 'Save changes to this employee?'
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        await this.executeUpdate();
      }
    });
  }

  private async executeUpdate() {
    this.isLoading.set(true);
    const { oldPassword, newPassword, confirmNewPassword, roles, profileImage, ...employeeData } = this.updateForm.value;

    const ops = createPatchOperations(this.employee() as any, employeeData);
    const isPasswordChanged = !!(oldPassword && oldPassword.trim() !== '');
    const isRolesChanged = JSON.stringify([...this.employee().roles!].sort()) !== JSON.stringify([...roles!].sort());
    const isImageChanged = !!profileImage;

    if (ops.length === 0 && !isPasswordChanged && !isRolesChanged && !isImageChanged) {
      this.notify.info('No changes detected.');
      this.isLoading.set(false);
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
    };

    try {
      await Update(this.http, request, roles!, passwordRequest, profileImage);
      
      this.isSaved = true; 

      if (this.employee().id == this.userState.getUserId() && isPasswordChanged) {
        this.authService.logout(false, "Employee has been updated! Please log in again.");
      } else {
        this.notify.success("Employee has been updated!");
        this.goBack();
      }
    } catch (error) {
       
    } finally {
      this.isLoading.set(false);
    }
  }

  goBack() {
    this.router.navigate(['/employees']);
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