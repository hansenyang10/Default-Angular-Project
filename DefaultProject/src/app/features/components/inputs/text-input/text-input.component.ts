import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal, } from '@angular/core';
import { ControlContainer, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatIcon],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }) 
    }
  ],
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.scss'
})
export class TextInputComponent {
  hide = signal<boolean>(true)
  label = input.required<string>();
  controlName = input.required<string>();
  type = input<string>('text');
  placeholder = input<string>('');
  minLength = input<number | null>(null);
  maxLength = input<number | null>(null);
  disabled = input<boolean>(false);
  isCapsLockOn = signal<boolean>(false);

  private controlContainer = inject(ControlContainer);

  constructor() {
    effect(() => {
      const parentForm = this.controlContainer.control as FormGroup;
      const control = parentForm?.get(this.controlName());

      if (control) {
        this.disabled() ? control.disable() : control.enable();
      }
    });
  }

  get errorMessage(): string {
    const control = this.controlContainer.control?.get(this.controlName());

    if (control && control.errors && control.touched) {
      if (control.hasError('required')) return 'This is required';
      if (control.hasError('email')) return 'Email patterin is invalid';
      if (control.hasError('minlength')) return `Minimal length is ${control.errors['minlength'].requiredLength} character`;
      if (control.hasError('maxlength')) return `Maksimal length is ${control.errors['maxlength'].requiredLength} character`;
      if (control.hasError('serverError')) return control.errors['serverError'];
      if (control.hasError('pattern') && this.type() === 'password') 
        return 'Password at least must consist of 1 uppercase, numeric and symbol.';
    }
    return '';
  }

  onlyNumber(event: KeyboardEvent) {
    if (this.type() === 'tel' || this.type() === 'number') {
      const charCode = event.which ? event.which : event.keyCode;
      
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        event.preventDefault(); 
        return false;
      }
    }
    return true;
  }

  onKeyUp(event: KeyboardEvent) {
    this.isCapsLockOn.set(event.getModifierState('CapsLock'));
  }

  onKeyPress(event: KeyboardEvent) {
    this.isCapsLockOn.set(event.getModifierState('CapsLock'));
    return this.onlyNumber(event);
  }
}
