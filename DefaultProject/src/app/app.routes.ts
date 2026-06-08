import { Routes } from '@angular/router';
import { AuthGuard } from './core/auth/auth-guard';
import { GuestGuard } from './core/auth/guest-guard';
import { canDeactivateGuard } from './core/auth/can-deactive.guard';

export const routes: Routes = [
    {
        path: "login",
        canActivate: [GuestGuard],
        loadComponent: () => import('./features/login/login.component')
        .then(m => m.LoginComponent)
    },
    {
        path: '',
        canActivate: [AuthGuard],
        loadComponent: () => import('./layouts/main-layouts/main-layout.component')
        .then(m => m.MainLayoutComponent),
        children: [
            {
                path: '',
                title: 'Home',
                loadComponent: () => import('./features/home/home.component')
                .then(m => m.HomeComponent)
            },
            {
                path: 'profile',
                title: 'My Profile',
                canDeactivate: [canDeactivateGuard],
                loadComponent: () => import('./features/user/my-profile/my-profile.component')
                .then(m => m.MyProfileComponent)
            },
            {
                path: 'employees',
                title: 'Employee List',
                loadComponent: () => import('./features/employee-hub/employee/employee-list/employee-list.component')
                    .then(m => m.EmployeeListComponent)
            },
            {
                path: 'employees/add',
                title: 'New Employee',
                loadComponent: () => import('./features/employee-hub/employee/employee-add/employee-add.component')
                    .then(m => m.EmployeeAddComponent)
            },
            {
                path: 'employees/:userId',
                title: 'Edit Employee',
                canDeactivate: [canDeactivateGuard],
                loadComponent: () => import('./features/employee-hub/employee/employee-edit/employee-edit.component')
                    .then(m => m.EmployeeEditComponent)
            },
            {
                path: 'roles',
                title: 'Role List',
                loadComponent: () => import('./features/employee-hub/role/role-list/role-list.component')
                    .then(m => m.RoleListComponent)
            },
            {
                path: 'roles/add',
                title: 'New Role',
                loadComponent: () => import('./features/employee-hub/role/role-add/role-add.component')
                    .then(m => m.RoleAddComponent)
            },
            {
                path: 'roles/:id',
                title: 'Edit Role',
                canDeactivate: [canDeactivateGuard],
                loadComponent: () => import('./features/employee-hub/role/role-edit/role-edit.component')
                    .then(m => m.RoleEditComponent)
            },
        ]
    },
];
