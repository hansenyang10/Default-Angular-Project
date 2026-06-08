import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const oldPassword = control.get('oldPassword')?.value;
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmNewPassword')?.value;

  if (newPassword !== confirmPassword && confirmPassword !== '') {
    return { passwordMismatch: true };
  }

  if (oldPassword && newPassword && oldPassword === newPassword) {
    return { sameAsOld: true };
  }

  return null;
};