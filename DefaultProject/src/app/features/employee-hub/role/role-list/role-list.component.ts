import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClientService } from '../../../../core/http/http-client';
import { execute as GetRoles } from '../../../../api/get-roles';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatIcon } from "@angular/material/icon";
import { TableColumn } from '../../../../core/models/table';
import { TableComponent } from "../../../components/table/table.component";
import { execute as Delete, Request} from '../../../../api/delete-role';
import { SearchInputComponent } from "../../../components/inputs/search-input/search-input.component";

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatIcon,
    TableComponent,
    SearchInputComponent
],  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss'
})
export class RoleListComponent {
constructor(
    private router: Router,
    private http: HttpClientService
  ) {}    
  tableColumns: TableColumn[] = [
      { def: 'roleName', header: 'Role', field: 'roleName' },
      { def: 'status', header: 'Status', field: 'status' },
      { def: 'actions', header: 'Actions' }
  ];
  currentPage = signal(1);
  apiResponse = signal<any>(null);
  loadingRoles = signal(false)
  searchTerm = signal<string>('');  

  async ngOnInit() {
    await this.loadRoles()
  }

  async loadRoles(page: number = 1, search: string = this.searchTerm()) {
    this.loadingRoles.set(true)
    try {
      const res = await GetRoles(this.http, {
        pageNumber: page,
        pageSize: 25,
        search: search,
        select: ['id', 'versionNumber', 'roleName', 'status'],
        status: 'ALL'
      })
      this.apiResponse.set(res);
      this.currentPage.set(res.pageNumber);
    } finally {
      this.loadingRoles.set(false);
    }
  }

  handlePageChange(newPage: number) {
    this.loadRoles(newPage);
  }

  handleSearch(value: string) {
    this.searchTerm.set(value);
    this.loadRoles(1, value);
  }

  async addRole() {
    this.router.navigate(['roles/add'])
  }

  async deleteRole(id: string, versionNumber: string) {
    const request: Request = {
      id,
      versionNumber
    };  
    const res = await Delete(this.http, request)  
    await this.loadRoles()
  }

  async editRole(id: string) {
    this.router.navigate([`roles/${id}`])
  }
}
