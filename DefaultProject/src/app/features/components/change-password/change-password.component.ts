import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ControlContainer, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TextInputComponent } from '../inputs/text-input/text-input.component';
import { MatError } from '@angular/material/form-field';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TextInputComponent, MatError],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {
  private controlContainer = inject(ControlContainer);

  get parentForm() {
    return this.controlContainer.control as FormGroup;
  }
}
