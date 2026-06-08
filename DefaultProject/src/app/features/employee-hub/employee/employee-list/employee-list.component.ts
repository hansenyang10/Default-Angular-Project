import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClientService } from '../../../../core/http/http-client';
import { Employee } from '../../../../api/get-employee';
import { execute as GetEmployees } from '../../../../api/get-employees';
import { execute as GetRoles } from '../../../../api/get-roles';
import { Role } from '../../../../api/get-role';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatIcon } from "@angular/material/icon";
import { TableColumn } from '../../../../core/models/table';
import { TableComponent } from "../../../components/table/table.component";
import { SearchInputComponent } from "../../../components/inputs/search-input/search-input.component";
import { FilderDropdownComponent } from "../../../components/inputs/filter-dropdown/filter-dropdown.component";

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatIcon,
    TableComponent,
    SearchInputComponent,
    FilderDropdownComponent
],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss'
})
export class EmployeeListComponent {
  constructor(
    private router: Router,
    private http: HttpClientService
  ) {}    
  tableColumns: TableColumn[] = [
      { def: 'fullName', header: 'Full Name', field: 'fullName' },
      { def: 'email', header: 'Email', field: 'email' },
      { def: 'phone', header: 'Phone', field: 'phoneNumber' },
      { def: 'gender', header: 'Gender' },
      { def: 'roles', header: 'Roles' },
      { def: 'actions', header: 'Actions' }
  ];
  employeeList = signal<Employee[]>([])
  genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' }
  ];
  roles = signal<Role[]>([])
  currentPage = signal(1);
  apiResponse = signal<any>(null);
  loadingEmployees = signal(false)
  loadingRoles = signal(false)
  searchTerm = signal<string>('');  
  selectedGender = signal<string | null>(null);
  selectedRoles = signal<string[]>([]);

  async ngOnInit() {
    await this.loadEmployees()
    await this.loadRoles()
  }

  async loadEmployees(
    page: number = 1, 
    search: string = this.searchTerm(),
    gender: string | null = this.selectedGender(), 
    roles: string[] = this.selectedRoles()
  ) {
    this.loadingEmployees.set(true)
    try {
      const res = await GetEmployees(this.http, {
        pageNumber: page,
        pageSize: 25,
        search: search,
        gender: gender || undefined, 
        roles: roles.length > 0 ? roles : undefined,
        select: ['id', 'versionNumber', 'roles', 'fullName', 'email', 'gender', 'phoneNumber']
      })
      this.employeeList.set(res.data)
      this.apiResponse.set(res);
      this.currentPage.set(res.pageNumber);
    } finally {
      this.loadingEmployees.set(false);
    }
  }

  handlePageChange(newPage: number) {
    this.loadEmployees(newPage);
  }

  handleSearch(value: string) {
    this.searchTerm.set(value);
    this.loadEmployees(1, value);
  }

  handleGenderFilter(value: string) {
    this.selectedGender.set(value);
    this.loadEmployees();
  }

  handleRoleFilter(values: string[]) {
    this.selectedRoles.set(values);
    this.loadEmployees();
  }

  async loadRoles() {
    try {
      this.loadingRoles.set(true)
      const res = await GetRoles(this.http, {
        pageNumber: 1,
        pageSize: 25,
        select: ['id', 'versionNumber', 'roleName']
      })
      this.roles.set(res.data)
    } catch (err) {

    } finally {
      this.loadingRoles.set(false)
    }
  }

  async addEmployee() {
    this.router.navigate(['employees/add'])
  }

  async editEmployee(userId: string) {
    this.router.navigate([`employees/${userId}`])
  }
}
