import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'app-filter-dropdown',
  standalone: true,
  imports: [MatFormFieldModule, MatSelectModule, CommonModule, MatProgressSpinner, MatIcon],
  templateUrl: './filter-dropdown.component.html',
  styleUrl: './filter-dropdown.component.scss'
})
export class FilderDropdownComponent {
  label = input.required<string>();
  defaultValue = input.required<string>();
  data = input.required<any[]>();
  valueField = input<string>('value');
  labelField = input<string>('label');
  multiple = input<boolean>(false);
  isLoading = input<boolean>(false);
  filterChange = output<any>();

  onSelectionChange(value: any) {
    this.filterChange.emit(value);
  }
}
