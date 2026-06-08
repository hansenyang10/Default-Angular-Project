import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { Validators, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientService } from '../../../../core/http/http-client';
import { Request as UpdateRequest, execute as Update } from '../../../../api/update-role';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { TextInputComponent } from "../../../components/inputs/text-input/text-input.component";
import { SelectInputComponent } from "../../../components/inputs/select-input/select-input.component";
import { NotificationService } from '../../../../core/services/notification.service';
import { execute as GetRole, Role } from '../../../../api/get-role';
import { createPatchOperations } from '../../../../core/helper/patch.helper';
import { PatchRequest } from '../../../../api/definition';
import { ActionButtonComponent } from "../../../components/buttons/action-button/action-button.component";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../components/dialog/confirm-dialog/confirm-dialog.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-role-edit',
  standalone: true,
  imports: 
  [
    ReactiveFormsModule, 
    CommonModule, 
    MatFormFieldModule, 
    MatSelectModule, 
    MatInputModule, 
    MatButtonModule, 
    TextInputComponent, 
    SelectInputComponent, 
    ActionButtonComponent,
    MatDialogModule
  ],
  templateUrl: './role-edit.component.html',
  styleUrl: './role-edit.component.scss'
})
export class RoleEditComponent {
  private notify = inject(NotificationService)
  private dialog = inject(MatDialog);   

  id = input<string>();
  loadingRole = signal(false)
  isLoading = signal(false)
  role = signal<Role>({} as Role)
  isSaved = false;

  constructor(
    private router: Router,
    private http: HttpClientService
  ) {
    effect(() => {
      const id = this.id(); 
      if (id) {
        untracked(() => {
          this.loadRole();
        });
      }
    });
  } 

  async loadRole() {
      try {
        this.loadingRole.set(true)
        const res = await GetRole(this.http, {
          id: this.id()!,
          select: ['id', 'versionNumber', 'roleName', 'status']
        })
        this.role.set(res)
        this.updateForm.patchValue({
          roleName: res.roleName,
          status: res.status
        });
  
        this.loadingRole.set(false)
      } catch (err) {
        
      }
    }

  statusOptions = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'In Active', value: 'INACTIVE' }
  ];

  updateForm = new FormGroup({
    roleName: new FormControl<string>('', [Validators.required]),
    status: new FormControl<string>('ACTIVE', [Validators.required]),
  })

  async onSubmit() {
    if (this.updateForm.invalid) {
      this.updateForm.markAllAsTouched();
      this.updateForm.updateValueAndValidity(); 
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Save Confirmation',
        message: 'Save changes to this role?'
      }
    });

    dialogRef.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        await this.executeUpdate();
      }
    });
  }

  async executeUpdate(){
    this.isLoading.set(true)
    const roleData = this.updateForm.value
    const ops = createPatchOperations(this.role() as any, roleData);

    if (ops.length === 0) {
      this.notify.info('No changes detected.');
      this.isLoading.set(false)
      return;
    }

    const request: PatchRequest<UpdateRequest> = {
      id: this.role().id,
      versionNumber: this.role().versionNumber!,
      operations: ops
    };

    try {
      await Update(this.http, request)  
      this.isSaved = true; 

      this.notify.success("Role has been updated!")
      this.goBack()         
    } catch (error) {
      
    } finally{
      this.isLoading.set(false)
    }
  }

  goBack() {
    this.router.navigate(['/roles']);
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
