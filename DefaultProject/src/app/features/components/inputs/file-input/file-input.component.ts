import { Component, input, signal, output, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlContainer, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConfigService } from '../../../../core/config/config-service';

@Component({
  selector: 'app-file-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatIconModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true })
    }
  ],
  templateUrl: './file-input.component.html',
  styleUrl: './file-input.component.scss'
})
export class FileInputComponent {
  
  private container = inject(ControlContainer);
  private config = inject(ConfigService);

  label = input<string>('Profile Picture');
  controlName = input.required<string>();
  accept = input<string>('image/*');
  
  initialPreview = input<string | null>(null); 
  isInitialRemoved = signal(false);
  imagePreview = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.initialPreview()) {
        this.isInitialRemoved.set(false);
      }
    }, { allowSignalWrites: true });
  }

  fullInitialPreview = computed(() => {
    if (this.isInitialRemoved()) return null;
    const path = this.initialPreview();
    if (!path) return null;
    
    return path.startsWith('http') ? path : `${this.config.apiBaseUrl}${path}`;
  });

  get control(): FormControl {
    return this.container.control?.get(this.controlName()) as FormControl;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      this.control.patchValue(file); // Mengisi File object (bukan string)
      this.control.markAsDirty();

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeFile(input: HTMLInputElement) {
    input.value = ''; 
    this.control.patchValue(null);
    this.control.markAsDirty();
    this.imagePreview.set(null);
    this.isInitialRemoved.set(true);
  }

  onImageError(event: any) {
    event.target.src = 'assets/images/default-avatar.png';
  }
}