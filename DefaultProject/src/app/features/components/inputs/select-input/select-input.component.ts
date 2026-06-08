import { Component, input, inject, effect } from '@angular/core';
import { ControlContainer, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-select-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSelectModule, MatFormFieldModule, MatSpinner, MatIcon],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ],
  templateUrl: './select-input.component.html',
  styleUrl: './select-input.component.scss'
})
export class SelectInputComponent {
  label = input.required<string>();
  controlName = input.required<string>();
  data = input<any[]>([]); // Data untuk opsi
  valueField = input<string>('id');
  labelField = input<string>('name');
  multiple = input<boolean>(false);
  placeholder = input<string>('');
  isLoading = input<boolean>(false);
  disabled = input<boolean>(false);

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
    if (control && control.invalid && control.touched) {
      if (control.hasError('required')) return 'This is required';
    }
    return '';
  }
}
