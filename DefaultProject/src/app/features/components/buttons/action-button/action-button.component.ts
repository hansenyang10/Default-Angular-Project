import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-action-button',
  standalone: true,
  imports: [MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './action-button.component.html',
  styleUrl: './action-button.component.scss'
})
export class ActionButtonComponent {
  // Inputs
  saveLabel = input<string>('Save');
  cancelLabel = input<string>('Cancel');
  disabled = input<boolean>(false);
  isLoading = input<boolean>(false);

  // Outputs
  onCancel = output<void>();
}
