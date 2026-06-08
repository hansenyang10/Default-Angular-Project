import { CommonModule } from '@angular/common';
import { Component, effect, input, output, TemplateRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { TableColumn } from '../../../core/models/table';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatPaginatorModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {
  data = input.required<any[]>();
  hasNext = input.required<boolean>(); // Berdasarkan parameter "next"
  pageNumber = input.required<number>(); // Berdasarkan parameter "pageNumber"
  
  columns = input.required<TableColumn[]>();
  columnTemplates = input<Record<string, TemplateRef<any>>>({});

  // Output untuk memberitahu parent agar fetch data lagi
  pageChange = output<number>();
  displayedColumns = () => this.columns().map(c => c.def);
  onPageChange(step: number) {
    const newPage = this.pageNumber() + step;
    this.pageChange.emit(newPage);
  }
}
